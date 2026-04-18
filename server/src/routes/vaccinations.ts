import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const vaccinationsRouter = Router();

vaccinationsRouter.get('/', requireAuth(['user','hospital','admin']), async (req, res) => {
  const authUser = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };

  // user เห็นเฉพาะวัคซีนของสัตว์เลี้ยงที่ตัวเองเป็นเจ้าของ
  // hospital เห็นเฉพาะวัคซีนที่โรงพยาบาลตัวเองเป็นผู้บันทึก, admin เห็นทั้งหมด
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

  const items = await prisma.vaccination.findMany({
    where,
    include: { pet: true, hospital: true },
  });

  res.json(items);
});

vaccinationsRouter.post('/', requireAuth(['user','hospital','admin']), async (req, res) => {
  const { petIdCode, petId, vaccineName, date, nextDate, hospitalId } = req.body as { petIdCode?: string; petId?: string; vaccineName: string; date: string; nextDate: string; hospitalId: string };
  let petRefId = petId;
  if(!petRefId && petIdCode){
    const pet = await prisma.pet.findUnique({ where: { petId: petIdCode }});
    if(!pet) return res.status(404).json({ error: 'pet not found by Pet ID' });
    petRefId = pet.id;
  }
  if(!petRefId) return res.status(400).json({ error: 'petId or petIdCode required' });
  const vac = await prisma.vaccination.create({ data: { petId: petRefId, vaccineName, date, nextDate, hospitalId } });

  // แจ้งเตือนเจ้าของสัตว์เลี้ยง (เฉพาะ role user) ว่ามีนัดฉีดวัคซีน
  const petWithOwner = await prisma.pet.findUnique({
    where: { id: petRefId },
    include: { owner: true },
  });
  if (petWithOwner && petWithOwner.owner.role === 'user') {
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    await prisma.notification.create({
      data: {
        userId: petWithOwner.ownerId,
        type: 'VACCINATION_CREATED',
        title: 'การนัดฉีดวัคซีนสัตว์เลี้ยง',
        message: `สัตว์เลี้ยงของคุณ (${petWithOwner.name || 'ไม่ระบุชื่อ'}) มีการฉีดวัคซีน ${vaccineName} วันที่ ${date} ที่${hospital?.name ? ` ${hospital.name}` : ''}`,
      },
    });
  }

   // แจ้งเตือนโรงพยาบาลว่ามีการบันทึกการฉีดวัคซีนสำหรับสัตว์เลี้ยง
   const hospitalAccountId = hospitalId;
   await prisma.notification.create({
     data: {
       userId: hospitalAccountId,
       type: 'VACCINATION_CREATED_HOSPITAL',
       title: 'มีการฉีดวัคซีนใหม่ในระบบ',
       message: `มีการบันทึกการฉีดวัคซีน ${vaccineName} ให้กับสัตว์เลี้ยง ${petWithOwner?.name || 'ไม่ระบุชื่อ'} วันที่ ${date}`,
     },
   });

  res.json(vac);
});

// Delete vaccination (hospital, admin)
vaccinationsRouter.delete('/:id', requireAuth(['hospital','admin']), async (req, res) => {
  await prisma.vaccination.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
