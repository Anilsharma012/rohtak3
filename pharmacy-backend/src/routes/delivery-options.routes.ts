import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listDeliveryOptions, createDeliveryOption, updateDeliveryOption, deleteDeliveryOption } from '../controllers/delivery-options.controller';

const router = Router();

router.get('/', requireAuth(), listDeliveryOptions);
router.post('/', requireAuth(['admin','inventory_manager']), createDeliveryOption);
router.put('/:id', requireAuth(['admin','inventory_manager']), updateDeliveryOption);
router.delete('/:id', requireAuth(['admin','inventory_manager']), deleteDeliveryOption);

export default router;
