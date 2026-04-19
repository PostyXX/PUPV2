import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface Hospital {
  id: string;
  name: string;
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
}

const AdminHospitals = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [items, setItems] = useState<Hospital[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("20:00");
  const [isOpen24h, setIsOpen24h] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState("");

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImage(result);
      }
    };
    reader.onerror = () => {
      toast({
        title: t('admin.hospitals.toast.imageError'),
        description: t('admin.hospitals.toast.imageErrorDesc'),
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const token = localStorage.getItem("pup_token");
    if (!token) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/hospitals`);
        if (!res.ok) return;
        const data = await res.json() as Hospital[];
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredItems = items.filter(h => {
    if (!search) return true;
    return h.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (h: Hospital) => {
    setSelectedId(h.id);
    setName(h.name || "");
    setAddress(h.address || "");
    setPhone(h.phone || "");
    setLatitude(h.latitude != null ? String(h.latitude) : "");
    setLongitude(h.longitude != null ? String(h.longitude) : "");
    setOpeningTime(h.openingTime || "08:00");
    setClosingTime(h.closingTime || "20:00");
    setIsOpen24h(Boolean(h.isOpen24h));
    setImage(h.image || null);
    setMapUrl(h.mapUrl || "");
  };

  const handleSave = async () => {
    if (!selectedId) return;
    const token = localStorage.getItem("pup_token");
    if (!token) return;

    setLoading(true);
    try {
      const body = {
        name,
        address,
        phone,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        openingTime,
        closingTime,
        isOpen24h,
        image,
        mapUrl: mapUrl || null,
      };

      const res = await fetch(`${API_BASE}/hospitals/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        toast({
          title: t('admin.hospitals.toast.saveError'),
          description: t('admin.hospitals.toast.saveErrorDesc'),
          variant: "destructive",
        });
        return;
      }

      const updated = await res.json() as Hospital;
      setItems(prev => prev.map(h => (h.id === updated.id ? updated : h)));
      toast({
        title: t('admin.hospitals.toast.saveSuccess'),
        description: t('admin.hospitals.toast.saveSuccessDesc'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("pup_token");
    if (!token) return;

    if (!confirm(t('admin.hospitals.confirmDelete'))) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.hospitals.toast.deleteError'),
          description: data?.error || t('admin.hospitals.toast.deleteErrorDesc'),
          variant: "destructive",
        });
        return;
      }

      setItems(prev => prev.filter(h => h.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      toast({
        title: t('admin.hospitals.toast.deleteSuccess'),
        description: t('admin.hospitals.toast.deleteSuccessDesc'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-6xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('admin.hospitals.title')}</h1>
          <p className="text-muted-foreground">{t('admin.hospitals.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-[2fr_3fr] gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>{t('admin.hospitals.listTitle')}</CardTitle>
              <CardDescription>{t('admin.hospitals.listDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[480px] overflow-auto space-y-3">
              <div className="flex justify-end">
                <Input
                  placeholder={t('admin.hospitals.search')}
                  className="max-w-xs"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {filteredItems.length === 0 && !loading ? (
                <p className="text-sm text-muted-foreground">{t('admin.hospitals.empty')}</p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-3 py-2 text-left font-medium">{t('admin.hospitals.table.name')}</th>
                        <th className="px-3 py-2 text-left font-medium">{t('admin.hospitals.table.address')}</th>
                        <th className="px-3 py-2 text-left font-medium">{t('admin.hospitals.table.phone')}</th>
                        <th className="px-3 py-2 text-left font-medium text-center">{t('admin.hospitals.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(h => (
                        <tr key={h.id} className={selectedId === h.id ? "bg-primary/5" : "hover:bg-muted/60"}>
                          <td className="px-3 py-2 align-top">
                            <button
                              type="button"
                              onClick={() => handleSelect(h)}
                              className="font-semibold text-left underline-offset-2 hover:underline"
                            >
                              {h.name}
                            </button>
                          </td>
                          <td className="px-3 py-2 align-top text-muted-foreground max-w-xs truncate">{h.address}</td>
                          <td className="px-3 py-2 align-top text-muted-foreground">{h.phone}</td>
                          <td className="px-3 py-2 align-top">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSelect(h)}
                              >
                                {t('admin.hospitals.button.edit')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(h.id)}
                              >
                                {t('admin.hospitals.button.delete')}
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
              <CardTitle>{t('admin.hospitals.detailTitle')}</CardTitle>
              <CardDescription>{t('admin.hospitals.detailDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedId && (
                <p className="text-sm text-muted-foreground">{t('admin.hospitals.selectHospital')}</p>
              )}
              {selectedId && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adm-h-name">{t('admin.hospitals.form.name')}</Label>
                      <Input id="adm-h-name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adm-h-phone">{t('admin.hospitals.form.phone')}</Label>
                      <Input id="adm-h-phone" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adm-h-addr">{t('admin.hospitals.form.address')}</Label>
                      <Input id="adm-h-addr" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adm-h-lat">{t('admin.hospitals.form.latitude')}</Label>
                      <Input id="adm-h-lat" value={latitude} onChange={e => setLatitude(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adm-h-lng">{t('admin.hospitals.form.longitude')}</Label>
                      <Input id="adm-h-lng" value={longitude} onChange={e => setLongitude(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adm-h-open">{t('admin.hospitals.form.openTime')}</Label>
                      <Input id="adm-h-open" type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adm-h-close">{t('admin.hospitals.form.closeTime')}</Label>
                      <Input id="adm-h-close" type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adm-h-24h">{t('admin.hospitals.form.is24h')}</Label>
                      <Input id="adm-h-24h" value={String(isOpen24h)} onChange={e => setIsOpen24h(e.target.value.toLowerCase() === "true")} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adm-h-mapurl">{t('admin.hospitals.form.mapUrl')}</Label>
                      <Input
                        id="adm-h-mapurl"
                        value={mapUrl}
                        onChange={e => setMapUrl(e.target.value)}
                        placeholder={t('admin.hospitals.form.mapUrlPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adm-h-image">{t('admin.hospitals.form.image')}</Label>
                      <div
                        className="border border-dashed rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-muted/40"
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleImageFile(file);
                        }}
                      >
                        <div className="space-y-2 flex-1">
                          <Input
                            id="adm-h-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFile(file);
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('admin.hospitals.form.imageNote')}
                          </p>
                        </div>
                        {image && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden border bg-background">
                            <img src={image} alt="Hospital preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adm-h-mapurl">ลิงก์ Google Maps / แผนที่</Label>
                      <Input
                        id="adm-h-mapurl"
                        value={mapUrl}
                        onChange={e => setMapUrl(e.target.value)}
                        placeholder={t('admin.hospitals.form.mapUrlPlaceholder')}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary hover:opacity-90">
                    {loading ? t('admin.hospitals.button.saving') : t('admin.hospitals.button.save')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminHospitals;
