export interface Pet {
  id: string;
  petId: string; // shareable Pet ID
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  image: string;
  medicalNotes: string;
}

export interface Hospital {
  id: string;
  name: string;
  type?: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  isOpen24h: boolean;
  description: string;
  image: string;
  rating: number;
  specialties: string[];
  distance: number;
  mapUrl?: string;
}

export interface Appointment {
  id: string;
  petId?: string; // link to Pet via Pet ID (optional for backward compatibility)
  petName: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
}

export interface Vaccination {
  id: string;
  petName: string;
  vaccineName: string;
  date: string;
  nextDate: string;
  hospitalName: string;
}

export const mockPets: Pet[] = [
  {
    id: '1',
    petId: 'P-000001',
    name: 'ชิบะ',
    type: 'dog',
    breed: 'Shiba Inu',
    age: 3,
    weight: 10.5,
    gender: 'male',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
    medicalNotes: 'แพ้อาหารทะเล, ต้องฉีดวัคซีนป้องกันพิษสุนัขบ้าทุกปี'
  },
  {
    id: '2',
    petId: 'P-000002',
    name: 'มิว',
    type: 'cat',
    breed: 'Scottish Fold',
    age: 2,
    weight: 4.2,
    gender: 'female',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    medicalNotes: 'เคยเป็นไข้หวัดแมว, ควรตรวจสุขภาพทุก 6 เดือน'
  },
  {
    id: '3',
    petId: 'P-000003',
    name: 'โกลด์',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 5,
    weight: 28.0,
    gender: 'male',
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
    medicalNotes: 'มีปัญหาข้อเข่า, ควรออกกำลังกายสม่ำเสมอ'
  }
];

export const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'โรงพยาบาลสัตว์ ธนาเพชร',
    address: '123 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    phone: '02-123-4567',
    latitude: 13.7250,
    longitude: 100.5478,
    openingTime: '08:00',
    closingTime: '20:00',
    isOpen24h: false,
    description: 'โรงพยาบาลสัตว์ครบวงจร มีสัตวแพทย์เชี่ยวชาญด้านต่างๆ พร้อมอุปกรณ์ทันสมัย',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600',
    rating: 4.8,
    specialties: ['ศัลยกรรม', 'อายุรกรรม', 'ทันตกรรม', 'เอกซเรย์'],
    distance: 2.5
  },
  {
    id: '2',
    name: 'คลินิกสัตว์เลี้ยง เพ็ทแคร์',
    address: '456 ถนนสุขุมวิท แขวงพระโขนง เขตพระโขนง กรุงเทพฯ 10110',
    phone: '02-234-5678',
    latitude: 13.7140,
    longitude: 100.6030,
    openingTime: '09:00',
    closingTime: '18:00',
    isOpen24h: false,
    description: 'คลินิกเฉพาะทางด้านสัตว์เล็ก ให้บริการฉีดวัคซีน ตรวจสุขภาพ',
    image: 'https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=600',
    rating: 4.5,
    specialties: ['ฉีดวัคซีน', 'ตรวจสุขภาพ', 'ผ่าตัดทำหมัน'],
    distance: 5.2
  },
  {
    id: '3',
    name: 'โรงพยาบาลสัตว์ 24 ชั่วโมง เพ็ทเซนเตอร์',
    address: '789 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    phone: '02-345-6789',
    latitude: 13.7650,
    longitude: 100.5750,
    openingTime: '00:00',
    closingTime: '23:59',
    isOpen24h: true,
    description: 'โรงพยาบาลสัตว์ฉุกเฉิน เปิดให้บริการตลอด 24 ชั่วโมง',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600',
    rating: 4.9,
    specialties: ['ฉุกเฉิน 24/7', 'ICU', 'เอกซเรย์', 'อัลตราซาวด์'],
    distance: 8.7
  },
  {
    id: '4',
    name: 'คลินิกสัตว์เลี้ยงเล็ก แฮปปี้เพ็ท',
    address: '321 ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพฯ 10900',
    phone: '02-456-7890',
    latitude: 13.8150,
    longitude: 100.5620,
    openingTime: '10:00',
    closingTime: '19:00',
    isOpen24h: false,
    description: 'คลินิกสัตว์เลี้ยงเล็กเฉพาะทาง บริการอาบน้ำตัดขน',
    image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=600',
    rating: 4.3,
    specialties: ['อาบน้ำตัดขน', 'ฉีดวัคซีน', 'ตรวจสุขภาพทั่วไป'],
    distance: 12.3
  },
  {
    id: '5',
    name: 'โรงพยาบาลสัตว์ชั้นนำ เวทแคร์',
    address: '567 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
    phone: '02-567-8901',
    latitude: 13.7690,
    longitude: 100.5440,
    openingTime: '08:00',
    closingTime: '22:00',
    isOpen24h: false,
    description: 'โรงพยาบาลสัตว์มาตรฐานสากล พร้อมห้องผ่าตัดที่ทันสมัย',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600',
    rating: 4.7,
    specialties: ['ศัลยกรรมกระดูก', 'โรคหัวใจ', 'โรคผิวหนัง', 'ตรวจเลือด'],
    distance: 6.8
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    petName: 'ชิบะ',
    hospitalName: 'โรงพยาบาลสัตว์ ธนาเพชร',
    date: '2024-11-20',
    time: '14:00',
    status: 'confirmed',
    reason: 'ตรวจสุขภาพประจำปี'
  },
  {
    id: '2',
    petName: 'มิว',
    hospitalName: 'คลินิกสัตว์เลี้ยง เพ็ทแคร์',
    date: '2024-11-22',
    time: '10:30',
    status: 'pending',
    reason: 'ฉีดวัคซีนป้องกันโรค'
  },
  {
    id: '3',
    petName: 'โกลด์',
    hospitalName: 'โรงพยาบาลสัตว์ชั้นนำ เวทแคร์',
    date: '2024-11-18',
    time: '16:00',
    status: 'completed',
    reason: 'ตรวจรักษาข้อเข่า'
  }
];

export const mockVaccinations: Vaccination[] = [
  {
    id: '1',
    petName: 'ชิบะ',
    vaccineName: 'วัคซีนป้องกันพิษสุนัขบ้า',
    date: '2024-01-15',
    nextDate: '2025-01-15',
    hospitalName: 'โรงพยาบาลสัตว์ ธนาเพชร'
  },
  {
    id: '2',
    petName: 'มิว',
    vaccineName: 'วัคซีน 3 in 1',
    date: '2024-06-10',
    nextDate: '2024-12-10',
    hospitalName: 'คลินิกสัตว์เลี้ยง เพ็ทแคร์'
  },
  {
    id: '3',
    petName: 'โกลด์',
    vaccineName: 'วัคซีนป้องกันไข้หวัดสุนัข',
    date: '2024-03-20',
    nextDate: '2025-03-20',
    hospitalName: 'โรงพยาบาลสัตว์ชั้นนำ เวทแคร์'
  }
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'สวัสดีค่ะ! ฉันคือ AI คุณหมอเสมือนของ PUP 🐾 ยินดีให้คำปรึกษาเกี่ยวกับสุขภาพสัตว์เลี้ยงของคุณค่ะ มีอาการอะไรที่อยากปรึกษาไหมคะ?',
    timestamp: new Date()
  }
];
