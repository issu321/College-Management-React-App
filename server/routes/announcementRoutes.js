import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('superadmin', 'teacher'), createAnnouncement);
router.delete('/:id', authorize('superadmin', 'teacher'), deleteAnnouncement);

export default router;

