import fs from 'fs';
import path from 'path';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Subject } from '../models/Subject.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { getTenantQuery } from '../middleware/tenant.js';
import { logAudit } from '../utils/audit.js';

/**
 * List Study Materials (scoped by tenant and role)
 */
export const getStudyMaterials = async (req, res, next) => {
  try {
    const { subjectId, department, semester, category, search } = req.query;
    let filter = getTenantQuery(req);

    if (subjectId) filter.subjectId = subjectId;
    if (category && category !== 'ALL') filter.category = category;

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
        { description: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    const materials = await StudyMaterial.find(filter)
      .populate('subjectId', 'title code department semester')
      .populate('teacherId', 'name email designation avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, materials });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload Study Material File
 */
export const uploadStudyMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please select a file to upload.' });
    }

    const { title, description, subjectId, category } = req.body;

    if (!title || !subjectId) {
      // Remove uploaded file if validation failed
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({ success: false, error: 'Title and subject selection are required.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(404).json({ success: false, error: 'Subject not found.' });
    }

    // Tenant check
    if (req.user.role !== 'superadmin' && subject.collegeId.toString() !== req.user.collegeId.toString()) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
    }

    const material = await StudyMaterial.create({
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
      category: category || 'Lecture Slides & Notes',
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Notify enrolled students
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
        title: 'New Study Material Uploaded',
        message: `${subject.code}: "${material.title}" is now available for download.`,
        type: 'material'
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (e) {}

    await logAudit({
      req,
      action: 'MATERIAL_UPLOADED',
      entityType: 'StudyMaterial',
      entityId: material._id,
      details: `Uploaded resource "${material.title}" (${(material.fileSize / 1024).toFixed(1)} KB) for ${subject.code}`,
      collegeId: subject.collegeId
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully!',
      material
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Study Material
 */
export const deleteStudyMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    let filter = { _id: id };
    if (req.user.role !== 'superadmin') {
      filter.collegeId = req.user.collegeId;
    }

    const material = await StudyMaterial.findOne(filter);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Study material not found.' });
    }

    // Delete disk file
    if (material.filePath && fs.existsSync(material.filePath)) {
      try { fs.unlinkSync(material.filePath); } catch (e) {}
    }

    await StudyMaterial.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'MATERIAL_DELETED',
      entityType: 'StudyMaterial',
      entityId: id,
      details: `Deleted material: ${material.title}`,
      collegeId: material.collegeId
    });

    res.json({ success: true, message: 'Material removed successfully.' });
  } catch (err) {
    next(err);
  }
};

