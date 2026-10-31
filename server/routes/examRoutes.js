import express from 'express';
import {
  getExams,
  createExam,
  enterMarks,
  getStudentExamResults
} from '../controllers/examController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { enforceTenant } from '../middleware/tenant.js';

const router = express.Router();

router.use(protect, enforceTenant);

router.get('/', getExams);
router.post('/', authorize('teacher', 'superadmin'), createExam);
router.post('/marks', authorize('teacher', 'superadmin'), enterMarks);
router.get('/student-results', getStudentExamResults);

export default router;

