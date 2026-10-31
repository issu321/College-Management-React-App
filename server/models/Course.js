import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    degreeType: {
      type: String,
      enum: ['B.Tech', 'B.E.', 'M.Tech', 'M.E.', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 'Diploma', 'Ph.D.'],
      default: 'B.Tech'
    },
    durationYears: {
      type: Number,
      default: 4
    },
    totalSemesters: {
      type: Number,
      default: 8
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ collegeId: 1, code: 1 }, { unique: true });

export const Course = mongoose.model('Course', courseSchema);

