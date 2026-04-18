import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const activityLogsRouter = Router();

// Admin: ดู log การกระทำของระบบทั้งหมด
activityLogsRouter.get('/', requireAuth(['admin']), async (_req, res) => {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      admin: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json(
    logs.map((log) => ({
      id: log.id,
      adminId: log.adminId,
      adminName: log.admin?.name ?? '',
      adminEmail: log.admin?.email ?? '',
      action: log.action,
      details: log.details ?? '',
      createdAt: log.createdAt,
    }))
  );
});
