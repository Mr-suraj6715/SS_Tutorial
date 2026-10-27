import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/settings  (public)
router.get('/', (_req: Request, res: Response) => {
  const rows = query<any>('SELECT key, value FROM site_settings ORDER BY key');
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json({ settings });
});

// GET /api/settings/:key
router.get('/:key', (_req: Request, res: Response) => {
  const row = get<any>('SELECT * FROM site_settings WHERE key = ?', [_req.params.key]);
  if (!row) { res.status(404).json({ error: 'Setting not found' }); return; }
  res.json({ setting: row });
});

// PATCH & POST /api/settings  (admin) — single or bulk update
const updateSettingsHandler = (req: Request, res: Response) => {
  if (req.body.key !== undefined && req.body.value !== undefined) {
    run('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [req.body.key, String(req.body.value)]);
    res.json({ message: 'Setting updated', key: req.body.key, value: req.body.value });
    return;
  }
  const updates: Record<string, string> = req.body;
  for (const [key, value] of Object.entries(updates)) {
    run('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', [key, String(value)]);
  }
  res.json({ message: 'Settings updated', count: Object.keys(updates).length });
};
router.patch('/', authenticate, authorize('admin'), updateSettingsHandler);
router.post('/', authenticate, authorize('admin'), updateSettingsHandler);

// PUT /api/settings/:key  (admin)
router.put('/:key', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { value, description } = req.body;
  run('INSERT OR REPLACE INTO site_settings (key, value, description) VALUES (?, ?, COALESCE(?, (SELECT description FROM site_settings WHERE key = ?)))',
    [req.params.key, String(value), description ?? null, req.params.key]);
  res.json({ setting: get('SELECT * FROM site_settings WHERE key = ?', [req.params.key]) });
});

export default router;