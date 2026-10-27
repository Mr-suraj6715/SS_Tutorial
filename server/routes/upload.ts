import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';

const router = Router();

// Ensure uploads directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
]);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Security Error: File type '${ext}' is not permitted.`));
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`Security Error: MIME type '${file.mimetype}' is not permitted.`));
    }
    cb(null, true);
  },
});

// POST /api/upload (single or multiple files)
router.post('/', (req: Request, res: Response) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.warn('Upload rejected:', err.message);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload' });
    }

    const uploadedFiles = files.map((file) => ({
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      url: uploadedFiles[0].url,
      file: uploadedFiles[0],
      files: uploadedFiles,
      message: 'File(s) uploaded successfully',
    });
  });
});

export default router;
