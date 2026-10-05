import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/users  (admin only)
router.get('/', authorize('admin'), (req: Request, res: Response) => {
  const users = query('SELECT id, email, full_name, phone, role, is_active, created_at FROM users ORDER BY created_at DESC');
  res.json({ users });
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  if (req.user!.role !== 'admin' && req.user!.id !== req.params.id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const user = get('SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?', [req.params.id]);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
});

// POST /api/users  (admin only)
router.post('/', authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    if (!email || !password || !full_name || !role) {
      res.status(400).json({ error: 'email, password, full_name, role are required' }); return;
    }
    const existing = get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) { res.status(409).json({ error: 'Email already in use' }); return; }
    const hash = await bcrypt.hash(password, 10);
    const id = 'u-' + Date.now();
    run('INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, hash, full_name, phone || null, role]);
    run('INSERT OR IGNORE INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)',
      [id, full_name, phone || null, role]);
    const user = get('SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?', [id]);
    res.status(201).json({ user });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/users/:id
router.patch('/:id', (req: Request, res: Response) => {
  if (req.user!.role !== 'admin' && req.user!.id !== req.params.id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const { full_name, phone, is_active } = req.body;
  const user = get<any>('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  run('UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [full_name ?? null, phone ?? null, is_active ?? null, req.params.id]);
  const updated = get('SELECT id, email, full_name, phone, role, is_active FROM users WHERE id = ?', [req.params.id]);
  res.json({ user: updated });
});

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authorize('admin'), (req: Request, res: Response) => {
  run('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deactivated' });
});

export default router;