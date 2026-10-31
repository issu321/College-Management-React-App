import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
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
    semester: {
      type: String,
      required: true,
      trim: true
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
      index: true
    },
    startTime: {
      type: String, // e.g. "09:00 AM" or "09:00"
      required: true
    },
    endTime: {
      type: String, // e.g. "10:30 AM" or "10:30"
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
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
      required: true
    },
    teacherName: {
      type: String,
      default: ''
    },
    classroom: {
      type: String,
      default: 'Room 101'
    }
  },
  {
    timestamps: true
  }
);

export const Timetable = mongoose.model('Timetable', timetableSchema);

