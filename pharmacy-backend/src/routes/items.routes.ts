import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createItem, getItems, getItem, updateItem, deleteItem, adjustStock } from '../controllers/items.controller';

const router = Router();

router.get('/', requireAuth(), getItems);
router.post('/', requireAuth(['admin']), createItem);
router.get('/:id', requireAuth(), getItem);
router.put('/:id', requireAuth(['admin']), updateItem);
router.delete('/:id', requireAuth(['admin']), deleteItem);
router.patch('/:id/adjust', requireAuth(['admin']), adjustStock);

export default router;
