import { Request, Response } from 'express';
import { StockMovement } from '../models/StockMovement';
import { Item } from '../models/Item';
import { asyncHandler } from '../utils/asyncHandler';

export const createMovement = asyncHandler(async (req: Request, res: Response) => {
  const { type, productId, batchNo, delta, qty, reason, fromBatchId, toBatchId, toBatch, notes } = req.body as any;
  const userId = (req as any).user?.id;

  if (!type || !['adjust', 'transfer'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type must be "adjust" or "transfer"' });
  }
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'reason is required' });
  }

  const product = await Item.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (type === 'adjust') {
    if (!batchNo) {
      return res.status(400).json({ success: false, message: 'batchNo is required for adjust' });
    }
    if (typeof delta !== 'number') {
      return res.status(400).json({ success: false, message: 'delta (number) is required for adjust' });
    }

    const batchIdx = product.batches.findIndex(b => b.batchNo === batchNo);
    if (batchIdx === -1) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const batch = product.batches[batchIdx];
    const newBatchQty = (batch.onHand || 0) + delta;

    if (newBatchQty < 0) {
      return res.status(400).json({ success: false, message: 'Insufficient stock in batch' });
    }

    batch.onHand = newBatchQty;
    product.onHand = Math.max(0, (product.onHand || 0) + delta);

    await product.save();

    const movement = await StockMovement.create({
      type: 'adjust',
      productId: product._id.toString(),
      productName: product.name,
      batchNo,
      qty: Math.abs(delta),
      reason: reason.trim(),
      userId,
      notes: notes?.trim(),
    });

    res.status(201).json({ success: true, data: movement });
  } else if (type === 'transfer') {
    if (!fromBatchId) {
      return res.status(400).json({ success: false, message: 'fromBatchId is required for transfer' });
    }
    if (typeof qty !== 'number' || qty <= 0) {
      return res.status(400).json({ success: false, message: 'qty must be > 0 for transfer' });
    }

    const fromBatchIdx = product.batches.findIndex(b => b._id?.toString() === fromBatchId || b.batchNo === fromBatchId);
    if (fromBatchIdx === -1) {
      return res.status(404).json({ success: false, message: 'From batch not found' });
    }

    const fromBatch = product.batches[fromBatchIdx];
    if ((fromBatch.onHand || 0) < qty) {
      return res.status(400).json({ success: false, message: 'Insufficient stock in from batch' });
    }

    let toBatchIdx = -1;
    if (toBatchId) {
      toBatchIdx = product.batches.findIndex(b => b._id?.toString() === toBatchId || b.batchNo === toBatchId);
      if (toBatchIdx === -1) {
        return res.status(404).json({ success: false, message: 'To batch not found' });
      }
    } else if (toBatch && toBatch.batchNo) {
      toBatchIdx = product.batches.findIndex(b => b.batchNo === toBatch.batchNo);
      if (toBatchIdx === -1) {
        product.batches.push({
          batchNo: toBatch.batchNo,
          expiryDate: toBatch.expiryDate ? new Date(toBatch.expiryDate) : undefined,
          onHand: 0,
          mrp: toBatch.mrp,
          purchasePrice: toBatch.purchasePrice,
          salePrice: toBatch.salePrice,
        });
        toBatchIdx = product.batches.length - 1;
      }
    } else {
      return res.status(400).json({ success: false, message: 'toBatchId or toBatch is required for transfer' });
    }

    fromBatch.onHand = (fromBatch.onHand || 0) - qty;
    product.batches[toBatchIdx].onHand = ((product.batches[toBatchIdx].onHand || 0) + qty);

    await product.save();

    const movement = await StockMovement.create({
      type: 'transfer',
      productId: product._id.toString(),
      productName: product.name,
      batchNo: fromBatch.batchNo,
      fromBatchId: fromBatch.batchNo,
      toBatchId: product.batches[toBatchIdx].batchNo,
      qty,
      reason: reason.trim(),
      userId,
      notes: notes?.trim(),
    });

    res.status(201).json({ success: true, data: movement });
  }
});

export const getMovements = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '50', type, productId, startDate, endDate } = req.query as any;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  let filter: any = {};
  if (type && ['adjust', 'transfer'].includes(type)) {
    filter.type = type;
  }
  if (productId) {
    filter.productId = productId;
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const total = await StockMovement.countDocuments(filter);
  const movements = await StockMovement.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json({
    success: true,
    data: {
      rows: movements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});
