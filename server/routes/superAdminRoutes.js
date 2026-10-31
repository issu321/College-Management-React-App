import express from 'express';
import {
  getDashboardStats,
  getAllColleges,
  createCollege,
  updateCollege,
  setCollegeStatus,
  deleteCollege,
  getAllTeachers,
  updateTeacherStatus,
  deleteTeacher,
  getAllStudents,
  updateStudentStatus,
  deleteStudent,
  getAuditLogs,
  getPlatformAnalytics
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

// All superadmin routes require authentication and 'superadmin' role
router.use(protect, authorize('superadmin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/colleges', getAllColleges);
router.post('/colleges', createCollege);
router.put('/colleges/:id', updateCollege);
router.patch('/colleges/:id/status', setCollegeStatus);
router.delete('/colleges/:id', deleteCollege);

router.get('/teachers', getAllTeachers);
router.patch('/teachers/:id/status', updateTeacherStatus);
router.delete('/teachers/:id', deleteTeacher);

router.get('/students', getAllStudents);
router.patch('/students/:id/status', updateStudentStatus);
router.delete('/students/:id', deleteStudent);

router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getPlatformAnalytics);

export default router;

