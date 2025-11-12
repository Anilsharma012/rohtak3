import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listOrders, createOrder, getOrder, updateOrder, deleteOrder, convertOrderToSale } from '../controllers/sales-orders.controller';

const router = Router();

router.get('/', requireAuth(), listOrders);
router.post('/', requireAuth(['admin','cashier','pharmacist']), createOrder);
router.get('/:id', requireAuth(), getOrder);
router.put('/:id', requireAuth(['admin','cashier','pharmacist']), updateOrder);
router.delete('/:id', requireAuth(['admin','cashier','pharmacist']), deleteOrder);
router.post('/:id/convert', requireAuth(['admin','cashier','pharmacist']), convertOrderToSale);

export default router;
