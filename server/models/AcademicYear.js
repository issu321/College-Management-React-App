import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    yearString: {
      type: String,
      required: true,
      trim: true // e.g. "2025-2026"
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    isCurrent: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

academicYearSchema.index({ collegeId: 1, yearString: 1 }, { unique: true });

export const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

