import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/gallery (public)
router.get('/', (req: Request, res: Response) => {
  const { placement, all } = req.query;
  let sql = 'SELECT * FROM gallery WHERE 1=1';
  const params: any[] = [];

  if (placement) {
    sql += ' AND placement = ?';
    params.push(placement);
  }
  if (!all) {
    sql += ' AND is_published = 1';
  }
  sql += ' ORDER BY display_order ASC, created_at DESC';

  const items = query(sql, params);
  res.json({ gallery: items });
});

// POST /api/gallery (admin)
router.post('/', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const {
    title,
    caption,
    alt_text,
    image_url,
    thumbnail_url,
    webp_url,
    placement,
    display_order,
    instagram_post_url,
    is_published,
  } = req.body;

  if (!image_url) {
    res.status(400).json({ error: 'image_url is required' });
    return;
  }

  const id = 'gal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  run(
    `INSERT INTO gallery (
      id, title, caption, alt_text, image_url, thumbnail_url, webp_url,
      placement, display_order, instagram_post_url, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title || '',
      caption || '',
      alt_text || title || '',
      image_url,
      thumbnail_url || image_url,
      webp_url || image_url,
      placement || 'gallery',
      display_order || 0,
      instagram_post_url || '',
      is_published === undefined || is_published === null ? 1 : is_published ? 1 : 0,
    ]
  );

  const created = get('SELECT * FROM gallery WHERE id = ?', [id]);
  res.status(201).json({ item: created });
});

// PATCH /api/gallery/:id (admin)
router.patch('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const item = get('SELECT id FROM gallery WHERE id = ?', [req.params.id]);
  if (!item) {
    res.status(404).json({ error: 'Gallery item not found' });
    return;
  }

  const fields = ['title', 'caption', 'alt_text', 'placement', 'display_order', 'is_published'];
  const updates: string[] = [];
  const vals: any[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  }

  if (updates.length > 0) {
    vals.push(req.params.id);
    run(`UPDATE gallery SET ${updates.join(', ')} WHERE id = ?`, vals);
  }

  const updated = get('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
  res.json({ item: updated });
});

// DELETE /api/gallery/:id (admin)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM gallery WHERE id = ?', [req.params.id]);
  res.json({ message: 'Gallery item deleted' });
});

export default router;
