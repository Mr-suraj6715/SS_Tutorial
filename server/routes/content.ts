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
    : 'SELECT * FROM blogs WHERE is_published = 1 ORDER BY published_at DESC, created_at DESC';
  res.json({ blogs: query(sql) });
});

router.get('/blogs/:idOrSlug', (req: Request, res: Response) => {
  const blog = get('SELECT * FROM blogs WHERE id = ? OR slug = ?', [
    req.params.idOrSlug,
    req.params.idOrSlug,
  ]);
  if (!blog) {
    res.status(404).json({ error: 'Blog post not found' });
    return;
  }
  res.json({ blog });
});

router.post('/blogs', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, slug, excerpt, content, cover_url, author, is_published } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'title and content are required' });
    return;
  }
  const id = 'blog-' + Date.now();
  const safeSlug =
    slug?.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    id;

  run(
    `INSERT INTO blogs (id, title, slug, excerpt, content, cover_url, author, is_published, published_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      id,
      title.trim(),
      safeSlug,
      excerpt || '',
      content,
      cover_url || '',
      author || 'SS Tutorial',
      is_published !== undefined ? (is_published ? 1 : 0) : 1,
    ]
  );
  res.status(201).json({ blog: get('SELECT * FROM blogs WHERE id = ?', [id]), message: 'Blog created' });
});

router.patch('/blogs/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const blog = get<any>('SELECT id FROM blogs WHERE id = ?', [req.params.id]);
  if (!blog) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  const fields = ['title', 'slug', 'excerpt', 'content', 'cover_url', 'author', 'is_published'];
  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'is_published') {
        vals.push(req.body[f] ? 1 : 0);
      } else {
        vals.push(req.body[f]);
      }
    }
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  vals.push(req.params.id);
  run(`UPDATE blogs SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);
  res.json({ blog: get('SELECT * FROM blogs WHERE id = ?', [req.params.id]), message: 'Blog updated' });
});

router.delete('/blogs/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM blogs WHERE id = ?', [req.params.id]);
  res.json({ message: 'Blog deleted' });
});

// ==========================================
// 2. TESTIMONIALS
// ==========================================
router.get('/testimonials', (req: Request, res: Response) => {
  const { all } = req.query;
  const sql = all
    ? 'SELECT * FROM testimonials ORDER BY created_at DESC'
    : 'SELECT * FROM testimonials WHERE is_published = 1 ORDER BY created_at DESC';
  res.json({ testimonials: query(sql) });
});

router.post('/testimonials', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { student_name, course, text, rating, photo_url, is_published } = req.body;
  if (!student_name || !text) {
    res.status(400).json({ error: 'student_name and text are required' });
    return;
  }
  const id = 'test-' + Date.now();
  run(
    `INSERT INTO testimonials (id, student_name, course, text, rating, photo_url, is_published) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      student_name.trim(),
      course || '',
      text.trim(),
      Number(rating) || 5,
      photo_url || '',
      is_published !== undefined ? (is_published ? 1 : 0) : 1,
    ]
  );
  res.status(201).json({ testimonial: get('SELECT * FROM testimonials WHERE id = ?', [id]), message: 'Testimonial created' });
});

router.patch('/testimonials/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const test = get<any>('SELECT id FROM testimonials WHERE id = ?', [req.params.id]);
  if (!test) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }
  const fields = ['student_name', 'course', 'text', 'rating', 'photo_url', 'is_published'];
  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'rating') vals.push(Number(req.body[f]) || 5);
      else if (f === 'is_published') vals.push(req.body[f] ? 1 : 0);
      else vals.push(req.body[f]);
    }
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  vals.push(req.params.id);
  run(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`, vals);
  res.json({ testimonial: get('SELECT * FROM testimonials WHERE id = ?', [req.params.id]), message: 'Testimonial updated' });
});

router.delete('/testimonials/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
  res.json({ message: 'Testimonial deleted' });
});

// ==========================================
// 3. FACULTY
// ==========================================
router.get('/faculty', (_req: Request, res: Response) => {
  res.json({ faculty: query('SELECT * FROM faculty ORDER BY display_order ASC, name ASC') });
});

router.post('/faculty', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { name, designation, bio, photo_url, subjects, display_order } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const id = 'fac-' + Date.now();
  run(
    `INSERT INTO faculty (id, name, designation, bio, photo_url, subjects, display_order) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name.trim(),
      designation || '',
      bio || '',
      photo_url || '',
      subjects || '',
      display_order !== undefined ? Number(display_order) : 0,
    ]
  );
  res.status(201).json({ faculty: get('SELECT * FROM faculty WHERE id = ?', [id]), message: 'Faculty created' });
});

router.patch('/faculty/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const fac = get<any>('SELECT id FROM faculty WHERE id = ?', [req.params.id]);
  if (!fac) {
    res.status(404).json({ error: 'Faculty member not found' });
    return;
  }
  const fields = ['name', 'designation', 'bio', 'photo_url', 'subjects', 'display_order'];
  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'display_order') vals.push(Number(req.body[f]) || 0);
      else vals.push(req.body[f]);
    }
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  vals.push(req.params.id);
  run(`UPDATE faculty SET ${updates.join(', ')} WHERE id = ?`, vals);
  res.json({ faculty: get('SELECT * FROM faculty WHERE id = ?', [req.params.id]), message: 'Faculty updated' });
});

router.delete('/faculty/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM faculty WHERE id = ?', [req.params.id]);
  res.json({ message: 'Faculty deleted' });
});

// ==========================================
// 4. FACILITIES
// ==========================================
router.get('/facilities', (_req: Request, res: Response) => {
  res.json({ facilities: query('SELECT * FROM facilities ORDER BY display_order ASC, title ASC') });
});

router.post('/facilities', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, description, icon, image_url, display_order } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  const id = 'facil-' + Date.now();
  run(
    `INSERT INTO facilities (id, title, description, icon, image_url, display_order) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      title.trim(),
      description || '',
      icon || 'BookOpen',
      image_url || '',
      display_order !== undefined ? Number(display_order) : 0,
    ]
  );
  res.status(201).json({ facility: get('SELECT * FROM facilities WHERE id = ?', [id]), message: 'Facility created' });
});

router.patch('/facilities/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const facil = get<any>('SELECT id FROM facilities WHERE id = ?', [req.params.id]);
  if (!facil) {
    res.status(404).json({ error: 'Facility not found' });
    return;
  }
  const fields = ['title', 'description', 'icon', 'image_url', 'display_order'];
  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'display_order') vals.push(Number(req.body[f]) || 0);
      else vals.push(req.body[f]);
    }
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  vals.push(req.params.id);
  run(`UPDATE facilities SET ${updates.join(', ')} WHERE id = ?`, vals);
  res.json({ facility: get('SELECT * FROM facilities WHERE id = ?', [req.params.id]), message: 'Facility updated' });
});

router.delete('/facilities/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM facilities WHERE id = ?', [req.params.id]);
  res.json({ message: 'Facility deleted' });
});

// ==========================================
// 5. ACHIEVEMENTS
// ==========================================
router.get('/achievements', (_req: Request, res: Response) => {
  res.json({ achievements: query('SELECT * FROM achievements ORDER BY display_order ASC, created_at DESC') });
});

router.post('/achievements', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, description, image_url, date, category, display_order } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  const id = 'ach-' + Date.now();
  run(
    `INSERT INTO achievements (id, title, description, image_url, date, category, display_order) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title.trim(),
      description || '',
      image_url || '',
      date || null,
      category || '',
      display_order !== undefined ? Number(display_order) : 0,
    ]
  );
  res.status(201).json({ achievement: get('SELECT * FROM achievements WHERE id = ?', [id]), message: 'Achievement created' });
});

router.patch('/achievements/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const ach = get<any>('SELECT id FROM achievements WHERE id = ?', [req.params.id]);
  if (!ach) {
    res.status(404).json({ error: 'Achievement not found' });
    return;
  }
  const fields = ['title', 'description', 'image_url', 'date', 'category', 'display_order'];
  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'display_order') vals.push(Number(req.body[f]) || 0);
      else vals.push(req.body[f]);
    }
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  vals.push(req.params.id);
  run(`UPDATE achievements SET ${updates.join(', ')} WHERE id = ?`, vals);
  res.json({ achievement: get('SELECT * FROM achievements WHERE id = ?', [req.params.id]), message: 'Achievement updated' });
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
    'INSERT INTO messages (id, name, email, phone, subject, message, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [id, name.trim(), email.trim(), phone?.trim() || '', subject?.trim() || '', message.trim()]
  );
  res.status(201).json({ message: 'Message sent successfully', id });
});

router.patch('/messages/:id/read', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const msg = get<any>('SELECT id, is_read FROM messages WHERE id = ?', [req.params.id]);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  const newRead = req.body.is_read !== undefined ? (req.body.is_read ? 1 : 0) : (msg.is_read ? 0 : 1);
  run('UPDATE messages SET is_read = ? WHERE id = ?', [newRead, req.params.id]);
  res.json({ message: 'Message status updated', is_read: newRead });
});

router.delete('/messages/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM messages WHERE id = ?', [req.params.id]);
  res.json({ message: 'Message deleted' });
});

// ==========================================
// 7. VIDEOS
// ==========================================
router.get('/videos', (req: Request, res: Response) => {
  const { all } = req.query;
  const sql = all
    ? 'SELECT * FROM videos ORDER BY display_order ASC, created_at DESC'
    : 'SELECT * FROM videos WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC';
  res.json({ videos: query(sql) });
});

router.post('/videos', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, description, url, platform, embed_url, thumbnail, display_order, is_active } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: 'title and url required' });
    return;
  }
  const id = 'vid-' + Date.now();
  run(
    `INSERT INTO videos (id, title, description, url, platform, embed_url, thumbnail, display_order, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title.trim(),
      description || '',
      url.trim(),
      platform || 'youtube',
      embed_url || '',
      thumbnail || '',
      display_order !== undefined ? Number(display_order) : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
    ]
  );
  res.status(201).json({ video: get('SELECT * FROM videos WHERE id = ?', [id]), message: 'Video created' });
});

router.patch('/videos/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const vid = get<any>('SELECT id FROM videos WHERE id = ?', [req.params.id]);
  if (!vid) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }
  const fields = ['title', 'description', 'url', 'platform', 'embed_url', 'thumbnail', 'display_order', 'is_active'];
  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'is_active') vals.push(req.body[f] ? 1 : 0);
      else if (f === 'display_order') vals.push(Number(req.body[f]) || 0);
      else vals.push(req.body[f]);
    }
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  vals.push(req.params.id);
  run(`UPDATE videos SET ${updates.join(', ')} WHERE id = ?`, vals);
  res.json({ video: get('SELECT * FROM videos WHERE id = ?', [req.params.id]), message: 'Video updated' });
});

router.delete('/videos/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM videos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Video deleted' });
});

export default router;
