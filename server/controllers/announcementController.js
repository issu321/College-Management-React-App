import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { getTenantQuery } from '../middleware/tenant.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'superadmin') {
      const collegeFilter = req.query.collegeId;
      if (collegeFilter && collegeFilter !== 'ALL') {
        filter.$or = [{ collegeId: 'ALL' }, { collegeId: collegeFilter }];
      }
    } else {
      // Must match global 'ALL' or user's collegeId
      filter.$or = [{ collegeId: 'ALL' }, { collegeId: req.user.collegeId.toString() }];

      // Target role check
      filter.targetRole = { $in: ['ALL', req.user.role] };

      // If student or teacher has department, show department announcements or 'ALL'
      if (req.user.department) {
        filter.department = { $in: ['ALL', req.user.department] };
      }
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetRole, department } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const collegeId =
      req.user.role === 'superadmin'
        ? (req.body.collegeId || 'ALL')
        : req.user.collegeId.toString();

    const announcement = await Announcement.create({
      collegeId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'Administrative',
      priority: priority || 'Normal',
      targetRole: targetRole || 'ALL',
      department: department || 'ALL',
      authorName: req.user.name,
      authorId: req.user._id
    });

    // Create notifications for targeted users
    try {
      const userFilter = { status: 'active' };
      if (collegeId !== 'ALL') userFilter.collegeId = collegeId;
      if (targetRole && targetRole !== 'ALL') userFilter.role = targetRole;
      if (department && department !== 'ALL') userFilter.department = department;

      const recipients = await User.find(userFilter).select('_id');
      const notifs = recipients.map((r) => ({
        userId: r._id,
        collegeId: collegeId === 'ALL' ? null : collegeId,
        title: `Announcement: ${announcement.title}`,
        message: announcement.content.slice(0, 120),
        type: 'announcement'
      }));

      if (notifs.length > 0) {
        await Notification.insertMany(notifs);
      }
    } catch (e) {}

    res.status(201).json({ success: true, message: 'Announcement published.', announcement });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    let filter = { _id: id };
    if (req.user.role !== 'superadmin') {
      filter.collegeId = req.user.collegeId.toString();
    }

    const deleted = await Announcement.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }

    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    next(err);
  }
};

