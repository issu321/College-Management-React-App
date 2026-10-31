import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    semesterNumber: {
      type: Number,
      required: true
    },
    semesterName: {
      type: String,
      required: true,
      trim: true // e.g. "6th Sem" or "Semester VI"
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    }
  },
  {
    timestamps: true
  }
);

semesterSchema.index({ collegeId: 1, department: 1, course: 1, semesterNumber: 1 }, { unique: true });

export const Semester = mongoose.model('Semester', semesterSchema);

