import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { logAudit } from '../utils/audit.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      collegeId: user.collegeId
    },
    process.env.JWT_SECRET || 'apex_enterprise_cms_jwt_secret_key_2026_super_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username/email and password.'
      });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Query user by email, username, employeeId, or rollNo
    const user = await User.findOne({
      $or: [
        { email: cleanId },
        { username: cleanId },
        { employeeId: identifier.trim() },
        { rollNo: identifier.trim() },
        { registrationNumber: identifier.trim() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User record not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Your account is suspended. Please contact the administrator.'
      });
    }

    if (user.status === 'pending' && user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Your registration is awaiting institutional administrator approval.'
      });
    }

    const token = generateToken(user);

    // Fetch college details if not superadmin
    let collegeInfo = null;
    if (user.collegeId) {
      collegeInfo = await College.findById(user.collegeId).select('name code status logo');
    }

    const userObj = user.toObject();
    delete userObj.password;

    await logAudit({
      req,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user._id,
      details: `User ${user.name} (${user.role}) logged in successfully.`,
      collegeId: user.collegeId
    });

    res.json({
      success: true,
      token,
      user: {
        ...userObj,
        collegeName: collegeInfo?.name || '',
        collegeCode: collegeInfo?.code || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

export const registerTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      collegeId,
      department,
      designation,
      qualification,
      experience,
      employeeId,
      phone,
      specialization
    } = req.body;

    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and college selection are mandatory.'
      });
    }

    // Verify college exists and is active
    const college = await College.findById(collegeId);
    if (!college || college.status !== 'Active') {
      return res.status(400).json({
        success: false,
        error: 'The selected college is either inactive or does not exist.'
      });
    }

    // Check existing teacher with email in same college
    const existing = await User.findOne({
      collegeId,
      email: email.trim().toLowerCase()
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A teacher with this email is already registered in this college.'
      });
    }

    const teacher = await User.create({
      role: 'teacher',
      collegeId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      department: department || 'General Engineering',
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'M.Tech / Ph.D.',
      experience: experience || '0 Years',
      employeeId: employeeId?.trim() || `EMP-${Date.now().toString().slice(-5)}`,
      phone: phone || '',
      specialization: specialization || '',
      status: 'pending', // Requires Super Admin approval
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });

    await logAudit({
      req,
      action: 'TEACHER_REGISTERED',
      entityType: 'User',
      entityId: teacher._id,
      details: `Teacher ${teacher.name} registered for college ${college.name}. Status: Pending.`,
      collegeId
    });

    res.status(201).json({
      success: true,
      message: 'Teacher registration submitted successfully! Awaiting institutional administrator approval.',
      teacherId: teacher._id
    });
  } catch (err) {
    next(err);
  }
};

export const registerStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      collegeId,
      department,
      course,
      semester,
      rollNo,
      registrationNumber,
      academicYear,
      phone,
      dob,
      gender,
      address
    } = req.body;

    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and college selection are mandatory.'
      });
    }

    const college = await College.findById(collegeId);
    if (!college || college.status !== 'Active') {
      return res.status(400).json({
        success: false,
        error: 'Selected college is inactive or does not exist.'
      });
    }

    // Check existing student
    const existing = await User.findOne({
      collegeId,
      email: email.trim().toLowerCase()
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A student with this email is already registered in this college.'
      });
    }

    const student = await User.create({
      role: 'student',
      collegeId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      department: department || 'Computer Science & Engineering',
      course: course || 'B.Tech Computer Science',
      semester: semester || '1st Sem',
      rollNo: rollNo?.trim() || `STU-${Date.now().toString().slice(-5)}`,
      registrationNumber: registrationNumber?.trim() || `REG-${Date.now().toString().slice(-6)}`,
      academicYear: academicYear || '2025-2026',
      phone: phone || '',
      dob: dob ? new Date(dob) : null,
      gender: gender || '',
      address: address || '',
      status: 'pending', // Requires administrator approval
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
    });

    await logAudit({
      req,
      action: 'STUDENT_REGISTERED',
      entityType: 'User',
      entityId: student._id,
      details: `Student ${student.name} registered for college ${college.name}. Status: Pending.`,
      collegeId
    });

    res.status(201).json({
      success: true,
      message: 'Student registration submitted successfully! Awaiting institutional approval.',
      studentId: student._id
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let college = null;
    if (user.collegeId) {
      college = await College.findById(user.collegeId);
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        collegeName: college?.name || '',
        collegeCode: college?.code || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, qualification, specialization, avatar, department, designation, experience } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();
    if (qualification !== undefined) updates.qualification = qualification.trim();
    if (specialization !== undefined) updates.specialization = specialization.trim();
    if (department !== undefined) updates.department = department.trim();
    if (designation !== undefined) updates.designation = designation.trim();
    if (experience !== undefined) updates.experience = experience.trim();
    if (avatar) updates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    let college = null;
    if (updatedUser.collegeId) {
      college = await College.findById(updatedUser.collegeId);
    }

    await logAudit({
      req,
      action: 'PROFILE_UPDATED',
      entityType: 'User',
      entityId: req.user._id,
      details: `User ${updatedUser.name} updated profile details.`,
      collegeId: updatedUser.collegeId
    });

    res.json({
      success: true,
      user: {
        ...updatedUser.toObject(),
        collegeName: college?.name || '',
        collegeCode: college?.code || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No avatar image file uploaded.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const avatarUrl = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    let college = null;
    if (updatedUser.collegeId) {
      college = await College.findById(updatedUser.collegeId);
    }

    await logAudit({
      req,
      action: 'AVATAR_UPDATED',
      entityType: 'User',
      entityId: req.user._id,
      details: `User ${updatedUser.name} updated profile avatar.`,
      collegeId: updatedUser.collegeId
    });

    res.json({
      success: true,
      avatarUrl,
      user: {
        ...updatedUser.toObject(),
        collegeName: college?.name || '',
        collegeCode: college?.code || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password does not match.'
      });
    }

    user.password = newPassword;
    await user.save();

    await logAudit({
      req,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user._id,
      details: `User ${user.name} changed their password.`
    });

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

