import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { Sale } from '../models/Sale';
import { GRN } from '../models/GRN';
import { asyncHandler } from '../utils/asyncHandler';
import { Readable } from 'stream';

const sendCSV = (res: Response, filename: string, rows: any[], headers?: string[]) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const cols = headers || (rows.length > 0 ? Object.keys(rows[0]) : []);
  const lines = [cols.join(',')];
  for (const r of rows) {
    const row = cols.map(c => {
      const v = r[c] ?? '';
      if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
      return String(v ?? '');
    }).join(',');
    lines.push(row);
  }
  res.send(lines.join('\n'));
};

export const stockValuation = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '200', export: ex } = req.query as any;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(1000, Math.max(1, parseInt(limit, 10) || 200));
  const skip = (pageNum - 1) * limitNum;

  // unwind batches
  const pipeline: any[] = [
    { $unwind: '$batches' },
    { $project: { name: 1, sku: 1, batchNo: '$batches.batchNo', onHand: '$batches.onHand', purchasePrice: '$batches.purchasePrice', mrp: '$batches.mrp' } },
  ];

  const totalAgg = await Item.aggregate([...pipeline, { $count: 'total' }]);
  const total = totalAgg.length > 0 ? totalAgg[0].total : 0;

  pipeline.push({ $skip: skip }, { $limit: limitNum });
  const rows = await Item.aggregate(pipeline);

  const data = rows.map((r: any) => ({ product: r.name, sku: r.sku, batchNo: r.batchNo, onHand: r.onHand || 0, purchasePrice: r.purchasePrice || 0, mrp: r.mrp || 0, valueByPurchase: Number(((r.onHand || 0) * (r.purchasePrice || 0)).toFixed(2)), valueByMRP: Number(((r.onHand || 0) * (r.mrp || 0)).toFixed(2)) }));

  if (ex === 'csv') return sendCSV(res, 'stock-valuation.csv', data, ['product','sku','batchNo','onHand','purchasePrice','mrp','valueByPurchase','valueByMRP']);

  res.json({ success: true, data: { rows: data, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
});

export const nearExpiry = asyncHandler(async (req: Request, res: Response) => {
  const { withinDays = '90', export: ex } = req.query as any;
  const days = Math.max(1, parseInt(withinDays, 10) || 90);
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const pipeline: any[] = [
    { $unwind: '$batches' },
    { $match: { 'batches.expiryDate': { $gte: now, $lte: future } } },
    { $project: { name: 1, sku: 1, batchNo: '$batches.batchNo', expiryDate: '$batches.expiryDate', onHand: '$batches.onHand', mrp: '$batches.mrp' } },
    { $sort: { expiryDate: 1 } },
  ];

  const rows = await Item.aggregate(pipeline);
  const data = rows.map((r: any) => ({ product: r.name, sku: r.sku, batchNo: r.batchNo, expiryDate: r.expiryDate, onHand: r.onHand || 0, mrp: r.mrp || 0 }));

  if (ex === 'csv') return sendCSV(res, 'near-expiry.csv', data, ['product','sku','batchNo','expiryDate','onHand','mrp']);

  res.json({ success: true, data: { rows: data } });
});

export const salesByProduct = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, export: ex } = req.query as any;
  const match: any = {};
  if (from || to) {
    match.billDate = {};
    if (from) match.billDate.$gte = new Date(from);
    if (to) match.billDate.$lte = new Date(to);
  }

  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: { productId: '$items.productId', productName: '$items.productName' }, qty: { $sum: '$items.qty' }, revenue: { $sum: '$items.amount' } } },
    { $project: { productId: '$_id.productId', productName: '$_id.productName', qty: 1, revenue: 1, _id: 0 } },
    { $sort: { revenue: -1 } },
  ];

  const rows = await Sale.aggregate(pipeline);
  const data = rows.map((r: any) => ({ productId: r.productId, productName: r.productName, qty: r.qty, revenue: Number(r.revenue.toFixed(2)), avgPrice: r.qty ? Number((r.revenue / r.qty).toFixed(2)) : 0 }));

  if (ex === 'csv') return sendCSV(res, 'sales-by-product.csv', data, ['productId','productName','qty','revenue','avgPrice']);

  res.json({ success: true, data: { rows: data } });
});
