import mongoose from 'mongoose';

const attendanceStudentEntrySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    rollNo: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present'
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
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
    department: {
      type: String,
      default: ''
    },
    semester: {
      type: String,
      default: ''
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for deterministic unique indexing
      required: true,
      index: true
    },
    records: [attendanceStudentEntrySchema],
    history: [
      {
        editedAt: { type: Date, default: Date.now },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: 'Updated attendance record' }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance records for the same college, subject, and date
attendanceSchema.index({ collegeId: 1, subjectId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);

