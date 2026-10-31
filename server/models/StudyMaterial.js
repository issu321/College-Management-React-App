import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
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
      default: '',
      index: true
    },
    semester: {
      type: String,
      default: '',
      index: true
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
    category: {
      type: String,
      enum: ['Lecture Slides & Notes', 'Reference Book / Syllabus', 'Previous Year Papers', 'Lab Manuals & Code', 'Research Paper / Article', 'Other'],
      default: 'Lecture Slides & Notes'
    },
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream'
    },
    downloadsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

