import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true
    },
    examinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },
    subjectTitle: {
      type: String,
      default: ''
    },
    subjectCode: {
      type: String,
      default: ''
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
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100
    },
    percentage: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      default: '' // 'A+', 'A', 'B', 'C', 'D', 'F'
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Automatic grade and percentage calculation helper
examResultSchema.pre('save', function () {
  if (this.maxMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100);
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 60) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'D';
    else this.grade = 'F';
  }
});

// One result per student per examination per subject
examResultSchema.index({ examinationId: 1, subjectId: 1, studentId: 1 }, { unique: true });

export const ExamResult = mongoose.model('ExamResult', examResultSchema);
