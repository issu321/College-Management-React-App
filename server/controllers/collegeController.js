import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';

export const getPublicActiveColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({ status: 'Active' })
      .select('name shortName code collegeType city state departments courses programs semesterStructure logo')
      .sort({ name: 1 });
    res.json({ success: true, colleges });
  } catch (err) {
    next(err);
  }
};

export const getCollegeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, error: 'College not found.' });
    }

    const [teacherCount, studentCount, subjectCount] = await Promise.all([
      User.countDocuments({ collegeId: id, role: 'teacher', status: 'active' }),
      User.countDocuments({ collegeId: id, role: 'student', status: 'active' }),
      Subject.countDocuments({ collegeId: id })
    ]);

    res.json({
      success: true,
      college: {
        ...college.toObject(),
        stats: { teacherCount, studentCount, subjectCount }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMyCollege = async (req, res, next) => {
  try {
    if (!req.user.collegeId) {
      return res.status(400).json({ success: false, error: 'User does not belong to a college tenant.' });
    }

    const college = await College.findById(req.user.collegeId);
    if (!college) {
      return res.status(404).json({ success: false, error: 'Institutional college record not found.' });
    }

    const [teacherCount, studentCount, subjectCount] = await Promise.all([
      User.countDocuments({ collegeId: college._id, role: 'teacher', status: 'active' }),
      User.countDocuments({ collegeId: college._id, role: 'student', status: 'active' }),
      Subject.countDocuments({ collegeId: college._id })
    ]);

    res.json({
      success: true,
      college: {
        ...college.toObject(),
        stats: { teacherCount, studentCount, subjectCount }
      }
    });
  } catch (err) {
    next(err);
  }
};

