import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getHospitals, DbHospital } from "@/lib/db";

const SystemHospitals = () => {
  const [items, setItems] = useState<DbHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await getHospitals();
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const navigateGoogleMaps = (h: DbHospital) => {
    if (h.mapUrl) {
      window.open(h.mapUrl, "_blank");
      return;
    }
    if (!h.latitude || !h.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const callHospital = (h: DbHospital) => {
    if (!h.phone) return;
    window.location.href = `tel:${h.phone.replace(/\s|-/g, "")}`;
  };

  const getStatusBadge = (hospital: DbHospital) => {
    if (hospital.isOpen24h) {
      return <Badge className="bg-gradient-primary text-white">{t('hospitals.status.open24h')}</Badge>;
    }
    if (!hospital.openingTime || !hospital.closingTime) {
      return <Badge variant="secondary">{t('systemHospitals.noHours')}</Badge>;
    }
    const now = new Date();
    const currentHour = now.getHours();
    const openHour = parseInt(hospital.openingTime.split(":")[0]);
    const closeHour = parseInt(hospital.closingTime.split(":")[0]);
    if (currentHour >= openHour && currentHour < closeHour) {
      return <Badge className="bg-green-100 text-green-700">{t('hospitals.status.open')}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700">{t('hospitals.status.closed')}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('systemHospitals.title')}</h1>
          <p className="text-muted-foreground">
            {t('systemHospitals.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {items.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">{t('systemHospitals.empty')}</p>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground">{t('systemHospitals.loading')}</p>
          )}

          <div className="grid gap-4">
            {items.map((h) => (
              <Card key={h.id} className="hover:shadow-luxury transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    <div className="relative h-60 md:h-full overflow-hidden">
                      <img
                        src={h.image || "https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?w=800"}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(h)}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">{h.name}</h2>
                          <p className="text-sm text-muted-foreground">{h.description || t('systemHospitals.defaultDesc')}</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">{t('hospitals.info.address')}</p>
                            <p className="text-muted-foreground">{h.address || t('systemHospitals.noAddress')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">{t('hospitals.info.phone')}</p>
                            <p className="text-muted-foreground">{h.phone || t('systemHospitals.noPhone')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">{t('hospitals.info.hours')}</p>
                            <p className="text-muted-foreground">
                              {h.isOpen24h
                                ? t('hospitals.status.open24h')
                                : h.openingTime && h.closingTime
                                ? `${h.openingTime} - ${h.closingTime}`
                                : t('systemHospitals.noHours')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          className="flex-1 bg-gradient-primary hover:opacity-90"
                          disabled={!h.mapUrl && (!h.latitude || !h.longitude)}
                          onClick={() => navigateGoogleMaps(h)}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          {t('hospitals.dialog.openMaps')}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary"
                          disabled={!h.phone}
                          onClick={() => callHospital(h)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {t('hospitals.dialog.callHospital')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemHospitals;
