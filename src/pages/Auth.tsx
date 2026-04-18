import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, PawPrint, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<'user' | 'hospital' | 'admin'>("user");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t('auth.error.genericSignup'));
      }

      // สมัครเสร็จแล้ว ทำการล็อกอินทันทีเพื่อรับ token
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => null);
        throw new Error(data?.error || t('auth.signupLoginError'));
      }

      const loginData = await loginRes.json() as { token: string; user: { id: string; role: 'user' | 'hospital' | 'admin'; email: string; name: string } };

      localStorage.setItem("pup_token", loginData.token);
      setSession(loginData.user.role, loginData.user.id);

      toast({
        title: t('auth.signupSuccess.title'),
        description: t('auth.signupSuccess.description'),
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t('auth.error.title'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const userId = `guest_${Date.now()}`;
    setSession('guest', userId);
    toast({
      title: t('auth.guestLogin.toastTitle'),
      description: t('auth.guestLogin.toastDescription'),
    });
    navigate("/hospitals");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t('auth.error.genericSignin'));
      }

      const data = await res.json() as { token: string; user: { id: string; role: 'user' | 'hospital' | 'admin'; email: string; name: string } };

      localStorage.setItem("pup_token", data.token);
      setSession(data.user.role, data.user.id);

      toast({
        title: t('auth.signinSuccess.title'),
        description: t('auth.signinSuccess.description'),
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-40 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-400/20 via-cyan-400/15 to-transparent dark:from-emerald-400/30 dark:via-cyan-400/20 blur-[100px] animate-pulse-glow" />
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-transparent dark:from-purple-500/25 dark:via-pink-500/15 blur-[120px] animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-fuchsia-500/5 dark:from-blue-500/10 dark:via-violet-500/10 dark:to-fuchsia-500/10 blur-[150px]" />
      </div>
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">กลับหน้าหลัก</span>
      </button>
      
      <Card className="w-full max-w-md shadow-2xl relative z-10 bg-card/95 backdrop-blur-2xl border-border animate-scale-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-2 shadow-xl shadow-emerald-500/40 animate-float">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {isSignUp ? 'สร้างบัญชีใหม่เพื่อเริ่มใช้งาน PUP' : 'ยินดีต้อนรับกลับสู่ Pet Urgent Path'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Animated Toggle Switch */}
          <div className="relative mb-8">
            <div className="flex rounded-2xl bg-muted/50 p-1.5 border border-border">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  !isSignUp
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  isSignUp
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>
          </div>
          
          {/* Sign In Form */}
          <div className={`transition-all duration-500 ${
            !isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute pointer-events-none'
          }`}>
            {!isSignUp && (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="email-signin" className="text-foreground font-medium">อีเมล</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password-signin" className="text-foreground font-medium">รหัสผ่าน</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    onClick={() => navigate("/forgot-password")}
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="role-signin" className="text-foreground font-medium">ประเภทผู้ใช้</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as any)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="เลือกประเภทผู้ใช้" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">ผู้ใช้ทั่วไป</SelectItem>
                      <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                      <SelectItem value="hospital">โรงพยาบาล</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white text-base font-bold rounded-xl shadow-xl shadow-pink-500/40 transition-all hover:scale-105 hover:shadow-pink-500/50 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 mt-3 rounded-xl font-semibold transition-all"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  เข้าใช้งานแบบผู้เยี่ยมชม
                </Button>
              </form>
            )}
          </div>
          
          {/* Sign Up Form */}
          <div className={`transition-all duration-500 ${
            isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 absolute pointer-events-none'
          }`}>
            {isSignUp && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="fullname" className="text-foreground font-medium">ชื่อ-นามสกุล</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="ชื่อและนามสกุลของคุณ"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email-signup" className="text-foreground font-medium">อีเมล</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password-signup" className="text-foreground font-medium">รหัสผ่าน</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white text-base font-bold rounded-xl shadow-xl shadow-emerald-500/40 transition-all hover:scale-105 hover:shadow-emerald-500/50 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  การสมัครสมาชิกหมายความว่าคุณยอมรับ{' '}
                  <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    เงื่อนไขการใช้งาน
                  </button>
                </p>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
