import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createGRN, getGRNs, getGRN } from '../controllers/grn.controller';

const router = Router();

router.post('/', requireAuth(['admin', 'inventory_manager']), createGRN);
router.get('/', requireAuth(), getGRNs);
router.get('/:id', requireAuth(), getGRN);

export default router;
