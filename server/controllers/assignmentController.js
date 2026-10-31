import path from 'path';
import fs from 'fs';
import { Assignment } from '../models/Assignment.js';
import { AssignmentSubmission } from '../models/AssignmentSubmission.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { getTenantQuery } from '../middleware/tenant.js';
import { logAudit } from '../utils/audit.js';

/**
 * List Assignments (scoped by tenant and role)
 */
export const getAssignments = async (req, res, next) => {
  try {
    const { subjectId, department, semester } = req.query;
    let filter = getTenantQuery(req);

    if (subjectId) filter.subjectId = subjectId;

    if (req.user.role === 'student') {
      filter.published = true;
      if (req.user.department) filter.department = req.user.department;
      if (req.user.semester) filter.semester = req.user.semester;
    } else {
      if (department && department !== 'ALL') filter.department = department;
      if (semester && semester !== 'ALL') filter.semester = semester;
      if (req.user.role === 'teacher' && req.query.mine === 'true') {
        filter.teacherId = req.user._id;
      }
    }

    const assignments = await Assignment.find(filter)
      .populate('teacherId', 'name email designation avatar')
      .populate('subjectId', 'title code credits')
      .sort({ createdAt: -1 });

    // Enhance with submission info
    const assignmentsWithSubmissions = await Promise.all(
      assignments.map(async (a) => {
        if (req.user.role === 'student') {
          const mySubmission = await AssignmentSubmission.findOne({
            assignmentId: a._id,
            studentId: req.user._id
          });
          return {
            ...a.toObject(),
            mySubmission: mySubmission || null
          };
        } else {
          const submissions = await AssignmentSubmission.find({ assignmentId: a._id })
            .populate('studentId', 'name email rollNo avatar');
          return {
            ...a.toObject(),
            submissions: submissions || [],
            submissionCount: submissions.length
          };
        }
      })
    );

    res.json({ success: true, assignments: assignmentsWithSubmissions });
  } catch (err) {
    next(err);
  }
};

/**
 * Create Assignment with optional attachment upload
 */
export const createAssignment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subjectId,
      dueDate,
      maxMarks,
      published
    } = req.body;

    if (!title || !subjectId || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Assignment title, subject, and due date are mandatory.'
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    // Tenant check
    if (req.user.role !== 'superadmin' && subject.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    let attachmentName = '';
    let attachmentPath = '';
    let attachmentSize = 0;

    if (req.file) {
      attachmentName = req.file.originalname;
      attachmentPath = req.file.path;
      attachmentSize = req.file.size;
    }

    const assignment = await Assignment.create({
      collegeId: subject.collegeId,
      subjectId: subject._id,
      subjectCode: subject.code,
      subjectTitle: subject.title,
      teacherId: req.user._id,
      teacherName: req.user.name,
      department: subject.department,
      semester: subject.semester,
      title: title.trim(),
      description: description || '',
      dueDate,
      maxMarks: Number(maxMarks) || 100,
      attachmentName,
      attachmentPath,
      attachmentSize,
      published: published !== 'false' && published !== false
    });

    // Notify students enrolled in this subject's department & semester
    try {
      const students = await User.find({
        collegeId: subject.collegeId,
        role: 'student',
        department: subject.department,
        semester: subject.semester,
        status: 'active'
      }).select('_id');

      const notifications = students.map((s) => ({
        userId: s._id,
        collegeId: subject.collegeId,
        title: 'New Assignment Assigned',
        message: `${subject.code}: "${assignment.title}" has been published. Due date: ${dueDate}`,
        type: 'assignment'
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.warn('Notification broadcast error:', notifErr.message);
    }

    await logAudit({
      req,
      action: 'ASSIGNMENT_CREATED',
      entityType: 'Assignment',
      entityId: assignment._id,
      details: `Created assignment "${assignment.title}" for subject ${subject.code}`,
      collegeId: subject.collegeId
    });

    res.status(201).json({
      success: true,
      message: 'Assignment published successfully!',
      assignment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Student Submit Assignment (supports file upload)
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    // Tenant check
    if (assignment.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    let fileName = '';
    let filePath = '';
    let fileSize = 0;

    if (req.file) {
      fileName = req.file.originalname;
      filePath = req.file.path;
      fileSize = req.file.size;
    }

    // Find existing submission or create new
    let submission = await AssignmentSubmission.findOne({
      assignmentId: id,
      studentId: req.user._id
    });

    if (submission) {
      // If updating, delete previous uploaded file if replaced
      if (req.file && submission.filePath && fs.existsSync(submission.filePath)) {
        try { fs.unlinkSync(submission.filePath); } catch (e) {}
      }

      submission.notes = notes || submission.notes;
      if (req.file) {
        submission.fileName = fileName;
        submission.filePath = filePath;
        submission.fileSize = fileSize;
      }
      submission.submittedAt = new Date();
      submission.status = 'Submitted';
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        collegeId: assignment.collegeId,
        assignmentId: assignment._id,
        studentId: req.user._id,
        studentName: req.user.name,
        rollNo: req.user.rollNo || '',
        notes: notes || '',
        fileName,
        filePath,
        fileSize,
        submittedAt: new Date(),
        status: 'Submitted'
      });
    }

    // Notify teacher
    try {
      await Notification.create({
        userId: assignment.teacherId,
        collegeId: assignment.collegeId,
        title: 'New Assignment Submission',
        message: `${req.user.name} submitted solution for "${assignment.title}".`,
        type: 'assignment'
      });
    } catch (e) {}

    await logAudit({
      req,
      action: 'ASSIGNMENT_SUBMITTED',
      entityType: 'AssignmentSubmission',
      entityId: submission._id,
      details: `Student ${req.user.name} submitted solution for ${assignment.title}`,
      collegeId: assignment.collegeId
    });

    res.json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Teacher Grade Submission
 */
export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found.' });
    }

    // Tenant check
    if (req.user.role !== 'superadmin' && submission.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    submission.status = 'Graded';
    await submission.save();

    // Notify student
    try {
      await Notification.create({
        userId: submission.studentId,
        collegeId: submission.collegeId,
        title: 'Assignment Graded',
        message: `Your submission for "${submission.assignmentId?.title || 'Assignment'}" was graded: ${submission.grade} marks.`,
        type: 'assignment'
      });
    } catch (e) {}

    await logAudit({
      req,
      action: 'ASSIGNMENT_GRADED',
      entityType: 'AssignmentSubmission',
      entityId: submission._id,
      details: `Graded submission for student ${submission.studentName}. Grade: ${submission.grade}`,
      collegeId: submission.collegeId
    });

    res.json({
      success: true,
      message: 'Submission graded successfully!',
      submission
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Assignment
 */
export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    let filter = { _id: id };
    if (req.user.role !== 'superadmin') {
      filter.collegeId = req.user.collegeId;
    }

    const assignment = await Assignment.findOne(filter);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    // Clean up attachment
    if (assignment.attachmentPath && fs.existsSync(assignment.attachmentPath)) {
      try { fs.unlinkSync(assignment.attachmentPath); } catch (e) {}
    }

    // Clean up submissions files
    const submissions = await AssignmentSubmission.find({ assignmentId: id });
    submissions.forEach((sub) => {
      if (sub.filePath && fs.existsSync(sub.filePath)) {
        try { fs.unlinkSync(sub.filePath); } catch (e) {}
      }
    });

    await AssignmentSubmission.deleteMany({ assignmentId: id });
    await Assignment.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'ASSIGNMENT_DELETED',
      entityType: 'Assignment',
      entityId: id,
      details: `Deleted assignment: ${assignment.title}`,
      collegeId: assignment.collegeId
    });

    res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

