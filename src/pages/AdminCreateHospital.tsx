import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const AdminCreateHospital = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName || !newEmail || !newPassword) {
      toast({
        title: t('admin.hospitals.create.toast.missingTitle'),
        description: t('admin.hospitals.create.toast.missingDescription'),
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("pup_token");
      if (!token) {
        toast({
          title: t('admin.hospitals.create.toast.noAdminTitle'),
          description: t('admin.hospitals.create.toast.noAdminDescription'),
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`${API_BASE}/auth/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          role: "hospital",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.hospitals.create.toast.errorTitle'),
          description: data?.error || t('admin.hospitals.create.toast.errorFallback'),
          variant: "destructive",
        });
        return;
      }

      setNewName("");
      setNewEmail("");
      setNewPassword("");

      toast({
        title: t('admin.hospitals.create.toast.successTitle'),
        description: t('admin.hospitals.create.toast.successDescription'),
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('admin.hospitals.create.title')}</h1>
          <p className="text-muted-foreground">{t('admin.hospitals.create.subtitle')}</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.hospitals.create.cardTitle')}</CardTitle>
            <CardDescription>{t('admin.hospitals.create.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adm-new-name">{t('admin.hospitals.create.nameLabel')}</Label>
                <Input
                  id="adm-new-name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('admin.hospitals.create.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adm-new-email">{t('admin.hospitals.create.emailLabel')}</Label>
                <Input
                  id="adm-new-email"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder={t('admin.hospitals.create.emailPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adm-new-pass">{t('admin.hospitals.create.passwordLabel')}</Label>
                <Input
                  id="adm-new-pass"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={t('admin.hospitals.create.passwordPlaceholder')}
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-gradient-primary hover:opacity-90"
            >
              {creating ? t('admin.hospitals.create.submitLoading') : t('admin.hospitals.create.submitIdle')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCreateHospital;
