import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PurchaseInvoice } from '../models/PurchaseInvoice';
import { GRN } from '../models/GRN';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

const toNumber = (v: any, def = 0) => {
  if (v === undefined || v === null || v === '') return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export const listPurchases = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', q, from, to, sort = 'invoiceDate', order = 'desc' } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (q) filter.$or = [ { invoiceNo: { $regex: q, $options: 'i' } }, { vendor: { $regex: q, $options: 'i' } } ];
  if (from || to) {
    filter.invoiceDate = {};
    if (from) filter.invoiceDate.$gte = new Date(from);
    if (to) filter.invoiceDate.$lte = new Date(to);
  }

  const total = await PurchaseInvoice.countDocuments(filter);
  const rows = await PurchaseInvoice.find(filter)
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json({ success: true, data: { rows, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const { invoiceNo, vendor, invoiceDate, notes, lines } = req.body as any;
  const userId = (req as any).user?.id;

  if (!invoiceDate) return res.status(400).json({ success: false, message: 'invoiceDate is required' });

  // invoiceNo auto-generation if empty
  const genInvoiceNo = () => {
    const d = new Date();
    const prefix = `INV-${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}`;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${suffix}`;
  };

  const finalInvoiceNo = (invoiceNo && invoiceNo.trim()) ? invoiceNo.trim() : genInvoiceNo();
  const existing = await PurchaseInvoice.findOne({ invoiceNo: finalInvoiceNo });
  if (existing) return res.status(409).json({ success: false, message: 'invoiceNo already exists' });

  // If no lines provided, create header-only
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    const pi = await PurchaseInvoice.create({ invoiceNo: finalInvoiceNo, vendor: vendor?.trim(), invoiceDate: new Date(invoiceDate), totalAmount: 0, notes, status: 'draft', createdBy: userId });
    return res.status(201).json({ success: true, data: pi });
  }

  // Otherwise, perform transactional create: create GRN, update stock, then purchase invoice
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // validate and prepare grn lines
    const grnLines: any[] = [];
    let invoiceTotal = 0;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i] || {};
      const productId = raw.productId || raw.product || raw.productId;
      if (!productId) throw new Error(`Line ${i+1}: productId required`);
      const batchNo = (raw.batchNo || '').toString();
      const qty = toNumber(raw.qty, 0);
      const freeQty = toNumber(raw.freeQty, 0);
      const purchasePrice = toNumber(raw.purchasePrice);
      if (!batchNo) throw new Error(`Line ${i+1}: batchNo required`);
      if (!(qty > 0)) throw new Error(`Line ${i+1}: qty must be > 0`);
      if (!(purchasePrice >= 0)) throw new Error(`Line ${i+1}: purchasePrice required`);

      const item = await Item.findById(productId).session(session);
      if (!item) throw new Error(`Product ${productId} not found`);

      grnLines.push({ productId: item._id, productName: item.name, batchNo, expiryDate: raw.expiryDate ? new Date(raw.expiryDate) : undefined, qty, freeQty, purchasePrice, mrp: raw.mrp, salePrice: raw.salePrice });

      invoiceTotal += (qty * purchasePrice);

      // update item batches
      const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
      const totalQty = qty + freeQty;
      if (batchIdx !== -1) {
        item.batches[batchIdx].onHand += totalQty;
        if (raw.purchasePrice !== undefined) item.batches[batchIdx].purchasePrice = purchasePrice;
        if (raw.mrp !== undefined) item.batches[batchIdx].mrp = raw.mrp;
        if (raw.salePrice !== undefined) item.batches[batchIdx].salePrice = raw.salePrice;
        if (raw.expiryDate) item.batches[batchIdx].expiryDate = new Date(raw.expiryDate);
      } else {
        item.batches.push({ batchNo, expiryDate: raw.expiryDate ? new Date(raw.expiryDate) : undefined, onHand: totalQty, mrp: raw.mrp, purchasePrice, salePrice: raw.salePrice });
      }

      item.onHand = (item.onHand || 0) + totalQty;
      await item.save({ session });
    }

    const grn = await GRN.create([{
      invoiceNo: finalInvoiceNo,
      invoiceDate: new Date(invoiceDate),
      vendor: vendor?.trim(),
      lines: grnLines,
      createdBy: userId,
    }], { session });

    const grnDoc = grn[0];

    const purchase = await PurchaseInvoice.create([{
      invoiceNo: finalInvoiceNo,
      vendor: vendor?.trim(),
      invoiceDate: new Date(invoiceDate),
      totalAmount: Number(invoiceTotal.toFixed(2)),
      status: 'posted',
      grnId: grnDoc._id,
      notes,
      createdBy: userId,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: purchase[0] });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const getPurchase = asyncHandler(async (req: Request, res: Response) => {
  const p = await PurchaseInvoice.findById(req.params.id).lean();
  if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
  // optionally fetch GRN lines
  if (p.grnId) {
    const grn = await GRN.findById(p.grnId).lean();
    return res.json({ success: true, data: { ...p, grn } });
  }
  res.json({ success: true, data: p });
});

export const updatePurchase = asyncHandler(async (req: Request, res: Response) => {
  const { vendor, notes } = req.body as any;
  const p = await PurchaseInvoice.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
  // only allow editing header fields when draft or admin
  if (p.status === 'posted') return res.status(400).json({ success: false, message: 'Cannot edit a posted purchase' });
  if (vendor !== undefined) p.vendor = vendor?.trim();
  if (notes !== undefined) p.notes = notes;
  await p.save();
  res.json({ success: true, data: p });
});

export const deletePurchase = asyncHandler(async (req: Request, res: Response) => {
  const p = await PurchaseInvoice.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Purchase not found' });
  if (p.status === 'posted') return res.status(400).json({ success: false, message: 'Cannot delete a posted purchase. Reverse GRN first.' });
  await p.remove();
  res.json({ success: true });
});
