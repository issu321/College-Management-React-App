import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },
    subjectCode: {
      type: String,
      default: ''
    },
    subjectTitle: {
      type: String,
      default: ''
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    teacherName: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    semester: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    attachmentName: {
      type: String,
      default: ''
    },
    attachmentPath: {
      type: String,
      default: ''
    },
    attachmentSize: {
      type: Number,
      default: 0
    },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Assignment = mongoose.model('Assignment', assignmentSchema);

