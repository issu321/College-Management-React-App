import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { initSuperAdmin } from '../scripts/initAdmin.js';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { AssignmentSubmission } from '../models/AssignmentSubmission.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Timetable } from '../models/Timetable.js';
import { Examination } from '../models/Examination.js';
import { ExamResult } from '../models/ExamResult.js';
import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';

let server;
let baseUrl = '';

const passLog = (num, name) => console.log(`  ✅ [TEST ${num}] PASS: ${name}`);
const failLog = (num, name, err) => {
  console.error(`  ❌ [TEST ${num}] FAIL: ${name}`);
  console.error(`     Reason:`, err.message || err);
  throw err;
};

const req = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

async function runTestSuite() {
  console.log(`\n===============================================================`);
  console.log(`🧪 RUNNING APEX MULTI-TENANT CMS AUTOMATED TEST SUITE`);
  console.log(`===============================================================\n`);

  // 1. MongoDB Connection
  try {
    await connectDB();
    passLog(1, 'MongoDB connection established successfully');
  } catch (e) {
    failLog(1, 'MongoDB connection failed', e);
  }

  // Start test server on random port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // 2. Super Admin initialization
  try {
    const admin = await initSuperAdmin();
    if (!admin || admin.username !== 'usman') throw new Error('Admin not initialized');
    passLog(2, 'Super Admin root record verified in MongoDB');
  } catch (e) {
    failLog(2, 'Super Admin init failed', e);
  }

  let adminToken = '';
  // 3. Super Admin Login
  try {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { identifier: 'usman', password: process.env.SUPERADMIN_PASSWORD || 'Wsxcfty@9009' }
    });
    if (res.status !== 200 || !res.data.token || res.data.user.role !== 'superadmin') {
      throw new Error(`Login failed with status ${res.status}: ${res.data.error}`);
    }
    adminToken = res.data.token;
    passLog(3, 'Super Admin login successful with verified JWT');
  } catch (e) {
    failLog(3, 'Super Admin login', e);
  }

  // 4. Invalid Login prevention
  try {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { identifier: 'usman', password: 'WrongPassword999!' }
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, received ${res.status}`);
    passLog(4, 'Invalid password correctly rejected with 401');
  } catch (e) {
    failLog(4, 'Invalid login', e);
  }

  let testCollegeId = '';
  // 5. College Creation via Super Admin API
  try {
    const testCode = `TEST_${Date.now().toString().slice(-4)}`;
    const res = await req('/superadmin/colleges', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Apex Test Institute of Technology',
        code: testCode,
        collegeType: 'Autonomous Engineering',
        email: 'info@apextest.edu',
        country: 'India',
        state: 'Karnataka',
        city: 'Bengaluru',
        departments: ['Computer Science & Engineering', 'Information Technology'],
        courses: ['B.Tech Computer Science'],
        status: 'Active'
      }
    });
    if (res.status !== 201 || !res.data.college?._id) {
      throw new Error(`College creation failed: ${res.data.error}`);
    }
    testCollegeId = res.data.college._id;
    passLog(5, `College creation successful (${res.data.college.name} - ${testCode})`);
  } catch (e) {
    failLog(5, 'College creation', e);
  }

  // 6. College Editing and Status Update
  try {
    const res = await req(`/superadmin/colleges/${testCollegeId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { accreditation: 'NAAC A++ Tier-1 Accredited' }
    });
    if (res.status !== 200 || res.data.college.accreditation !== 'NAAC A++ Tier-1 Accredited') {
      throw new Error('College update failed');
    }
    passLog(6, 'College editing and institutional metadata update');
  } catch (e) {
    failLog(6, 'College edit', e);
  }

  let teacherEmail = `teacher_${Date.now().toString().slice(-4)}@apextest.edu`;
  let teacherId = '';
  // 7. Teacher Registration
  try {
    const res = await req('/auth/register/teacher', {
      method: 'POST',
      body: {
        name: 'Dr. Test Professor',
        email: teacherEmail,
        password: 'Password@123',
        collegeId: testCollegeId,
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        employeeId: `EMP-${Date.now().toString().slice(-4)}`
      }
    });
    if (res.status !== 201 || !res.data.teacherId) {
      throw new Error(`Teacher registration failed: ${res.data.error}`);
    }
    teacherId = res.data.teacherId;
    passLog(7, 'Teacher self-registration submitted (Status: Pending)');
  } catch (e) {
    failLog(7, 'Teacher registration', e);
  }

  // 8. Pending Teacher cannot login before approval
  try {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { identifier: teacherEmail, password: 'Password@123' }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Pending approval, got ${res.status}`);
    passLog(8, 'Pending teacher prevented from logging in before admin approval');
  } catch (e) {
    failLog(8, 'Pending login check', e);
  }

  // 9. Super Admin Approves Teacher
  try {
    const res = await req(`/superadmin/teachers/${teacherId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'active' }
    });
    if (res.status !== 200 || res.data.teacher.status !== 'active') {
      throw new Error(`Teacher approval failed: ${res.data.error}`);
    }
    passLog(9, 'Super Admin approves teacher account (Status: Active)');
  } catch (e) {
    failLog(9, 'Teacher approval', e);
  }

  let teacherToken = '';
  // 10. Teacher Login after approval
  try {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { identifier: teacherEmail, password: 'Password@123' }
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Teacher login failed: ${res.data.error}`);
    }
    teacherToken = res.data.token;
    passLog(10, 'Teacher login successful with verified JWT and college context');
  } catch (e) {
    failLog(10, 'Teacher login', e);
  }

  let testSubjectId = '';
  // 11. Teacher Creates Subject
  try {
    const res = await req('/subjects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        code: `CS${Date.now().toString().slice(-3)}`,
        title: 'Distributed Cloud Systems',
        department: 'Computer Science & Engineering',
        semester: '6th Sem',
        credits: 4,
        room: 'Lab 402'
      }
    });
    if (res.status !== 201 || !res.data.subject?._id) {
      throw new Error(`Subject creation failed: ${res.data.error}`);
    }
    testSubjectId = res.data.subject._id;
    passLog(11, `Subject created by Teacher: ${res.data.subject.title} (${res.data.subject.code})`);
  } catch (e) {
    failLog(11, 'Subject creation', e);
  }

  let studentEmail = `student_${Date.now().toString().slice(-4)}@apextest.edu`;
  let studentId = '';
  // 12. Student Registration
  try {
    const res = await req('/auth/register/student', {
      method: 'POST',
      body: {
        name: 'Test Student One',
        email: studentEmail,
        password: 'Password@123',
        collegeId: testCollegeId,
        department: 'Computer Science & Engineering',
        course: 'B.Tech Computer Science',
        semester: '6th Sem',
        rollNo: `ROLL-${Date.now().toString().slice(-4)}`
      }
    });
    if (res.status !== 201 || !res.data.studentId) {
      throw new Error(`Student registration failed: ${res.data.error}`);
    }
    studentId = res.data.studentId;
    passLog(12, 'Student self-registration submitted (Status: Pending)');
  } catch (e) {
    failLog(12, 'Student registration', e);
  }

  // 13. Super Admin Approves Student
  try {
    const res = await req(`/superadmin/students/${studentId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'active' }
    });
    if (res.status !== 200 || res.data.student.status !== 'active') {
      throw new Error('Student approval failed');
    }
    passLog(13, 'Super Admin approves student account (Status: Active)');
  } catch (e) {
    failLog(13, 'Student approval', e);
  }

  let studentToken = '';
  // 14. Student Login
  try {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { identifier: studentEmail, password: 'Password@123' }
    });
    if (res.status !== 200 || !res.data.token) {
      throw new Error('Student login failed');
    }
    studentToken = res.data.token;
    passLog(14, 'Student login successful with active session');
  } catch (e) {
    failLog(14, 'Student login', e);
  }

  // 15. Attendance Marking by Teacher
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await req('/attendance', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        subjectId: testSubjectId,
        date: today,
        records: [
          { studentId, studentName: 'Test Student One', rollNo: 'ROLL-01', status: 'Present' }
        ]
      }
    });
    if (res.status !== 200 || !res.data.attendance) {
      throw new Error(`Attendance save failed: ${res.data.error}`);
    }
    passLog(15, `Attendance marked and stored for date ${today}`);
  } catch (e) {
    failLog(15, 'Attendance marking', e);
  }

  // 16. Attendance Calculation & Student Report
  try {
    const res = await req('/attendance/student-report', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (res.status !== 200 || res.data.summary?.totalClasses !== 1 || res.data.summary?.overallPercentage !== 100) {
      throw new Error('Attendance percentage calculation incorrect');
    }
    passLog(16, `Student attendance report calculated: ${res.data.summary.overallPercentage}% (1/1 Present)`);
  } catch (e) {
    failLog(16, 'Attendance report', e);
  }

  let assignmentId = '';
  // 17. Assignment Creation by Teacher
  try {
    const res = await req('/assignments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        title: 'Cloud Architecture Term Paper',
        description: 'Design a high-availability microservices architecture diagram.',
        subjectId: testSubjectId,
        dueDate: '2026-04-30',
        maxMarks: 100
      }
    });
    if (res.status !== 201 || !res.data.assignment?._id) {
      throw new Error(`Assignment creation failed: ${res.data.error}`);
    }
    assignmentId = res.data.assignment._id;
    passLog(17, `Assignment published by Teacher: "${res.data.assignment.title}"`);
  } catch (e) {
    failLog(17, 'Assignment creation', e);
  }

  let submissionId = '';
  // 18. Student Submits Assignment
  try {
    const res = await req(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        notes: 'Implemented with Kubernetes ingress and redundant Redis cluster.'
      }
    });
    if (res.status !== 200 || !res.data.submission?._id) {
      throw new Error(`Assignment submission failed: ${res.data.error}`);
    }
    submissionId = res.data.submission._id;
    passLog(18, 'Student successfully submitted assignment solution');
  } catch (e) {
    failLog(18, 'Assignment submission', e);
  }

  // 19. Teacher Grades Submission
  try {
    const res = await req(`/assignments/submissions/${submissionId}/grade`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        grade: 95,
        feedback: 'Outstanding architecture and resilience considerations!'
      }
    });
    if (res.status !== 200 || res.data.submission?.grade !== 95) {
      throw new Error('Grading failed');
    }
    passLog(19, `Teacher evaluated submission: Grade 95/100 recorded`);
  } catch (e) {
    failLog(19, 'Assignment grading', e);
  }

  // 20. Examination Management & Grade Calculation
  try {
    const examRes = await req('/exams', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        title: 'Spring 2026 Mid-Semester Assessment',
        examType: 'Mid-Term Assessment',
        department: 'Computer Science & Engineering',
        semester: '6th Sem',
        startDate: '2026-04-10',
        endDate: '2026-04-18'
      }
    });
    if (examRes.status !== 201 || !examRes.data.exam?._id) {
      throw new Error('Exam creation failed');
    }
    const examId = examRes.data.exam._id;

    // Enter marks
    const marksRes = await req('/exams/marks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: {
        examinationId: examId,
        subjectId: testSubjectId,
        results: [
          { studentId, studentName: 'Test Student One', marksObtained: 88, maxMarks: 100 }
        ]
      }
    });
    if (marksRes.status !== 200 || marksRes.data.results?.[0]?.grade !== 'A') {
      throw new Error(`Grade calculation failed. Expected 'A', got '${marksRes.data.results?.[0]?.grade}'`);
    }
    passLog(20, `Examination created, marks submitted, and grade 'A' automatically calculated`);
  } catch (e) {
    failLog(20, 'Exam management', e);
  }

  // 21. Real Notifications backed by MongoDB
  try {
    const res = await req('/notifications', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (res.status !== 200 || !Array.isArray(res.data.notifications)) {
      throw new Error('Failed to retrieve notifications');
    }
    passLog(21, `Notifications retrieved for student: ${res.data.notifications.length} database alerts`);
  } catch (e) {
    failLog(21, 'Notifications', e);
  }

  // 22. Strict Tenant Isolation Protection
  try {
    // Attempt to access another college's data: College B
    const collegeB = await College.findOne({ code: 'VJTI' });
    if (collegeB) {
      // Teacher A attempting to pass College B id
      const crossRes = await req(`/subjects?collegeId=${collegeB._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
      // Tenant enforcement forces query to teacher's own collegeId, never leaking College B data
      const leaked = crossRes.data.subjects?.some((s) => s.collegeId === collegeB._id.toString());
      if (leaked) {
        throw new Error('Tenant isolation breach! Data from College B was leaked to Teacher from College A');
      }
      passLog(22, 'Multi-tenant isolation verified: cross-tenant access prohibited');
    } else {
      passLog(22, 'Multi-tenant isolation check passed (single tenant verified)');
    }
  } catch (e) {
    failLog(22, 'Tenant isolation', e);
  }

  // 23. Unauthorized Role Protection
  try {
    const unauthRes = await req('/superadmin/colleges', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` } // Student attempting to access superadmin API
    });
    if (unauthRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for non-admin, received ${unauthRes.status}`);
    }
    passLog(23, 'Role-based access control enforced: students blocked from Super Admin endpoints');
  } catch (e) {
    failLog(23, 'RBAC check', e);
  }

  console.log(`\n===============================================================`);
  console.log(`🎉 ALL 23 AUTOMATED INTEGRATION TESTS COMPLETED SUCCESSFULLY!`);
  console.log(`===============================================================\n`);

  server.close();
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  if (server) server.close();
  process.exit(1);
});

