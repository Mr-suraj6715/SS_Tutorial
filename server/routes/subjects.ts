import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/subjects  (public: returns all active, or all if query all=true)
router.get('/', (req: Request, res: Response) => {
  const { board, class: cls, all } = req.query;
  let sql = 'SELECT * FROM subjects WHERE 1=1';
  const params: any[] = [];

  if (!all) {
    sql += ' AND is_active = 1';
  }
  if (board && board !== 'Both' && board !== 'All') {
    sql += ' AND (board = ? OR board = ?)';
    params.push(board, 'Both');
  }
  if (cls && cls !== 'All') {
    sql += ' AND target_class = ?';
    params.push(cls);
  }
  sql += ' ORDER BY display_order ASC, name ASC';

  const subjects = query(sql, params);
  res.json({ subjects });
});

// GET /api/subjects/:id
router.get('/:id', (req: Request, res: Response) => {
  const subject = get('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
  if (!subject) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }
  res.json({ subject });
});

// POST /api/subjects  (admin only)
router.post('/', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { name, code, board, target_class, description, display_order, is_active } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Subject name is required' });
    return;
  }

  const id = 'subj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  run(
    `INSERT INTO subjects (id, name, code, board, target_class, description, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name.trim(),
      code?.trim() || '',
      board || 'SSC',
      target_class || 'Class 10',
      description || '',
      display_order !== undefined ? Number(display_order) : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
    ]
  );

  const created = get('SELECT * FROM subjects WHERE id = ?', [id]);
  res.status(201).json({ subject: created, message: 'Subject created successfully' });
});

// PUT & PATCH /api/subjects/:id  (admin only)
const updateSubjectHandler = (req: Request, res: Response) => {
  const subject = get<any>('SELECT id FROM subjects WHERE id = ?', [req.params.id]);
  if (!subject) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }

  const fields = ['name', 'code', 'board', 'target_class', 'description', 'display_order', 'is_active'];
  const updates: string[] = [];
  const vals: any[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'is_active') {
        vals.push(req.body[f] ? 1 : 0);
      } else if (f === 'display_order') {
        vals.push(Number(req.body[f]) || 0);
      } else {
        vals.push(typeof req.body[f] === 'string' ? req.body[f].trim() : req.body[f]);
      }
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields provided to update' });
    return;
  }

  vals.push(req.params.id);
  run(`UPDATE subjects SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);

  const updated = get('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
  res.json({ subject: updated, message: 'Subject updated successfully' });
};
router.put('/:id', authenticate, authorize('admin'), updateSubjectHandler);
router.patch('/:id', authenticate, authorize('admin'), updateSubjectHandler);

// DELETE /api/subjects/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const subject = get<any>('SELECT id FROM subjects WHERE id = ?', [req.params.id]);
  if (!subject) {
    res.status(404).json({ error: 'Subject not found' });
    return;
  }

  run('DELETE FROM subjects WHERE id = ?', [req.params.id]);
  res.json({ message: 'Subject deleted successfully' });
});

export default router;
