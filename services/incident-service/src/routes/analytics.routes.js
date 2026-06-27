import { Router } from 'express';

const router = Router();

router.get('/summary', (_req, res) => {
  res.status(501).json({ message: 'Analytics dashboard — implemented in Day 10' });
});

export default router;
