import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(){
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pup.local' },
    update: {},
    create: { email: 'admin@pup.local', password_hash: await bcrypt.hash('admin123', 10), name: 'Admin', role: 'admin' }
  });
  const hospitalUser = await prisma.user.upsert({
    where: { email: 'hospital@pup.local' },
    update: {},
    create: { email: 'hospital@pup.local', password_hash: await bcrypt.hash('hospital123', 10), name: 'Hospital', role: 'hospital' }
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@pup.local' },
    update: {},
    create: { email: 'user@pup.local', password_hash: await bcrypt.hash('user123', 10), name: 'User', role: 'user' }
  });

  const hospital = await prisma.hospital.create({
    data: { name: 'โรงพยาบาลสัตว์ ตัวอย่าง', address: 'Bangkok', isOpen24h: true }
  });

  const pet = await prisma.pet.create({
    data: { ownerId: user.id, petId: 'P-123456', name: 'ชิบะ', type: 'dog', breed: 'Shiba', age: 3, weight: 10.5, gender: 'male' }
  });

  await prisma.appointment.create({
    data: { petId: pet.id, hospitalId: hospital.id, date: '2025-11-20', time: '14:00', status: 'pending', reason: 'ตรวจสุขภาพ' }
  });

  await prisma.vaccination.create({
    data: { petId: pet.id, hospitalId: hospital.id, vaccineName: 'Rabies', date: '2025-01-10', nextDate: '2026-01-10' }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
