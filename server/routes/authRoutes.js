import express from 'express';
import {
  login,
  registerTeacher,
  registerStudent,
  getMe,
  updateProfile,
  uploadAvatar,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/login', login);
router.post('/register/teacher', registerTeacher);
router.post('/register/student', registerStudent);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/change-password', protect, changePassword);

export default router;

