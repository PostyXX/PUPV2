import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const userActivityRouter = Router();

// Admin: ดึงรายชื่อผู้ใช้ทั้งหมดพร้อมสถานะการใช้งาน
userActivityRouter.get('/users-activity', requireAuth(['admin']), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        sessions: {
          orderBy: { lastActiveAt: 'desc' },
          take: 1,
          select: {
            id: true,
            loginAt: true,
            lastActiveAt: true,
            logoutAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // กำหนดว่า user active หรือไม่ (ถ้า lastActiveAt อยู่ในช่วง 5 นาทีที่แล้ว)
    const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const now = new Date();

    const usersWithStatus = users.map(user => {
      const latestSession = user.sessions[0];
      let isActive = false;
      
      if (latestSession && !latestSession.logoutAt) {
        const lastActive = new Date(latestSession.lastActiveAt);
        isActive = (now.getTime() - lastActive.getTime()) < ACTIVE_THRESHOLD_MS;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        isActive,
        lastActiveAt: latestSession?.lastActiveAt || null,
        lastLoginAt: latestSession?.loginAt || null,
      };
    });

    res.json(usersWithStatus);
  } catch (e) {
    console.error('Error fetching users activity', e);
    return res.status(500).json({ error: 'unable to fetch users activity' });
  }
});

// Admin: ดึงประวัติการเข้าใช้งานทั้งหมดของ user คนหนึ่ง
userActivityRouter.get('/users-activity/:userId', requireAuth(['admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        sessions: {
          orderBy: { loginAt: 'desc' },
          select: {
            id: true,
            loginAt: true,
            lastActiveAt: true,
            logoutAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    res.json(user);
  } catch (e) {
    console.error('Error fetching user activity detail', e);
    return res.status(500).json({ error: 'unable to fetch user activity detail' });
  }
});

// Middleware สำหรับบันทึก session เมื่อ user login (เรียกใช้จาก auth route)
export const createUserSession = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await prisma.userSession.create({
      data: {
        userId,
        ipAddress,
        userAgent,
      },
    });
  } catch (e) {
    console.error('Error creating user session', e);
  }
};

// Middleware สำหรับอัปเดต lastActiveAt
export const updateUserActivity = async (userId: string) => {
  try {
    // หา session ล่าสุดที่ยังไม่ logout
    const latestSession = await prisma.userSession.findFirst({
      where: {
        userId,
        logoutAt: null,
      },
      orderBy: { loginAt: 'desc' },
    });

    if (latestSession) {
      await prisma.userSession.update({
        where: { id: latestSession.id },
        data: { lastActiveAt: new Date() },
      });
    }
  } catch (e) {
    console.error('Error updating user activity', e);
  }
};

// Middleware สำหรับบันทึก logout
export const logoutUserSession = async (userId: string) => {
  try {
    // หา session ล่าสุดที่ยังไม่ logout
    const latestSession = await prisma.userSession.findFirst({
      where: {
        userId,
        logoutAt: null,
      },
      orderBy: { loginAt: 'desc' },
    });

    if (latestSession) {
      await prisma.userSession.update({
        where: { id: latestSession.id },
        data: { logoutAt: new Date() },
      });
    }
  } catch (e) {
    console.error('Error logging out user session', e);
  }
};
