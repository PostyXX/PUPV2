import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const petsRouter = Router();

// Get my pets
petsRouter.get('/', requireAuth(['user','hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string, role: string };
  if(user.role === 'user'){
    const pets = await prisma.pet.findMany({ where: { ownerId: user.id } });
    return res.json(pets);
  }
  // hospital/admin may pass ownerId query to filter
  const ownerId = req.query.ownerId as string | undefined;
  const pets = await prisma.pet.findMany({ where: ownerId ? { ownerId } : {} });
  res.json(pets);
});

// Create pet (user, hospital, admin)
petsRouter.post('/', requireAuth(['user','hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };
  const { name, type, breed, age, weight, gender, image, medicalNotes } = req.body;
  const petId = `P-${Math.floor(100000 + Math.random() * 900000)}`;
  const pet = await prisma.pet.create({ data: { ownerId: user.id, petId, name, type, breed, age, weight, gender, image, medicalNotes }});

  // แจ้งเตือนเฉพาะเจ้าของที่เป็น user
  if (user.role === 'user') {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'PET_CREATED',
        title: 'สร้างสัตว์เลี้ยงใหม่',
        message: `คุณได้เพิ่มสัตว์เลี้ยงใหม่: ${pet.name || 'ไม่ระบุชื่อ'} (รหัส ${pet.petId})`,
      },
    });
  }

  res.json(pet);
});

// Update pet (owner, hospital, admin)
petsRouter.put('/:id', requireAuth(['user','hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };
  const { id } = req.params;
  const { name, type, breed, age, weight, gender, image, medicalNotes } = req.body as {
    name?: string;
    type?: string;
    breed?: string | null;
    age?: number | null;
    weight?: number | null;
    gender?: string | null;
    image?: string | null;
    medicalNotes?: string | null;
  };

  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet) return res.status(404).json({ error: 'pet not found' });

  // ผู้ใช้ทั่วไปแก้ไขได้เฉพาะสัตว์ของตัวเอง
  if (user.role === 'user' && pet.ownerId !== user.id) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const updated = await prisma.pet.update({
    where: { id },
    data: {
      name,
      type,
      breed,
      age,
      weight,
      gender,
      image,
      medicalNotes,
    },
  });

  // แจ้งเตือนเจ้าของที่เป็น user เมื่อแก้ไขข้อมูลสัตว์เลี้ยง
  if (user.role === 'user') {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'PET_UPDATED',
        title: 'แก้ไขข้อมูลสัตว์เลี้ยง',
        message: `คุณได้แก้ไขข้อมูลของสัตว์เลี้ยง: ${updated.name || 'ไม่ระบุชื่อ'}`,
      },
    });
  }

  res.json(updated);
});

// Delete pet (owner, hospital, admin)
petsRouter.delete('/:id', requireAuth(['user','hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string; role: 'user' | 'hospital' | 'admin' };
  const { id } = req.params;

  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet) return res.status(404).json({ error: 'pet not found' });

  if (user.role === 'user' && pet.ownerId !== user.id) {
    return res.status(403).json({ error: 'forbidden' });
  }

  await prisma.pet.delete({ where: { id } });

  // แจ้งเตือนเจ้าของที่เป็น user เมื่อสัตว์เลี้ยงถูกลบ
  if (user.role === 'user') {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'PET_DELETED',
        title: 'ลบสัตว์เลี้ยง',
        message: `คุณได้ลบสัตว์เลี้ยง: ${pet.name || 'ไม่ระบุชื่อ'}`,
      },
    });
  }

  res.json({ ok: true });
});

// Link by Pet ID (hospital)
petsRouter.post('/link/by-petid', requireAuth(['hospital','admin']), async (req, res) => {
  const actor = (req as any).user as { id: string; role: 'hospital'|'admin' };
  const { petId } = req.body as { petId: string };
  if(!petId) return res.status(400).json({ error: 'petId required' });
  const pet = await prisma.pet.findUnique({ where: { petId }, include: { owner: true } });
  if(!pet) return res.status(404).json({ error: 'pet not found' });

  // แจ้งเตือนโรงพยาบาลเมื่อมีการเชื่อมสัตว์เลี้ยงเข้ากับโรงพยาบาล
  if (actor.role === 'hospital') {
    await prisma.notification.create({
      data: {
        userId: actor.id,
        type: 'PET_LINKED_HOSPITAL',
        title: 'เชื่อมสัตว์เลี้ยงกับโรงพยาบาล',
        message: `มีการเชื่อมสัตว์เลี้ยง ${pet.name || 'ไม่ระบุชื่อ'} (รหัส ${pet.petId}) ของผู้ใช้ ${(pet.owner && (pet.owner.name || pet.owner.email)) || ''} เข้ากับโรงพยาบาลของคุณ`,
      },
    });
  }
  res.json(pet);
});
