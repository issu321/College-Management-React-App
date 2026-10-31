import { Timetable } from '../models/Timetable.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { getTenantQuery } from '../middleware/tenant.js';

export const getTimetable = async (req, res, next) => {
  try {
    const { department, semester, dayOfWeek } = req.query;
    let filter = getTenantQuery(req);

    if (req.user.role === 'student') {
      if (req.user.department) filter.department = req.user.department;
      if (req.user.semester) filter.semester = req.user.semester;
    } else {
      if (department && department !== 'ALL') filter.department = department;
      if (semester && semester !== 'ALL') filter.semester = semester;
    }

    if (dayOfWeek && dayOfWeek !== 'ALL') filter.dayOfWeek = dayOfWeek;

    const schedules = await Timetable.find(filter)
      .populate('subjectId', 'title code credits room')
      .populate('teacherId', 'name email designation avatar')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({ success: true, schedules });
  } catch (err) {
    next(err);
  }
};

export const createTimetableEntry = async (req, res, next) => {
  try {
    const {
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      classroom,
      teacherId
    } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    // Tenant check
    if (req.user.role !== 'superadmin' && subject.collegeId.toString() !== req.user.collegeId.toString()) {
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    let assignedTeacher = null;
    if (teacherId) {
      assignedTeacher = await User.findById(teacherId);
    } else if (subject.teacherId) {
      assignedTeacher = await User.findById(subject.teacherId);
    } else {
      assignedTeacher = req.user;
    }

    const entry = await Timetable.create({
      collegeId: subject.collegeId,
      department: subject.department,
      semester: subject.semester,
      dayOfWeek,
      startTime,
      endTime,
      classroom: classroom || subject.room || 'Room 101',
      subjectId: subject._id,
      subjectCode: subject.code,
      subjectTitle: subject.title,
      teacherId: assignedTeacher._id,
      teacherName: assignedTeacher.name
    });

    res.status(201).json({ success: true, message: 'Class schedule added.', schedule: entry });
  } catch (err) {
    next(err);
  }
};

export const deleteTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    let filter = { _id: id };
    if (req.user.role !== 'superadmin') {
      filter.collegeId = req.user.collegeId;
    }

    const deleted = await Timetable.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found.' });
    }

    res.json({ success: true, message: 'Timetable slot removed.' });
  } catch (err) {
    next(err);
  }
};

