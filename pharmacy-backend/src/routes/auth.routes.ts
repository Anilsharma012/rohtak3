import { Router } from 'express';
import { login, registerIfEmpty, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register-if-empty', registerIfEmpty);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth(), me);

export default router;
