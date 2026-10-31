import express from 'express';
import { downloadFile } from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/download/:type/:id', protect, downloadFile);

export default router;

