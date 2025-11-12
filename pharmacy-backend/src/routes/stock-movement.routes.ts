import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createMovement, getMovements } from '../controllers/stock-movement.controller';

const router = Router();

router.post('/', requireAuth(['admin', 'inventory_manager']), createMovement);
router.get('/', requireAuth(), getMovements);

export default router;
