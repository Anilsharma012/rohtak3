import { Router } from 'express';
import { login, registerIfEmpty } from '../controllers/auth.controller';

const router = Router();

router.post('/register-if-empty', registerIfEmpty);
router.post('/login', login);

export default router;
