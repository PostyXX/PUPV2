import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, MapPin, Syringe } from "lucide-react";
import { Appointment, Vaccination, Pet } from "@/data/mockData";
import { getRole, getUserId } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { getAppointments, getVaccinations, getMyPets, getAllPets, createAppointment, deleteAppointment as dbDeleteAppointment, updateAppointmentStatus, createVaccination, deleteVaccination as dbDeleteVaccination, getMedicalRecords, createMedicalRecord, findPetByPetId, getMyProfile } from "@/lib/db";

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [isNewVacOpen, setIsNewVacOpen] = useState(false);
  const role = getRole();
  const currentUserId = getUserId();
  const { toast } = useToast();
  const { t } = useI18n();

  const APPT_KEY = "pup_appointments";
  const VACC_KEY = "pup_vaccinations";
  const PETS_KEY = "pup_pets";
  const RECS_KEY = "pup_records";

  // New appointment form
  const [petName, setPetName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [linkedUserId, setLinkedUserId] = useState("");
  const [linkedPetId, setLinkedPetId] = useState("");

  // New vaccination form
  const [vacPetName, setVacPetName] = useState("");
  const [vaccineName, setVaccineName] = useState("");
  const [vacDate, setVacDate] = useState("");
  const [vacNextDate, setVacNextDate] = useState("");
  const [vacHospitalName, setVacHospitalName] = useState("");
  const [vacLinkedPetId, setVacLinkedPetId] = useState("");

  // Medical records per appointment (hospital role)
  type MedicalRecord = { id: string; appointmentId: string; symptoms: string; diagnosis: string; treatment: string; createdAt: string };
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordAppId, setRecordAppId] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isRecOpen, setIsRecOpen] = useState(false);
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [vaccinationSearch, setVaccinationSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [apptData, vacData, recs, petData] = await Promise.all([
          getAppointments(),
          getVaccinations(),
          getMedicalRecords(),
          role === 'user' ? getMyPets() : getAllPets(),
        ]);
        setAppointments(apptData.map(a => ({
          id: a.id,
          petName: (a.pet as any)?.name || "สัตว์เลี้ยงของคุณ",
          hospitalName: (a.hospital as any)?.name || "โรงพยาบาลสัตว์",
          date: a.date, time: a.time, status: a.status, reason: a.reason || "",
        })));
        setVaccinations(vacData.map(v => ({
          id: v.id,
          petName: (v.pet as any)?.name || 'สัตว์เลี้ยงของคุณ',
          vaccineName: v.vaccineName, date: v.date, nextDate: v.nextDate,
          hospitalName: (v.hospital as any)?.name || 'โรงพยาบาลสัตว์',
        })));
        setRecords(recs as any);
        setPets(petData as any);
      } catch {
        toast({ title: t('appointments.toast.loadError'), description: t('appointments.toast.loadErrorDesc'), variant: "destructive" });
      }
    };
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">{t('appointments.status.confirmed')}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">{t('appointments.status.pending')}</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">{t('appointments.status.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('appointments.status.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isUpcoming = (date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    return appointmentDate >= today;
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!appointmentSearch) return true;
    const term = appointmentSearch.toLowerCase();
    const petId = (a as any).petId ? String((a as any).petId).toLowerCase() : "";
    return (
      a.petName.toLowerCase().includes(term) ||
      petId.includes(term)
    );
  });

  const filteredVaccinations = vaccinations.filter((v) => {
    if (!vaccinationSearch) return true;
    const term = vaccinationSearch.toLowerCase();
    const petId = (v as any).petId ? String((v as any).petId).toLowerCase() : "";
    return (
      v.petName.toLowerCase().includes(term) ||
      petId.includes(term)
    );
  });

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    try { await dbDeleteAppointment(id); } catch { /* optimistic already done */ }
  };

  const deleteVaccination = async (id: string) => {
    setVaccinations(prev => prev.filter(v => v.id !== id));
    try { await dbDeleteVaccination(id); } catch { /* optimistic already done */ }
  };

  const addAppointment = async () => {
    try {
      let petDbId: string | undefined;
      if (linkedPetId) {
        const found = await findPetByPetId(linkedPetId);
        petDbId = found?.id;
      }
      const profile = await getMyProfile();
      if (!profile) throw new Error('Not authenticated');
      await createAppointment({ petId: petDbId!, hospitalId: profile.id, date, time, reason });
      const fresh = await getAppointments();
      setAppointments(fresh.map(a => ({ id: a.id, petName: (a.pet as any)?.name || "สัตว์เลี้ยงของคุณ", hospitalName: (a.hospital as any)?.name || "โรงพยาบาลสัตว์", date: a.date, time: a.time, status: a.status, reason: a.reason || "" })));
    } catch {
      toast({ title: t('appointments.toast.createError'), description: t('appointments.toast.createErrorDesc'), variant: "destructive" });
    } finally {
      setIsNewAppOpen(false);
      setPetName(""); setHospitalName(""); setDate(""); setTime(""); setReason(""); setLinkedUserId(""); setLinkedPetId("");
    }
  };

  const addVaccination = async () => {
    try {
      let petDbId: string | undefined;
      if (vacLinkedPetId) {
        const found = await findPetByPetId(vacLinkedPetId);
        petDbId = found?.id;
      }
      const profile = await getMyProfile();
      if (!profile) throw new Error('Not authenticated');
      await createVaccination({ petId: petDbId!, hospitalId: profile.id, vaccineName, date: vacDate, nextDate: vacNextDate });
      const fresh = await getVaccinations();
      setVaccinations(fresh.map(v => ({ id: v.id, petName: (v.pet as any)?.name || 'สัตว์เลี้ยงของคุณ', vaccineName: v.vaccineName, date: v.date, nextDate: v.nextDate, hospitalName: (v.hospital as any)?.name || 'โรงพยาบาลสัตว์' })));
    } catch {
      toast({ title: t('appointments.toast.createError'), description: t('appointments.toast.createErrorDesc'), variant: "destructive" });
    } finally {
      setIsNewVacOpen(false);
      setVacPetName(""); setVaccineName(""); setVacDate(""); setVacNextDate(""); setVacHospitalName(""); setVacLinkedPetId("");
    }
  };

  const setStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      toast({ title: t('appointments.toast.statusError'), description: t('appointments.toast.statusErrorDesc'), variant: "destructive" });
    }
  };

  const openRecordDialog = (appointmentId: string) => {
    setRecordAppId(appointmentId);
    setSymptoms(""); setDiagnosis(""); setTreatment("");
    setIsRecOpen(true);
  };

  const addRecord = async () => {
    if (!recordAppId) return;
    try {
      const rec = await createMedicalRecord({ appointmentId: recordAppId, symptoms, diagnosis, treatment });
      setRecords((prev) => [rec as any, ...prev]);
      setIsRecOpen(false);
    } catch {
      setIsRecOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('appointments.title')}</h1>
          <p className="text-muted-foreground">{t('appointments.subtitle')}</p>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="appointments">{t('appointments.tabAppointments')}</TabsTrigger>
            <TabsTrigger value="vaccinations">{t('appointments.tabVaccinations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t('appointments.allAppointments')}</h2>
              {role !== 'user' && (
                <Dialog open={isNewAppOpen} onOpenChange={setIsNewAppOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary hover:opacity-90">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {t('appointments.newAppointment')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t('appointments.dialog.createTitle')}</DialogTitle>
                    <DialogDescription>{t('appointments.dialog.createDesc')}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    {role === 'hospital' ? (
                      <div className="text-xs text-muted-foreground">
                        <p>โรงพยาบาล: ใช้บัญชีโรงพยาบาลที่กำลังล็อกอินอยู่</p>
                      </div>
                    ) : (
                      <>
                        <Input placeholder={t('appointments.form.petName')} value={petName} onChange={(e) => setPetName(e.target.value)} />
                        <Input placeholder={t('appointments.form.hospital')} value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                    <Input placeholder={t('appointments.form.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
                    {role === 'hospital' && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        <span>{t('appointments.form.commonReasons')}</span>
                        {[
                          t('appointments.form.reason1'),
                          t('appointments.form.reason2'),
                          t('appointments.form.reason3'),
                        ].map((r) => (
                          <button
                            key={r}
                            type="button"
                            className="px-2 py-1 rounded-full border bg-background hover:bg-muted text-xs"
                            onClick={() => {
                              setReason((prev) => {
                                if (!prev) return r;
                                if (prev.includes(r)) return prev;
                                return prev + (prev.endsWith(".") || prev.endsWith(" ") ? " " : ", ") + r;
                              });
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                    {role === 'hospital' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">เลือกสัตว์เลี้ยงในระบบ (ถ้ามี)</p>
                          <Select
                            value={linkedPetId}
                            onValueChange={(v) => setLinkedPetId(v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="เลือกสัตว์เลี้ยงจาก Pet ID" />
                            </SelectTrigger>
                            <SelectContent>
                              {pets.length === 0 && (
                                <SelectItem value="no-pets" disabled>
                                  ยังไม่มีสัตว์เลี้ยงในระบบที่เชื่อมกับโรงพยาบาล
                                </SelectItem>
                              )}
                              {pets.map((p) => (
                                <SelectItem key={p.petId} value={p.petId}>
                                  {p.petId} • {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input placeholder={t('appointments.form.userId')} value={linkedUserId} onChange={(e) => setLinkedUserId(e.target.value)} />
                        <Input placeholder={t('appointments.form.petId')} value={linkedPetId} onChange={(e) => setLinkedPetId(e.target.value.trim())} />
                        {linkedPetId && (
                          <div className="text-xs text-muted-foreground">
                            {pets.find(p => p.petId === linkedPetId)?.name ? `${t('appointments.form.linkedTo')} ${pets.find(p => p.petId === linkedPetId)!.name}` : t('appointments.form.petNotFound')}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                    <Button onClick={addAppointment} className="w-full bg-gradient-primary">{t('appointments.form.save')}</Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {role === 'hospital' && (
              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-sm">
                  <Input
                    placeholder={t('appointments.search')}
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            {role === 'hospital' ? (
              <div className="mt-4 border rounded-lg overflow-hidden bg-background">
                {filteredAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('appointments.empty')}
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr className="text-left">
                        <th className="px-4 py-3">{t('appointments.table.pet')}</th>
                        <th className="px-4 py-3">{t('appointments.table.hospital')}</th>
                        <th className="px-4 py-3">{t('appointments.table.date')}</th>
                        <th className="px-4 py-3">{t('appointments.table.time')}</th>
                        <th className="px-4 py-3">{t('appointments.table.status')}</th>
                        <th className="px-4 py-3">{t('appointments.table.reason')}</th>
                        <th className="px-4 py-3 text-right">{t('appointments.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-t hover:bg-muted/40">
                          <td className="px-4 py-3 font-medium">{appointment.petName}</td>
                          <td className="px-4 py-3">{appointment.hospitalName}</td>
                          <td className="px-4 py-3">
                            {new Date(appointment.date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3">{appointment.time} น.</td>
                          <td className="px-4 py-3">
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate" title={appointment.reason}>{appointment.reason}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {isUpcoming(appointment.date) && appointment.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500"
                                    onClick={() => setStatus(appointment.id, 'confirmed')}
                                  >
                                    {t('appointments.button.confirm')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                                    onClick={() => setStatus(appointment.id, 'cancelled')}
                                  >
                                    {t('appointments.button.cancel')}
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => deleteAppointment(appointment.id)}
                              >
                                {t('appointments.button.delete')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRecordDialog(appointment.id)}
                              >
                                {t('appointments.button.record')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAppointments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {t('appointments.empty')}
                  </p>
                )}
                {filteredAppointments.map((appointment) => (
                  <Card 
                    key={appointment.id} 
                    className={`hover:shadow-luxury transition-all duration-300 ${
                      isUpcoming(appointment.date) ? 'border-primary/50' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold mb-1">{appointment.petName}</h3>
                            <p className="text-muted-foreground">{appointment.reason}</p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold">โรงพยาบาล</p>
                            <p className="text-sm text-muted-foreground">{appointment.hospitalName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold">วันที่</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold">เวลา</p>
                            <p className="text-sm text-muted-foreground">{appointment.time} น.</p>
                          </div>
                        </div>
                      </div>

                      {isUpcoming(appointment.date) && appointment.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => setStatus(appointment.id, 'confirmed')} variant="outline" className="flex-1 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500">
                            ยืนยัน
                          </Button>
                          <Button onClick={() => setStatus(appointment.id, 'cancelled')} variant="outline" className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
                            ยกเลิก
                          </Button>
                        </div>
                      )}

                      {(role === 'hospital' || role === 'user' || role === 'admin') && (
                        <div className="mt-4 space-y-3">
                          <div className="flex gap-2">
                            {(role === 'hospital' || role === 'admin') && (
                              <Button onClick={() => openRecordDialog(appointment.id)} variant="outline" className="flex-1">
                                บันทึกการรักษา
                              </Button>
                            )}
                            {(role === 'hospital' || role === 'admin') && (
                              <Button
                                variant="outline"
                                className="flex-1 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => deleteAppointment(appointment.id)}
                              >
                                ลบ
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {records.filter(r => r.appointmentId === appointment.id).length === 0 && (
                              <p className="text-xs text-muted-foreground">ยังไม่มีบันทึกการรักษาสำหรับนัดนี้</p>
                            )}
                            {records.filter(r => r.appointmentId === appointment.id).map(r => (
                              <div key={r.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                                <div className="flex justify-between">
                                  <span className="font-semibold">บันทึกแพทย์</span>
                                  <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString('th-TH')}</span>
                                </div>
                                <p className="mt-1"><span className="font-semibold">อาการ:</span> {r.symptoms}</p>
                                <p className="mt-1"><span className="font-semibold">วินิจฉัย:</span> {r.diagnosis}</p>
                                <p className="mt-1"><span className="font-semibold">การรักษา:</span> {r.treatment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t('appointments.vaccinations.all')}</h2>
              {role !== 'user' && (
                <Dialog open={isNewVacOpen} onOpenChange={setIsNewVacOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-secondary hover:opacity-90">
                      <Syringe className="w-4 h-4 mr-2" />
                      {t('appointments.vaccinations.new')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t('appointments.vaccinations.new')}</DialogTitle>
                    <DialogDescription>เพิ่มข้อมูลการฉีดวัคซีนสำหรับสัตว์เลี้ยง</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    {role === 'hospital' ? (
                      <div className="text-xs text-muted-foreground">
                        <p>โรงพยาบาล: ใช้บัญชีโรงพยาบาลที่กำลังล็อกอินอยู่</p>
                      </div>
                    ) : (
                      <Input placeholder={t('appointments.form.petName')} value={vacPetName} onChange={(e) => setVacPetName(e.target.value)} />
                    )}
                    <Input placeholder="ชื่อวัคซีน" value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} />
                    {role === 'hospital' && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        <span>วัคซีนที่ใช้บ่อย:</span>
                        {[
                          "วัคซีนพิษสุนัขบ้า",
                          "วัคซีนรวมสุนัข",
                          "วัคซีนรวมแมว",
                          "วัคซีนลำไส้อักเสบ/ไข้หัด",
                          "วัคซีนพาร์โวไวรัส",
                        ].map((vName) => (
                          <button
                            key={vName}
                            type="button"
                            className="px-2 py-1 rounded-full border bg-background hover:bg-muted text-xs"
                            onClick={() => {
                              setVaccineName((prev) => {
                                if (!prev) return vName;
                                if (prev.includes(vName)) return prev;
                                return prev + (prev.endsWith(".") || prev.endsWith(" ") ? " " : ", ") + vName;
                              });
                            }}
                          >
                            {vName}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="date" value={vacDate} onChange={(e) => setVacDate(e.target.value)} />
                      <Input type="date" value={vacNextDate} onChange={(e) => setVacNextDate(e.target.value)} />
                    </div>
                    {role !== 'hospital' && (
                      <Input placeholder="ชื่อโรงพยาบาล" value={vacHospitalName} onChange={(e) => setVacHospitalName(e.target.value)} />
                    )}
                    {role === 'hospital' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">เลือกสัตว์เลี้ยงในระบบ (ถ้ามี)</p>
                          <Select
                            value={vacLinkedPetId}
                            onValueChange={(v) => setVacLinkedPetId(v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="เลือกสัตว์เลี้ยงจาก Pet ID" />
                            </SelectTrigger>
                            <SelectContent>
                              {pets.length === 0 && (
                                <SelectItem value="no-pets" disabled>
                                  ยังไม่มีสัตว์เลี้ยงในระบบที่เชื่อมกับโรงพยาบาล
                                </SelectItem>
                              )}
                              {pets.map((p) => (
                                <SelectItem key={p.petId} value={p.petId}>
                                  {p.petId} • {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input placeholder="Pet ID (เชื่อมสัตว์เลี้ยง) เช่น P-123456" value={vacLinkedPetId} onChange={(e) => setVacLinkedPetId(e.target.value.trim())} />
                        {vacLinkedPetId && (
                          <div className="text-xs text-muted-foreground">
                            {pets.find(p => p.petId === vacLinkedPetId)?.name ? `จะผูกกับ: ${pets.find(p => p.petId === vacLinkedPetId)!.name}` : 'ไม่พบ Pet ID นี้ในระบบของผู้ใช้'}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                    <Button onClick={addVaccination} className="w-full bg-gradient-secondary">บันทึก</Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {role === 'hospital' && (
              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-sm">
                  <Input
                    placeholder="ค้นหาชื่อสัตว์ หรือ Pet ID"
                    value={vaccinationSearch}
                    onChange={(e) => setVaccinationSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            {role === 'hospital' ? (
              <div className="mt-4 border rounded-lg overflow-hidden bg-background">
                {filteredVaccinations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('appointments.empty')}
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr className="text-left">
                        <th className="px-4 py-3">{t('appointments.table.pet')}</th>
                        <th className="px-4 py-3">{t('appointments.form.petName')}</th>
                        <th className="px-4 py-3">{t('appointments.table.date')}</th>
                        <th className="px-4 py-3">{t('admin.listUsers.detail.nextDose')}</th>
                        <th className="px-4 py-3">{t('appointments.table.hospital')}</th>
                        <th className="px-4 py-3 text-right">{t('appointments.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVaccinations.map((vaccination) => (
                        <tr key={vaccination.id} className="border-t hover:bg-muted/40">
                          <td className="px-4 py-3 font-medium">{vaccination.petName}</td>
                          <td className="px-4 py-3">{vaccination.vaccineName}</td>
                          <td className="px-4 py-3">
                            {new Date(vaccination.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(vaccination.nextDate).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3">{vaccination.hospitalName}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => deleteVaccination(vaccination.id)}
                            >
                              ลบ
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {vaccinations.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    ยังไม่มีการนัดหมาย
                  </p>
                ) : (
                  vaccinations.map((vaccination) => (
                    <Card key={vaccination.id} className="hover:shadow-luxury transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                              <Syringe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{vaccination.petName}</CardTitle>
                              <p className="text-sm text-muted-foreground">{vaccination.vaccineName}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">ฉีดเมื่อ</p>
                            <p className="text-sm font-semibold">
                              {new Date(vaccination.date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">ฉีดครั้งต่อไป</p>
                            <p className="text-sm font-semibold text-primary">
                              {new Date(vaccination.nextDate).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{vaccination.hospitalName}</span>
                        </div>

                        {new Date(vaccination.nextDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-sm text-amber-700 font-semibold">
                              ⚠️ ใกล้ถึงกำหนดฉีดวัคซีนครั้งต่อไป
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog: Add Medical Record */}
      <Dialog open={isRecOpen} onOpenChange={setIsRecOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>บันทึกการรักษา</DialogTitle>
            <DialogDescription>กรอกอาการ, วินิจฉัย, และการรักษา</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Input placeholder="อาการ" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
            <Input placeholder="วินิจฉัยเบื้องต้น" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            <Input placeholder="แนวทางการรักษา" value={treatment} onChange={(e) => setTreatment(e.target.value)} />
          </div>
          <Button onClick={addRecord} className="w-full bg-gradient-primary">บันทึก</Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Appointments;
