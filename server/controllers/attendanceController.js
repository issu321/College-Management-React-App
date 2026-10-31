import { Attendance } from '../models/Attendance.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { getTenantQuery } from '../middleware/tenant.js';
import { logAudit } from '../utils/audit.js';

/**
 * Get attendance records (scoped by subject and/or date)
 */
export const getAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, month } = req.query;
    let filter = getTenantQuery(req);

    if (subjectId) filter.subjectId = subjectId;
    if (date) filter.date = date; // YYYY-MM-DD
    if (month) {
      // Filter by regex YYYY-MM
      filter.date = { $regex: `^${month}` };
    }

    const records = await Attendance.find(filter)
      .populate('subjectId', 'title code department semester')
      .populate('teacherId', 'name email')
      .sort({ date: -1 });

    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
};

/**
 * Save or update Attendance for a Subject on a Date
 * Prevents duplicates by atomic upsert with unique index on { collegeId, subjectId, date }
 */
export const markAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, records } = req.body;

    if (!subjectId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: 'Subject, date (YYYY-MM-DD), and student attendance records are required.'
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

    // Teachers can only submit attendance for their assigned subject unless superadmin
    if (req.user.role === 'teacher' && subject.teacherId && subject.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are only authorized to mark attendance for your subjects.' });
    }

    // Clean records and ensure student names and roll numbers
    const formattedRecords = records.map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName || 'Student',
      rollNo: r.rollNo || '',
      status: ['Present', 'Absent', 'Late', 'Excused'].includes(r.status) ? r.status : 'Present',
      remarks: r.remarks || ''
    }));

    // Find existing to preserve audit history
    const existing = await Attendance.findOne({
      collegeId: subject.collegeId,
      subjectId,
      date
    });

    let attendanceDoc;
    if (existing) {
      existing.records = formattedRecords;
      existing.history.push({
        editedAt: new Date(),
        editedBy: req.user._id,
        note: `Attendance updated by ${req.user.name}`
      });
      attendanceDoc = await existing.save();
    } else {
      attendanceDoc = await Attendance.create({
        collegeId: subject.collegeId,
        subjectId,
        subjectCode: subject.code,
        subjectTitle: subject.title,
        department: subject.department,
        semester: subject.semester,
        teacherId: req.user._id,
        date,
        records: formattedRecords,
        history: [
          {
            editedAt: new Date(),
            editedBy: req.user._id,
            note: `Initial attendance marked by ${req.user.name}`
          }
        ]
      });
    }

    await logAudit({
      req,
      action: 'ATTENDANCE_MARKED',
      entityType: 'Attendance',
      entityId: attendanceDoc._id,
      details: `Marked attendance for ${subject.title} on ${date} (${formattedRecords.length} students)`,
      collegeId: subject.collegeId
    });

    res.status(200).json({
      success: true,
      message: `Attendance for ${subject.title} on ${date} saved successfully!`,
      attendance: attendanceDoc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Student Attendance Summary & History
 * Calculates percentage: (Present + Late*0.5) / Total sessions
 */
export const getStudentAttendanceReport = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.query.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Student ID required.' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // Tenant check
    if (req.user.role !== 'superadmin' && student.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    // Find all attendance records containing this student
    const allSessions = await Attendance.find({
      collegeId: student.collegeId,
      'records.studentId': studentId
    }).sort({ date: -1 });

    const subjectStats = {};
    let totalClasses = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    const detailedHistory = [];

    allSessions.forEach((session) => {
      const studentRecord = session.records.find((r) => r.studentId.toString() === studentId.toString());
      if (studentRecord) {
        totalClasses++;
        if (studentRecord.status === 'Present') totalPresent++;
        else if (studentRecord.status === 'Absent') totalAbsent++;
        else if (studentRecord.status === 'Late') totalLate++;
        else if (studentRecord.status === 'Excused') totalExcused++;

        // Subject breakdown
        const sId = session.subjectId.toString();
        if (!subjectStats[sId]) {
          subjectStats[sId] = {
            subjectId: session.subjectId,
            subjectCode: session.subjectCode,
            subjectTitle: session.subjectTitle,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          };
        }
        subjectStats[sId].total++;
        if (studentRecord.status === 'Present') subjectStats[sId].present++;
        else if (studentRecord.status === 'Absent') subjectStats[sId].absent++;
        else if (studentRecord.status === 'Late') subjectStats[sId].late++;
        else if (studentRecord.status === 'Excused') subjectStats[sId].excused++;

        detailedHistory.push({
          date: session.date,
          subjectCode: session.subjectCode,
          subjectTitle: session.subjectTitle,
          status: studentRecord.status,
          remarks: studentRecord.remarks
        });
      }
    });

    const overallPercentage =
      totalClasses > 0 ? Math.round(((totalPresent + totalLate) / totalClasses) * 100) : 0;

    // Calculate percentages for each subject
    const subjectList = Object.values(subjectStats).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0
    }));

    res.json({
      success: true,
      summary: {
        totalClasses,
        totalPresent,
        totalAbsent,
        totalLate,
        totalExcused,
        overallPercentage
      },
      subjects: subjectList,
      history: detailedHistory
    });
  } catch (err) {
    next(err);
  }
};

