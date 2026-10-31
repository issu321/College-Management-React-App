import path from 'path';
import fs from 'fs';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Assignment } from '../models/Assignment.js';
import { AssignmentSubmission } from '../models/AssignmentSubmission.js';

export const downloadFile = async (req, res, next) => {
  try {
    const { type, id } = req.params; // type: 'material' | 'assignment' | 'submission'
    let filePath = '';
    let originalName = 'download';

    if (type === 'material') {
      const material = await StudyMaterial.findById(id);
      if (!material) return res.status(404).json({ success: false, error: 'File record not found.' });
      
      // Tenant isolation check
      if (req.user.role !== 'superadmin' && material.collegeId.toString() !== req.user.collegeId.toString()) {
        return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
      }

      filePath = material.filePath;
      originalName = material.originalName;
      material.downloadsCount = (material.downloadsCount || 0) + 1;
      await material.save();
    } else if (type === 'assignment') {
      const assignment = await Assignment.findById(id);
      if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found.' });

      if (req.user.role !== 'superadmin' && assignment.collegeId.toString() !== req.user.collegeId.toString()) {
        return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
      }

      filePath = assignment.attachmentPath;
      originalName = assignment.attachmentName || 'assignment_attachment';
    } else if (type === 'submission') {
      const submission = await AssignmentSubmission.findById(id);
      if (!submission) return res.status(404).json({ success: false, error: 'Submission not found.' });

      if (req.user.role !== 'superadmin' && submission.collegeId.toString() !== req.user.collegeId.toString()) {
        return res.status(403).json({ success: false, error: 'Tenant isolation violation.' });
      }

      filePath = submission.filePath;
      originalName = submission.fileName || 'student_solution';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid file type.' });
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'The requested file could not be located on the server disk.' });
    }

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

