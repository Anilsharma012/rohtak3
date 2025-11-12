import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getSettings, updateSettings } from '../controllers/settings.controller';

const router = Router();

router.get('/', requireAuth(), getSettings);
router.put('/', requireAuth(['admin']), updateSettings);

export default router;
