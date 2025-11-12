import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SalesReturn } from '../models/SalesReturn';
import { Sale } from '../models/Sale';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

const toNumber = (v: any, def = 0) => {
  if (v === undefined || v === null || v === '') return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const genReturnNo = async (): Promise<string> => {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`;
  const count = await SalesReturn.countDocuments({ returnDate: { $gte: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), $lte: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) + 24*60*60*1000 -1) } });
  const seq = String(count + 1).padStart(3, '0');
  return `RTN-${ymd}-${seq}`;
};

export const createSalesReturn = asyncHandler(async (req: Request, res: Response) => {
  const { refBillId, refBillNo, returnDate, lines, reason } = req.body as any;
  const userId = (req as any).user?.id;
  if (!returnDate) return res.status(400).json({ success: false, message: 'returnDate is required' });
  if (!lines || !Array.isArray(lines) || lines.length === 0) return res.status(400).json({ success: false, message: 'At least one line is required' });

  const sale = refBillId ? await Sale.findById(refBillId).lean() : refBillNo ? await Sale.findOne({ billNo: refBillNo }).lean() : null;
  if (!sale) return res.status(400).json({ success: false, message: 'Referenced sale not found' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ensure not returning more than sold
    const saleMap = new Map<string, any>();
    for (const l of sale.items) {
      const key = `${l.productId}::${l.batchNo}`;
      saleMap.set(key, (saleMap.get(key) || 0) + (l.qty || 0));
    }

    const prepared: any[] = [];
    let totalAmount = 0;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i] || {};
      const productId = raw.productId || raw.product;
      const batchNo = (raw.batchNo || '').toString();
      const qty = toNumber(raw.qty, 0);
      const salePrice = toNumber(raw.salePrice, 0);
      if (!productId) throw new Error(`Line ${i+1}: productId required`);
      if (!batchNo) throw new Error(`Line ${i+1}: batchNo required`);
      if (!(qty > 0)) throw new Error(`Line ${i+1}: qty must be > 0`);

      const key = `${productId}::${batchNo}`;
      const soldQty = saleMap.get(key) || 0;
      if (soldQty < qty) throw new Error(`Return qty ${qty} exceeds sold qty ${soldQty} for product ${productId} batch ${batchNo}`);

      // increase stock
      const item = await Item.findById(productId).session(session);
      if (!item) throw new Error(`Product ${productId} not found`);
      const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
      if (batchIdx === -1) {
        item.batches.push({ batchNo, expiryDate: undefined, onHand: qty, mrp: undefined, purchasePrice: undefined, salePrice });
      } else {
        item.batches[batchIdx].onHand = (item.batches[batchIdx].onHand || 0) + qty;
      }
      item.onHand = (item.onHand || 0) + qty;
      await item.save({ session });

      // audit log
      const AuditLogModel = require('../models/AuditLog').AuditLog;
      const ControlledLogModel = require('../models/compliance.models').ControlledLog;
      await AuditLogModel.create([{ actor: userId, action: 'return', productId: item._id, batchNo, delta: +qty, source: 'sales-return' }], { session });
      try {
        if ((item as any).isControlled) {
          await ControlledLogModel.create([{ productId: item._id, batchNo, type: 'IN', qty, actor: userId, reason: 'sales return' }], { session });
        }
      } catch (e) {}

      prepared.push({ productId: item._id, productName: item.name, batchNo, qty, salePrice, amount: Number((qty * salePrice).toFixed(2)) });
      totalAmount += qty * salePrice;

      // decrement saleMap so multiple returns validated
      saleMap.set(key, soldQty - qty);
    }

    const returnNo = await genReturnNo();
    const pr = await SalesReturn.create([{ returnNo, returnDate: new Date(returnDate), refBillId: refBillId || sale._id, refBillNo: refBillNo || sale.billNo, customer: sale.customer, totalAmount: Number(totalAmount.toFixed(2)), reason, lines: prepared, createdBy: userId }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: pr[0] });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const listSalesReturns = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', q, from, to } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const filter: any = {};
  if (q) filter.$or = [ { returnNo: { $regex: q, $options: 'i' } }, { customer: { $regex: q, $options: 'i' } } ];
  if (from || to) {
    filter.returnDate = {};
    if (from) filter.returnDate.$gte = new Date(from);
    if (to) filter.returnDate.$lte = new Date(to);
  }
  const total = await SalesReturn.countDocuments(filter);
  const rows = await SalesReturn.find(filter).sort({ returnDate: -1 }).skip(skip).limit(limitNum).lean();
  res.json({ success: true, data: { rows, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const getSalesReturn = asyncHandler(async (req: Request, res: Response) => {
  const pr = await SalesReturn.findById(req.params.id).lean();
  if (!pr) return res.status(404).json({ success: false, message: 'Return not found' });
  res.json({ success: true, data: pr });
});
