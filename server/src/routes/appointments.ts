import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const appointmentsRouter = Router();

appointmentsRouter.get('/', requireAuth(['user','hospital','admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };

  // user เห็นเฉพาะนัดของสัตว์เลี้ยงที่ตัวเองเป็นเจ้าของ
  // hospital เห็นเฉพาะนัดของโรงพยาบาลตัวเอง, admin เห็นทุกนัด
  const where = authUser.role === 'user'
    ? {
        pet: {
          ownerId: authUser.id,
        },
      }
    : authUser.role === 'hospital'
    ? {
        hospitalId: authUser.id,
      }
    : {};

  const items = await prisma.appointment.findMany({
    where,
    include: {
      pet: { include: { owner: true } },
      hospital: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(items);
});

appointmentsRouter.post('/', requireAuth(['user','hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin'; name?: string | null };
  const { petIdCode, petId, hospitalId: bodyHospitalId, date, time, reason } = req.body as { petIdCode?: string; petId?: string; hospitalId?: string; date: string; time: string; reason: string };
  let petRefId = petId;
  if(!petRefId && petIdCode){
    const pet = await prisma.pet.findUnique({ where: { petId: petIdCode }});
    if(!pet) return res.status(404).json({ error: 'pet not found by Pet ID' });
    petRefId = pet.id;
  }
  if(!petRefId) return res.status(400).json({ error: 'petId or petIdCode required' });

  // กำหนด hospitalId ตาม role
  let effectiveHospitalId: string | undefined;
  if (user.role === 'hospital') {
    // ใช้ id ของ user hospital เอง และถ้าไม่มี record Hospital ให้สร้างให้
    let hospital = await prisma.hospital.findUnique({ where: { id: user.id } });
    if (!hospital) {
      hospital = await prisma.hospital.create({
        data: {
          id: user.id,
          name: user.name && user.name.trim().length > 0 ? user.name : 'โรงพยาบาลสัตว์ของฉัน',
        },
      });
    }
    effectiveHospitalId = hospital.id;
  } else {
    effectiveHospitalId = bodyHospitalId;
  }

  if (!effectiveHospitalId) {
    return res.status(400).json({ error: 'hospitalId required' });
  }

  const initialStatus: 'pending' | 'confirmed' = user.role === 'hospital' ? 'confirmed' : 'pending';
  const appt = await prisma.appointment.create({ data: { petId: petRefId, hospitalId: effectiveHospitalId, date, time, status: initialStatus, reason }});

  // แจ้งเตือนเจ้าของสัตว์เลี้ยง (เฉพาะ role user) ว่ามีนัดหมายใหม่และเชื่อมกับโรงพยาบาล
  const petWithOwner = await prisma.pet.findUnique({
    where: { id: petRefId },
    include: { owner: true },
  });
  if (petWithOwner && petWithOwner.owner.role === 'user') {
    const hospital = await prisma.hospital.findUnique({ where: { id: effectiveHospitalId } });
    await prisma.notification.create({
      data: {
        userId: petWithOwner.ownerId,
        type: 'APPOINTMENT_CREATED',
        title: 'มีนัดหมายสำหรับสัตว์เลี้ยง',
        message: `สัตว์เลี้ยงของคุณ (${petWithOwner.name || 'ไม่ระบุชื่อ'}) มีนัดที่${hospital?.name ? ` ${hospital.name}` : ''} วันที่ ${date} เวลา ${time}`,
      },
    });
  }

  // แจ้งเตือนโรงพยาบาลว่ามีนัดหมายใหม่สำหรับสัตว์เลี้ยง
  const hospitalAccountId = effectiveHospitalId;
  await prisma.notification.create({
    data: {
      userId: hospitalAccountId,
      type: 'APPOINTMENT_CREATED_HOSPITAL',
      title: 'มีนัดหมายใหม่ในระบบ',
      message: `มีการสร้างนัดหมายสำหรับสัตว์เลี้ยง ${petWithOwner?.name || 'ไม่ระบุชื่อ'} วันที่ ${date} เวลา ${time}`,
    },
  });

  res.json(appt);
});

appointmentsRouter.patch('/:id/status', requireAuth(['hospital','admin']), async (req, res) => {
  const { status } = req.body as { status: 'pending'|'confirmed'|'completed'|'cancelled' };
  const appt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status } });
  res.json(appt);
});

// Delete appointment (hospital, admin)
appointmentsRouter.delete('/:id', requireAuth(['hospital','admin']), async (req, res) => {
  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
