import { Router } from 'express';
import { config } from '../config';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      version: config.version,
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  return router;
}
