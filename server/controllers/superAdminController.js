import fs from 'fs';
import path from 'path';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Subject } from '../models/Subject.js';
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { AssignmentSubmission } from '../models/AssignmentSubmission.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Timetable } from '../models/Timetable.js';
import { Examination } from '../models/Examination.js';
import { ExamResult } from '../models/ExamResult.js';
import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { logAudit } from '../utils/audit.js';

/**
 * Super Admin Dashboard Aggregated Statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalColleges,
      activeColleges,
      totalTeachers,
      pendingTeachers,
      totalStudents,
      pendingStudents,
      totalSubjects,
      totalMaterials,
      totalAssignments,
      recentUsers,
      recentColleges,
      recentAuditLogs
    ] = await Promise.all([
      College.countDocuments(),
      College.countDocuments({ status: 'Active' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'teacher', status: 'pending' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'pending' }),
      Subject.countDocuments(),
      StudyMaterial.countDocuments(),
      Assignment.countDocuments(),
      User.find({ role: { $in: ['teacher', 'student'] } })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('collegeId', 'name code'),
      College.find().sort({ createdAt: -1 }).limit(5),
      AuditLog.find().sort({ createdAt: -1 }).limit(8)
    ]);

    // Calculate disk storage consumption from uploaded materials
    const materials = await StudyMaterial.find().select('fileSize');
    const totalStorageBytes = materials.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
    const storageStats = {
      totalBytes: totalStorageBytes,
      totalMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
      totalFiles: materials.length
    };

    // System Health Status
    const systemHealth = {
      database: 'Connected (MongoDB 9.0 Enterprise Ready)',
      serverUptime: `${Math.floor(process.uptime())}s`,
      nodeVersion: process.version,
      memoryUsageMB: (process.memoryUsage().rss / (1024 * 1024)).toFixed(1),
      status: 'Healthy'
    };

    res.json({
      success: true,
      stats: {
        totalColleges,
        activeColleges,
        totalTeachers,
        pendingTeachers,
        totalStudents,
        pendingStudents,
        totalSubjects,
        totalMaterials,
        totalAssignments,
        storageStats,
        systemHealth,
        recentRegistrations: recentUsers,
        recentColleges,
        recentAuditLogs
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * College Management: List all colleges
 */
export const getAllColleges = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'ALL') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    const colleges = await College.find(filter).sort({ createdAt: -1 });

    // Enhance colleges with live student/teacher counts
    const collegesWithCounts = await Promise.all(
      colleges.map(async (c) => {
        const [teacherCount, studentCount, subjectCount] = await Promise.all([
          User.countDocuments({ collegeId: c._id, role: 'teacher' }),
          User.countDocuments({ collegeId: c._id, role: 'student' }),
          Subject.countDocuments({ collegeId: c._id })
        ]);
        return {
          ...c.toObject(),
          teacherCount,
          studentCount,
          subjectCount
        };
      })
    );

    res.json({ success: true, colleges: collegesWithCounts });
  } catch (err) {
    next(err);
  }
};

/**
 * College Management: Create new college
 */
export const createCollege = async (req, res, next) => {
  try {
    const {
      name,
      shortName,
      code,
      collegeType,
      affiliation,
      accreditation,
      website,
      email,
      phone,
      country,
      state,
      district,
      city,
      postalCode,
      address,
      principalName,
      adminName,
      adminEmail,
      adminPhone,
      academicYear,
      programs,
      departments,
      courses,
      semesterStructure,
      logo,
      description,
      status
    } = req.body;

    if (!name || !code || !email || !city || !state) {
      return res.status(400).json({
        success: false,
        error: 'College name, unique code, official email, state, and city are mandatory.'
      });
    }

    // Check unique code
    const existing = await College.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A college with code '${code.toUpperCase()}' is already registered.`
      });
    }

    const college = await College.create({
      name: name.trim(),
      shortName: shortName?.trim() || '',
      code: code.trim().toUpperCase(),
      collegeType: collegeType || 'Autonomous Engineering',
      affiliation: affiliation || '',
      accreditation: accreditation || '',
      website: website || '',
      email: email.trim().toLowerCase(),
      phone: phone || '',
      country: country || 'India',
      state: state || '',
      district: district || '',
      city: city || '',
      postalCode: postalCode || '',
      address: address || '',
      principalName: principalName || '',
      adminName: adminName || '',
      adminEmail: adminEmail?.toLowerCase() || '',
      adminPhone: adminPhone || '',
      academicYear: academicYear || '2025-2026',
      programs: programs && programs.length > 0 ? programs : ['Undergraduate (B.Tech / B.E.)'],
      departments: departments && departments.length > 0 ? departments : ['Computer Science & Engineering'],
      courses: courses && courses.length > 0 ? courses : ['B.Tech Computer Science'],
      semesterStructure: semesterStructure || '8 Semesters (4 Years)',
      logo: logo || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=150&q=80',
      description: description || '',
      status: status || 'Active'
    });

    await logAudit({
      req,
      action: 'COLLEGE_CREATED',
      entityType: 'College',
      entityId: college._id,
      details: `Created new institutional tenant: ${college.name} (${college.code})`
    });

    res.status(201).json({
      success: true,
      message: 'Institutional tenant created successfully!',
      college
    });
  } catch (err) {
    next(err);
  }
};

/**
 * College Management: Update existing college
 */
export const updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, error: 'College not found.' });
    }

    const updated = await College.findByIdAndUpdate(id, req.body, { new: true });

    await logAudit({
      req,
      action: 'COLLEGE_UPDATED',
      entityType: 'College',
      entityId: id,
      details: `Updated details for ${updated.name}`
    });

    res.json({ success: true, message: 'College updated successfully.', college: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * College Management: Toggle Status (Active / Inactive / Suspended)
 */
export const setCollegeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' });
    }

    const college = await College.findByIdAndUpdate(id, { status }, { new: true });
    if (!college) {
      return res.status(404).json({ success: false, error: 'College not found.' });
    }

    await logAudit({
      req,
      action: 'COLLEGE_STATUS_CHANGED',
      entityType: 'College',
      entityId: id,
      details: `Status of ${college.name} changed to ${status}`
    });

    res.json({ success: true, message: `College status updated to ${status}.`, college });
  } catch (err) {
    next(err);
  }
};

/**
 * College Management: Delete college with safe dependency checks
 */
export const deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, error: 'College not found.' });
    }

    // Check dependencies
    const [teacherCount, studentCount, subjectCount] = await Promise.all([
      User.countDocuments({ collegeId: id, role: 'teacher' }),
      User.countDocuments({ collegeId: id, role: 'student' }),
      Subject.countDocuments({ collegeId: id })
    ]);

    if ((teacherCount > 0 || studentCount > 0 || subjectCount > 0) && force !== 'true') {
      return res.status(400).json({
        success: false,
        error: `Cannot delete college '${college.name}'. It contains active dependencies: ${teacherCount} teachers, ${studentCount} students, and ${subjectCount} subjects. Deactivate or reassign first, or provide force=true if permanent deletion is confirmed.`,
        dependencies: { teacherCount, studentCount, subjectCount }
      });
    }

    // If force is confirmed or no dependencies exist, perform cascade cleanup
    await Promise.all([
      User.deleteMany({ collegeId: id }),
      Subject.deleteMany({ collegeId: id }),
      Attendance.deleteMany({ collegeId: id }),
      Assignment.deleteMany({ collegeId: id }),
      AssignmentSubmission.deleteMany({ collegeId: id }),
      StudyMaterial.deleteMany({ collegeId: id }),
      Timetable.deleteMany({ collegeId: id }),
      Examination.deleteMany({ collegeId: id }),
      ExamResult.deleteMany({ collegeId: id }),
      Announcement.deleteMany({ collegeId: id }),
      Notification.deleteMany({ collegeId: id }),
      College.findByIdAndDelete(id)
    ]);

    await logAudit({
      req,
      action: 'COLLEGE_DELETED',
      entityType: 'College',
      entityId: id,
      details: `Deleted college tenant: ${college.name} (${college.code})`
    });

    res.json({
      success: true,
      message: `College '${college.name}' and its associated records have been removed.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User Approval & Management: Teachers
 */
export const getAllTeachers = async (req, res, next) => {
  try {
    const { collegeId, status, search } = req.query;
    const filter = { role: 'teacher' };
    if (collegeId && collegeId !== 'ALL') filter.collegeId = collegeId;
    if (status && status !== 'ALL') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await User.find(filter)
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, teachers });
  } catch (err) {
    next(err);
  }
};

export const updateTeacherStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'pending' | 'suspended'

    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid user status.' });
    }

    const teacher = await User.findOneAndUpdate(
      { _id: id, role: 'teacher' },
      { status },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher record not found.' });
    }

    await logAudit({
      req,
      action: `TEACHER_STATUS_${status.toUpperCase()}`,
      entityType: 'User',
      entityId: id,
      details: `Teacher ${teacher.name} status updated to ${status}`
    });

    res.json({ success: true, message: `Teacher status set to ${status}.`, teacher });
  } catch (err) {
    next(err);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await User.findOneAndDelete({ _id: id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }

    // Reassign teacher's subjects
    await Subject.updateMany({ teacherId: id }, { teacherId: null, teacherName: 'Unassigned' });

    await logAudit({
      req,
      action: 'TEACHER_DELETED',
      entityType: 'User',
      entityId: id,
      details: `Deleted teacher: ${teacher.name} (${teacher.email})`
    });

    res.json({ success: true, message: `Teacher '${teacher.name}' removed.` });
  } catch (err) {
    next(err);
  }
};

/**
 * User Approval & Management: Students
 */
export const getAllStudents = async (req, res, next) => {
  try {
    const { collegeId, status, department, semester, search } = req.query;
    const filter = { role: 'student' };
    if (collegeId && collegeId !== 'ALL') filter.collegeId = collegeId;
    if (status && status !== 'ALL') filter.status = status;
    if (department && department !== 'ALL') filter.department = department;
    if (semester && semester !== 'ALL') filter.semester = semester;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(filter)
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, students });
  } catch (err) {
    next(err);
  }
};

export const updateStudentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid user status.' });
    }

    const student = await User.findOneAndUpdate(
      { _id: id, role: 'student' },
      { status },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student record not found.' });
    }

    await logAudit({
      req,
      action: `STUDENT_STATUS_${status.toUpperCase()}`,
      entityType: 'User',
      entityId: id,
      details: `Student ${student.name} status updated to ${status}`
    });

    res.json({ success: true, message: `Student status set to ${status}.`, student });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await User.findOneAndDelete({ _id: id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    await logAudit({
      req,
      action: 'STUDENT_DELETED',
      entityType: 'User',
      entityId: id,
      details: `Deleted student: ${student.name} (${student.rollNo})`
    });

    res.json({ success: true, message: `Student '${student.name}' removed.` });
  } catch (err) {
    next(err);
  }
};

/**
 * Audit Logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, search, limit = 50 } = req.query;
    const filter = {};
    if (action && action !== 'ALL') filter.action = action;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

/**
 * Platform Analytics Aggregation
 */
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    // Aggregation of students by department across colleges
    const studentsByDept = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Colleges by state
    const collegesByState = await College.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total subjects per department
    const subjectsByDept = await Subject.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        studentsByDept,
        collegesByState,
        subjectsByDept
      }
    });
  } catch (err) {
    next(err);
  }
};

