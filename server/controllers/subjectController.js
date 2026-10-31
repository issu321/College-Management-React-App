import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Assignment } from '../models/Assignment.js';
import { getTenantQuery } from '../middleware/tenant.js';
import { logAudit } from '../utils/audit.js';

/**
 * Get subjects scoped by tenant and role
 */
export const getSubjects = async (req, res, next) => {
  try {
    const { department, semester, search } = req.query;
    let filter = getTenantQuery(req);

    // If teacher, can optionally filter by their assigned subjects or all in college
    if (req.user.role === 'teacher' && req.query.mine === 'true') {
      filter.teacherId = req.user._id;
    }

    // If student, filter by student's department and semester if requested
    if (req.user.role === 'student') {
      if (req.user.department) filter.department = req.user.department;
      if (req.user.semester) filter.semester = req.user.semester;
    } else {
      if (department && department !== 'ALL') filter.department = department;
      if (semester && semester !== 'ALL') filter.semester = semester;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(filter)
      .populate('teacherId', 'name email designation qualification avatar')
      .sort({ code: 1 });

    // Enhance each subject with materials and assignment counts
    const subjectsWithMeta = await Promise.all(
      subjects.map(async (s) => {
        const [materialsCount, assignmentsCount] = await Promise.all([
          StudyMaterial.countDocuments({ subjectId: s._id }),
          Assignment.countDocuments({ subjectId: s._id })
        ]);
        return {
          ...s.toObject(),
          materialsCount,
          assignmentsCount
        };
      })
    );

    res.json({ success: true, subjects: subjectsWithMeta });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new subject (Teacher or Super Admin)
 */
export const createSubject = async (req, res, next) => {
  try {
    const {
      code,
      title,
      department,
      semester,
      course,
      credits,
      room,
      syllabus,
      description,
      teacherId
    } = req.body;

    const collegeId = req.user.role === 'superadmin' ? (req.body.collegeId || req.tenantCollegeId) : req.user.collegeId;

    if (!collegeId) {
      return res.status(400).json({ success: false, error: 'College ID is required to create a subject.' });
    }

    if (!code || !title || !department || !semester) {
      return res.status(400).json({
        success: false,
        error: 'Subject code, title, department, and semester are mandatory.'
      });
    }

    // Check uniqueness within college
    const existing = await Subject.findOne({ collegeId, code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A subject with code '${code.toUpperCase()}' already exists in this college.`
      });
    }

    // Determine assigned teacher
    let assignedTeacherId = null;
    let assignedTeacherName = 'Unassigned';

    if (req.user.role === 'teacher') {
      assignedTeacherId = req.user._id;
      assignedTeacherName = req.user.name;
    } else if (teacherId) {
      const teacher = await User.findOne({ _id: teacherId, collegeId, role: 'teacher' });
      if (teacher) {
        assignedTeacherId = teacher._id;
        assignedTeacherName = teacher.name;
      }
    }

    const subject = await Subject.create({
      collegeId,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      department: department.trim(),
      semester: semester.trim(),
      course: course || '',
      credits: credits || 4,
      room: room || 'Hall 101',
      syllabus: syllabus || '',
      description: description || '',
      teacherId: assignedTeacherId,
      teacherName: assignedTeacherName
    });

    await logAudit({
      req,
      action: 'SUBJECT_CREATED',
      entityType: 'Subject',
      entityId: subject._id,
      details: `Created subject: ${subject.title} (${subject.code})`,
      collegeId
    });

    res.status(201).json({ success: true, message: 'Subject created successfully!', subject });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Subject
 */
export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    let filter = { _id: id };
    if (req.user.role !== 'superadmin') {
      filter.collegeId = req.user.collegeId;
    }

    const subject = await Subject.findOne(filter);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found or access denied.' });
    }

    // Teachers can only edit subjects they teach, unless superadmin
    if (req.user.role === 'teacher' && subject.teacherId && subject.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are only authorized to edit your assigned subjects.' });
    }

    const updated = await Subject.findByIdAndUpdate(id, req.body, { new: true });

    await logAudit({
      req,
      action: 'SUBJECT_UPDATED',
      entityType: 'Subject',
      entityId: id,
      details: `Updated subject ${updated.title} (${updated.code})`,
      collegeId: updated.collegeId
    });

    res.json({ success: true, message: 'Subject updated successfully.', subject: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Subject
 */
export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    let filter = { _id: id };
    if (req.user.role !== 'superadmin') {
      filter.collegeId = req.user.collegeId;
    }

    const subject = await Subject.findOne(filter);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    // Cascade delete materials and assignments for this subject
    await Promise.all([
      StudyMaterial.deleteMany({ subjectId: id }),
      Assignment.deleteMany({ subjectId: id }),
      Subject.findByIdAndDelete(id)
    ]);

    await logAudit({
      req,
      action: 'SUBJECT_DELETED',
      entityType: 'Subject',
      entityId: id,
      details: `Deleted subject: ${subject.title} (${subject.code})`,
      collegeId: subject.collegeId
    });

    res.json({ success: true, message: `Subject '${subject.title}' removed.` });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Students Enrolled/Applicable to Subject
 */
export const getEnrolledStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    // Tenant check
    if (req.user.role !== 'superadmin' && req.user.collegeId.toString() !== subject.collegeId.toString()) {
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    // Find students belonging to the same college, department, and semester
    const students = await User.find({
      collegeId: subject.collegeId,
      role: 'student',
      status: 'active',
      department: subject.department,
      semester: subject.semester
    }).select('name email rollNo registrationNumber avatar phone course semester');

    res.json({ success: true, subject, students });
  } catch (err) {
    next(err);
  }
};

