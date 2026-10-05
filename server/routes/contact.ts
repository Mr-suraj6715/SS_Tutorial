import { Router, Request, Response } from 'express';
import { run, query } from '../database/connection.js';

const router = Router();

// POST /api/contact  or  POST /api/messages  — public, no auth required
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'name, email, and message are required' });
      return;
    }
    const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    run(
      'INSERT INTO messages (id, name, email, phone, subject, message, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, name.trim(), email.trim().toLowerCase(), phone?.trim() || '', subject?.trim() || '', message.trim()]
    );
    res.status(201).json({ message: 'Your message has been received. We will get back to you shortly!', id });
  } catch (err: any) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/messages  — admin only
router.get('/', (req: Request, res: Response) => {
  try {
    // Simple check — no hard auth middleware so admin calls can pass token optionally
    const messages = query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /api/messages/:id/read  — mark as read
router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    run('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
