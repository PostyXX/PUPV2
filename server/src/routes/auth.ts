import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { createUserSession } from './user-activity';

export const authRouter = Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// เรียกหลังจาก Supabase signup สำเร็จ — สร้าง User record ในฐานข้อมูล
authRouter.post('/complete-profile', async (req, res) => {
  const { name, role } = req.body as { name: string; role?: 'user' | 'hospital' | 'admin' };
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.replace('Bearer ', '');

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }

  const existing = await prisma.user.findUnique({ where: { supabase_uid: user.id } });
  if (existing) return res.json({ id: existing.id, email: existing.email, role: existing.role, name: existing.name });

  const targetRole = (role === 'hospital' || role === 'admin') ? role : 'user';
  const dbUser = await prisma.user.create({
    data: { supabase_uid: user.id, email: user.email!, name: name.trim(), role: targetRole },
  });

  if (targetRole === 'hospital') {
    await prisma.hospital.create({ data: { id: dbUser.id, name: name.trim() } });
  }

  if (targetRole === 'user') {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || undefined;
    const userAgent = req.headers['user-agent'] || undefined;
    await createUserSession(dbUser.id, ipAddress, userAgent);
  }

  res.json({ id: dbUser.id, email: dbUser.email, role: dbUser.role, name: dbUser.name });
});

// Admin: สร้างบัญชี hospital หรือ admin ผ่าน Supabase Auth
authRouter.post('/admin/register', requireAuth(['admin']), async (req, res) => {
  const { email, password, name, role } = req.body as { email: string; password: string; name?: string; role?: 'hospital' | 'admin' };
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const targetRole: 'hospital' | 'admin' = role === 'hospital' ? 'hospital' : 'admin';

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (authError) return res.status(400).json({ error: authError.message });

  const dbUser = await prisma.user.create({
    data: { supabase_uid: authData.user.id, email, name: name || '', role: targetRole },
  });

  if (targetRole === 'hospital') {
    await prisma.hospital.create({ data: { id: dbUser.id, name: name || 'โรงพยาบาลสัตว์ของฉัน' } });
  }

  const admin = (req as any).user as { id: string };
  await prisma.activityLog.create({
    data: {
      adminId: admin.id,
      action: targetRole === 'admin' ? 'CREATE_ADMIN' : 'CREATE_HOSPITAL',
      details: `สร้างบัญชี ${targetRole} email=${email}`,
    },
  });

  res.json({ id: dbUser.id, email: dbUser.email, role: dbUser.role });
});

// ดึงข้อมูล user ปัจจุบันจาก token
authRouter.get('/me', requireAuth(), async (req, res) => {
  const user = (req as any).user as { id: string; role: string };
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true },
  });
  res.json(dbUser);
});

authRouter.get('/admins', requireAuth(['admin']), async (_req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(admins);
});

authRouter.get('/hospital-users', requireAuth(['admin']), async (_req, res) => {
  const hospitals = await prisma.user.findMany({
    where: { role: 'hospital' },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(hospitals);
});

authRouter.delete('/hospital-users/:id', requireAuth(['admin']), async (req, res) => {
  const { id } = req.params;
  const admin = (req as any).user as { id: string };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== 'hospital') return res.status(404).json({ error: 'hospital user not found' });

  await supabaseAdmin.auth.admin.deleteUser(user.supabase_uid);

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.pet.deleteMany({ where: { ownerId: id } }),
    prisma.appointment.deleteMany({ where: { hospitalId: id } }),
    prisma.vaccination.deleteMany({ where: { hospitalId: id } }),
    prisma.hospital.deleteMany({ where: { id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  await prisma.activityLog.create({
    data: { adminId: admin.id, action: 'DELETE_HOSPITAL_USER', details: `ลบบัญชีโรงพยาบาล id=${id}` },
  });

  res.json({ ok: true });
});

authRouter.get('/users', requireAuth(['admin']), async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'user' },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

authRouter.get('/users/:id/detail', requireAuth(['admin']), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, email: true, name: true, createdAt: true,
      pets: {
        select: {
          id: true, petId: true, name: true, type: true, breed: true,
          age: true, weight: true, gender: true, medicalNotes: true,
          appointments: { select: { id: true, date: true, time: true, status: true, reason: true, hospital: { select: { id: true, name: true } } } },
          vaccinations: { select: { id: true, vaccineName: true, date: true, nextDate: true, hospital: { select: { id: true, name: true } } } },
        },
      },
    },
  });
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

authRouter.delete('/users/:id', requireAuth(['admin']), async (req, res) => {
  const { id } = req.params;
  const admin = (req as any).user as { id: string };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'user not found' });

  await supabaseAdmin.auth.admin.deleteUser(user.supabase_uid);

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.pet.deleteMany({ where: { ownerId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  await prisma.activityLog.create({
    data: { adminId: admin.id, action: 'DELETE_USER', details: `ลบบัญชีผู้ใช้ id=${id}` },
  });

  res.json({ ok: true });
});
