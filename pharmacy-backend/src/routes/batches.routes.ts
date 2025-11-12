import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getBatches, getBatch, updateBatchPrice, deleteBatchStrict } from '../controllers/items.controller';

const router = Router();

router.get('/', requireAuth(), getBatches);
router.get('/:batchId', requireAuth(), getBatch);
router.put('/:batchId', requireAuth(['admin', 'inventory_manager']), updateBatchPrice);
router.delete('/:batchId', requireAuth(['admin', 'inventory_manager']), deleteBatchStrict);

export default router;
