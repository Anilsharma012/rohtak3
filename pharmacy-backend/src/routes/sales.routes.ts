import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listSales, createSale, getSale, deleteSale, printSale, shareSale } from '../controllers/sales.controller';

const router = Router();

router.get('/', requireAuth(), listSales);
router.post('/', requireAuth(['admin','cashier','pharmacist']), createSale);
router.get('/:id', requireAuth(), getSale);
router.delete('/:id', requireAuth(['admin','cashier','pharmacist']), deleteSale);
router.get('/:id/print', requireAuth(), printSale);
router.post('/:id/share', requireAuth(), shareSale);

export default router;
