import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const hospitalsRouter = Router();

// Haversine formula to calculate distance between two coordinates in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

hospitalsRouter.get('/', async (_req, res) => {
  const hospitals = await prisma.hospital.findMany();

  const normalized = hospitals.map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type,
    address: h.address ?? null,
    phone: h.phone ?? null,
    latitude: h.latitude ?? null,
    longitude: h.longitude ?? null,
    openingTime: h.openingTime ?? null,
    closingTime: h.closingTime ?? null,
    isOpen24h: h.isOpen24h ?? false,
    description: h.description ?? null,
    image:
      h.image ??
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
    rating: h.rating ?? null,
    mapUrl: h.mapUrl ?? null,
  }));

  res.json(normalized);
});

// GET /hospitals/nearby - ค้นหาโรงพยาบาล/คลินิกใกล้เคียงตามพิกัด GPS (จาก database)
hospitalsRouter.get('/nearby', async (req, res) => {
  const { latitude, longitude, radius, type } = req.query;

  // Validate required parameters
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);
  const radiusKm = radius ? parseFloat(radius as string) : 20; // Default 20km

  if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
    return res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
  }

  // Fetch all hospitals/clinics with coordinates
  const allHospitals = await prisma.hospital.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      ...(type && (type === 'hospital' || type === 'clinic') ? { type: type as any } : {}),
    },
  });

  // Calculate distance and filter by radius
  const hospitalsWithDistance = allHospitals
    .map((h) => {
      const distance = haversineDistance(lat, lng, h.latitude!, h.longitude!);
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        address: h.address ?? null,
        phone: h.phone ?? null,
        latitude: h.latitude,
        longitude: h.longitude,
        openingTime: h.openingTime ?? null,
        closingTime: h.closingTime ?? null,
        isOpen24h: h.isOpen24h ?? false,
        description: h.description ?? null,
        image: h.image ?? "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
        rating: h.rating ?? null,
        mapUrl: h.mapUrl ?? null,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      };
    })
    .filter((h) => h.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  res.json(hospitalsWithDistance);
});

// GET /hospitals/search-nearby - ค้นหาโรงพยาบาล/คลินิกสัตว์จริงจาก OpenStreetMap ตามตำแหน่ง GPS
hospitalsRouter.get('/search-nearby', async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);
  const radiusMeters = radius ? parseFloat(radius as string) * 1000 : 20000; // Convert km to meters

  if (isNaN(lat) || isNaN(lng) || isNaN(radiusMeters)) {
    return res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
  }

  try {
    // Query Overpass API for veterinary clinics and animal hospitals
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="veterinary"](around:${radiusMeters},${lat},${lng});
        way["amenity"="veterinary"](around:${radiusMeters},${lat},${lng});
        relation["amenity"="veterinary"](around:${radiusMeters},${lat},${lng});
        node["healthcare"="veterinary"](around:${radiusMeters},${lat},${lng});
        way["healthcare"="veterinary"](around:${radiusMeters},${lat},${lng});
        relation["healthcare"="veterinary"](around:${radiusMeters},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json() as { elements: Array<{
      type: string;
      id: number;
      lat?: number;
      lon?: number;
      tags?: {
        name?: string;
        'name:th'?: string;
        'name:en'?: string;
        amenity?: string;
        healthcare?: string;
        phone?: string;
        'contact:phone'?: string;
        opening_hours?: string;
        website?: string;
        'addr:street'?: string;
        'addr:housenumber'?: string;
        'addr:district'?: string;
        'addr:province'?: string;
      };
    }> };

    // Process and format results
    const results = data.elements
      .filter((element) => element.lat && element.lon && element.tags?.name)
      .map((element) => {
        const tags = element.tags!;
        const distance = haversineDistance(lat, lng, element.lat!, element.lon!);
        
        // Build address from OSM tags
        const addressParts = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:district'],
          tags['addr:province'],
        ].filter(Boolean);
        const address = addressParts.length > 0 ? addressParts.join(' ') : null;

        // Determine type (hospital vs clinic) - simplified logic
        const name = tags['name:th'] || tags.name || tags['name:en'] || 'Unknown';
        const isHospital = name.toLowerCase().includes('โรงพยาบาล') || 
                          name.toLowerCase().includes('hospital');
        
        return {
          id: `osm-${element.id}`,
          name,
          type: isHospital ? 'hospital' : 'clinic',
          address,
          phone: tags.phone || tags['contact:phone'] || null,
          latitude: element.lat,
          longitude: element.lon,
          openingTime: null,
          closingTime: null,
          isOpen24h: tags.opening_hours === '24/7',
          description: `${isHospital ? 'โรงพยาบาลสัตว์' : 'คลินิกสัตว์เลี้ยง'} (ข้อมูลจาก OpenStreetMap)`,
          image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
          rating: null,
          mapUrl: tags.website || null,
          distance: Math.round(distance * 10) / 10,
          source: 'openstreetmap',
        };
      })
      .sort((a, b) => a.distance - b.distance);

    res.json(results);
  } catch (error: any) {
    console.error('Error fetching from Overpass API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch nearby veterinary facilities',
      message: error.message 
    });
  }
});

// ข้อมูลโรงพยาบาลของบัญชีปัจจุบัน (role: hospital/admin)
hospitalsRouter.get('/me', requireAuth(['hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string; role: 'user'|'hospital'|'admin' };
  const hospital = await prisma.hospital.findUnique({ where: { id: user.id } });
  if (!hospital) return res.status(404).json({ error: 'hospital profile not found' });
  res.json(hospital);
});

// อัปเดตโปรไฟล์โรงพยาบาลของบัญชีปัจจุบัน
hospitalsRouter.put('/me', requireAuth(['hospital','admin']), async (req, res) => {
  const user = (req as any).user as { id: string; role: 'user'|'hospital'|'admin' };
  const { name, address, phone, latitude, longitude, openingTime, closingTime, isOpen24h, description, image, mapUrl } = req.body as {
    name?: string;
    address?: string | null;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    openingTime?: string | null;
    closingTime?: string | null;
    isOpen24h?: boolean | null;
    description?: string | null;
    image?: string | null;
    mapUrl?: string | null;
  };

  try {
    const hospital = await prisma.hospital.update({
      where: { id: user.id },
      data: {
        name: name,
        address,
        phone,
        latitude,
        longitude,
        openingTime,
        closingTime,
        isOpen24h: isOpen24h ?? undefined,
        description,
        image,
        mapUrl,
      },
    });
    // แจ้งเตือนเจ้าของบัญชีโรงพยาบาลเมื่อมีการแก้ไขข้อมูลโรงพยาบาลของตนเอง
    if (user.role === 'hospital') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'HOSPITAL_PROFILE_UPDATED',
          title: 'แก้ไขข้อมูลโรงพยาบาล',
          message: `คุณได้อัปเดตข้อมูลโรงพยาบาล${hospital.name ? ` (${hospital.name})` : ''}`,
        },
      });
    }

    res.json(hospital);
  } catch (e) {
    return res.status(400).json({ error: 'unable to update hospital profile' });
  }
});

// Admin: อัปเดตโปรไฟล์โรงพยาบาลใด ๆ ตาม id
hospitalsRouter.put('/:id', requireAuth(['admin']), async (req, res) => {
  const { name, address, phone, latitude, longitude, openingTime, closingTime, isOpen24h, description, image, mapUrl } = req.body as {
    name?: string;
    address?: string | null;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    openingTime?: string | null;
    closingTime?: string | null;
    isOpen24h?: boolean | null;
    description?: string | null;
    image?: string | null;
    mapUrl?: string | null;
  };

  try {
    const admin = (req as any).user as { id: string; role: 'admin' };
    const hospital = await prisma.hospital.update({
      where: { id: req.params.id },
      data: {
        name,
        address,
        phone,
        latitude,
        longitude,
        openingTime,
        closingTime,
        isOpen24h: isOpen24h ?? undefined,
        description,
        image,
        mapUrl,
      },
    });

    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_HOSPITAL',
        details: `แก้ไขข้อมูลโรงพยาบาล id=${req.params.id}`,
      },
    });

    res.json(hospital);
  } catch (e) {
    return res.status(400).json({ error: 'unable to update hospital' });
  }
});

hospitalsRouter.get('/:id', async (req, res) => {
  const hospital = await prisma.hospital.findUnique({ where: { id: req.params.id } });
  if(!hospital) return res.status(404).json({ error: 'not found' });
  res.json(hospital);
});

// Admin: ลบโรงพยาบาลตาม id พร้อมข้อมูลที่เกี่ยวข้อง (นัดหมาย/วัคซีน)
hospitalsRouter.delete('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const admin = (req as any).user as { id: string; role: 'admin' };
    const targetId = req.params.id;

    // ตรวจสอบว่ามี user ที่เป็นบัญชีโรงพยาบาลผูกกับ id นี้หรือไม่
    const hospitalUser = await prisma.user.findUnique({ where: { id: targetId } });

    const tx: any[] = [];

    // ลบข้อมูลที่อ้างอิง hospital ก่อน
    tx.push(prisma.appointment.deleteMany({ where: { hospitalId: targetId } }));
    tx.push(prisma.vaccination.deleteMany({ where: { hospitalId: targetId } }));

    // ถ้ามี user role=hospital ที่ใช้ id นี้ ให้ลบข้อมูลที่ผูกกับ user ด้วย
    if (hospitalUser && hospitalUser.role === 'hospital') {
      tx.push(prisma.notification.deleteMany({ where: { userId: targetId } }));
      // เผื่อมีสัตว์เลี้ยงผูกกับบัญชีโรงพยาบาล (ส่วนใหญ่จะไม่มี แต่กันไว้)
      tx.push(prisma.pet.deleteMany({ where: { ownerId: targetId } }));
      tx.push(prisma.user.delete({ where: { id: targetId } }));
    }

    // ลบ hospital record ท้ายสุด
    tx.push(prisma.hospital.delete({ where: { id: targetId } }));

    await prisma.$transaction(tx);

    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_HOSPITAL',
        details: `ลบข้อมูลโรงพยาบาล id=${targetId}`,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Error deleting hospital', req.params.id, e);
    return res.status(400).json({ error: 'unable to delete hospital (it may have related data)' });
  }
});
