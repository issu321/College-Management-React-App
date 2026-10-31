import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.Mixed, // ObjectId or 'GLOBAL' or null
      default: null,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userRole: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: 'System'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      required: true // 'College', 'User', 'Subject', 'Attendance', 'Assignment', 'Exam', etc.
    },
    entityId: {
      type: String,
      default: ''
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

