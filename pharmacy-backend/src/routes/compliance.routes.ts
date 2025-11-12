import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
const router = Router();

const ControlledLog = require('../models/compliance.models').ControlledLog;
const RecallNotice = require('../models/compliance.models').RecallNotice;

router.get('/controlled-logs', requireAuth(['admin','manager']), async (req, res) => {
  const rows = await ControlledLog.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, data: rows });
});

router.get('/recalls', requireAuth(), async (req, res) => {
  const rows = await RecallNotice.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: rows });
});

router.post('/recalls', requireAuth(['admin','manager']), async (req, res) => {
  const { productId, batchNo, notes } = req.body;
  if (!productId || !batchNo) return res.status(400).json({ success: false, message: 'productId and batchNo required' });
  const r = await RecallNotice.create({ productId, batchNo, notes });
  res.status(201).json({ success: true, data: r });
});

router.put('/recalls/:id', requireAuth(['admin','manager']), async (req, res) => {
  const r = await RecallNotice.findById(req.params.id);
  if (!r) return res.status(404).json({ success: false, message: 'Recall not found' });
  const { status, notes } = req.body;
  if (status) r.status = status;
  if (notes !== undefined) r.notes = notes;
  await r.save();
  res.json({ success: true, data: r });
});

export default router;
