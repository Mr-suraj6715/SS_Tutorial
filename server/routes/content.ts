import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. BLOGS
// ==========================================
router.get('/blogs', (req: Request, res: Response) => {
  const { all } = req.query;
  const sql = all
    ? 'SELECT * FROM blogs ORDER BY created_at DESC'
    : 'SELECT * FROM blogs WHERE is_published = 1 ORDER BY published_at DESC';
  res.json({ blogs: query(sql) });
});

router.post('/blogs', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, excerpt, content, cover_url, author } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'title and content required' });
    return;
  }
  const id = 'blog-' + Date.now();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id;
  run(
    'INSERT INTO blogs (id, title, slug, excerpt, content, cover_url, author, is_published) VALUES (?,?,?,?,?,?,?,?)',
    [id, title, slug, excerpt || '', content, cover_url || '', author || 'SS Tutorial', 1]
  );
  res.status(201).json({ blog: get('SELECT * FROM blogs WHERE id = ?', [id]) });
});

router.delete('/blogs/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM blogs WHERE id = ?', [req.params.id]);
  res.json({ message: 'Blog deleted' });
});

// ==========================================
// 2. TESTIMONIALS
// ==========================================
router.get('/testimonials', (_req: Request, res: Response) => {
  res.json({ testimonials: query('SELECT * FROM testimonials WHERE is_published = 1 ORDER BY created_at DESC') });
});

router.post('/testimonials', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { student_name, course, text, rating, photo_url } = req.body;
  if (!student_name || !text) {
    res.status(400).json({ error: 'student_name and text required' });
    return;
  }
  const id = 'test-' + Date.now();
  run(
    'INSERT INTO testimonials (id, student_name, course, text, rating, photo_url, is_published) VALUES (?,?,?,?,?,?,?)',
    [id, student_name, course || '', text, rating || 5, photo_url || '', 1]
  );
  res.status(201).json({ testimonial: get('SELECT * FROM testimonials WHERE id = ?', [id]) });
});

router.delete('/testimonials/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
  res.json({ message: 'Testimonial deleted' });
});

// ==========================================
// 3. FACULTY
// ==========================================
router.get('/faculty', (_req: Request, res: Response) => {
  res.json({ faculty: query('SELECT * FROM faculty ORDER BY display_order ASC') });
});

router.post('/faculty', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { name, designation, bio, photo_url, subjects, display_order } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name required' });
    return;
  }
  const id = 'fac-' + Date.now();
  run(
    'INSERT INTO faculty (id, name, designation, bio, photo_url, subjects, display_order) VALUES (?,?,?,?,?,?,?)',
    [id, name, designation || '', bio || '', photo_url || '', subjects || '', display_order || 0]
  );
  res.status(201).json({ faculty: get('SELECT * FROM faculty WHERE id = ?', [id]) });
});

router.delete('/faculty/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM faculty WHERE id = ?', [req.params.id]);
  res.json({ message: 'Faculty deleted' });
});

// ==========================================
// 4. FACILITIES
// ==========================================
router.get('/facilities', (_req: Request, res: Response) => {
  res.json({ facilities: query('SELECT * FROM facilities ORDER BY display_order ASC') });
});

router.post('/facilities', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, description, icon, image_url, display_order } = req.body;
  if (!title) {
    res.status(400).json({ error: 'title required' });
    return;
  }
  const id = 'facil-' + Date.now();
  run(
    'INSERT INTO facilities (id, title, description, icon, image_url, display_order) VALUES (?,?,?,?,?,?)',
    [id, title, description || '', icon || 'BookOpen', image_url || '', display_order || 0]
  );
  res.status(201).json({ facility: get('SELECT * FROM facilities WHERE id = ?', [id]) });
});

router.delete('/facilities/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM facilities WHERE id = ?', [req.params.id]);
  res.json({ message: 'Facility deleted' });
});

// ==========================================
// 5. ACHIEVEMENTS
// ==========================================
router.get('/achievements', (_req: Request, res: Response) => {
  res.json({ achievements: query('SELECT * FROM achievements ORDER BY display_order ASC') });
});

router.post('/achievements', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, description, image_url, date, category, display_order } = req.body;
  if (!title) {
    res.status(400).json({ error: 'title required' });
    return;
  }
  const id = 'ach-' + Date.now();
  run(
    'INSERT INTO achievements (id, title, description, image_url, date, category, display_order) VALUES (?,?,?,?,?,?,?)',
    [id, title, description || '', image_url || '', date || null, category || '', display_order || 0]
  );
  res.status(201).json({ achievement: get('SELECT * FROM achievements WHERE id = ?', [id]) });
});

router.delete('/achievements/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM achievements WHERE id = ?', [req.params.id]);
  res.json({ message: 'Achievement deleted' });
});

// ==========================================
// 6. MESSAGES (Contact Inquiries)
// ==========================================
router.get('/messages', authenticate, authorize('admin'), (_req: Request, res: Response) => {
  res.json({ messages: query('SELECT * FROM messages ORDER BY created_at DESC') });
});

router.post('/messages', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message required' });
    return;
  }
  const id = 'msg-' + Date.now();
  run(
    'INSERT INTO messages (id, name, email, phone, subject, message) VALUES (?,?,?,?,?,?)',
    [id, name, email, phone || '', subject || '', message]
  );
  res.status(201).json({ message: 'Message sent successfully', id });
});

router.delete('/messages/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM messages WHERE id = ?', [req.params.id]);
  res.json({ message: 'Message deleted' });
});

// ==========================================
// 7. VIDEOS
// ==========================================
router.get('/videos', (_req: Request, res: Response) => {
  res.json({ videos: query('SELECT * FROM videos WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC') });
});

router.post('/videos', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, description, url, platform, embed_url, thumbnail, display_order } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: 'title and url required' });
    return;
  }
  const id = 'vid-' + Date.now();
  run(
    'INSERT INTO videos (id, title, description, url, platform, embed_url, thumbnail, display_order, is_active) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, title, description || '', url, platform || 'youtube', embed_url || '', thumbnail || '', display_order || 0, 1]
  );
  res.status(201).json({ video: get('SELECT * FROM videos WHERE id = ?', [id]) });
});

router.delete('/videos/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM videos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Video deleted' });
});

export default router;
