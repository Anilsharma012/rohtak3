import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createItem, getItems, getItem, updateItem, deleteItem, adjustStock, addBatch, updateBatch, deleteBatch, getBatches, getBatch, updateBatchPrice, deleteBatchStrict, getAllBatches } from '../controllers/items.controller';

const router = Router();

router.get('/', requireAuth(), getItems);
router.post('/', requireAuth(['admin','inventory_manager']), createItem);
router.get('/:id', requireAuth(), getItem);
router.put('/:id', requireAuth(['admin','inventory_manager']), updateItem);
router.delete('/:id', requireAuth(['admin']), deleteItem);
router.post('/:id/adjust-stock', requireAuth(['admin','inventory_manager']), adjustStock);
router.post('/:id/batches', requireAuth(['admin','inventory_manager']), addBatch);
router.put('/:id/batches', requireAuth(['admin','inventory_manager']), updateBatch);
router.post('/:id/batches/delete', requireAuth(['admin','inventory_manager']), deleteBatch);

export default router;
