import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const notificationsRouter = Router();

// ดึงรายการแจ้งเตือนของผู้ใช้ที่ล็อกอินอยู่
notificationsRouter.get('/my', requireAuth(['user', 'hospital', 'admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };

  const notifications = await prisma.notification.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(notifications);
});

// มาร์กแจ้งเตือนว่าอ่านแล้ว
notificationsRouter.post('/my/read', requireAuth(['user', 'hospital', 'admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };
  const { ids, all } = req.body as { ids?: string[]; all?: boolean };

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: authUser.id, read: false },
      data: { read: true },
    });
    return res.json({ ok: true });
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids is required when all is not true' });
  }

  await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: authUser.id },
    data: { read: true },
  });

  res.json({ ok: true });
});
