import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure base upload directories exist
const uploadBaseDir = path.resolve(process.cwd(), process.env.UPLOAD_PATH || 'uploads');
const subDirs = ['materials', 'assignments', 'submissions', 'avatars', 'logos'];

subDirs.forEach((sub) => {
  const fullPath = path.join(uploadBaseDir, sub);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'materials';
    if (req.baseUrl.includes('assignment') || req.path.includes('assignment')) {
      folder = req.path.includes('submit') ? 'submissions' : 'assignments';
    } else if (req.baseUrl.includes('user') || req.path.includes('avatar')) {
      folder = 'avatars';
    } else if (req.baseUrl.includes('college') || req.path.includes('logo')) {
      folder = 'logos';
    }
    const dest = path.join(uploadBaseDir, folder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Generate safe, unique filename preserving original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanBaseName}-${uniqueSuffix}${ext}`);
  }
});

// Permitted extensions filter
const allowedExtensions = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
  '.txt', '.csv', '.rtf', '.zip', '.rar', '.7z', '.tar', '.gz',
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
  '.mp4', '.webm', '.mkv', '.mov', '.mp3', '.wav',
  '.py', '.java', '.c', '.cpp', '.cs', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.sql'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) || !ext) {
    cb(null, true);
  } else {
    cb(new Error(`File format '${ext}' is not permitted for institutional security.`), false);
  }
};

const maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50) * 1024 * 1024; // 50MB default

export const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter
});

