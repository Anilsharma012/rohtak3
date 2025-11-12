import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createSalesReturn, listSalesReturns, getSalesReturn } from '../controllers/sales-returns.controller';

const router = Router();

router.get('/', requireAuth(), listSalesReturns);
router.post('/', requireAuth(['admin','cashier','pharmacist']), createSalesReturn);
router.get('/:id', requireAuth(), getSalesReturn);

export default router;
