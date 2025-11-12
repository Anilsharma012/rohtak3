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
    { $group: { _id: { productId: '$items.productId', productName: '$items.productName', batchNo: '$items.batchNo' }, qty: { $sum: '$items.qty' }, revenue: { $sum: '$items.amount' } } },
    { $project: { productId: '$_id.productId', productName: '$_id.productName', batchNo: '$_id.batchNo', qty: 1, revenue: 1, _id: 0 } },
    { $sort: { revenue: -1 } },
  ];

  const rows = await Sale.aggregate(pipeline);
  const data = rows.map((r: any) => ({ productId: r.productId, productName: r.productName, batchNo: r.batchNo, qty: r.qty, revenue: Number(r.revenue.toFixed(2)), avgPrice: r.qty ? Number((r.revenue / r.qty).toFixed(2)) : 0 }));

  if (ex === 'csv') return sendCSV(res, 'sales-by-product.csv', data, ['productId','productName','batchNo','qty','revenue','avgPrice']);

  res.json({ success: true, data: { rows: data } });
});

export const gstSummary = asyncHandler(async (req: Request, res: Response) => {
  const { from, to, export: ex } = req.query as any;
  const match: any = {};
  if (from || to) {
    match.billDate = {};
    if (from) match.billDate.$gte = new Date(from);
    if (to) match.billDate.$lte = new Date(to);
  }

  // Assume items have gstPercent and amounts include tax excluded; simple aggregation
  const pipeline: any[] = [
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: '$items.gstPercent', taxable: { $sum: '$items.amount' }, qty: { $sum: '$items.qty' } } },
    { $project: { gstPercent: '$_id', taxable: 1, qty: 1, _id: 0 } },
    { $sort: { gstPercent: 1 } },
  ];

  const rows = await Sale.aggregate(pipeline);
  const data = rows.map((r: any) => ({ gstPercent: r.gstPercent || 0, taxable: Number((r.taxable || 0).toFixed(2)), qty: r.qty }));

  if (ex === 'csv') return sendCSV(res, 'gst-summary.csv', data, ['gstPercent','taxable','qty']);
  res.json({ success: true, data: { rows: data } });
});

export const stockLedger = asyncHandler(async (req: Request, res: Response) => {
  const { productId, batchNo, from, to } = req.query as any;
  // Build ledger from GRN (in), sales (out), sales-returns (in), adjustments
  const inEvents: any[] = [];
  const outEvents: any[] = [];

  // GRN lines
  const grnMatch: any = {};
  if (productId) grnMatch['lines.productId'] = productId;
  if (batchNo) grnMatch['lines.batchNo'] = batchNo;
  if (from || to) grnMatch.invoiceDate = {};
  if (from) grnMatch.invoiceDate.$gte = new Date(from);
  if (to) grnMatch.invoiceDate.$lte = new Date(to);

  const grns = await GRN.find(grnMatch).lean();
  for (const g of grns) {
    for (const l of g.lines) {
      if (productId && String(l.productId) !== String(productId)) continue;
      if (batchNo && l.batchNo !== batchNo) continue;
      inEvents.push({ date: g.invoiceDate, type: 'GRN', qty: l.qty + (l.freeQty || 0), price: l.purchasePrice, ref: g._id });
    }
  }

  const salesMatch: any = {};
  if (from || to) salesMatch.billDate = {};
  if (from) salesMatch.billDate.$gte = new Date(from);
  if (to) salesMatch.billDate.$lte = new Date(to);
  const sales = await Sale.find(salesMatch).lean();
  for (const s of sales) {
    for (const it of s.items) {
      if (productId && String(it.productId) !== String(productId)) continue;
      if (batchNo && it.batchNo !== batchNo) continue;
      outEvents.push({ date: s.billDate, type: 'Sale', qty: it.qty, price: it.salePrice, ref: s._id });
    }
  }

  const returns = await require('../models/SalesReturn').SalesReturn.find({}).lean();
  const inReturns: any[] = [];
  for (const r of returns) {
    for (const it of r.lines) {
      if (productId && String(it.productId) !== String(productId)) continue;
      if (batchNo && it.batchNo !== batchNo) continue;
      inReturns.push({ date: r.returnDate, type: 'Return', qty: it.qty, price: it.salePrice, ref: r._id });
    }
  }

  const events = [...inEvents, ...outEvents, ...inReturns].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = 0;
  const rows = events.map(e => { running += (e.type === 'Sale' ? -e.qty : e.qty); return { date: e.date, type: e.type, qty: e.qty, price: e.price, running }; });
  res.json({ success: true, data: { rows } });
});

export const reorderSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { days = '30' } = req.query as any;
  const window = Math.max(1, parseInt(days, 10) || 30);
  const salesFrom = new Date(Date.now() - window * 24 * 60 * 60 * 1000);

  // compute avg daily sales per product
  const pipeline: any[] = [
    { $match: { billDate: { $gte: salesFrom } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', qty: { $sum: '$items.qty' } } },
  ];
  const sold = await Sale.aggregate(pipeline);
  const avgMap = new Map<string, number>();
  for (const s of sold) {
    avgMap.set(s._id, (s.qty / window));
  }

  const items = await Item.find().lean();
  const suggestions: any[] = [];
  for (const it of items) {
    const onHand = it.onHand || 0;
    const minStock = it.minStock || 0;
    const avgDaily = avgMap.get(String(it._id)) || 0;
    const leadTime = (await require('../models/Settings').Settings.findOne().lean())?.inventory?.leadTimeDays || 7;
    const needed = Math.max(0, Math.ceil(avgDaily * leadTime) - onHand);
    if (onHand <= minStock || needed > 0) {
      suggestions.push({ productId: it._id, name: it.name, onHand, minStock, avgDaily: Number(avgDaily.toFixed(2)), suggestedQty: needed });
    }
  }

  res.json({ success: true, data: { rows: suggestions } });
});
