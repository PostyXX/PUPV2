import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MapPin, MessageSquare, Calendar, Users, Hospital, Clock, Syringe, PawPrint, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRole } from "@/lib/session";
import { mockAppointments, mockVaccinations, mockPets, Appointment, Vaccination, Pet } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";
import { getAppointments, getVaccinations, getMyPets, getAllUsers, getHospitals } from "@/lib/db";

const Dashboard = () => {
  const navigate = useNavigate();

  const role = getRole() ?? 'user';

  const [appts, setAppts] = useState<Appointment[]>(mockAppointments);
  const [vacs, setVacs] = useState<Vaccination[]>(mockVaccinations);
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalHospitals, setTotalHospitals] = useState<number | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      try {
        const [apptData, vacData, petData] = await Promise.all([
          getAppointments(),
          getVaccinations(),
          getMyPets(),
        ]);
        setAppts(apptData.map(a => ({
          id: a.id,
          petName: (a.pet as any)?.name || 'สัตว์เลี้ยงของคุณ',
          hospitalName: (a.hospital as any)?.name || 'โรงพยาบาลสัตว์',
          date: a.date,
          time: a.time,
          status: a.status,
          reason: a.reason || "",
        })));
        setVacs(vacData.map(v => ({
          id: v.id,
          petName: (v.pet as any)?.name || 'สัตว์เลี้ยงของคุณ',
          vaccineName: v.vaccineName,
          date: v.date,
          nextDate: v.nextDate,
          hospitalName: (v.hospital as any)?.name || 'โรงพยาบาลสัตว์',
        })));
        setPets(petData as any);
      } catch {
        // keep defaults
      }

      if (role === 'admin') {
        try {
          const [users, hospitals] = await Promise.all([getAllUsers(), getHospitals()]);
          setTotalUsers(users.length);
          setTotalHospitals(hospitals.length);
        } catch {
          // ignore
        }
      }
    };
    load();
  }, []);

  // Derive dashboard data
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const upcomingAppointments = appts
    .filter(a => a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const pendingAppointments = appts.filter(a => a.status === 'pending').length;
  const confirmedAppointments = appts.filter(a => a.status === 'confirmed').length;

  const upcomingVaccinations = vacs
    .filter(v => {
      // สำหรับผู้ใช้ทั่วไปให้แสดงประวัติวัคซีนทั้งหมด (ไม่กรองด้วยวันที่)
      if (role === 'user') return true;
      return v.nextDate >= todayStr;
    })
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 5);

  const petTypesCount = pets.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {role === 'admin'
              ? t('dashboard.adminTitle')
              : role === 'hospital'
              ? t('dashboard.hospitalTitle')
              : t('dashboard.welcomeUser')}
          </h1>
          <p className="text-muted-foreground">
            {role === 'admin'
              ? t('dashboard.adminSubtitle')
              : role === 'hospital'
              ? t('dashboard.hospitalSubtitle')
              : t('dashboard.userSubtitle')}
          </p>
        </div>

        {role === 'admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-luxury transition-shadow cursor-pointer group"
              onClick={() => navigate("/admin/hospitals")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Hospital className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('dashboard.admin.card.manageHospitals.title')}</CardTitle>
                <CardDescription>{t('dashboard.admin.card.manageHospitals.description')}</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-luxury transition-shadow cursor-pointer group"
              onClick={() => navigate("/admin/hospitals/create")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Hospital className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('dashboard.admin.card.createHospital.title')}</CardTitle>
                <CardDescription>{t('dashboard.admin.card.createHospital.description')}</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-luxury transition-shadow cursor-pointer group"
              onClick={() => navigate("/admin/admins")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('dashboard.admin.card.listAdmins.title')}</CardTitle>
                <CardDescription>{t('dashboard.admin.card.listAdmins.description')}</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-luxury transition-shadow cursor-pointer group"
              onClick={() => navigate("/admin/users")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('dashboard.admin.card.listUsers.title')}</CardTitle>
                <CardDescription>{t('dashboard.admin.card.listUsers.description')}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-luxury transition-shadow cursor-pointer group"
              onClick={() => navigate(role === 'hospital' ? "/hospital/pets" : "/pets")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{role === 'hospital' ? t('nav.hospitalPets') : t('nav.pets')}</CardTitle>
                <CardDescription>
                  {role === 'hospital'
                    ? t('dashboard.hospitalSubtitle')
                    : t('pets.subtitle')}
                </CardDescription>
              </CardHeader>
            </Card>

            {role !== 'hospital' && (
              <Card className="hover:shadow-luxury transition-shadow cursor-pointer group" onClick={() => navigate("/hospitals")}>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{t('hospitals.title')}</CardTitle>
                  <CardDescription>{t('hospitals.title')}</CardDescription>
                </CardHeader>
              </Card>
            )}

            {role !== 'hospital' && (
              <Card className="hover:shadow-luxury transition-shadow cursor-pointer group" onClick={() => navigate("/ai-chat")}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{t('aichat.title')}</CardTitle>
                  <CardDescription>{t('aichat.subtitle')}</CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card className="hover:shadow-luxury transition-shadow cursor-pointer group" onClick={() => navigate("/appointments")}>
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('appointments.tabAppointments')}</CardTitle>
                <CardDescription>{t('appointments.subtitle')}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {role === 'admin' && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle>{t('dashboard.admin.summary.title')}</CardTitle>
                <CardDescription>{t('dashboard.admin.summary.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.admin.summary.totalUsers')}</p>
                    <p className="text-lg font-semibold">{totalUsers ?? '-'}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                  <Hospital className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.admin.summary.totalHospitals')}</p>
                    <p className="text-lg font-semibold">{totalHospitals ?? '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {role === 'user' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle>{t('dashboard.user.stats.title')}</CardTitle>
                <CardDescription>{t('dashboard.user.stats.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.stats.totalPets')}</p>
                    <p className="text-lg font-semibold">{pets.length}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.stats.pendingAppointments')}</p>
                    <p className="text-lg font-semibold">{pendingAppointments}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.stats.confirmedAppointments')}</p>
                    <p className="text-lg font-semibold">{confirmedAppointments}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                  <Syringe className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.user.stats.upcomingVaccines')}</p>
                    <p className="text-lg font-semibold">{upcomingVaccinations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle>{t('dashboard.user.appointments.title')}</CardTitle>
                <CardDescription>{t('dashboard.user.appointments.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('dashboard.user.appointments.empty')}</p>
                )}
                {upcomingAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{a.petName} • {a.hospitalName}</p>
                        <p className="text-xs text-muted-foreground">{a.date} {a.time} • {a.reason}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border bg-background">
                      {a.status === 'pending'
                        ? t('dashboard.user.appointments.status.pending')
                        : a.status === 'confirmed'
                        ? t('dashboard.user.appointments.status.confirmed')
                        : a.status === 'completed'
                        ? t('dashboard.user.appointments.status.completed')
                        : t('dashboard.user.appointments.status.cancelled')}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vaccination reminders */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle>{t('dashboard.user.vaccines.title')}</CardTitle>
                <CardDescription>{t('dashboard.user.vaccines.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingVaccinations.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('dashboard.user.vaccines.empty')}</p>
                )}
                {upcomingVaccinations.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Syringe className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium">{v.petName} • {v.vaccineName}</p>
                        <p className="text-xs text-muted-foreground">ถัดไป: {v.nextDate} • {v.hospitalName}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="shadow-soft" hidden={role === 'admin'}>
          <CardHeader>
            <CardTitle>
              {role === 'hospital'
                ? t('dashboard.steps.card.title.hospital')
                : role === 'admin'
                ? t('dashboard.steps.card.title.admin')
                : t('dashboard.steps.card.title.user')}
            </CardTitle>
            <CardDescription>
              {role === 'hospital'
                ? t('dashboard.steps.card.description.hospital')
                : role === 'admin'
                ? t('dashboard.steps.card.description.admin')
                : t('dashboard.steps.card.description.user')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {role === 'hospital'
                    ? t('dashboard.steps.step1.title.hospital')
                    : role === 'admin'
                    ? t('dashboard.steps.step1.title.admin')
                    : t('dashboard.steps.step1.title.user')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {role === 'hospital'
                    ? t('dashboard.steps.step1.desc.hospital')
                    : role === 'admin'
                    ? t('dashboard.steps.step1.desc.admin')
                    : t('dashboard.steps.step1.desc.user')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {role === 'hospital'
                    ? t('dashboard.steps.step2.title.hospital')
                    : role === 'admin'
                    ? t('dashboard.steps.step2.title.admin')
                    : t('dashboard.steps.step2.title.user')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {role === 'hospital'
                    ? t('dashboard.steps.step2.desc.hospital')
                    : role === 'admin'
                    ? t('dashboard.steps.step2.desc.admin')
                    : t('dashboard.steps.step2.desc.user')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {role === 'hospital'
                    ? t('dashboard.steps.step3.title.hospital')
                    : role === 'admin'
                    ? t('dashboard.steps.step3.title.admin')
                    : t('dashboard.steps.step3.title.user')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {role === 'hospital'
                    ? t('dashboard.steps.step3.desc.hospital')
                    : role === 'admin'
                    ? t('dashboard.steps.step3.desc.admin')
                    : t('dashboard.steps.step3.desc.user')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
