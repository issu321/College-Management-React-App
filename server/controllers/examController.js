import { Examination } from '../models/Examination.js';
import { ExamResult } from '../models/ExamResult.js';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { getTenantQuery } from '../middleware/tenant.js';

export const getExams = async (req, res, next) => {
  try {
    const { department, semester } = req.query;
    let filter = getTenantQuery(req);

    if (req.user.role === 'student') {
      if (req.user.department) filter.department = req.user.department;
      if (req.user.semester) filter.semester = req.user.semester;
    } else {
      if (department && department !== 'ALL') filter.department = department;
      if (semester && semester !== 'ALL') filter.semester = semester;
    }

    const exams = await Examination.find(filter).sort({ startDate: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    next(err);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const { title, examType, department, semester, startDate, endDate, academicYear } = req.body;
    const collegeId = req.user.role === 'superadmin' ? req.body.collegeId : req.user.collegeId;

    if (!title || !department || !semester || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'All exam fields are mandatory.' });
    }

    const exam = await Examination.create({
      collegeId,
      title: title.trim(),
      examType: examType || 'Mid-Term Assessment',
      department,
      semester,
      startDate,
      endDate,
      academicYear: academicYear || '2025-2026',
      status: 'Scheduled'
    });

    res.status(201).json({ success: true, message: 'Examination created.', exam });
  } catch (err) {
    next(err);
  }
};

export const enterMarks = async (req, res, next) => {
  try {
    const { examinationId, subjectId, results } = req.body;

    if (!examinationId || !subjectId || !results || !Array.isArray(results)) {
      return res.status(400).json({ success: false, error: 'Examination, subject, and results list required.' });
    }

    const [exam, subject] = await Promise.all([
      Examination.findById(examinationId),
      Subject.findById(subjectId)
    ]);

    if (!exam || !subject) {
      return res.status(404).json({ success: false, error: 'Exam or subject not found.' });
    }

    // Save marks for each student
    const savedResults = await Promise.all(
      results.map(async (r) => {
        const marksObtained = Number(r.marksObtained) || 0;
        const maxMarks = Number(r.maxMarks) || 100;

        let resDoc = await ExamResult.findOne({
          examinationId,
          subjectId,
          studentId: r.studentId
        });

        if (resDoc) {
          resDoc.marksObtained = marksObtained;
          resDoc.maxMarks = maxMarks;
          resDoc.remarks = r.remarks || '';
          return await resDoc.save();
        } else {
          return await ExamResult.create({
            collegeId: exam.collegeId,
            examinationId,
            subjectId,
            subjectTitle: subject.title,
            subjectCode: subject.code,
            studentId: r.studentId,
            studentName: r.studentName || 'Student',
            rollNo: r.rollNo || '',
            marksObtained,
            maxMarks,
            remarks: r.remarks || ''
          });
        }
      })
    );

    // Update exam status to Results Published
    exam.status = 'Results Published';
    await exam.save();

    res.json({
      success: true,
      message: 'Examination results saved and published.',
      results: savedResults
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentExamResults = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.query.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Student ID required.' });
    }

    const results = await ExamResult.find({ studentId })
      .populate('examinationId', 'title examType startDate endDate academicYear status')
      .populate('subjectId', 'title code credits')
      .sort({ createdAt: -1 });

    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

