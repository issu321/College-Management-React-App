import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true
    },
    rollNo: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    grade: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded', 'Resubmission Requested'],
      default: 'Submitted'
    }
  },
  {
    timestamps: true
  }
);

// One active submission per student per assignment
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

