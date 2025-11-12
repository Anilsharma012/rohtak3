import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SalesOrder } from '../models/SalesOrder';
import { Sale } from '../models/Sale';
import { asyncHandler } from '../utils/asyncHandler';
import { createSale } from './sales.controller';

const genOrderNo = async (): Promise<string> => {
  const d = new Date();
  const y = d.getUTCFullYear();
  const count = await SalesOrder.countDocuments({});
  const seq = String(count + 1).padStart(3, '0');
  return `SO-${y}-${seq}`;
};

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', q } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const filter: any = {};
  if (q) filter.$or = [ { orderNo: { $regex: q, $options: 'i' } }, { customer: { $regex: q, $options: 'i' } } ];
  const total = await SalesOrder.countDocuments(filter);
  const rows = await SalesOrder.find(filter).sort({ orderDate: -1 }).skip(skip).limit(limitNum).lean();
  res.json({ success: true, data: { rows, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { customer, orderDate, items } = req.body as any;
  const userId = (req as any).user?.id;
  if (!orderDate) return res.status(400).json({ success: false, message: 'orderDate is required' });
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'At least one item is required' });

  let total = 0;
  const prepared: any[] = [];
  for (const raw of items) {
    const qty = Number(raw.qty || 0);
    const salePrice = Number(raw.salePrice || 0);
    if (!(qty > 0)) return res.status(400).json({ success: false, message: 'qty must be >0' });
    prepared.push({ productId: raw.productId, productName: raw.productName, batchNo: raw.batchNo, qty, salePrice, amount: Number((qty * salePrice).toFixed(2)) });
    total += qty * salePrice;
  }

  const orderNo = await genOrderNo();
  const so = await SalesOrder.create({ orderNo, orderDate: new Date(orderDate), customer, items: prepared, totalAmount: Number(total.toFixed(2)), createdBy: userId });
  res.status(201).json({ success: true, data: so });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const so = await SalesOrder.findById(req.params.id).lean();
  if (!so) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: so });
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const so = await SalesOrder.findById(req.params.id);
  if (!so) return res.status(404).json({ success: false, message: 'Order not found' });
  if (so.status === 'Fulfilled') return res.status(400).json({ success: false, message: 'Cannot edit a fulfilled order' });
  const { customer, orderDate, items, status } = req.body as any;
  if (customer !== undefined) so.customer = customer;
  if (orderDate !== undefined) so.orderDate = new Date(orderDate);
  if (items !== undefined && Array.isArray(items) && items.length > 0) {
    let total = 0;
    const prepared: any[] = [];
    for (const raw of items) {
      const qty = Number(raw.qty || 0);
      const salePrice = Number(raw.salePrice || 0);
      prepared.push({ productId: raw.productId, productName: raw.productName, batchNo: raw.batchNo, qty, salePrice, amount: Number((qty * salePrice).toFixed(2)) });
      total += qty * salePrice;
    }
    so.items = prepared;
    so.totalAmount = Number(total.toFixed(2));
  }
  if (status !== undefined) so.status = status;
  await so.save();
  res.json({ success: true, data: so });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const so = await SalesOrder.findById(req.params.id);
  if (!so) return res.status(404).json({ success: false, message: 'Order not found' });
  if (so.status === 'Fulfilled') return res.status(400).json({ success: false, message: 'Cannot delete a fulfilled order' });
  await so.remove();
  res.json({ success: true });
});

export const convertOrderToSale = asyncHandler(async (req: Request, res: Response) => {
  const so = await SalesOrder.findById(req.params.id);
  if (!so) return res.status(404).json({ success: false, message: 'Order not found' });
  if (so.status === 'Fulfilled') return res.status(400).json({ success: false, message: 'Order already fulfilled' });

  // create sale using sales.controller createSale logic by constructing req.body-like payload
  const fakeReq: any = { body: { customer: so.customer, items: so.items.map(i => ({ productId: i.productId, batchNo: i.batchNo, qty: i.qty, salePrice: i.salePrice })), discount: 0 }, user: req.user };
  // reuse createSale function: it expects (req,res) so call with fake objects and capture result via promise
  const fakeRes: any = {
    status(code: number) { this._status = code; return this; },
    json(payload: any) { this._payload = payload; return this; }
  };

  // Run in a transaction to ensure order marked fulfilled only if sale created
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Create sale: call createSale but it starts its own session; instead, replicate minimal sale creation here to ensure same transaction
    // For simplicity, call createSale which manages its own transaction; after success, update order
    await createSale(fakeReq as any, fakeRes as any);
    if (!fakeRes._payload || !fakeRes._payload.success) {
      throw new Error('Failed to create sale from order');
    }
    so.status = 'Fulfilled';
    await so.save();
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, data: { order: so, sale: fakeRes._payload.data } });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});
