import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface UserRow {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

interface UserDetail extends UserRow {
  pets: Array<{
    id: string;
    petId: string;
    name: string;
    type: string;
    breed?: string | null;
    age?: number | null;
    weight?: number | null;
    gender?: string | null;
    medicalNotes?: string | null;
    appointments: Array<{
      id: string;
      date: string;
      time: string;
      status: string;
      reason?: string | null;
      hospital?: { id: string; name: string } | null;
    }>;
    vaccinations: Array<{
      id: string;
      vaccineName: string;
      date: string;
      nextDate: string;
      hospital?: { id: string; name: string } | null;
    }>;
  }>;
}

const AdminListUsers = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("pup_token") : null;

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast({
            title: t('admin.listUsers.toast.loadError'),
            description: data?.error || t('admin.listUsers.toast.loadErrorDesc'),
            variant: "destructive",
          });
          return;
        }
        const data = await res.json() as UserRow[];
        setItems(data.map(u => ({ ...u, name: u.name ?? "" })));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, toast]);

  const filtered = items.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const loadDetail = async (id: string) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/users/${id}/detail`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.listUsers.toast.loadDetailError'),
          description: data?.error || t('admin.listUsers.toast.loadDetailErrorDesc'),
          variant: "destructive",
        });
        return;
      }
      const detail = await res.json() as UserDetail;
      setSelected(detail);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm(t('admin.listUsers.confirmDelete'))) return;

    try {
      const res = await fetch(`${API_BASE}/auth/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.listUsers.toast.deleteError'),
          description: data?.error || t('admin.listUsers.toast.deleteErrorDesc'),
          variant: "destructive",
        });
        return;
      }
      setItems(prev => prev.filter(u => u.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({
        title: t('admin.listUsers.toast.deleteSuccess'),
        description: t('admin.listUsers.toast.deleteSuccessDesc'),
      });
    } catch {
      toast({
        title: t('admin.listUsers.toast.error'),
        description: t('admin.listUsers.toast.errorDesc'),
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-6xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('admin.listUsers.title')}</h1>
          <p className="text-muted-foreground">{t('admin.listUsers.subtitle')} (role: user)</p>
        </div>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.listUsers.cardTitle')}</CardTitle>
            <CardDescription>{t('admin.listUsers.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[480px] overflow-auto">
            <div className="flex justify-end">
              <Input
                placeholder={t('admin.listUsers.search')}
                className="max-w-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {filtered.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">{t('admin.listUsers.empty')}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-medium">{t('admin.listUsers.table.name')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.listUsers.table.email')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.listUsers.table.createdAt')}</th>
                      <th className="px-3 py-2 text-center font-medium">{t('admin.listUsers.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className={selected?.id === u.id ? "bg-primary/5" : "hover:bg-muted/60"}>
                        <td className="px-3 py-2 align-top">{u.name || "-"}</td>
                        <td className="px-3 py-2 align-top text-muted-foreground">{u.email}</td>
                        <td className="px-3 py-2 align-top text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadDetail(u.id)}
                            >
                              {t('admin.listUsers.button.viewDetail')}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(u.id)}
                            >
                              {t('admin.listUsers.button.delete')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.listUsers.detail.title')}</CardTitle>
            <CardDescription>{t('admin.listUsers.detail.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[480px] overflow-auto">
            {!selected && !detailLoading && (
              <p className="text-sm text-muted-foreground">{t('admin.listUsers.detail.selectUser')}</p>
            )}
            {detailLoading && (
              <p className="text-sm text-muted-foreground">{t('admin.listUsers.detail.loading')}</p>
            )}
            {selected && !detailLoading && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t('admin.listUsers.detail.basicInfo')}</h2>
                  <p className="text-sm text-muted-foreground">{t('admin.listUsers.detail.name')}: {selected.name || "-"}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.listUsers.detail.email')}: {selected.email}</p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">{t('admin.listUsers.detail.pets')} ({selected.pets.length})</h2>
                  {selected.pets.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('admin.listUsers.detail.noPets')}</p>
                  )}
                  {selected.pets.map(p => (
                    <div key={p.id} className="border rounded-lg p-3 space-y-2 bg-muted/40">
                      <div className="font-semibold">{p.name} ({p.petId})</div>
                      <p className="text-xs text-muted-foreground">
                        ประเภท: {p.type} | สายพันธุ์: {p.breed || "-"} | อายุ: {p.age ?? "-"} | น้ำหนัก: {p.weight ?? "-"} | เพศ: {p.gender || "-"}
                      </p>
                      {p.medicalNotes && (
                        <p className="text-xs text-muted-foreground">หมายเหตุสุขภาพ: {p.medicalNotes}</p>
                      )}

                      <div className="mt-2 space-y-1">
                        <h3 className="text-sm font-semibold">{t('admin.listUsers.detail.appointments')} ({p.appointments.length})</h3>
                        {p.appointments.length === 0 && (
                          <p className="text-xs text-muted-foreground">{t('admin.listUsers.detail.noAppointments')}</p>
                        )}
                        {p.appointments.map(a => (
                          <p key={a.id} className="text-xs text-muted-foreground">
                            - {a.date} {a.time} @ {a.hospital?.name || "ไม่ระบุโรงพยาบาล"} (สถานะ: {a.status})
                          </p>
                        ))}
                      </div>

                      <div className="mt-2 space-y-1">
                        <h3 className="text-sm font-semibold">{t('admin.listUsers.detail.vaccinations')} ({p.vaccinations.length})</h3>
                        {p.vaccinations.length === 0 && (
                          <p className="text-xs text-muted-foreground">{t('admin.listUsers.detail.noVaccinations')}</p>
                        )}
                        {p.vaccinations.map(v => (
                          <p key={v.id} className="text-xs text-muted-foreground">
                            - {v.vaccineName}: {v.date} (นัดถัดไป: {v.nextDate}) @ {v.hospital?.name || "ไม่ระบุโรงพยาบาล"}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminListUsers;
