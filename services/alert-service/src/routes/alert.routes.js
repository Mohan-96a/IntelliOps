import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Alert notifications — implemented in Day 8' });
});

export default router;
