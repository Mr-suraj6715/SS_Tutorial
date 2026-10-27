import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Helper to count active administrators
function countActiveAdmins(): number {
  const row = get<{ count: number }>(
    "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = 1"
  );
  return row?.count ?? 0;
}

// GET /api/users  (admin only)
router.get('/', authorize('admin'), (_req: Request, res: Response) => {
  const users = query(
    'SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  res.json({ users });
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  if (req.user!.role !== 'admin' && req.user!.id !== req.params.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const user = get(
    'SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?',
    [req.params.id]
  );
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

// POST /api/users  (admin only)
router.post('/', authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    if (!email || !password || !full_name || !role) {
      res.status(400).json({ error: 'email, password, full_name, and role are required' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const id = 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    
    run(
      'INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, cleanEmail, hash, full_name.trim(), phone?.trim() || '', role]
    );
    run(
      'INSERT OR IGNORE INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)',
      [id, full_name.trim(), phone?.trim() || '', role]
    );

    const user = get(
      'SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    res.status(201).json({ user, message: 'User created successfully' });
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PUT & PATCH /api/users/:id  (admin can edit any user; regular users can only edit own profile fields)
const updateUserHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  if (!isAdmin && req.user!.id !== req.params.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const targetUser = get<any>('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { full_name, phone, role, is_active, password } = req.body;

  // Security: Protect last active administrator from demotion or deactivation
  const isTargetAdmin = targetUser.role === 'admin' && targetUser.is_active === 1;
  const isDemoting = role !== undefined && role !== 'admin';
  const isDeactivating = is_active !== undefined && (is_active === 0 || is_active === false);

  if (isTargetAdmin && (isDemoting || isDeactivating)) {
    const adminCount = countActiveAdmins();
    if (adminCount <= 1) {
      res.status(400).json({
        error: 'Security Protection: Cannot demote or deactivate the last active administrator account.',
      });
      return;
    }
  }

  // Non-admins cannot change roles or toggle is_active
  const newRole = isAdmin && role !== undefined ? role : targetUser.role;
  const newIsActive = isAdmin && is_active !== undefined ? (is_active ? 1 : 0) : targetUser.is_active;

  let newPasswordHash = targetUser.password_hash;
  if (password && password.trim().length > 0) {
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }
    newPasswordHash = await bcrypt.hash(password, 10);
  }

  const updatedName = full_name !== undefined ? full_name.trim() : targetUser.full_name;
  const updatedPhone = phone !== undefined ? phone.trim() : targetUser.phone;

  run(
    `UPDATE users 
     SET full_name = ?, phone = ?, role = ?, is_active = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [updatedName, updatedPhone, newRole, newIsActive, newPasswordHash, req.params.id]
  );

  run(
    `UPDATE profiles 
     SET full_name = ?, phone = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [updatedName, updatedPhone, newRole, req.params.id]
  );

  const updated = get(
    'SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?',
    [req.params.id]
  );
  res.json({ user: updated, message: 'User updated successfully' });
};
router.put('/:id', updateUserHandler);
router.patch('/:id', updateUserHandler);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authorize('admin'), (req: Request, res: Response) => {
  const targetUser = get<any>('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Security: Protect last active administrator from deletion
  if (targetUser.role === 'admin' && targetUser.is_active === 1) {
    const adminCount = countActiveAdmins();
    if (adminCount <= 1) {
      res.status(400).json({
        error: 'Security Protection: Cannot delete the last active administrator account.',
      });
      return;
    }
  }

  // Remove associated records or delete user (cascades per foreign keys)
  run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted successfully' });
});

export default router;