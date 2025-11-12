import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '50', q, role, active } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;
  const filter: any = {};
  if (q) filter.$or = [ { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } } ];
  if (role) filter.role = role;
  if (active !== undefined) filter.isActive = active === '1' || active === 'true';

  const total = await User.countDocuments(filter);
  const rows = await User.find(filter).skip(skip).limit(limitNum).lean();
  res.json({ success: true, data: { rows, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role = 'viewer', password } = req.body as any;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name,email,password required' });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const u = await User.create({ name, email: email.toLowerCase(), password: hashed, role });
  res.status(201).json({ success: true, data: { id: u._id, name: u.name, email: u.email, role: u.role } });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'User not found' });
  const { name, role, isActive, password } = req.body as any;
  if (name !== undefined) u.name = name;
  if (role !== undefined) u.role = role;
  if (isActive !== undefined) u.isActive = !!isActive;
  if (password) {
    u.password = await bcrypt.hash(password, 10);
  }
  await u.save();
  res.json({ success: true, data: { id: u._id, name: u.name, email: u.email, role: u.role, isActive: u.isActive } });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'User not found' });
  u.isActive = false;
  await u.save();
  res.json({ success: true });
});
