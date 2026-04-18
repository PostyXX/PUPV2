import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { ReactNode } from "react";
import { getRole } from "@/lib/session";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import Hospitals from "./pages/Hospitals";
import SystemHospitals from "./pages/SystemHospitals";
import AIChat from "./pages/AIChat";
import Appointments from "./pages/Appointments";
import HospitalPets from "./pages/HospitalPets";
import Settings from "./pages/Settings";
import AdminHospitals from "./pages/AdminHospitals";
import AdminCreateHospital from "./pages/AdminCreateHospital";
import AdminCreateAdmin from "./pages/AdminCreateAdmin";
import AdminListAdmins from "./pages/AdminListAdmins";
import AdminListUsers from "./pages/AdminListUsers";
import AdminActivityLog from "./pages/AdminActivityLog";
import AdminUserActivity from "./pages/AdminUserActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface RequireRoleProps {
  allowed: Array<'user' | 'hospital' | 'admin' | 'guest'>;
  children: ReactNode;
}

const RequireRole = ({ allowed, children }: RequireRoleProps) => {
  const role = getRole();
  if (!role || !allowed.includes(role)) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <I18nProvider>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <RequireRole allowed={['user', 'hospital', 'admin']}>
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/pets"
            element={
              <RequireRole allowed={['user', 'hospital', 'admin']}>
                <Pets />
              </RequireRole>
            }
          />
          <Route
            path="/hospitals"
            element={
              <RequireRole allowed={['user', 'guest']}>
                <Hospitals />
              </RequireRole>
            }
          />
          <Route
            path="/system-hospitals"
            element={
              <RequireRole allowed={['user', 'guest']}>
                <SystemHospitals />
              </RequireRole>
            }
          />
          <Route
            path="/ai-chat"
            element={
              <RequireRole allowed={['user', 'hospital', 'admin', 'guest']}>
                <AIChat />
              </RequireRole>
            }
          />
          <Route
            path="/appointments"
            element={
              <RequireRole allowed={['user', 'hospital', 'admin']}>
                <Appointments />
              </RequireRole>
            }
          />
          <Route
            path="/hospital/pets"
            element={
              <RequireRole allowed={['hospital']}>
                <HospitalPets />
              </RequireRole>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireRole allowed={['user', 'hospital', 'admin']}>
                <Settings />
              </RequireRole>
            }
          />
          <Route
            path="/admin/hospitals"
            element={
              <RequireRole allowed={['admin']}>
                <AdminHospitals />
              </RequireRole>
            }
          />
          <Route
            path="/admin/hospitals/create"
            element={
              <RequireRole allowed={['admin']}>
                <AdminCreateHospital />
              </RequireRole>
            }
          />
          <Route
            path="/admin/admins/create"
            element={
              <RequireRole allowed={['admin']}>
                <AdminCreateAdmin />
              </RequireRole>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <RequireRole allowed={['admin']}>
                <AdminListAdmins />
              </RequireRole>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireRole allowed={['admin']}>
                <AdminListUsers />
              </RequireRole>
            }
          />
          <Route
            path="/admin/activity-logs"
            element={
              <RequireRole allowed={['admin']}>
                <AdminActivityLog />
              </RequireRole>
            }
          />
          <Route
            path="/admin/user-activity"
            element={
              <RequireRole allowed={['admin']}>
                <AdminUserActivity />
              </RequireRole>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
