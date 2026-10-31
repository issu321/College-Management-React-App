import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: String,
      required: true,
      trim: true // e.g. "6th Sem"
    },
    course: {
      type: String,
      default: ''
    },
    credits: {
      type: Number,
      default: 4
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    teacherName: {
      type: String,
      default: ''
    },
    room: {
      type: String,
      default: 'Hall 101'
    },
    syllabus: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

subjectSchema.index({ collegeId: 1, code: 1 }, { unique: true });

export const Subject = mongoose.model('Subject', subjectSchema);

