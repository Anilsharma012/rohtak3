import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: ENV.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
  secure: ENV.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const registerIfEmpty = asyncHandler(async (req: Request, res: Response) => {
  const count = await User.countDocuments();
  if (count > 0) {
    return res.status(400).json({ success: false, message: 'Admin already exists. Use /api/auth/login.' });
  }

  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email, password required' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role: 'admin' });
  res.json({ success: true, data: { id: user._id, email: user.email, name: user.name } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOpts());
  res.json({ success: true, data: { id: user._id, email: user.email, name: user.name, role: user.role, token } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('token', cookieOpts());
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const id = req.user?.id;
  if (!id) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const user = await User.findById(id).select('_id name email role isActive');
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
