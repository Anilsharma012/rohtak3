import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller';

const router = Router();

router.get('/', requireAuth(['admin','manager']), listUsers);
router.post('/', requireAuth(['admin','manager']), createUser);
router.put('/:id', requireAuth(['admin','manager']), updateUser);
router.delete('/:id', requireAuth(['admin','manager']), deleteUser);

export default router;
