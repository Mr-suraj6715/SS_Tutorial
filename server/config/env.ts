import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'ss_tutorial_production_jwt_secret_2026_super_secure',
  JWT_EXPIRES_IN: '7d',
  DB_PATH: path.resolve(process.cwd(), 'server/data/sstutorial.db'),
  UPLOAD_DIR: path.resolve(process.cwd(), 'server/data/uploads'),
};
