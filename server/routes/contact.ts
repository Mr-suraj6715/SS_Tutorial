import { Router, Request, Response } from 'express';
import { run, query, get } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { eventBroadcaster } from '../services/events.js';

const router = Router();

// POST /api/contact or POST /api/messages or POST /api/content/messages — public contact submission
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please provide your name (at least 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      res.status(400).json({ error: 'Please provide a message or inquiry (at least 5 characters).' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const trimmedPhone = phone ? String(phone).trim() : '';
    const trimmedSubject = subject && String(subject).trim() ? String(subject).trim() : 'General Inquiry';

    // Prevent immediate duplicate submissions (same email & message within last 2 minutes)
    const recentDuplicate = get<any>(
      `SELECT id FROM messages 
       WHERE email = ? AND message = ? AND created_at > datetime('now', '-2 minutes')`,
      [trimmedEmail, trimmedMessage]
    );

    if (recentDuplicate) {
      res.status(429).json({
        error: 'Your inquiry was already received recently. Our team will contact you shortly.',
        id: recentDuplicate.id,
      });
      return;
    }

    const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    run(
      'INSERT INTO messages (id, name, email, phone, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, datetime(\'now\'))',
      [id, name.trim(), trimmedEmail, trimmedPhone, trimmedSubject, trimmedMessage]
    );

    const created = get('SELECT * FROM messages WHERE id = ?', [id]);

    // Real-time broadcast to connected admin dashboards
    eventBroadcaster.broadcast({
      type: 'message_created',
      data: created,
    });

    res.status(201).json({
      message: 'Your message has been received. We will get back to you shortly!',
      id,
      inquiry: created,
    });
  } catch (err: any) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/messages or /api/content/messages — admin only (secured)
router.get('/', authenticate, authorize('admin'), (_req: Request, res: Response) => {
  try {
    const messages = query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/messages/:id — view single message details (admin only)
router.get('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  try {
    const message = get('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    if (!message) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    res.json({ message });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PUT & PATCH /api/messages/:id/read or /:id — mark as read / unread (admin only)
const markReadHandler = (req: Request, res: Response) => {
  try {
    const isRead = req.body.is_read !== undefined ? (req.body.is_read ? 1 : 0) : 1;
    const existing = get('SELECT id FROM messages WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    run('UPDATE messages SET is_read = ? WHERE id = ?', [isRead, req.params.id]);
    const updated = get('SELECT * FROM messages WHERE id = ?', [req.params.id]);

    // Real-time broadcast
    eventBroadcaster.broadcast({
      type: 'message_updated',
      data: updated,
    });

    res.json({ message: 'Message read status updated', is_read: isRead, inquiry: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
router.patch('/:id/read', authenticate, authorize('admin'), markReadHandler);
router.put('/:id/read', authenticate, authorize('admin'), markReadHandler);
router.patch('/:id', authenticate, authorize('admin'), markReadHandler);
router.put('/:id', authenticate, authorize('admin'), markReadHandler);

// DELETE /api/messages/:id (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  try {
    const existing = get('SELECT id FROM messages WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    run('DELETE FROM messages WHERE id = ?', [req.params.id]);

    // Real-time broadcast
    eventBroadcaster.broadcast({
      type: 'message_deleted',
      data: { id: req.params.id },
    });

    res.json({ message: 'Inquiry deleted successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
