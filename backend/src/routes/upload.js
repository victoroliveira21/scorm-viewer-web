import express from 'express';
import multer from 'multer';
import { uploadScormPackage } from '../controllers/uploadController.js';

const router = express.Router();

// Configure Multer for file upload (memory storage for security validation)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024, // 500MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Basic pre-validation (detailed validation in controller)
    if (!file.originalname.toLowerCase().endsWith('.zip')) {
      return cb(new Error('Only ZIP files are allowed'), false);
    }
    cb(null, true);
  }
});

// POST /api/upload
router.post('/', upload.single('scormPackage'), uploadScormPackage);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: `Maximum file size: ${(parseInt(process.env.MAX_FILE_SIZE) / 1024 / 1024).toFixed(0)}MB`
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }

  if (error) {
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }

  next();
});

export default router;
