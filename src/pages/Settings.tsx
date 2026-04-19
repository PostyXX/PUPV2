import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const Settings = () => {
  const { toast } = useToast();
  const role = getRole();
  const { t } = useI18n();

  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");

  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalLatitude, setHospitalLatitude] = useState<string>("");
  const [hospitalLongitude, setHospitalLongitude] = useState<string>("");
  const [hospitalOpeningTime, setHospitalOpeningTime] = useState("08:00");
  const [hospitalClosingTime, setHospitalClosingTime] = useState("20:00");
  const [hospitalIsOpen24h, setHospitalIsOpen24h] = useState(false);

  // โหลดโปรไฟล์ของ user ปัจจุบัน
  useEffect(() => {
    const token = localStorage.getItem('pup_token');
    if (!token) return;

    const fetchUserProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json() as {
          name: string | null;
          email: string;
          phone?: string | null;
          address?: string | null;
        };

        setProfileName(data.name || "");
        setProfileEmail(data.email);
        setProfilePhone(data.phone || "");
        setProfileAddress(data.address || "");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // โหลดโปรไฟล์โรงพยาบาล ถ้า role เป็น hospital
  useEffect(() => {
    if (role !== 'hospital') return;
    const token = localStorage.getItem('pup_token');
    if (!token) return;

    const fetchProfile = async () => {
      setHospitalLoading(true);
      try {
        const res = await fetch(`${API_BASE}/hospitals/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json() as {
          name: string;
          address?: string | null;
          phone?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          openingTime?: string | null;
          closingTime?: string | null;
          isOpen24h?: boolean | null;
        };

        setHospitalName(data.name || "");
        setHospitalAddress(data.address || "");
        setHospitalPhone(data.phone || "");
        setHospitalLatitude(data.latitude != null ? String(data.latitude) : "");
        setHospitalLongitude(data.longitude != null ? String(data.longitude) : "");
        setHospitalOpeningTime(data.openingTime || "08:00");
        setHospitalClosingTime(data.closingTime || "20:00");
        setHospitalIsOpen24h(Boolean(data.isOpen24h));
      } finally {
        setHospitalLoading(false);
      }
    };

    fetchProfile();
  }, [role]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('pup_token');
    if (!token) return;

    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone || null,
          address: profileAddress || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('settings.profile.toast.errorTitle'),
          description: data?.error || t('settings.profile.toast.errorDescription'),
          variant: "destructive",
        });
        return;
      }

      const updated = await res.json();
      setProfileName(updated.name || "");
      setProfilePhone(updated.phone || "");
      setProfileAddress(updated.address || "");
      setIsEditingProfile(false);

      toast({
        title: t('settings.profile.toast.successTitle'),
        description: t('settings.profile.toast.successDescription'),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveHospital = async () => {
    const token = localStorage.getItem('pup_token');
    if (!token) return;

    setHospitalLoading(true);
    try {
      const latitude = hospitalLatitude ? parseFloat(hospitalLatitude) : null;
      const longitude = hospitalLongitude ? parseFloat(hospitalLongitude) : null;

      const res = await fetch(`${API_BASE}/hospitals/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hospitalName,
          address: hospitalAddress,
          phone: hospitalPhone,
          latitude,
          longitude,
          openingTime: hospitalOpeningTime,
          closingTime: hospitalClosingTime,
          isOpen24h: hospitalIsOpen24h,
        }),
      });

      if (!res.ok) {
        toast({
          title: t('settings.hospital.toast.errorTitle'),
          description: t('settings.hospital.toast.errorDescription'),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('settings.hospital.toast.successTitle'),
        description: t('settings.hospital.toast.successDescription'),
      });
    } finally {
      setHospitalLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>

        {/* Profile Settings */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t('settings.profile')}</CardTitle>
                <CardDescription>{t('settings.profile.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">{t('settings.profile.fullname')}</Label>
                <Input
                  id="fullname"
                  placeholder={profileName || t('settings.profile.empty')}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  readOnly={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={profileEmail || "ยังไม่มีข้อมูล"}
                  value={profileEmail}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                <Input
                  id="phone"
                  placeholder={profilePhone || "ยังไม่มีข้อมูล"}
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  readOnly={!isEditingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('settings.profile.address')}</Label>
                <Input
                  id="address"
                  placeholder={profileAddress || "ยังไม่มีข้อมูล"}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  readOnly={!isEditingProfile}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditingProfile ? (
                <Button
                  type="button"
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => setIsEditingProfile(true)}
                  disabled={profileLoading}
                >
                  {t('settings.profile.edit')}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                    }}
                    disabled={profileLoading}
                  >
                    {t('settings.profile.cancel')}
                  </Button>
                  <Button
                    type="button"
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                  >
                    {profileLoading ? t('settings.profile.saving') : t('settings.profile.save')}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hospital Profile Settings (สำหรับบัญชีโรงพยาบาล) */}
        {role === 'hospital' && (
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t('settings.hospital.title')}</CardTitle>
                  <CardDescription>{t('settings.hospital.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital-name">{t('settings.hospital.name')}</Label>
                  <Input
                    id="hospital-name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-phone">{t('settings.hospital.phone')}</Label>
                  <Input
                    id="hospital-phone"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hospital-address">{t('settings.hospital.address')}</Label>
                  <Input
                    id="hospital-address"
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-lat">{t('settings.hospital.lat')}</Label>
                  <Input
                    id="hospital-lat"
                    value={hospitalLatitude}
                    onChange={(e) => setHospitalLatitude(e.target.value)}
                    placeholder="เช่น 13.7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-lng">{t('settings.hospital.lng')}</Label>
                  <Input
                    id="hospital-lng"
                    value={hospitalLongitude}
                    onChange={(e) => setHospitalLongitude(e.target.value)}
                    placeholder="เช่น 100.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-open">{t('settings.hospital.open')}</Label>
                  <Input
                    id="hospital-open"
                    type="time"
                    value={hospitalOpeningTime}
                    onChange={(e) => setHospitalOpeningTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-close">{t('settings.hospital.close')}</Label>
                  <Input
                    id="hospital-close"
                    type="time"
                    value={hospitalClosingTime}
                    onChange={(e) => setHospitalClosingTime(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <Switch
                    id="hospital-24h"
                    checked={hospitalIsOpen24h}
                    onCheckedChange={(v) => setHospitalIsOpen24h(v)}
                  />
                  <Label htmlFor="hospital-24h">{t('settings.hospital.open24h')}</Label>
                </div>
              </div>
              <Button
                onClick={handleSaveHospital}
                className="bg-gradient-primary hover:opacity-90"
                disabled={hospitalLoading}
              >
                {hospitalLoading ? t('settings.hospital.saving') : t('settings.hospital.save')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>{t('settings.notifications.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.notifications.appointmentTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.notifications.appointmentDescription')}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.notifications.vaccineTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.notifications.vaccineDescription')}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t('settings.security')}</CardTitle>
                <CardDescription>{t('settings.security.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('settings.security.currentPassword')}</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('settings.security.newPassword')}</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('settings.security.confirmPassword')}</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <Button variant="outline" className="hover:bg-primary/10 hover:text-primary hover:border-primary">
              {t('settings.security.changePassword')}
            </Button>
          </CardContent>
        </Card>

        
      </div>
    </DashboardLayout>
  );
};

export default Settings;
