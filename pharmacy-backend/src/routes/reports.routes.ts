import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { stockValuation, nearExpiry, salesByProduct, gstSummary, stockLedger, reorderSuggestions } from '../controllers/reports.controller';

const router = Router();

router.get('/stock-valuation', requireAuth(), stockValuation);
router.get('/near-expiry', requireAuth(), nearExpiry);
router.get('/sales-by-product', requireAuth(), salesByProduct);
router.get('/gst-summary', requireAuth(), gstSummary);
router.get('/stock-ledger', requireAuth(), stockLedger);
router.get('/reorder', requireAuth(), reorderSuggestions);

export default router;
