import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { Activity, Eye } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface UserActivity {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  lastActiveAt: string | null;
  lastLoginAt: string | null;
}

interface UserSession {
  id: string;
  loginAt: string;
  lastActiveAt: string;
  logoutAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

interface UserActivityDetail {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  sessions: UserSession[];
}

const AdminUserActivity = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserActivityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("pup_token") : null;

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user-activity/users-activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.userActivity.toast.loadError'),
          description: data?.error || t('admin.userActivity.toast.loadErrorDesc'),
          variant: "destructive",
        });
        return;
      }
      const data = await res.json() as UserActivity[];
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const loadUserDetail = async (userId: string) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user-activity/users-activity/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: t('admin.userActivity.toast.loadDetailError'),
          description: data?.error || t('admin.userActivity.toast.loadDetailErrorDesc'),
          variant: "destructive",
        });
        return;
      }
      const detail = await res.json() as UserActivityDetail;
      setSelectedUser(detail);
      setDialogOpen(true);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionDuration = (loginAt: string, logoutAt: string | null) => {
    const login = new Date(loginAt);
    const logout = logoutAt ? new Date(logoutAt) : new Date();
    const durationMs = logout.getTime() - login.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ชม. ${minutes % 60} นาที`;
    }
    return `${minutes} นาที`;
  };

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.length - activeCount;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" />
            {t('admin.userActivity.title')}
          </h1>
          <p className="text-muted-foreground">{t('admin.userActivity.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('admin.userActivity.stats.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t('admin.userActivity.stats.active')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {t('admin.userActivity.stats.inactive')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t('admin.userActivity.cardTitle')}</CardTitle>
            <CardDescription>{t('admin.userActivity.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center gap-3">
              <Input
                placeholder={t('admin.userActivity.search')}
                className="max-w-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
                {loading ? t('admin.userActivity.button.refreshing') : t('admin.userActivity.button.refresh')}
              </Button>
            </div>

            {filtered.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('admin.userActivity.empty')}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-medium">{t('admin.userActivity.table.status')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.userActivity.table.name')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.userActivity.table.email')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.userActivity.table.lastActive')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('admin.userActivity.table.lastLogin')}</th>
                      <th className="px-3 py-2 text-center font-medium">{t('admin.userActivity.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className="hover:bg-muted/60 border-b border-border/50">
                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                u.isActive
                                  ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                  : 'bg-red-500'
                              }`}
                            />
                            <span className={`text-xs font-medium ${
                              u.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {u.isActive ? t('admin.userActivity.status.active') : t('admin.userActivity.status.inactive')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle font-medium">{u.name || "-"}</td>
                        <td className="px-3 py-3 align-middle text-muted-foreground">{u.email}</td>
                        <td className="px-3 py-3 align-middle text-muted-foreground text-xs">
                          {formatDateTime(u.lastActiveAt)}
                        </td>
                        <td className="px-3 py-3 align-middle text-muted-foreground text-xs">
                          {formatDateTime(u.lastLoginAt)}
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadUserDetail(u.id)}
                              disabled={detailLoading}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              {t('admin.userActivity.button.viewDetail')}
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.userActivity.detail.title')}</DialogTitle>
            <DialogDescription>{t('admin.userActivity.detail.description')}</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.userActivity.detail.name')}</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.userActivity.detail.email')}</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.userActivity.detail.registered')}</p>
                  <p className="font-medium">{formatDateTime(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.userActivity.detail.totalSessions')}</p>
                  <p className="font-medium">{selectedUser.sessions.length}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">{t('admin.userActivity.detail.sessionHistory')}</h3>
                {selectedUser.sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('admin.userActivity.detail.noSessions')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.sessions.map((session, idx) => (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {t('admin.userActivity.detail.session')} #{selectedUser.sessions.length - idx}
                            </span>
                            {!session.logoutAt && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                                {t('admin.userActivity.detail.currentSession')}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {t('admin.userActivity.detail.duration')}: {getSessionDuration(session.loginAt, session.logoutAt)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">{t('admin.userActivity.detail.loginTime')}:</span>
                            <span className="ml-2 font-medium">{formatDateTime(session.loginAt)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.userActivity.detail.lastActive')}:</span>
                            <span className="ml-2 font-medium">{formatDateTime(session.lastActiveAt)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.userActivity.detail.logoutTime')}:</span>
                            <span className="ml-2 font-medium">
                              {session.logoutAt ? formatDateTime(session.logoutAt) : t('admin.userActivity.detail.stillActive')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.userActivity.detail.ipAddress')}:</span>
                            <span className="ml-2 font-medium">{session.ipAddress || "-"}</span>
                          </div>
                        </div>

                        {session.userAgent && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">{t('admin.userActivity.detail.device')}:</span>
                            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                              {session.userAgent}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminUserActivity;
