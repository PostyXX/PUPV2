import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../lib/mailer';
import { createUserSession } from './user-activity';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body as { email: string; password: string; name?: string; role?: 'user'|'hospital'|'admin' };
  if(!email || !password || !name || name.trim().length === 0) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if(exists) return res.status(409).json({ error: 'email already exists' });
  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password_hash, name: name || '', role: role || 'user' } });

  // ถ้าเป็นบัญชีโรงพยาบาล ให้สร้างโปรไฟล์ Hospital ผูกกับ user.id ทันที
  if ((role || 'user') === 'hospital') {
    const hospitalName = name && name.trim().length > 0 ? name : 'โรงพยาบาลสัตว์ของฉัน';
    await prisma.hospital.create({
      data: {
        id: user.id,
        name: hospitalName,
      },
    });
  }

  res.json({ id: user.id, email: user.email, role: user.role });
});

authRouter.post('/login', async (req, res) => {
  const { email, password, role } = req.body as { email: string; password: string; role?: 'user'|'hospital'|'admin' };
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'email, password and role are required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if(!user || user.role !== role) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  
  // บันทึก session สำหรับ user role เท่านั้น
  if (user.role === 'user') {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || undefined;
    const userAgent = req.headers['user-agent'] || undefined;
    await createUserSession(user.id, ipAddress, userAgent);
  }
  
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.json({ ok: true });
  }

  const secret = (process.env.JWT_SECRET || 'devsecret') + '|reset';
  const token = jwt.sign({ id: user.id }, secret, { expiresIn: '30m' });

  const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const resetLink = `${frontendBase}/reset-password/${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetLink);
  } catch (e) {
    console.error('Failed to send reset email', e);
  }

  res.json({ ok: true });
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };

  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'invalid payload' });
  }

  try {
    const secret = (process.env.JWT_SECRET || 'devsecret') + '|reset';
    const payload = jwt.verify(token, secret) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash } });

    res.json({ ok: true });
  } catch (e) {
    console.error('reset-password error', e);
    return res.status(400).json({ error: 'invalid or expired token' });
  }
});

// เปลี่ยนรหัสผ่านสำหรับผู้ใช้ที่ล็อกอินอยู่
authRouter.post('/change-password', requireAuth(['user','hospital','admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user'|'hospital'|'admin' };
  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };

  if (!oldPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'invalid password payload' });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!dbUser) return res.status(404).json({ error: 'user not found' });

  const ok = await bcrypt.compare(oldPassword, dbUser.password_hash);
  if (!ok) return res.status(401).json({ error: 'old password incorrect' });

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: authUser.id }, data: { password_hash: newHash } });

  // แจ้งเตือนเมื่อมีการเปลี่ยนรหัสผ่าน
  await prisma.notification.create({
    data: {
      userId: authUser.id,
      type: authUser.role === 'hospital' ? 'PASSWORD_CHANGED_HOSPITAL' : 'PASSWORD_CHANGED',
      title: 'เปลี่ยนรหัสผ่านสำเร็จ',
      message: 'คุณได้ทำการเปลี่ยนรหัสผ่านของบัญชีเรียบร้อยแล้ว',
    },
  });

  res.json({ ok: true });
});

// Admin: สร้างบัญชีใหม่ (admin หรือ hospital) พร้อมบันทึก ActivityLog
authRouter.post('/admin/register', requireAuth(['admin']), async (req, res) => {
  const { email, password, name, role } = req.body as { email: string; password: string; name?: string; role?: 'user'|'hospital'|'admin' };
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  // อนุญาตให้ admin สร้างเฉพาะบัญชี admin หรือ hospital
  const targetRole: 'hospital' | 'admin' = (role === 'hospital' ? 'hospital' : 'admin');

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'email already exists' });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password_hash, name: name || '', role: targetRole } });

  // ถ้าสร้างบัญชีโรงพยาบาล ให้สร้างโปรไฟล์ Hospital ผูกกับ user.id ทันที
  if (targetRole === 'hospital') {
    const hospitalName = name && name.trim().length > 0 ? name : 'โรงพยาบาลสัตว์ของฉัน';
    await prisma.hospital.create({
      data: {
        id: user.id,
        name: hospitalName,
      },
    });
  }

  const admin = (req as any).user as { id: string; role: 'admin' };
  await prisma.activityLog.create({
    data: {
      adminId: admin.id,
      action: targetRole === 'admin' ? 'CREATE_ADMIN' : 'CREATE_HOSPITAL',
      details: targetRole === 'admin'
        ? `สร้างบัญชีผู้ดูแลใหม่ email=${email}`
        : `สร้างบัญชีโรงพยาบาลใหม่ email=${email}`,
    },
  });

  res.json({ id: user.id, email: user.email, role: user.role });
});

// Admin: รายชื่อผู้ดูแลทั้งหมดในระบบ
authRouter.get('/admins', requireAuth(['admin']), async (_req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(admins);
});

// Admin: รายชื่อบัญชีโรงพยาบาลทั้งหมด (role hospital)
authRouter.get('/hospital-users', requireAuth(['admin']), async (_req, res) => {
  const hospitals = await prisma.user.findMany({
    where: { role: 'hospital' },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(hospitals);
});

// Admin: ลบบัญชีโรงพยาบาล (user role=hospital) พร้อมข้อมูลที่เกี่ยวข้อง
authRouter.delete('/hospital-users/:id', requireAuth(['admin']), async (req, res) => {
  const { id } = req.params;
  const admin = (req as any).user as { id: string; role: 'admin' };

  try {
    // ตรวจสอบว่ามี user และเป็น role hospital จริงหรือไม่
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'hospital') {
      return res.status(404).json({ error: 'hospital user not found' });
    }

    // ใช้ transaction เพื่อลบข้อมูลทุกอย่างที่อ้างอิงบัญชีโรงพยาบาลนี้
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.pet.deleteMany({ where: { ownerId: id } }),
      prisma.appointment.deleteMany({ where: { hospitalId: id } }),
      prisma.vaccination.deleteMany({ where: { hospitalId: id } }),
      prisma.hospital.deleteMany({ where: { id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_HOSPITAL_USER',
        details: `ลบบัญชีโรงพยาบาล id=${id}`,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Error deleting hospital user', id, e);
    return res.status(400).json({ error: 'unable to delete hospital user' });
  }
});

// Admin: รายชื่อผู้ใช้ทั้งหมด (role user)
authRouter.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'user' },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// Admin: รายละเอียดผู้ใช้คนหนึ่ง รวมสัตว์เลี้ยง + นัดหมาย + วัคซีน
authRouter.get('/users/:id/detail', requireAuth(['admin']), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      pets: {
        select: {
          id: true,
          petId: true,
          name: true,
          type: true,
          breed: true,
          age: true,
          weight: true,
          gender: true,
          medicalNotes: true,
          appointments: {
            select: {
              id: true,
              date: true,
              time: true,
              status: true,
              reason: true,
              hospital: { select: { id: true, name: true } },
            },
          },
          vaccinations: {
            select: {
              id: true,
              vaccineName: true,
              date: true,
              nextDate: true,
              hospital: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

// Admin: ลบผู้ใช้ (role user) พร้อมสัตว์เลี้ยง การแจ้งเตือน และประวัติที่เกี่ยวข้อง
authRouter.delete('/users/:id', requireAuth(['admin']), async (req, res) => {
  const { id } = req.params;
  const admin = (req as any).user as { id: string; role: 'admin' };

  try {
    // ใช้ transaction เพื่อความปลอดภัยของข้อมูล
    await prisma.$transaction([
      // ลบการแจ้งเตือนทั้งหมดของ user ก่อน (กัน FK constraint)
      prisma.notification.deleteMany({ where: { userId: id } }),
      // ลบสัตว์เลี้ยงทั้งหมดของ user (จะ cascade นัดหมาย/วัคซีน/เวชระเบียนต่อเอง)
      prisma.pet.deleteMany({ where: { ownerId: id } }),
      // แล้วลบ user
      prisma.user.delete({ where: { id } }),
    ]);

    // บันทึก ActivityLog ของผู้ดูแล แยก transaction ได้
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_USER',
        details: `ลบบัญชีผู้ใช้ id=${id}`,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Error deleting user', id, e);
    return res.status(400).json({ error: 'unable to delete user' });
  }
});
