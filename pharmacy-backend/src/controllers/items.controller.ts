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

export const addBatch = asyncHandler(async (req: Request, res: Response) => {
  const { batchNo, expiryDate, onHand, mrp, purchasePrice, salePrice } = req.body as any;

  if (!batchNo) return res.status(400).json({ success: false, message: 'batchNo is required' });
  if (typeof onHand !== 'number' || onHand < 0) return res.status(400).json({ success: false, message: 'onHand (positive number) is required' });

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  const existingBatchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
  if (existingBatchIdx !== -1) {
    return res.status(400).json({ success: false, message: 'Batch number already exists for this item' });
  }

  item.batches.push({
    batchNo,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    onHand,
    mrp: mrp || item.mrp,
    purchasePrice: purchasePrice || item.purchasePrice,
    salePrice: salePrice || item.salePrice,
  });

  item.onHand = (item.onHand || 0) + onHand;
  await item.save();

  res.status(201).json({ success: true, data: item });
});

export const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const { batchNo, expiryDate, onHand, mrp, purchasePrice, salePrice } = req.body as any;

  if (!batchNo) return res.status(400).json({ success: false, message: 'batchNo is required' });

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
  if (batchIdx === -1) return res.status(404).json({ success: false, message: 'Batch not found' });

  const oldQuantity = item.batches[batchIdx].onHand || 0;
  const quantityDelta = (onHand || 0) - oldQuantity;

  item.batches[batchIdx] = {
    ...item.batches[batchIdx],
    batchNo,
    expiryDate: expiryDate ? new Date(expiryDate) : item.batches[batchIdx].expiryDate,
    onHand: onHand !== undefined ? onHand : oldQuantity,
    mrp: mrp !== undefined ? mrp : item.batches[batchIdx].mrp,
    purchasePrice: purchasePrice !== undefined ? purchasePrice : item.batches[batchIdx].purchasePrice,
    salePrice: salePrice !== undefined ? salePrice : item.batches[batchIdx].salePrice,
  };

  item.onHand = (item.onHand || 0) + quantityDelta;
  if (item.onHand < 0) item.onHand = 0;

  await item.save();
  res.json({ success: true, data: item });
});

export const deleteBatch = asyncHandler(async (req: Request, res: Response) => {
  const { batchNo } = req.body as { batchNo?: string };

  if (!batchNo) return res.status(400).json({ success: false, message: 'batchNo is required' });

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
  if (batchIdx === -1) return res.status(404).json({ success: false, message: 'Batch not found' });

  const batchQuantity = item.batches[batchIdx].onHand || 0;
  item.batches.splice(batchIdx, 1);
  item.onHand = Math.max(0, (item.onHand || 0) - batchQuantity);

  await item.save();
  res.json({ success: true, data: item });
});

export const getBatches = asyncHandler(async (req: Request, res: Response) => {
  const { q, expiry = 'all', withinDays = '90', page = '1', limit = '50', sort = '-createdAt' } = req.query as any;

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
  const skip = (pageNum - 1) * limitNum;
  const withinDaysNum = Math.max(1, parseInt(String(withinDays), 10) || 90);

  const now = new Date();
  const futureDate = new Date(now.getTime() + withinDaysNum * 24 * 60 * 60 * 1000);

  const pipeline: any[] = [
    { $unwind: '$batches' },
    {
      $project: {
        _id: 1,
        name: 1,
        sku: 1,
        manufacturer: 1,
        onHand: 1,
        batch: '$batches',
        batchNo: '$batches.batchNo',
        expiryDate: '$batches.expiryDate',
        batchOnHand: '$batches.onHand',
        mrp: '$batches.mrp',
        purchasePrice: '$batches.purchasePrice',
        salePrice: '$batches.salePrice',
      },
    },
  ];

  if (q) {
    const query = String(q).toLowerCase();
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { manufacturer: { $regex: query, $options: 'i' } },
          { batchNo: { $regex: query, $options: 'i' } },
        ],
      },
    });
  }

  if (expiry !== 'all') {
    if (expiry === 'valid') {
      pipeline.push({
        $match: {
          expiryDate: { $gt: futureDate },
        },
      });
    } else if (expiry === 'expiringSoon') {
      pipeline.push({
        $match: {
          expiryDate: { $gte: now, $lte: futureDate },
        },
      });
    } else if (expiry === 'expired') {
      pipeline.push({
        $match: {
          expiryDate: { $lt: now },
        },
      });
    }
  }

  const countPipeline = [...pipeline];
  const totalResult = await Item.aggregate([
    ...countPipeline,
    { $count: 'total' },
  ]);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limitNum });

  const rows = await Item.aggregate(pipeline);

  res.json({
    success: true,
    data: {
      rows: rows.map(r => ({
        _id: `${r._id}-${r.batchNo}`,
        itemId: r._id,
        itemName: r.name,
        sku: r.sku,
        manufacturer: r.manufacturer,
        batchNo: r.batchNo,
        expiryDate: r.expiryDate,
        onHand: r.batchOnHand,
        mrp: r.mrp,
        purchasePrice: r.purchasePrice,
        salePrice: r.salePrice,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getBatch = asyncHandler(async (req: Request, res: Response) => {
  const { batchId } = req.params;

  if (!batchId || !batchId.includes('-')) {
    return res.status(400).json({ success: false, message: 'Invalid batchId format' });
  }

  const [itemId, batchNo] = batchId.split('-');

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const batch = item.batches.find(b => b.batchNo === batchNo);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  res.json({
    success: true,
    data: {
      _id: batchId,
      itemId: item._id,
      itemName: item.name,
      sku: item.sku,
      manufacturer: item.manufacturer,
      batchNo: batch.batchNo,
      expiryDate: batch.expiryDate,
      onHand: batch.onHand,
      mrp: batch.mrp,
      purchasePrice: batch.purchasePrice,
      salePrice: batch.salePrice,
    },
  });
});

export const updateBatchPrice = asyncHandler(async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const { mrp, purchasePrice, salePrice, expiryDate } = req.body as any;

  if (!batchId || !batchId.includes('-')) {
    return res.status(400).json({ success: false, message: 'Invalid batchId format' });
  }

  const [itemId, batchNo] = batchId.split('-');

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
  if (batchIdx === -1) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  if (mrp !== undefined) item.batches[batchIdx].mrp = mrp;
  if (purchasePrice !== undefined) item.batches[batchIdx].purchasePrice = purchasePrice;
  if (salePrice !== undefined) item.batches[batchIdx].salePrice = salePrice;
  if (expiryDate !== undefined) item.batches[batchIdx].expiryDate = new Date(expiryDate);

  await item.save();

  res.json({
    success: true,
    data: {
      _id: batchId,
      itemId: item._id,
      itemName: item.name,
      batchNo: item.batches[batchIdx].batchNo,
      expiryDate: item.batches[batchIdx].expiryDate,
      onHand: item.batches[batchIdx].onHand,
      mrp: item.batches[batchIdx].mrp,
      purchasePrice: item.batches[batchIdx].purchasePrice,
      salePrice: item.batches[batchIdx].salePrice,
    },
  });
});

export const deleteBatchStrict = asyncHandler(async (req: Request, res: Response) => {
  const { batchId } = req.params;

  if (!batchId || !batchId.includes('-')) {
    return res.status(400).json({ success: false, message: 'Invalid batchId format' });
  }

  const [itemId, batchNo] = batchId.split('-');

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const batchIdx = item.batches.findIndex(b => b.batchNo === batchNo);
  if (batchIdx === -1) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  if ((item.batches[batchIdx].onHand || 0) > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete batch with remaining stock' });
  }

  const batchQuantity = item.batches[batchIdx].onHand || 0;
  item.batches.splice(batchIdx, 1);
  item.onHand = Math.max(0, (item.onHand || 0) - batchQuantity);

  await item.save();

  res.json({ success: true, data: { id: batchId } });
});

export const getAllBatches = asyncHandler(async (req: Request, res: Response) => {
  const items = await Item.find({ 'batches.0': { $exists: true } });

  const allBatches = [];
  for (const item of items) {
    for (const batch of item.batches) {
      allBatches.push({
        _id: `${item._id}-${batch.batchNo}`,
        itemId: item._id,
        itemName: item.name,
        ...batch.toObject?.() || batch,
      });
    }
  }

  const { expiringSoon, expired, q, page = '1', limit = '50' } = req.query as any;
  let filtered = allBatches;

  if (q) {
    const query = String(q).toLowerCase();
    filtered = filtered.filter(b =>
      b.itemName.toLowerCase().includes(query) ||
      b.batchNo.toLowerCase().includes(query)
    );
  }

  if (expiringSoon === '1' || expiringSoon === 'true') {
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(b => {
      if (!b.expiryDate) return false;
      const expiry = new Date(b.expiryDate);
      return expiry <= threeMonthsFromNow && expiry > now;
    });
  }

  if (expired === '1' || expired === 'true') {
    const now = new Date();
    filtered = filtered.filter(b => {
      if (!b.expiryDate) return false;
      const expiry = new Date(b.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return expiry < now;
    });
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const paginated = filtered.slice(skip, skip + limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      pages: Math.ceil(filtered.length / limitNum),
    },
  });
});
