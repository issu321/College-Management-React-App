import express from 'express';
import {
  getAttendance,
  markAttendance,
  getStudentAttendanceReport
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { enforceTenant } from '../middleware/tenant.js';

const router = express.Router();

router.use(protect, enforceTenant);

router.get('/', getAttendance);
router.post('/', authorize('teacher', 'superadmin'), markAttendance);
router.get('/student-report', getStudentAttendanceReport);

export default router;

