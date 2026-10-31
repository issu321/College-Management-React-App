import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    // 'ALL' for superadmin global broadcast, or college ObjectId
    collegeId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Academic & Cultural', 'Examination', 'Administrative', 'Admissions', 'Sports & Events', 'Urgent Notice'],
      default: 'Administrative'
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal'
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'teacher', 'student'],
      default: 'ALL'
    },
    department: {
      type: String,
      default: 'ALL'
    },
    authorName: {
      type: String,
      default: 'Administration'
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);

