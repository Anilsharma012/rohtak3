import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { asyncHandler } from '../utils/asyncHandler';

// Singleton: get or create default
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  let s = await Settings.findOne().lean();
  if (!s) {
    const created = await Settings.create({});
    s = created.toObject();
  }
  res.json({ success: true, data: s });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  let s = await Settings.findOne();
  if (!s) {
    s = await Settings.create(req.body);
  } else {
    s.set(req.body);
    await s.save();
  }
  res.json({ success: true, data: s });
});
