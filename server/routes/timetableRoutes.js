import express from 'express';
import {
  getTimetable,
  createTimetableEntry,
  deleteTimetableEntry
} from '../controllers/timetableController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { enforceTenant } from '../middleware/tenant.js';

const router = express.Router();

router.use(protect, enforceTenant);

router.get('/', getTimetable);
router.post('/', authorize('teacher', 'superadmin'), createTimetableEntry);
router.delete('/:id', authorize('teacher', 'superadmin'), deleteTimetableEntry);

export default router;

