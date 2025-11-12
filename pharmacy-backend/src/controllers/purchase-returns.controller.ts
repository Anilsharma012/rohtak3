import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PurchaseReturn } from '../models/PurchaseReturn';
import { PurchaseInvoice } from '../models/PurchaseInvoice';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

const toNumber = (v: any, def = 0) => {
  if (v === undefined || v === null || v === '') return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export const createPurchaseReturn = asyncHandler(async (req: Request, res: Response) => {
  const { returnNo, refInvoiceId, refInvoiceNo, supplier, returnDate, lines, reason } = req.body as any;
  const userId = (req as any).user?.id;
  if (!returnDate) return res.status(400).json({ success: false, message: 'returnDate is required' });
  if (!lines || !Array.isArray(lines) || lines.length === 0) return res.status(400).json({ success: false, message: 'At least one line is required' });

  const genReturnNo = () => {
    const d = new Date();
    const prefix = `PR-${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`;
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${suffix}`;
  };

  const finalReturnNo = (returnNo && returnNo.trim()) ? returnNo.trim() : genReturnNo();
  const existing = await PurchaseReturn.findOne({ returnNo: finalReturnNo });
  if (existing) return res.status(409).json({ success: false, message: 'returnNo already exists' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalAmount = 0;
    const preparedLines: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i] || {};
      const productId = raw.productId || raw.product;
      if (!productId) throw new Error(`Line ${i+1}: productId required`);
      const batchNo = (raw.batchNo || '').toString();
      const qty = toNumber(raw.qty, 0);
      const purchasePrice = toNumber(raw.purchasePrice, 0);
      if (!batchNo) throw new Error(`Line ${i+1}: batchNo required`);
      if (!(qty > 0)) throw new Error(`Line ${i+1}: qty must be > 0`);

      const item = await Item.findById(productId).session(session);
      if (!item) throw new Error(`Product ${productId} not found`);

      const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
      if (batchIdx === -1) throw new Error(`Batch ${batchNo} not found for product ${productId}`);
      if ((item.batches[batchIdx].onHand || 0) < qty) throw new Error(`Insufficient stock in batch ${batchNo} for product ${productId}`);

      // deduct
      item.batches[batchIdx].onHand -= qty;
      item.onHand = Math.max(0, (item.onHand || 0) - qty);
      await item.save({ session });

      totalAmount += qty * purchasePrice;
      preparedLines.push({ productId: item._id, productName: item.name, batchNo, qty, purchasePrice, reason: raw.reason });
    }

    const pr = await PurchaseReturn.create([{
      returnNo: finalReturnNo,
      refInvoiceId,
      refInvoiceNo,
      supplier,
      returnDate: new Date(returnDate),
      totalAmount: Number(totalAmount.toFixed(2)),
      reason,
      lines: preparedLines,
      createdBy: userId,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: pr[0] });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const listPurchaseReturns = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', q, from, to } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const filter: any = {};
  if (q) filter.$or = [ { returnNo: { $regex: q, $options: 'i' } }, { supplier: { $regex: q, $options: 'i' } } ];
  if (from || to) {
    filter.returnDate = {};
    if (from) filter.returnDate.$gte = new Date(from);
    if (to) filter.returnDate.$lte = new Date(to);
  }

  const total = await PurchaseReturn.countDocuments(filter);
  const rows = await PurchaseReturn.find(filter).sort({ returnDate: -1 }).skip(skip).limit(limitNum).lean();
  res.json({ success: true, data: { rows, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const getPurchaseReturn = asyncHandler(async (req: Request, res: Response) => {
  const pr = await PurchaseReturn.findById(req.params.id).lean();
  if (!pr) return res.status(404).json({ success: false, message: 'Purchase return not found' });
  res.json({ success: true, data: pr });
});

export const deletePurchaseReturn = asyncHandler(async (req: Request, res: Response) => {
  const pr = await PurchaseReturn.findById(req.params.id);
  if (!pr) return res.status(404).json({ success: false, message: 'Purchase return not found' });
  // Only allow delete if we consider it unposted (no reversion of stock required) - current model always posts immediately
  // For safety, do not allow delete to avoid inconsistency
  return res.status(400).json({ success: false, message: 'Deleting returns is not supported. Implement reversal endpoint if needed.' });
});
