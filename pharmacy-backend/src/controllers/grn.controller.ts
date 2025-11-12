import { Request, Response } from 'express';
import { GRN } from '../models/GRN';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

export const createGRN = asyncHandler(async (req: Request, res: Response) => {
  const { invoiceNo, invoiceDate, vendor, lines } = req.body as any;
  const userId = (req as any).user?.id;

  if (!invoiceNo || !invoiceNo.trim()) {
    return res.status(400).json({ success: false, message: 'invoiceNo is required' });
  }
  if (!invoiceDate) {
    return res.status(400).json({ success: false, message: 'invoiceDate is required' });
  }
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one line is required' });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.productId) {
      return res.status(400).json({ success: false, message: `Line ${i + 1}: productId is required` });
    }
    if (!line.batchNo) {
      return res.status(400).json({ success: false, message: `Line ${i + 1}: batchNo is required` });
    }
    if (typeof line.qty !== 'number' || line.qty <= 0) {
      return res.status(400).json({ success: false, message: `Line ${i + 1}: qty must be > 0` });
    }
    if (typeof line.purchasePrice !== 'number' || line.purchasePrice < 0) {
      return res.status(400).json({ success: false, message: `Line ${i + 1}: purchasePrice is required and >= 0` });
    }
  }

  const checkInvoice = await GRN.findOne({ invoiceNo });
  if (checkInvoice) {
    return res.status(409).json({ success: false, message: 'invoiceNo already exists' });
  }

  const linesSaved = [];
  for (const line of lines) {
    const item = await Item.findById(line.productId);
    if (!item) {
      return res.status(404).json({ success: false, message: `Product ${line.productId} not found` });
    }

    const batchIdx = item.batches.findIndex(b => b.batchNo === line.batchNo);
    const totalQty = (line.qty || 0) + (line.freeQty || 0);

    if (batchIdx !== -1) {
      item.batches[batchIdx].onHand += totalQty;
      if (line.purchasePrice) item.batches[batchIdx].purchasePrice = line.purchasePrice;
      if (line.mrp) item.batches[batchIdx].mrp = line.mrp;
      if (line.salePrice) item.batches[batchIdx].salePrice = line.salePrice;
    } else {
      item.batches.push({
        batchNo: line.batchNo,
        expiryDate: line.expiryDate ? new Date(line.expiryDate) : undefined,
        onHand: totalQty,
        mrp: line.mrp,
        purchasePrice: line.purchasePrice,
        salePrice: line.salePrice,
      });
    }

    item.onHand = (item.onHand || 0) + totalQty;
    await item.save();

    linesSaved.push({
      productId: item._id,
      productName: item.name,
      batchNo: line.batchNo,
      expiryDate: line.expiryDate,
      qty: line.qty,
      freeQty: line.freeQty || 0,
      purchasePrice: line.purchasePrice,
      mrp: line.mrp,
      salePrice: line.salePrice,
    });
  }

  const grn = await GRN.create({
    invoiceNo: invoiceNo.trim(),
    invoiceDate: new Date(invoiceDate),
    vendor: vendor?.trim() || undefined,
    lines: linesSaved,
    createdBy: userId,
  });

  res.status(201).json({ success: true, data: grn });
});

export const getGRNs = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', vendor, startDate, endDate } = req.query as any;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  let filter: any = {};
  if (vendor) {
    filter.vendor = { $regex: vendor, $options: 'i' };
  }
  if (startDate || endDate) {
    filter.invoiceDate = {};
    if (startDate) filter.invoiceDate.$gte = new Date(startDate);
    if (endDate) filter.invoiceDate.$lte = new Date(endDate);
  }

  const total = await GRN.countDocuments(filter);
  const grns = await GRN.find(filter)
    .sort({ invoiceDate: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json({
    success: true,
    data: {
      rows: grns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getGRN = asyncHandler(async (req: Request, res: Response) => {
  const grn = await GRN.findById(req.params.id);
  if (!grn) {
    return res.status(404).json({ success: false, message: 'GRN not found' });
  }
  res.json({ success: true, data: grn });
});
