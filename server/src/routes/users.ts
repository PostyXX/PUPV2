import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const usersRouter = Router();

// ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
usersRouter.get('/me', requireAuth(['user', 'hospital', 'admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
    },
  });

  if (!user) return res.status(404).json({ error: 'user not found' });

  res.json(user);
});

// อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
usersRouter.put('/me', requireAuth(['user', 'hospital', 'admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };
  const { name, phone, address } = req.body as {
    name?: string;
    phone?: string | null;
    address?: string | null;
  };

  const updated = await prisma.user.update({
    where: { id: authUser.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(address !== undefined ? { address } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
    },
  });

  // แจ้งเตือนเมื่อมีการแก้ไขข้อมูลส่วนตัว
  if (authUser.role === 'user') {
    await prisma.notification.create({
      data: {
        userId: authUser.id,
        type: 'PROFILE_UPDATED',
        title: 'แก้ไขข้อมูลส่วนตัว',
        message: 'คุณได้อัปเดตข้อมูลส่วนตัวของคุณ',
      },
    });
  } else if (authUser.role === 'hospital') {
    await prisma.notification.create({
      data: {
        userId: authUser.id,
        type: 'PROFILE_UPDATED_HOSPITAL_USER',
        title: 'แก้ไขข้อมูลบัญชีโรงพยาบาล',
        message: 'คุณได้อัปเดตข้อมูลบัญชีผู้ใช้ของโรงพยาบาล',
      },
    });
  }

  res.json(updated);
});
