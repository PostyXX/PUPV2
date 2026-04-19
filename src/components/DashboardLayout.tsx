import { ReactNode, useEffect, useRef, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LayoutDashboard, PawPrint, Calendar, Hospital, Users, Shield, Settings, Menu, Globe, Bell, Sun, Moon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ChatWidget from "@/components/ChatWidget";
import { useI18n } from "@/lib/i18n";

import { getMyNotifications, markNotificationsRead } from "@/lib/db";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('pup_theme') as 'light' | 'dark') || 'light');
  const { lang, setLang, t } = useI18n();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const prevUnreadRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);

  const playNotificationSound = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 tone
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 350);
    } catch {
      // ถ้าเล่นเสียงไม่ได้ ให้เงียบเฉย ๆ
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pup_theme', theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        const list = await getMyNotifications();
        if (cancelled) return;
        const newUnread = list.filter((n) => !n.read).length;
        if (initializedRef.current && newUnread > prevUnreadRef.current) {
          playNotificationSound();
        }
        prevUnreadRef.current = newUnread;
        initializedRef.current = true;
        setNotifications(list);
      } catch {
        // ignore errors
      }
    };

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      prevUnreadRef.current = 0;
    } catch {
      // ignore
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-hero">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-white/10 bg-background/80 backdrop-blur-lg sticky top-0 z-40 flex items-center px-4 gap-3">
            <SidebarTrigger className="hover:bg-muted rounded-lg p-2 transition-colors">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="ml-auto flex items-center gap-3 relative">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Select value={lang} onValueChange={(v) => setLang(v as 'th' | 'en')}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder={t('layout.languageLabel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">{t('layout.language.th')}</SelectItem>
                    <SelectItem value="en">{t('layout.language.en')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-lg relative"
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label={t('sidebar.notifications')}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] px-1 min-w-[16px] h-[16px]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg border bg-popover shadow-lg z-50">
                    <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{t('sidebar.notifications')}</span>
                        <span className="text-xs text-muted-foreground">{t('sidebar.allNotifications')} ({notifications.length})</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:underline whitespace-nowrap"
                        >
                          {t('sidebar.markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                          {t('sidebar.noNotifications')}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-3 py-2 text-sm border-b last:border-b-0 ${
                              n.read ? 'bg-background' : 'bg-muted/70'
                            }`}
                          >
                            <div className="font-medium truncate">{n.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="relative w-10 h-10 p-0 rounded-xl border-2 hover:scale-110 transition-all duration-300 overflow-hidden group"
                aria-label={theme === 'dark' ? t('layout.theme.toggleToLight') : t('layout.theme.toggleToDark')}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? t('layout.theme.toggleToLight') : t('layout.theme.toggleToDark')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />
                )}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
          <ChatWidget />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
