import mongoose from 'mongoose';

const examinationSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true // e.g. "Spring 2026 Mid-Term Examination"
    },
    examType: {
      type: String,
      enum: ['Mid-Term Assessment', 'End-Term Semester Exam', 'Internal Practical Exam', 'Class Quiz / Test'],
      default: 'Mid-Term Assessment'
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    department: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Results Published'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

export const Examination = mongoose.model('Examination', examinationSchema);

