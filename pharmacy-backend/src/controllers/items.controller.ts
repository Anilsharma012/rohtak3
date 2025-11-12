import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name) return res.status(400).json({ success: false, message: 'name is required' });
  const item = await Item.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = '1', limit = '20', lowStock, expiringSoon } = req.query as any;
  const filter: any = {};
  if (q) filter.$text = { $search: String(q) };

  if (lowStock === '1') {
    filter.$or = [
      { onHand: { $lte: '$minStock' } },
      { minStock: { $gt: 0 }, onHand: { $lte: 0 } },
    ];
  }
  if (expiringSoon) {
    const days = Math.max(1, parseInt(String(expiringSoon), 10) || 90);
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    filter['batches.expiryDate'] = { $lte: future };
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Item.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
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
  const { delta, reason, batchNo } = req.body as { delta: number; reason?: string; batchNo?: string };
  if (typeof delta !== 'number') return res.status(400).json({ success: false, message: 'delta (number) required' });
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  let newOnHand = (item.onHand || 0) + delta;
  if (newOnHand < 0) return res.status(400).json({ success: false, message: 'Insufficient stock' });

  if (batchNo) {
    const idx = item.batches.findIndex(b => b.batchNo === batchNo);
    if (idx === -1) return res.status(400).json({ success: false, message: 'Batch not found' });
    const b = item.batches[idx];
    const batchNew = (b.onHand || 0) + delta;
    if (batchNew < 0) return res.status(400).json({ success: false, message: 'Insufficient batch stock' });
    item.batches[idx].onHand = batchNew;
  }

  item.onHand = newOnHand;
  await item.save();
  res.json({ success: true, data: item });
});
