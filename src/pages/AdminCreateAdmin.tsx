import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const AdminCreateAdmin = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !password) {
      toast({
        title: t('admin.createAdmin.toast.requiredError'),
        description: t('admin.createAdmin.toast.requiredErrorDesc'),
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("pup_token");
      if (!token) {
        toast({
          title: t('admin.createAdmin.toast.authError'),
          description: t('admin.createAdmin.toast.authErrorDesc'),
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
          email,
          password,
          name,
          role: "admin",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.createAdmin.toast.createError'),
          description: data?.error || t('admin.createAdmin.toast.createErrorDesc'),
          variant: "destructive",
        });
        return;
      }

      setName("");
      setEmail("");
      setPassword("");

      toast({
        title: t('admin.createAdmin.toast.createSuccess'),
        description: t('admin.createAdmin.toast.createSuccessDesc'),
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('admin.createAdmin.title')}</h1>
          <p className="text-muted-foreground">{t('admin.createAdmin.subtitle')}</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.createAdmin.cardTitle')}</CardTitle>
            <CardDescription>{t('admin.createAdmin.cardDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="adm-admin-name">{t('admin.createAdmin.form.name')}</Label>
                <Input
                  id="adm-admin-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('admin.createAdmin.form.namePlaceholder')}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="adm-admin-email">{t('admin.createAdmin.form.email')}</Label>
                <Input
                  id="adm-admin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="adm-admin-pass">{t('admin.createAdmin.form.password')}</Label>
                <Input
                  id="adm-admin-pass"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('admin.createAdmin.form.passwordPlaceholder')}
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-gradient-primary hover:opacity-90"
            >
              {creating ? t('admin.createAdmin.button.creating') : t('admin.createAdmin.button.create')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCreateAdmin;
