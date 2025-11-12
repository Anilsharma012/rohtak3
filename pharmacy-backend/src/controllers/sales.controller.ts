import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Sale } from '../models/Sale';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

const toNumber = (v: any, def = 0) => {
  if (v === undefined || v === null || v === '') return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const genBillNo = async (): Promise<string> => {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`;
  // count today's bills to generate sequence
  const todayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const todayEnd = new Date(todayStart.getTime() + 24*60*60*1000 - 1);
  const count = await Sale.countDocuments({ billDate: { $gte: todayStart, $lte: todayEnd } });
  const seq = String(count + 1).padStart(3, '0');
  return `B-${ymd}-${seq}`;
};

export const listSales = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', q, from, to, sort = 'billDate', order = 'desc' } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (q) filter.$or = [ { billNo: { $regex: q, $options: 'i' } }, { customer: { $regex: q, $options: 'i' } } ];
  if (from || to) {
    filter.billDate = {};
    if (from) filter.billDate.$gte = new Date(from);
    if (to) filter.billDate.$lte = new Date(to);
  }

  const total = await Sale.countDocuments(filter);
  const rows = await Sale.find(filter).sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(limitNum).lean();
  res.json({ success: true, data: { rows, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const { customer, customerId, items, discount = 0, paymentMode, notes } = req.body as any;
  const userId = (req as any).user?.id;

  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'At least one item is required' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // validate and prepare lines
    const lines: any[] = [];
    let subtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const raw = items[i] || {};
      const productId = raw.productId || raw.product;
      const batchNo = (raw.batchNo || '').toString();
      const qty = toNumber(raw.qty, 0);
      const salePrice = toNumber(raw.salePrice, 0);
      if (!productId) throw new Error(`Line ${i+1}: productId required`);
      if (!batchNo) throw new Error(`Line ${i+1}: batchNo required`);
      if (!(qty > 0)) throw new Error(`Line ${i+1}: qty must be > 0`);
      if (!(salePrice >= 0)) throw new Error(`Line ${i+1}: salePrice required`);

      const item = await Item.findById(productId).session(session);
      if (!item) throw new Error(`Product ${productId} not found`);

      const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
      if (batchIdx === -1) throw new Error(`Batch ${batchNo} not found for product ${productId}`);

      const available = item.batches[batchIdx].onHand || 0;
      if (available < qty) throw new Error(`Insufficient stock in batch ${batchNo} for product ${productId}`);

      // decrement
      item.batches[batchIdx].onHand = available - qty;
      item.onHand = Math.max(0, (item.onHand || 0) - qty);
      await item.save({ session });

      // audit log
      try {
        const { AuditLog, ControlledLog, RecallNotice } = require('../models/compliance.models');
        const { AuditLog: ALModel } = require('../models/AuditLog');
      } catch (e) {
        // ignore require issues
      }
      const AuditLogModel = require('../models/AuditLog').AuditLog;
      const ControlledLogModel = require('../models/compliance.models').ControlledLog;
      // create audit and controlled logs
      await AuditLogModel.create([{ actor: userId, action: 'sale', productId: item._id, batchNo, delta: -qty, source: 'sale' }], { session });
      // if product is controlled, add ControlledLog
      try {
        if ((item as any).isControlled) {
          await ControlledLogModel.create([{ productId: item._id, batchNo, type: 'OUT', qty, actor: userId }], { session });
        }
      } catch (e) {
        // ignore
      }

      const amount = Number((qty * salePrice).toFixed(2));
      subtotal += amount;

      lines.push({ productId: item._id, productName: item.name, batchNo, expiryDate: item.batches[batchIdx].expiryDate, qty, salePrice, mrp: item.batches[batchIdx].mrp, amount });
    }

    const tax = 0; // tax calc placeholder
    const grandTotal = Number((subtotal - Number(discount || 0) + tax).toFixed(2));

    const billNo = await genBillNo();
    const sale = await Sale.create([{ billNo, billDate: new Date(), customer, customerId, items: lines, subtotal: Number(subtotal.toFixed(2)), discount: Number(discount || 0), tax, roundOff: 0, grandTotal, paymentMode, notes, cashierId: userId }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: sale[0] });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const getSale = asyncHandler(async (req: Request, res: Response) => {
  const s = await Sale.findById(req.params.id).lean();
  if (!s) return res.status(404).json({ success: false, message: 'Sale not found' });
  res.json({ success: true, data: s });
});

export const deleteSale = asyncHandler(async (req: Request, res: Response) => {
  const s = await Sale.findById(req.params.id);
  if (!s) return res.status(404).json({ success: false, message: 'Sale not found' });
  // For safety, revert stock when deleting
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const line of s.items) {
      const item = await Item.findById(line.productId).session(session);
      if (!item) continue;
      const idx = item.batches.findIndex(b => b.batchNo === line.batchNo);
      if (idx === -1) {
        // recreate batch
        item.batches.push({ batchNo: line.batchNo, expiryDate: line.expiryDate, onHand: line.qty, mrp: line.mrp, purchasePrice: undefined, salePrice: line.salePrice });
      } else {
        item.batches[idx].onHand = (item.batches[idx].onHand || 0) + line.qty;
      }
      item.onHand = (item.onHand || 0) + line.qty;
      await item.save({ session });
    }

    await s.remove({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ success: true });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const printSale = asyncHandler(async (req: Request, res: Response) => {
  const s = await Sale.findById(req.params.id).lean();
  if (!s) return res.status(404).json({ success: false, message: 'Sale not found' });
  // return printable JSON for now
  res.json({ success: true, data: s });
});

export const shareSale = asyncHandler(async (req: Request, res: Response) => {
  const s = await Sale.findById(req.params.id).lean();
  if (!s) return res.status(404).json({ success: false, message: 'Sale not found' });
  let text = `Bill: ${s.billNo}\nDate: ${new Date(s.billDate).toLocaleString()}\n`;
  text += `Items:\n`;
  for (const it of s.items) {
    text += `${it.productName} x${it.qty} = ₹${it.amount.toFixed(2)}\n`;
  }
  text += `Total: ₹${s.grandTotal.toFixed(2)}`;
  res.json({ success: true, data: { text } });
});
