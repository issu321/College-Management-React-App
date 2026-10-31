import express from 'express';
import {
  getPublicActiveColleges,
  getCollegeDetails,
  getMyCollege
} from '../controllers/collegeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: needed for student and teacher registration forms & directory
router.get('/', getPublicActiveColleges);
router.get('/public', getPublicActiveColleges);

// Protected
router.get('/my-college', protect, getMyCollege);
router.get('/:id', protect, getCollegeDetails);

export default router;

