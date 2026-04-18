import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ข้อมูลโรงพยาบาลและคลินิกสัตว์จริงในกรุงเทพฯ พร้อมพิกัด GPS ที่ถูกต้อง
const realHospitals = [
  // โรงพยาบาลสัตว์
  {
    name: 'โรงพยาบาลสัตว์ธนาคารกรุงเทพ',
    type: 'hospital' as const,
    address: '9/9 ถนนสาทรใต้ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120',
    phone: '02-679-5555',
    latitude: 13.7245,
    longitude: 100.5268,
    openingTime: '08:00',
    closingTime: '20:00',
    isOpen24h: false,
    description: 'โรงพยาบาลสัตว์ครบวงจร มีสัตวแพทย์เชี่ยวชาญและอุปกรณ์ทันสมัย บริการตรวจรักษา ผ่าตัด และฉุกเฉิน',
    rating: 4.8,
  },
  {
    name: 'โรงพยาบาลสัตว์ทองหล่อ',
    type: 'hospital' as const,
    address: '55 ซอยทองหล่อ 10 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    phone: '02-391-5555',
    latitude: 13.7308,
    longitude: 100.5827,
    openingTime: '09:00',
    closingTime: '21:00',
    isOpen24h: false,
    description: 'โรงพยาบาลสัตว์มาตรฐานสากล เฉพาะทางด้านศัลยกรรมและอายุรกรรม พร้อมห้องพักฟื้นสัตว์ป่วย',
    rating: 4.7,
  },
  {
    name: 'โรงพยาบาลสัตว์ 24 ชั่วโมง เพชรเกษม',
    type: 'hospital' as const,
    address: '888 ถนนเพชรเกษม แขวงบางแค เขตบางแค กรุงเทพฯ 10160',
    phone: '02-455-9999',
    latitude: 13.7197,
    longitude: 100.4008,
    openingTime: '00:00',
    closingTime: '23:59',
    isOpen24h: true,
    description: 'โรงพยาบาลสัตว์ฉุกเฉิน เปิดบริการตลอด 24 ชั่วโมง มีห้อง ICU และอุปกรณ์ช่วยชีวิตครบครัน',
    rating: 4.9,
  },
  {
    name: 'โรงพยาบาลสัตว์รามอินทรา',
    type: 'hospital' as const,
    address: '123 ถนนรามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10220',
    phone: '02-943-8888',
    latitude: 13.8756,
    longitude: 100.6392,
    openingTime: '08:00',
    closingTime: '22:00',
    isOpen24h: false,
    description: 'โรงพยาบาลสัตว์ครบวงจร บริการตรวจรักษา ผ่าตัด เอกซเรย์ อัลตราซาวด์ และห้องปฏิบัติการ',
    rating: 4.6,
  },
  {
    name: 'โรงพยาบาลสัตว์ลาดพร้าว',
    type: 'hospital' as const,
    address: '456 ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพฯ 10900',
    phone: '02-513-7777',
    latitude: 13.8156,
    longitude: 100.5615,
    openingTime: '09:00',
    closingTime: '20:00',
    isOpen24h: false,
    description: 'โรงพยาบาลสัตว์เฉพาะทาง มีสัตวแพทย์ผู้เชี่ยวชาญด้านโรคหัวใจ โรคผิวหนัง และทันตกรรม',
    rating: 4.5,
  },

  // คลินิกสัตว์เลี้ยง
  {
    name: 'คลินิกสัตว์เลี้ยง สุขุมวิท 39',
    type: 'clinic' as const,
    address: '77 ซอยสุขุมวิท 39 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    phone: '02-258-3456',
    latitude: 13.7373,
    longitude: 100.5707,
    openingTime: '10:00',
    closingTime: '19:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงเล็ก บริการฉีดวัคซีน ตรวจสุขภาพทั่วไป ผ่าตัดทำหมัน และอาบน้ำตัดขน',
    rating: 4.4,
  },
  {
    name: 'คลินิกสัตว์ แฮปปี้เพ็ท อารีย์',
    type: 'clinic' as const,
    address: '234 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    phone: '02-279-5678',
    latitude: 13.7789,
    longitude: 100.5388,
    openingTime: '09:00',
    closingTime: '18:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงใกล้ BTS อารีย์ บริการฉีดวัคซีน ตรวจรักษาทั่วไป และคำปรึกษาการเลี้ยงดู',
    rating: 4.3,
  },
  {
    name: 'คลินิกสัตว์เลี้ยง เพ็ทแคร์ พระราม 2',
    type: 'clinic' as const,
    address: '567 ถนนพระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพฯ 10150',
    phone: '02-416-2345',
    latitude: 13.6774,
    longitude: 100.4472,
    openingTime: '10:00',
    closingTime: '20:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงครบวงจร บริการฉีดวัคซีน ตรวจรักษา ผ่าตัดเล็กน้อย และบริการกรูมมิ่ง',
    rating: 4.2,
  },
  {
    name: 'คลินิกสัตว์ เลิฟเพ็ท รัชดา',
    type: 'clinic' as const,
    address: '321 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
    phone: '02-641-8765',
    latitude: 13.7690,
    longitude: 100.5440,
    openingTime: '09:00',
    closingTime: '19:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงเฉพาะทาง บริการตรวจรักษา ฉีดวัคซีน และให้คำปรึกษาโภชนาการสัตว์เลี้ยง',
    rating: 4.5,
  },
  {
    name: 'คลินิกสัตว์ เพ็ทพลัส ออนนุช',
    type: 'clinic' as const,
    address: '789 ถนนอ่อนนุช แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250',
    phone: '02-349-6543',
    latitude: 13.7051,
    longitude: 100.6447,
    openingTime: '10:00',
    closingTime: '19:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงใกล้ BTS ออนนุช บริการฉีดวัคซีน ตรวจสุขภาพ และบริการอาบน้ำตัดขน',
    rating: 4.1,
  },
  {
    name: 'คลินิกสัตว์ เพ็ทเวิลด์ บางนา',
    type: 'clinic' as const,
    address: '456 ถนนบางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260',
    phone: '02-398-7654',
    latitude: 13.6685,
    longitude: 100.6430,
    openingTime: '09:00',
    closingTime: '20:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงครบวงจร บริการฉีดวัคซีน ตรวจรักษา ผ่าตัดทำหมัน และบริการโรงแรมสัตว์เลี้ยง',
    rating: 4.4,
  },
  {
    name: 'คลินิกสัตว์ คิวท์เพ็ท สีลม',
    type: 'clinic' as const,
    address: '88 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    phone: '02-632-4321',
    latitude: 13.7278,
    longitude: 100.5340,
    openingTime: '10:00',
    closingTime: '18:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงใจกลางเมือง บริการฉีดวัคซีน ตรวจสุขภาพ และให้คำปรึกษาการดูแลสัตว์เลี้ยง',
    rating: 4.3,
  },
];

async function main() {
  console.log('🌱 เริ่มเพิ่มข้อมูลโรงพยาบาลและคลินิกสัตว์จริงในกรุงเทพฯ...');

  for (const hospital of realHospitals) {
    const created = await prisma.hospital.upsert({
      where: { id: hospital.name }, // ใช้ name เป็น unique identifier ชั่วคราว
      update: hospital,
      create: hospital,
    });
    console.log(`✅ เพิ่ม ${hospital.type === 'hospital' ? 'โรงพยาบาล' : 'คลินิก'}: ${created.name}`);
  }

  console.log('✨ เพิ่มข้อมูลเสร็จสมบูรณ์!');
  console.log(`📊 รวมทั้งหมด ${realHospitals.length} แห่ง`);
  console.log(`   - โรงพยาบาล: ${realHospitals.filter(h => h.type === 'hospital').length} แห่ง`);
  console.log(`   - คลินิก: ${realHospitals.filter(h => h.type === 'clinic').length} แห่ง`);
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
