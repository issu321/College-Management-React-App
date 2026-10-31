import express from 'express';
import {
  getStudyMaterials,
  uploadStudyMaterial,
  deleteStudyMaterial
} from '../controllers/materialController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { enforceTenant } from '../middleware/tenant.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect, enforceTenant);

router.get('/', getStudyMaterials);
router.post('/', authorize('teacher', 'superadmin'), upload.single('materialFile'), uploadStudyMaterial);
router.delete('/:id', authorize('teacher', 'superadmin'), deleteStudyMaterial);

export default router;

