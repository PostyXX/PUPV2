import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { getAllAdmins } from "@/lib/db";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
}

const AdminListAdmins = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const data = await getAllAdmins();
        setItems(data.map(u => ({ ...u, name: u.name ?? null })));
      } catch {
        toast({
          title: t('admin.listAdmins.toast.loadError'),
          description: t('admin.listAdmins.toast.loadErrorDesc'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('admin.listAdmins.title')}</h1>
          <p className="text-muted-foreground">{t('admin.listAdmins.subtitle')}</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.listAdmins.cardTitle')}</CardTitle>
            <CardDescription>{t('admin.listAdmins.cardDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">{t('admin.listAdmins.empty')}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-medium">{t('admin.listAdmins.table.name')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.listAdmins.table.email')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.listAdmins.table.createdAt')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/60">
                        <td className="px-3 py-2 align-top">{u.name || "-"}</td>
                        <td className="px-3 py-2 align-top text-muted-foreground">{u.email}</td>
                        <td className="px-3 py-2 align-top text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminListAdmins;
