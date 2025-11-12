import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface AuthPayload {
  id: string;
  role: 'admin' | 'staff';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth = (roles: Array<'admin' | 'staff'> = ['admin','staff']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
      if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

      const payload = jwt.verify(token, ENV.JWT_SECRET) as AuthPayload;
      if (!roles.includes(payload.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      req.user = payload;
      next();
    } catch (e: any) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
};
