import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request { user?: AuthUser; }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (typeof req.query.token === 'string') {
    token = req.query.token.trim();
  }

  if (!token || token === 'null' || token === 'undefined' || token === '') {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch (err: any) {
    if (err?.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    } else {
      res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: 'Unauthenticated' }); return; }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden. Required roles: ' + roles.join(', ') });
      return;
    }
    next();
  };
}