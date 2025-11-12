import { Request, Response } from 'express';
import { DeliveryOption } from '../models/DeliveryOption';
import { asyncHandler } from '../utils/asyncHandler';

export const listDeliveryOptions = asyncHandler(async (req: Request, res: Response) => {
  const rows = await DeliveryOption.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: rows });
});

export const createDeliveryOption = asyncHandler(async (req: Request, res: Response) => {
  const { name, fee = 0, status = 'Enabled' } = req.body as any;
  if (!name) return res.status(400).json({ success: false, message: 'name is required' });
  const d = await DeliveryOption.create({ name: name.trim(), fee: Number(fee), status });
  res.status(201).json({ success: true, data: d });
});

export const updateDeliveryOption = asyncHandler(async (req: Request, res: Response) => {
  const d = await DeliveryOption.findById(req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Delivery option not found' });
  const { name, fee, status } = req.body as any;
  if (name !== undefined) d.name = name.trim();
  if (fee !== undefined) d.fee = Number(fee);
  if (status !== undefined) d.status = status;
  await d.save();
  res.json({ success: true, data: d });
});

export const deleteDeliveryOption = asyncHandler(async (req: Request, res: Response) => {
  // For now allow delete; caller must ensure no references
  const d = await DeliveryOption.findById(req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Delivery option not found' });
  await d.remove();
  res.json({ success: true });
});
