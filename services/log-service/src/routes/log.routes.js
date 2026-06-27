import { Router } from 'express';

const router = Router();

router.post('/', (_req, res) => {
  res.status(501).json({ message: 'Log ingestion — implemented in Day 5' });
});

router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Log retrieval — implemented in Day 5' });
});

export default router;
