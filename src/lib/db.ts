import { supabase, createIsolatedClient } from './supabase';

export type Role = 'user' | 'hospital' | 'admin';
export type HospitalType = 'hospital' | 'clinic';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface DbUser {
  id: string;
  supabase_uid: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  role: Role;
  createdAt: string;
}

export interface DbPet {
  id: string;
  petId: string;
  ownerId: string;
  name: string;
  type: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  gender?: string | null;
  image?: string | null;
  medicalNotes?: string | null;
  createdAt: string;
}

export interface DbHospital {
  id: string;
  name: string;
  type: HospitalType;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingTime?: string | null;
  closingTime?: string | null;
  isOpen24h: boolean;
  description?: string | null;
  rating?: number | null;
  image?: string | null;
  mapUrl?: string | null;
}

export interface DbAppointment {
  id: string;
  petId: string;
  hospitalId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason?: string | null;
  createdAt: string;
  pet?: DbPet & { owner?: DbUser };
  hospital?: DbHospital;
}

export interface DbVaccination {
  id: string;
  petId: string;
  hospitalId: string;
  vaccineName: string;
  date: string;
  nextDate: string;
  createdAt: string;
  pet?: DbPet;
  hospital?: DbHospital;
}

export interface DbMedicalRecord {
  id: string;
  appointmentId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
  appointment?: DbAppointment;
}

export interface DbNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DbActivityLog {
  id: string;
  adminId: string;
  action: string;
  details?: string | null;
  createdAt: string;
  admin?: { name: string; email: string };
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<DbUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('User').select('*').eq('supabase_uid', user.id).single();
  return data as DbUser | null;
}

export async function completeProfile(name: string, role: Role = 'user'): Promise<DbUser> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase.from('User').select('*').eq('supabase_uid', user.id).single();
  if (existing) return existing as DbUser;

  const { data, error } = await supabase.from('User').insert({
    supabase_uid: user.id,
    email: user.email!,
    name: name.trim(),
    role,
  }).select().single();
  if (error) throw new Error(error.message);

  if (role === 'hospital') {
    await supabase.from('Hospital').insert({ id: (data as DbUser).id, name: name.trim() });
  }

  return data as DbUser;
}

// ── USERS ─────────────────────────────────────────────────────────────────────

export async function updateMyProfile(updates: { name?: string; phone?: string | null; address?: string | null }) {
  const profile = await getMyProfile();
  if (!profile) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('User').update(updates).eq('id', profile.id).select().single();
  if (error) throw new Error(error.message);
  await addNotification(profile.id, 'PROFILE_UPDATED', 'แก้ไขข้อมูลส่วนตัว', 'คุณได้อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
  return data as DbUser;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase.from('User').select('id,email,name,role,createdAt').eq('role', 'user').order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbUser[];
}

export async function getAllAdmins(): Promise<DbUser[]> {
  const { data, error } = await supabase.from('User').select('id,email,name,role,createdAt').eq('role', 'admin').order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbUser[];
}

export async function getAllHospitalUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase.from('User').select('id,email,name,role,createdAt').eq('role', 'hospital').order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbUser[];
}

// ── PETS ──────────────────────────────────────────────────────────────────────

function generatePetId(): string {
  return `P-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function getMyPets(): Promise<DbPet[]> {
  const profile = await getMyProfile();
  if (!profile) return [];
  const { data, error } = await supabase.from('Pet').select('*').eq('ownerId', profile.id).order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbPet[];
}

export async function getAllPets(ownerId?: string): Promise<DbPet[]> {
  let query = supabase.from('Pet').select('*').order('createdAt', { ascending: false });
  if (ownerId) query = query.eq('ownerId', ownerId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as DbPet[];
}

export async function createPet(pet: Omit<DbPet, 'id' | 'petId' | 'ownerId' | 'createdAt'>): Promise<DbPet> {
  const profile = await getMyProfile();
  if (!profile) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('Pet').insert({
    ...pet,
    ownerId: profile.id,
    petId: generatePetId(),
  }).select().single();
  if (error) throw new Error(error.message);
  await addNotification(profile.id, 'PET_CREATED', 'สร้างสัตว์เลี้ยงใหม่', `คุณได้เพิ่มสัตว์เลี้ยงใหม่: ${pet.name} (รหัส ${(data as DbPet).petId})`);
  return data as DbPet;
}

export async function updatePet(id: string, updates: Partial<Omit<DbPet, 'id' | 'petId' | 'ownerId' | 'createdAt'>>): Promise<DbPet> {
  const profile = await getMyProfile();
  if (!profile) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('Pet').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  if (profile.role === 'user') {
    await addNotification(profile.id, 'PET_UPDATED', 'แก้ไขข้อมูลสัตว์เลี้ยง', `คุณได้แก้ไขข้อมูลของสัตว์เลี้ยง: ${updates.name ?? ''}`);
  }
  return data as DbPet;
}

export async function deletePet(id: string): Promise<void> {
  const profile = await getMyProfile();
  if (!profile) throw new Error('Not authenticated');
  const { data: pet } = await supabase.from('Pet').select('name').eq('id', id).single();
  const { error } = await supabase.from('Pet').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (profile.role === 'user' && pet) {
    await addNotification(profile.id, 'PET_DELETED', 'ลบสัตว์เลี้ยง', `คุณได้ลบสัตว์เลี้ยง: ${(pet as any).name ?? ''}`);
  }
}

export async function findPetByPetId(petId: string): Promise<(DbPet & { owner: DbUser }) | null> {
  const { data, error } = await supabase.from('Pet').select('*, owner:User!Pet_ownerId_fkey(*)').eq('petId', petId).single();
  if (error) return null;
  return data as any;
}

// ── HOSPITALS ─────────────────────────────────────────────────────────────────

export async function getHospitals(): Promise<DbHospital[]> {
  const { data, error } = await supabase.from('Hospital').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map(h => ({
    ...h,
    image: h.image ?? 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600',
    isOpen24h: h.isOpen24h ?? false,
  })) as DbHospital[];
}

export async function getHospitalById(id: string): Promise<DbHospital | null> {
  const { data } = await supabase.from('Hospital').select('*').eq('id', id).single();
  return data as DbHospital | null;
}

export async function getMyHospital(): Promise<DbHospital | null> {
  const profile = await getMyProfile();
  if (!profile) return null;
  const { data } = await supabase.from('Hospital').select('*').eq('id', profile.id).single();
  return data as DbHospital | null;
}

export async function updateMyHospital(updates: Partial<Omit<DbHospital, 'id'>>): Promise<DbHospital> {
  const profile = await getMyProfile();
  if (!profile) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('Hospital').update(updates).eq('id', profile.id).select().single();
  if (error) throw new Error(error.message);
  await addNotification(profile.id, 'HOSPITAL_PROFILE_UPDATED', 'แก้ไขข้อมูลโรงพยาบาล', `คุณได้อัปเดตข้อมูลโรงพยาบาล`);
  return data as DbHospital;
}

export async function updateHospital(id: string, updates: Partial<Omit<DbHospital, 'id'>>): Promise<DbHospital> {
  const { data, error } = await supabase.from('Hospital').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as DbHospital;
}

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<DbAppointment[]> {
  const { data, error } = await supabase
    .from('Appointment')
    .select('*, pet:Pet(*, owner:User!Pet_ownerId_fkey(*)), hospital:Hospital(*)')
    .order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbAppointment[];
}

export async function createAppointment(appt: {
  petId: string;
  hospitalId: string;
  date: string;
  time: string;
  reason?: string;
}): Promise<DbAppointment> {
  const profile = await getMyProfile();
  if (!profile) throw new Error('Not authenticated');
  const status: AppointmentStatus = profile.role === 'hospital' ? 'confirmed' : 'pending';
  const { data, error } = await supabase.from('Appointment').insert({ ...appt, status }).select().single();
  if (error) throw new Error(error.message);

  const [petRes, hospRes] = await Promise.all([
    supabase.from('Pet').select('name, ownerId, owner:User!Pet_ownerId_fkey(role)').eq('id', appt.petId).single(),
    supabase.from('Hospital').select('name').eq('id', appt.hospitalId).single(),
  ]);
  const pet = petRes.data as any;
  const hosp = hospRes.data as any;

  if (pet && pet.owner?.role === 'user') {
    await addNotification(pet.ownerId, 'APPOINTMENT_CREATED', 'มีนัดหมายสำหรับสัตว์เลี้ยง',
      `สัตว์เลี้ยงของคุณ (${pet.name}) มีนัดที่${hosp?.name ? ` ${hosp.name}` : ''} วันที่ ${appt.date} เวลา ${appt.time}`);
  }
  await addNotification(appt.hospitalId, 'APPOINTMENT_CREATED_HOSPITAL', 'มีนัดหมายใหม่ในระบบ',
    `มีการสร้างนัดหมายสำหรับสัตว์เลี้ยง ${pet?.name ?? ''} วันที่ ${appt.date} เวลา ${appt.time}`);

  return data as DbAppointment;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<DbAppointment> {
  const { data, error } = await supabase.from('Appointment').update({ status }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as DbAppointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('Appointment').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── VACCINATIONS ──────────────────────────────────────────────────────────────

export async function getVaccinations(): Promise<DbVaccination[]> {
  const { data, error } = await supabase
    .from('Vaccination')
    .select('*, pet:Pet(*), hospital:Hospital(*)')
    .order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbVaccination[];
}

export async function createVaccination(vac: {
  petId: string;
  hospitalId: string;
  vaccineName: string;
  date: string;
  nextDate: string;
}): Promise<DbVaccination> {
  const { data, error } = await supabase.from('Vaccination').insert(vac).select().single();
  if (error) throw new Error(error.message);
  return data as DbVaccination;
}

export async function deleteVaccination(id: string): Promise<void> {
  const { error } = await supabase.from('Vaccination').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── MEDICAL RECORDS ───────────────────────────────────────────────────────────

export async function getMedicalRecords(appointmentId?: string): Promise<DbMedicalRecord[]> {
  let query = supabase.from('MedicalRecord').select('*').order('createdAt', { ascending: false });
  if (appointmentId) query = query.eq('appointmentId', appointmentId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as DbMedicalRecord[];
}

export async function createMedicalRecord(record: {
  appointmentId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
}): Promise<DbMedicalRecord> {
  const { data, error } = await supabase.from('MedicalRecord').insert(record).select().single();
  if (error) throw new Error(error.message);
  return data as DbMedicalRecord;
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

async function addNotification(userId: string, type: string, title: string, message: string) {
  await supabase.from('Notification').insert({ userId, type, title, message });
}

export async function getMyNotifications(): Promise<DbNotification[]> {
  const profile = await getMyProfile();
  if (!profile) return [];
  const { data, error } = await supabase
    .from('Notification')
    .select('*')
    .eq('userId', profile.id)
    .order('createdAt', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as DbNotification[];
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  const profile = await getMyProfile();
  if (!profile) return;
  let query = supabase.from('Notification').update({ read: true }).eq('userId', profile.id);
  if (ids && ids.length > 0) query = query.in('id', ids);
  await query;
}

// ── ACTIVITY LOGS ─────────────────────────────────────────────────────────────

export async function getActivityLogs(): Promise<DbActivityLog[]> {
  const { data, error } = await supabase
    .from('ActivityLog')
    .select('*, admin:User!ActivityLog_adminId_fkey(name,email)')
    .order('createdAt', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as DbActivityLog[];
}

export async function addActivityLog(adminId: string, action: string, details?: string) {
  await supabase.from('ActivityLog').insert({ adminId, action, details });
}

// ── ADMIN USER DETAIL ─────────────────────────────────────────────────────────

export async function getUserDetail(userId: string) {
  const { data: user } = await supabase.from('User').select('id,email,name,createdAt').eq('id', userId).single();
  if (!user) return null;
  const { data: pets } = await supabase.from('Pet').select('id,petId,name,type,breed,age,weight,gender,medicalNotes').eq('ownerId', userId);
  const petIds = (pets ?? []).map((p: any) => p.id);
  const { data: appointments } = petIds.length > 0
    ? await supabase.from('Appointment').select('id,date,time,status,reason,petId,hospitalId,hospital:Hospital(id,name)').in('petId', petIds)
    : { data: [] };
  const { data: vaccinations } = petIds.length > 0
    ? await supabase.from('Vaccination').select('id,vaccineName,date,nextDate,petId,hospital:Hospital(id,name)').in('petId', petIds)
    : { data: [] };

  return {
    ...user,
    pets: (pets ?? []).map((p: any) => ({
      ...p,
      appointments: (appointments ?? []).filter((a: any) => a.petId === p.id),
      vaccinations: (vaccinations ?? []).filter((v: any) => v.petId === p.id),
    })),
  };
}

export async function deleteUserDb(userId: string) {
  const { error } = await supabase.from('User').delete().eq('id', userId);
  if (error) throw new Error(error.message);
}

// ── USER ACTIVITY ─────────────────────────────────────────────────────────────

export async function getUsersActivity() {
  const { data: users, error } = await supabase
    .from('User')
    .select('id,email,name,createdAt')
    .eq('role', 'user')
    .order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);

  const userIds = (users ?? []).map((u: any) => u.id);
  if (userIds.length === 0) return [];

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: sessions } = await supabase
    .from('UserSession')
    .select('userId,lastActiveAt,logoutAt,loginAt')
    .in('userId', userIds)
    .order('loginAt', { ascending: false });

  return (users ?? []).map((u: any) => {
    const userSessions = (sessions ?? []).filter((s: any) => s.userId === u.id);
    const latest = userSessions[0] ?? null;
    const isActive = latest ? (!latest.logoutAt && latest.lastActiveAt >= fiveMinAgo) : false;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      isActive,
      lastActiveAt: latest?.lastActiveAt ?? null,
      lastLoginAt: latest?.loginAt ?? null,
    };
  });
}

export async function getUserActivityDetail(userId: string) {
  const { data: user } = await supabase.from('User').select('id,email,name,createdAt').eq('id', userId).single();
  if (!user) return null;
  const { data: sessions } = await supabase
    .from('UserSession')
    .select('id,loginAt,lastActiveAt,logoutAt,ipAddress,userAgent')
    .eq('userId', userId)
    .order('loginAt', { ascending: false });
  return { ...(user as any), sessions: sessions ?? [] };
}

// ── ADMIN USER CREATION ───────────────────────────────────────────────────────

export async function createUserWithRole(email: string, password: string, name: string, role: Role): Promise<void> {
  const client = createIsolatedClient();

  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('ไม่สามารถสร้างบัญชีได้');

  const { error: insertError } = await supabase.from('User').insert({
    supabase_uid: data.user.id,
    email,
    name: name.trim(),
    role,
  });
  if (insertError) throw new Error(insertError.message);

  if (role === 'hospital') {
    const { data: userRow } = await supabase.from('User').select('id').eq('supabase_uid', data.user.id).single();
    if (userRow) {
      await supabase.from('Hospital').insert({ id: (userRow as any).id, name: name.trim() });
    }
  }
}
