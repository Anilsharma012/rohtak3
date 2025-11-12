import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export type UserRole = 'admin' | 'pharmacist' | 'inventory_manager' | 'cashier' | 'viewer';

export interface AuthPayload {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth = (roles: UserRole[] = ['admin', 'pharmacist', 'inventory_manager', 'cashier', 'viewer']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
      const cookieToken = (req as any).cookies?.token as string | undefined;
      const token = cookieToken || bearer;
      if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const payload = jwt.verify(token, ENV.JWT_SECRET) as AuthPayload;
      if (!roles.includes(payload.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      req.user = payload;
      next();
    } catch (e: any) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
};
