import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  const filter: any = {};
  if (q) filter.$text = { $search: q };
  const items = await Item.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: items });
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: { id: item._id } });
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { delta } = req.body as { delta: number };
  if (typeof delta !== 'number') return res.status(400).json({ success: false, message: 'delta (number) required' });
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  item.onHand = (item.onHand || 0) + delta;
  await item.save();
  res.json({ success: true, data: item });
});
