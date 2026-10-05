import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run } from '../database/connection.js';
import { config } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full name are required' });
      return;
    }

    // STRICT ADMIN PRIVILEGE LOCKDOWN:
    // No one can register as admin or moderator from public sign up
    const requestedRole = (role || 'student').toLowerCase();
    if (requestedRole === 'admin' || requestedRole === 'moderator') {
      res.status(403).json({
        error: 'Forbidden: Admin accounts cannot be created via public sign-up. Please log in using existing administrator credentials.',
      });
      return;
    }

    const safeRole = requestedRole === 'parent' ? 'parent' : 'student';

    // Check if email already exists
    const existing = get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const userId = 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const hash = await bcrypt.hash(password, 10);

    // 1. Insert into users
    run(
      'INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [userId, email.trim().toLowerCase(), hash, full_name.trim(), phone ? phone.trim() : '', safeRole]
    );

    // 2. Insert into user_roles
    run(
      'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
      ['ur-' + Date.now(), userId, safeRole]
    );

    // 3. Insert into profiles
    run(
      'INSERT INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)',
      [userId, full_name.trim(), phone ? phone.trim() : '', safeRole]
    );

    // 4. If student, create student profile row
    if (safeRole === 'student') {
      run(
        'INSERT INTO students (id, roll_no, class_name, board, status) VALUES (?, ?, ?, ?, ?)',
        [userId, 'SS-' + Math.floor(1000 + Math.random() * 9000), 'Class 10', 'SSC', 'active']
      );
    }

    // Generate JWT token
    const payload = { id: userId, email: email.trim().toLowerCase(), role: safeRole, name: full_name.trim() };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as any);

    res.status(201).json({
      token,
      user: payload,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = get<any>('SELECT * FROM users WHERE email = ? AND is_active = 1', [email.trim().toLowerCase()]);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const payload = { id: user.id, email: user.email, role: user.role, name: user.full_name };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as any);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.full_name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = get<any>('SELECT * FROM users WHERE id = ?', [req.user!.id]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Current password is incorrect' }); return; }
    const hash = await bcrypt.hash(newPassword, 10);
    const { run } = await import('../database/connection.js');
    run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, req.user!.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;