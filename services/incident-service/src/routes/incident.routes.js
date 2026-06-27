import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Incident list — implemented in Day 7' });
});

router.get('/:id', (_req, res) => {
  res.status(501).json({ message: 'Incident detail — implemented in Day 7' });
});

router.patch('/:id/resolve', (_req, res) => {
  res.status(501).json({ message: 'Resolve incident — implemented in Day 7' });
});

export default router;
