import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';

export const registerIfEmpty = asyncHandler(async (req: Request, res: Response) => {
  const count = await User.countDocuments();
  if (count > 0) {
    return res.status(400).json({ success: false, message: 'Admin already exists. Use /auth/login.' });
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email, password required' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: 'admin' });
  res.json({ success: true, data: { id: user._id, email: user.email } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});
