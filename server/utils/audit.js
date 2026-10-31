import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  action,
  entityType,
  entityId = '',
  details = '',
  collegeId = null
}) => {
  try {
    const finalCollegeId = collegeId || req?.user?.collegeId || null;
    const userId = req?.user?._id || null;
    const userRole = req?.user?.role || 'system';
    const userName = req?.user?.name || (req?.user?.username ? `@${req.user.username}` : 'System');
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';

    await AuditLog.create({
      collegeId: finalCollegeId,
      userId,
      userRole,
      userName,
      action,
      entityType,
      entityId: String(entityId),
      details,
      ipAddress
    });
  } catch (err) {
    console.warn('[Audit Logger Warning] Failed to persist audit record:', err.message);
  }
};

