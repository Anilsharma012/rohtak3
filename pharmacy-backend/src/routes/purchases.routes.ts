import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listPurchases, createPurchase, getPurchase, updatePurchase, deletePurchase } from '../controllers/purchases.controller';

const router = Router();

router.get('/', requireAuth(), listPurchases);
router.post('/', requireAuth(['admin','inventory_manager']), createPurchase);
router.get('/:id', requireAuth(), getPurchase);
router.put('/:id', requireAuth(['admin','inventory_manager']), updatePurchase);
router.delete('/:id', requireAuth(['admin','inventory_manager']), deletePurchase);

export default router;
