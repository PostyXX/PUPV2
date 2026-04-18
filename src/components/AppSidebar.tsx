import { Heart, Home, Stethoscope, MapPin, MessageSquare, Calendar, Settings, LogOut, Building2, UserPlus, Users, Activity, UserCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getRole, clearSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const userMenu = [
  { key: "nav.dashboard", url: "/dashboard", icon: Home },
  { key: "nav.pets", url: "/pets", icon: Heart },
  { key: "nav.hospitals", url: "/hospitals", icon: MapPin },
  { key: "nav.systemHospitals", url: "/system-hospitals", icon: Building2 },
  { key: "nav.aiChat", url: "/ai-chat", icon: MessageSquare },
  { key: "nav.appointments", url: "/appointments", icon: Calendar },
];

const hospitalMenu = [
  { key: "nav.hospitalDashboard", url: "/dashboard", icon: Home },
  { key: "nav.appointments", url: "/appointments", icon: Calendar },
  { key: "nav.hospitalPets", url: "/hospital/pets", icon: Heart },
];

// สำหรับผู้ดูแลระบบ แสดงเฉพาะ Dashboard หลักในกลุ่มนี้
const adminMenu = [
  { key: "nav.dashboard", url: "/dashboard", icon: Home },
];

const guestMenu = [
  { key: "nav.aiChat", url: "/ai-chat", icon: MessageSquare },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();
  const { t } = useI18n();

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const isActive = (url: string) => location.pathname === url;

  const menuItems =
    role === 'hospital'
      ? hospitalMenu
      : role === 'user'
      ? userMenu
      : role === 'admin'
      ? adminMenu
      : guestMenu;

  return (
    <Sidebar>
      <SidebarContent className="bg-sidebar-background backdrop-blur-sm border-r border-sidebar-border shadow-soft animate-fade-in">
        {/* Logo Section */}
        <div className={`p-4 flex items-center ${!open ? 'justify-center' : 'gap-3'}`}>
          <img
            src="/pup-logo.svg"
            alt="PUP Logo"
            className="w-10 h-10 rounded-lg flex-shrink-0 ring-2 ring-primary/20 shadow-luxury transition-transform duration-200 hover:scale-105 animate-bounce-subtle"
          />
          {open && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                PUP
              </h2>
              <p className="text-xs text-muted-foreground">Pet Urgent Path {role ? `• ${role}` : ''}</p>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        <SidebarGroup>
          {open && <SidebarGroupLabel>{t('nav.dashboard')}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      title={!open ? t(item.key) : undefined}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                    >
                      {isActive(item.url) && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                      )}
                      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                      <item.icon
                        className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} group-hover:scale-105`}
                      />
                      {open && (
                        <span className={`${isActive(item.url) ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                          {t(item.key)}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          {open && <SidebarGroupLabel>{t('nav.settings')}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <NavLink
                    to="/settings"
                    title={!open ? t('nav.settings') : undefined}
                    style={{ animationDelay: `${menuItems.length * 60}ms` }}
                    className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                  >
                    {isActive('/settings') && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                    )}
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                    <Settings className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {open && (
                      <span className={`${isActive('/settings') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                        {t('nav.settings')}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {role === 'admin' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/hospitals/create")}>
                      <NavLink
                        to="/admin/hospitals/create"
                        title={!open ? t('nav.admin.createHospital') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 1) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/hospitals/create') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <Building2 className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/hospitals/create') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/hospitals/create') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.createHospital')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/hospitals")}>
                      <NavLink
                        to="/admin/hospitals"
                        title={!open ? t('nav.admin.manageHospitals') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 2) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/hospitals') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <Building2 className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/hospitals') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/hospitals') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.manageHospitals')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/admins/create")}>
                      <NavLink
                        to="/admin/admins/create"
                        title={!open ? t('nav.admin.createAdmin') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 3) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/admins/create') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <UserPlus className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/admins/create') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/admins/create') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.createAdmin')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/admins")}>
                      <NavLink
                        to="/admin/admins"
                        title={!open ? t('nav.admin.listAdmins') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 4) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/admins') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <Users className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/admins') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/admins') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.listAdmins')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                      <NavLink
                        to="/admin/users"
                        title={!open ? t('nav.admin.listUsers') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 5) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/users') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <Users className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/users') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/users') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.listUsers')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/user-activity")}>
                      <NavLink
                        to="/admin/user-activity"
                        title={!open ? t('nav.admin.userActivity') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 6) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/user-activity') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <UserCheck className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/user-activity') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/user-activity') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.userActivity')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/activity-logs")}>
                      <NavLink
                        to="/admin/activity-logs"
                        title={!open ? t('nav.admin.activityLogs') : undefined}
                        style={{ animationDelay: `${(menuItems.length + 7) * 60}ms` }}
                        className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all overflow-hidden group hover:bg-muted/70 animate-fade-in"
                      >
                        {isActive('/admin/activity-logs') && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                        )}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent,hsla(var(--primary),0.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
                        <Activity className={`${!open ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-colors ${isActive('/admin/activity-logs') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        {open && (
                          <span className={`${isActive('/admin/activity-logs') ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'} transition-transform group-hover:translate-x-0.5`}>
                            {t('nav.admin.activityLogs')}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="p-4">
          <Button
            variant="outline"
            className={`w-full ${!open ? 'px-2' : 'justify-start'} transition-all bg-card/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive border-border hover:scale-[1.01]`}
            onClick={handleLogout}
          >
            <LogOut className={`${!open ? 'w-5 h-5' : 'w-4 h-4 mr-2'}`} />
            {open && t('nav.logout')}
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
