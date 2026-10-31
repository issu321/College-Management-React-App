import express from 'express';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { enforceTenant } from '../middleware/tenant.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect, enforceTenant);

router.get('/', getAssignments);
router.post('/', authorize('teacher', 'superadmin'), upload.single('attachment'), createAssignment);
router.post('/:id/submit', authorize('student'), upload.single('submissionFile'), submitAssignment);
router.post('/submissions/:submissionId/grade', authorize('teacher', 'superadmin'), gradeSubmission);
router.delete('/:id', authorize('teacher', 'superadmin'), deleteAssignment);

export default router;

