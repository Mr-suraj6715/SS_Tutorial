import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run, exec } from '../database/connection.js';
import { config } from '../config/env.js';
import { authenticate, authorize } from '../middleware/auth.js';

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

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential, email: directEmail, name: directName } = req.body;

    let email = '';
    let name = '';
    let googleId = '';

    if (credential) {
      // Verify token with Google API
      const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!tokenInfoRes.ok) {
        res.status(401).json({ error: 'Invalid Google OAuth credential' });
        return;
      }
      const tokenInfo = (await tokenInfoRes.json()) as any;
      if (!tokenInfo.email || (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true)) {
        res.status(401).json({ error: 'Google email is not verified' });
        return;
      }
      email = tokenInfo.email.trim().toLowerCase();
      name = tokenInfo.name || tokenInfo.email.split('@')[0];
      googleId = tokenInfo.sub || '';
    } else if (directEmail) {
      email = String(directEmail).trim().toLowerCase();
      name = directName ? String(directName).trim() : email.split('@')[0];
    } else {
      res.status(400).json({ error: 'Google credential or verified email is required' });
      return;
    }

    // Check if user already exists
    let existingUser = get<any>('SELECT * FROM users WHERE email = ?', [email]);
    let userId = existingUser?.id;
    let userRole = existingUser?.role || 'student';
    let userName = existingUser?.full_name || name;

    if (!existingUser) {
      // Create new student account (safe default, NEVER admin)
      userId = 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      userRole = 'student';
      userName = name;

      run(
        'INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [userId, email, 'oauth_google_' + (googleId || Date.now()), userName, '', userRole]
      );

      run(
        'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
        ['ur-' + Date.now(), userId, userRole]
      );

      run(
        'INSERT INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)',
        [userId, userName, '', userRole]
      );

      run(
        'INSERT INTO students (id, roll_no, class_name, board, status) VALUES (?, ?, ?, ?, ?)',
        [userId, 'SS-' + Math.floor(1000 + Math.random() * 9000), 'Class 10', 'SSC', 'active']
      );
    }

    const payload = { id: userId, email, role: userRole, name: userName };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as any);

    res.json({
      token,
      user: payload,
      message: 'Google Sign-In successful',
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during Google sign-in' });
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
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }
    const user = get<any>('SELECT * FROM users WHERE id = ?', [req.user!.id]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Current password is incorrect' }); return; }
    const hash = await bcrypt.hash(newPassword, 10);
    run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, req.user!.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/change-email
router.post('/change-email', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newEmail } = req.body;
    if (!currentPassword || !newEmail) {
      res.status(400).json({ error: 'Current password and new email are required' });
      return;
    }
    const user = get<any>('SELECT * FROM users WHERE id = ?', [req.user!.id]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Current password is incorrect' }); return; }

    const trimmedEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const conflict = get<any>('SELECT id FROM users WHERE email = ? AND id != ?', [trimmedEmail, req.user!.id]);
    if (conflict) { res.status(409).json({ error: 'This email is already in use by another account' }); return; }

    run('UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [trimmedEmail, req.user!.id]);
    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/admin/update-credentials
// Dedicated atomic endpoint strictly protected for administrators & moderators
router.post('/admin/update-credentials', authenticate, authorize('admin', 'moderator'), async (req: Request, res: Response) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      res.status(400).json({ error: 'Current password is required to update credentials.' });
      return;
    }

    if (!newEmail && !newPassword) {
      res.status(400).json({ error: 'Please provide a new email address, a new password, or both.' });
      return;
    }

    // Verify requesting admin exists in database
    const adminUser = get<any>('SELECT * FROM users WHERE id = ?', [req.user!.id]);
    if (!adminUser) {
      res.status(404).json({ error: 'Administrator account not found.' });
      return;
    }

    // Verify current password against database hash
    const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect. Please check and try again.' });
      return;
    }

    let updatedEmail = adminUser.email;
    let updatedHash = adminUser.password_hash;

    // Validate email if provided
    if (newEmail) {
      const trimmedEmail = String(newEmail).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }

      // Check whether email is already registered to another account
      const conflict = get<any>('SELECT id FROM users WHERE email = ? AND id != ?', [trimmedEmail, req.user!.id]);
      if (conflict) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }
      updatedEmail = trimmedEmail;
    }

    // Validate password if provided
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        res.status(400).json({ error: 'New password must be at least 8 characters long.' });
        return;
      }
      updatedHash = await bcrypt.hash(newPassword, 10);
    }

    // Atomic database update in SQLite
    exec('BEGIN TRANSACTION');
    try {
      run(
        'UPDATE users SET email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [updatedEmail, updatedHash, req.user!.id]
      );
      run('UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.user!.id]);
      exec('COMMIT');
    } catch (dbErr) {
      exec('ROLLBACK');
      throw dbErr;
    }

    res.json({
      success: true,
      message: 'Admin credentials updated successfully! Please sign in with your new credentials.',
      user: {
        id: req.user!.id,
        email: updatedEmail,
        role: adminUser.role,
        name: adminUser.full_name,
      },
    });
  } catch (err: any) {
    console.error('Error updating admin credentials:', err);
    res.status(500).json({ error: err.message || 'Internal server error while updating credentials.' });
  }
});

export default router;