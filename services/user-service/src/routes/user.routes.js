import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { listUsers } from '../services/auth.service.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.get('/', authenticate, authorize(ROLES.ADMIN), async (_req, res) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to load users' });
  }
});

export default router;
