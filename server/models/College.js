import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    // Institutional Information
    name: {
      type: String,
      required: true,
      trim: true
    },
    shortName: {
      type: String,
      trim: true,
      default: ''
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    collegeType: {
      type: String,
      enum: ['Autonomous Engineering', 'University Constituent', 'Affiliated Technical College', 'Private University Institute', 'Government Polytechnic / College'],
      default: 'Autonomous Engineering'
    },
    affiliation: {
      type: String,
      trim: true,
      default: ''
    },
    accreditation: {
      type: String,
      trim: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },

    // Location Information
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    state: {
      type: String,
      required: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },

    // Administration Information
    principalName: {
      type: String,
      trim: true,
      default: ''
    },
    adminName: {
      type: String,
      trim: true,
      default: ''
    },
    adminEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    adminPhone: {
      type: String,
      trim: true,
      default: ''
    },

    // Academic Structure
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    programs: {
      type: [String],
      default: ['Undergraduate (B.Tech / B.E.)', 'Postgraduate (M.Tech / M.E.)', 'Doctoral (Ph.D.)']
    },
    departments: {
      type: [String],
      default: [
        'Computer Science & Engineering',
        'Artificial Intelligence & Data Science',
        'Information Technology',
        'Electronics & Communication Engineering'
      ]
    },
    courses: {
      type: [String],
      default: ['B.Tech Computer Science', 'B.Tech AI & Data Science', 'M.Tech Software Engineering']
    },
    semesterStructure: {
      type: String,
      enum: ['8 Semesters (4 Years)', '6 Semesters (3 Years)', '4 Semesters (2 Years)'],
      default: '8 Semesters (4 Years)'
    },

    // Additional Details
    logo: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const College = mongoose.model('College', collegeSchema);

