import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createPurchaseReturn, listPurchaseReturns, getPurchaseReturn, deletePurchaseReturn } from '../controllers/purchase-returns.controller';

const router = Router();

router.get('/', requireAuth(), listPurchaseReturns);
router.post('/', requireAuth(['admin','inventory_manager']), createPurchaseReturn);
router.get('/:id', requireAuth(), getPurchaseReturn);
router.delete('/:id', requireAuth(['admin','inventory_manager']), deletePurchaseReturn);

export default router;
