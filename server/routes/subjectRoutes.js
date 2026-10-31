import express from 'express';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getEnrolledStudents
} from '../controllers/subjectController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { enforceTenant } from '../middleware/tenant.js';

const router = express.Router();

router.use(protect, enforceTenant);

router.get('/', getSubjects);
router.post('/', authorize('teacher', 'superadmin'), createSubject);
router.put('/:id', authorize('teacher', 'superadmin'), updateSubject);
router.delete('/:id', authorize('teacher', 'superadmin'), deleteSubject);
router.get('/:id/students', getEnrolledStudents);

export default router;

