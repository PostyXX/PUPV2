import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRole } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface ActivityLogItem {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

const AdminActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const role = getRole();

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("pup_token");
      if (!token || role !== "admin") return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/activity-logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(t('admin.activityLog.error'));
        }
        const data = (await res.json()) as ActivityLogItem[];
        setLogs(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [role]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.activityLog.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('admin.activityLog.subtitle')}</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.activityLog.cardTitle')}</CardTitle>
            <CardDescription>{t('admin.activityLog.cardDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-muted-foreground">{t('admin.activityLog.loading')}</p>}
            {error && !loading && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {!loading && !error && logs.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('admin.activityLog.empty')}</p>
            )}

            {!loading && !error && logs.length > 0 && (
              <div className="w-full overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">{t('admin.activityLog.table.admin')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('admin.activityLog.table.email')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('admin.activityLog.table.action')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('admin.activityLog.table.details')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('admin.activityLog.table.datetime')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">{log.adminName || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{log.adminEmail}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{log.action}</TableCell>
                        <TableCell className="text-sm max-w-xs whitespace-pre-line">{log.details}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(log.createdAt).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminActivityLog;
