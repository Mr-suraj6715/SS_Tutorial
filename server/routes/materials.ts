import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { config } from '../config/env.js';

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/materials
router.get('/', (req: Request, res: Response) => {
  const { batch_id, course_id, category } = req.query;
  let sql = 'SELECT m.*, u.full_name as uploaded_by_name FROM study_materials m LEFT JOIN users u ON u.id = m.uploaded_by WHERE 1=1';
  const params: any[] = [];
  if (batch_id) { sql += ' AND m.batch_id = ?'; params.push(batch_id); }
  if (course_id) { sql += ' AND m.course_id = ?'; params.push(course_id); }
  if (category) { sql += ' AND m.category = ?'; params.push(category); }
  sql += ' ORDER BY m.created_at DESC';
  res.json({ materials: query(sql, params) });
});

// POST /api/materials  (teacher / admin)
router.post('/', authorize('admin', 'teacher'), upload.single('file'), (req: Request, res: Response) => {
  const { batch_id, course_id, title, description, category } = req.body;
  if (!title) { res.status(400).json({ error: 'title required' }); return; }
  const id = 'sm-' + Date.now();
  const fileUrl = req.file ? '/uploads/' + req.file.filename : (req.body.file_url || null);
  const fileType = req.file ? path.extname(req.file.originalname).slice(1) : (req.body.file_type || null);
  run('INSERT INTO study_materials (id, batch_id, course_id, title, description, file_url, file_type, category, uploaded_by) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, batch_id || null, course_id || null, title, description || null, fileUrl, fileType || 'pdf', category || 'notes', req.user!.id]);
  res.status(201).json({ material: get('SELECT * FROM study_materials WHERE id = ?', [id]) });
});

// DELETE /api/materials/:id  (admin / teacher)
router.delete('/:id', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  run('DELETE FROM study_materials WHERE id = ?', [req.params.id]);
  res.json({ message: 'Material deleted' });
});

export default router;