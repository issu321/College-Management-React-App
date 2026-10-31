import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['superadmin', 'teacher', 'student'],
      required: true,
      index: true
    },
    // Multi-tenant isolation: null for superadmin, required for teachers and students
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
      index: true
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending',
      index: true
    },
    badge: {
      type: String,
      default: ''
    },

    // Teacher-specific fields
    employeeId: {
      type: String,
      trim: true,
      sparse: true
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    qualification: {
      type: String,
      trim: true,
      default: ''
    },
    experience: {
      type: String,
      trim: true,
      default: ''
    },
    specialization: {
      type: String,
      trim: true,
      default: ''
    },

    // Student-specific fields
    rollNo: {
      type: String,
      trim: true,
      sparse: true
    },
    registrationNumber: {
      type: String,
      trim: true,
      sparse: true
    },
    course: {
      type: String,
      trim: true,
      default: ''
    },
    semester: {
      type: String,
      trim: true,
      default: ''
    },
    academicYear: {
      type: String,
      trim: true,
      default: ''
    },
    dob: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness within a college
userSchema.index({ collegeId: 1, email: 1 }, { unique: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
