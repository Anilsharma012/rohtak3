import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { stockValuation, nearExpiry, salesByProduct } from '../controllers/reports.controller';

const router = Router();

router.get('/stock-valuation', requireAuth(), stockValuation);
router.get('/near-expiry', requireAuth(), nearExpiry);
router.get('/sales-by-product', requireAuth(), salesByProduct);

export default router;
