import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { db } from './database/connection.js';
import { initSchema } from './database/schema.js';
import { seedDatabase } from './database/seed.js';

// Routes
import authRouter      from './routes/auth.js';
import usersRouter     from './routes/users.js';
import coursesRouter   from './routes/courses.js';
import batchesRouter   from './routes/batches.js';
import feesRouter      from './routes/fees.js';
import attendanceRouter from './routes/attendance.js';
import examsRouter     from './routes/exams.js';
import materialsRouter from './routes/materials.js';
import noticesRouter   from './routes/notices.js';
import settingsRouter  from './routes/settings.js';
import dashboardRouter from './routes/dashboard.js';
import admissionsRouter from './routes/admissions.js';
import uploadRouter     from './routes/upload.js';
import galleryRouter    from './routes/gallery.js';
import contentRouter    from './routes/content.js';
import contactRouter    from './routes/contact.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'server/data/uploads')));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'sqlite' });
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/users',       usersRouter);
app.use('/api/courses',     coursesRouter);
app.use('/api/batches',     batchesRouter);
app.use('/api/fees',        feesRouter);
app.use('/api/attendance',  attendanceRouter);
app.use('/api/exams',       examsRouter);
app.use('/api/materials',   materialsRouter);
app.use('/api/notices',     noticesRouter);
app.use('/api/settings',    settingsRouter);
app.use('/api/dashboard',   dashboardRouter);
app.use('/api/admissions',  admissionsRouter);
app.use('/api/upload',      uploadRouter);
app.use('/api/gallery',     galleryRouter);
app.use('/api/content',     contentRouter);
app.use('/api/contact',     contactRouter);
app.use('/api/messages',    contactRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────
async function start() {
  try {
    initSchema();
    await seedDatabase();
    app.listen(config.PORT, () => {
      console.log('\n========================================');
      console.log(' SS Tutorial Backend API');
      console.log(' Running on: http://localhost:' + config.PORT);
      console.log(' DB: ' + config.DB_PATH);
      console.log('========================================\n');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();