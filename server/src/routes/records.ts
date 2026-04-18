import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const recordsRouter = Router();

recordsRouter.get('/', requireAuth(['hospital','admin','user']), async (req, res) => {
  const appointmentId = req.query.appointmentId as string | undefined;
  const where = appointmentId ? { appointmentId } : {};
  const items = await prisma.medicalRecord.findMany({ where });
  res.json(items);
});

recordsRouter.post('/', requireAuth(['hospital','admin']), async (req, res) => {
  const { appointmentId, symptoms, diagnosis, treatment } = req.body as { appointmentId: string; symptoms: string; diagnosis: string; treatment: string };
  const rec = await prisma.medicalRecord.create({ data: { appointmentId, symptoms, diagnosis, treatment } });
  res.json(rec);
});
