import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Announcement } from '../models/Announcement.js';
import { initSuperAdmin } from './initAdmin.js';

export const seedDemoData = async () => {
  console.log('[Seed Demo] Initializing explicitly requested demonstration data...');

  // 1. Ensure Super Admin
  await initSuperAdmin();

  // 2. Create Sample College A
  let collegeA = await College.findOne({ code: 'NITB' });
  if (!collegeA) {
    collegeA = await College.create({
      name: 'National Institute of Technology & Science',
      shortName: 'NITS',
      code: 'NITB',
      collegeType: 'Autonomous Engineering',
      affiliation: 'Affiliated with Central Technical University',
      accreditation: 'NAAC A++ (Score 3.86/4.0) • NBA Accredited',
      website: 'https://nits.edu.in',
      email: 'admissions@nits.edu.in',
      phone: '+91 80 2852 0100',
      country: 'India',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      city: 'Bengaluru',
      postalCode: '560100',
      address: 'Tech Innovation Zone, Phase 1, Electronic City',
      principalName: 'Dr. S. K. Narayanan',
      adminName: 'Prof. Ramesh Rao',
      adminEmail: 'registrar@nits.edu.in',
      adminPhone: '+91 98450 12345',
      academicYear: '2025-2026',
      departments: [
        'Computer Science & Engineering',
        'Artificial Intelligence & Data Science',
        'Electronics & Communication Engineering'
      ],
      courses: ['B.Tech Computer Science', 'B.Tech AI & Data Science'],
      semesterStructure: '8 Semesters (4 Years)',
      status: 'Active',
      description: 'Premier tier-1 autonomous engineering college accredited with NAAC A++ rating.'
    });
    console.log(`[Seed Demo] Created College A: ${collegeA.name}`);
  }

  // 3. Create Sample College B (for tenant isolation testing)
  let collegeB = await College.findOne({ code: 'VJTI' });
  if (!collegeB) {
    collegeB = await College.create({
      name: 'Victoria Jubilee Technological Institute',
      shortName: 'VJTI',
      code: 'VJTI',
      collegeType: 'Autonomous Engineering',
      affiliation: 'Affiliated with State Technical University',
      accreditation: 'NAAC A+ Accredited',
      website: 'https://vjti.edu.in',
      email: 'contact@vjti.edu.in',
      phone: '+91 22 2419 8100',
      country: 'India',
      state: 'Maharashtra',
      district: 'Mumbai City',
      city: 'Mumbai',
      postalCode: '400019',
      address: 'H. R. Mahajani Road, Matunga',
      principalName: 'Dr. D. N. Patel',
      adminName: 'Sanjay Deshmukh',
      adminEmail: 'admin@vjti.edu.in',
      adminPhone: '+91 98200 54321',
      academicYear: '2025-2026',
      departments: ['Computer Science & Engineering', 'Information Technology'],
      courses: ['B.Tech Computer Science'],
      semesterStructure: '8 Semesters (4 Years)',
      status: 'Active',
      description: 'Historical premier autonomous engineering institute in Mumbai.'
    });
    console.log(`[Seed Demo] Created College B: ${collegeB.name}`);
  }

  // 4. Sample Teacher for College A
  let teacherA = await User.findOne({ email: 'dr.sharma@nits.edu.in' });
  if (!teacherA) {
    teacherA = await User.create({
      role: 'teacher',
      collegeId: collegeA._id,
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@nits.edu.in',
      password: 'Teacher@123',
      department: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. in Computer Science (IIT Bombay)',
      experience: '15 Years',
      specialization: 'Distributed Systems & Cloud Computing',
      employeeId: 'EMP-CSE-101',
      phone: '+91 98450 11223',
      status: 'active'
    });
    console.log(`[Seed Demo] Created Teacher: ${teacherA.name}`);
  }

  // 5. Sample Student for College A
  let studentA = await User.findOne({ email: 'aarav.patel@student.nits.edu.in' });
  if (!studentA) {
    studentA = await User.create({
      role: 'student',
      collegeId: collegeA._id,
      name: 'Aarav Patel',
      email: 'aarav.patel@student.nits.edu.in',
      password: 'Student@123',
      department: 'Computer Science & Engineering',
      course: 'B.Tech Computer Science',
      semester: '6th Sem',
      rollNo: 'CS26-001',
      registrationNumber: 'REG-2023-CS-001',
      phone: '+91 98765 43210',
      status: 'active'
    });
    console.log(`[Seed Demo] Created Student: ${studentA.name}`);
  }

  // 6. Sample Subject for College A
  let subjectA = await Subject.findOne({ collegeId: collegeA._id, code: 'CS601' });
  if (!subjectA) {
    subjectA = await Subject.create({
      collegeId: collegeA._id,
      code: 'CS601',
      title: 'Cloud Architecture & Distributed Systems',
      department: 'Computer Science & Engineering',
      semester: '6th Sem',
      credits: 4,
      room: 'Hall 301',
      syllabus: 'Module 1: CAP Theorem & Consensus, Module 2: Raft Algorithm, Module 3: Microservices & Docker',
      teacherId: teacherA._id,
      teacherName: teacherA.name
    });
    console.log(`[Seed Demo] Created Subject: ${subjectA.title}`);
  }

  console.log('✅ Demonstration dataset successfully initialized in MongoDB.');
};

if (process.argv[1]?.includes('seedDemo.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDemoData();
      process.exit(0);
    } catch (e) {
      console.error('❌ Failed to seed demo data:', e);
      process.exit(1);
    }
  })();
}

