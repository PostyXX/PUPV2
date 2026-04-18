import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, Calendar, Heart, Shield, Clock, Stethoscope, PawPrint, Users, Target, Zap, Mail, Phone, MapPinned, Send } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground relative overflow-hidden flex flex-col">
      {/* Premium Background with Multiple Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-40 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
        
        {/* Top right glow - emerald/cyan */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-400/20 via-cyan-400/15 to-transparent dark:from-emerald-400/30 dark:via-cyan-400/20 blur-[100px] animate-pulse-glow" />
        
        {/* Bottom left glow - purple/pink */}
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-transparent dark:from-purple-500/25 dark:via-pink-500/15 blur-[120px] animate-float" />
        
        {/* Center accent - subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-fuchsia-500/5 dark:from-blue-500/10 dark:via-violet-500/10 dark:to-fuchsia-500/10 blur-[150px]" />
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 py-4 px-4">
        <div className="container mx-auto flex items-center justify-between rounded-full bg-card/80 border border-border px-6 py-3 backdrop-blur-xl shadow-luxury">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">PUP</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              ฟีเจอร์
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              เกี่ยวกับเรา
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              ติดต่อ
            </a>
          </div>

          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-pink-500/30 transition-all hover:scale-105"
          >
            เริ่มต้นใช้งาน
          </Button>
        </div>
      </nav>

      {/* Hero Section - Redesigned */}
      <section className="relative pt-8 lg:pt-12 pb-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 max-w-xl animate-fade-in z-10">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-5 py-2.5 text-sm shadow-glow backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-200 dark:to-cyan-200 bg-clip-text text-transparent font-semibold">แพลตฟอร์มฉุกเฉินสัตว์เลี้ยงระดับพรีเมียม</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                <span className="block text-foreground drop-shadow-2xl">ดูแลสัตว์เลี้ยง</span>
                <span className="block text-foreground drop-shadow-2xl">ของคุณด้วย</span>
                <span className="block mt-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: '200% auto' }}>
                  AI & ระบบฉุกเฉิน
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-lg lg:text-xl text-foreground/80 leading-relaxed">
                Pet Urgent Path - แพลตฟอร์มครบวงจรสำหรับดูแลสัตว์เลี้ยง 
                ค้นหาโรงพยาบาลฉุกเฉิน นัดหมาย และปรึกษา AI ได้ตลอด 24 ชั่วโมง
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="group relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white text-lg px-12 py-7 rounded-2xl font-bold shadow-2xl shadow-pink-500/50 transition-all hover:scale-105 hover:shadow-pink-500/60 overflow-hidden"
                >
                  <span className="relative z-10">เริ่มต้นใช้งานฟรี</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
                <button
                  type="button"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-slate-900 dark:text-white hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-xl"
                  onClick={() => {
                    const features = document.getElementById("features");
                    if (features) {
                      features.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <span>ดูการทำงานของระบบ</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-foreground/70">พร้อมช่วยเหลือ</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-foreground/70">โรงพยาบาล</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">AI</div>
                  <div className="text-sm text-foreground/70">วิเคราะห์อัจฉริยะ</div>
                </div>
              </div>
            </div>

            {/* Right Content - 3D Pet Illustration */}
            <div className="relative animate-fade-in-slow flex items-center justify-center lg:justify-end z-10">
              <div className="relative w-full max-w-lg">
                {/* Main 3D Container */}
                <div className="relative aspect-square">
                  {/* Outer glow rings */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl animate-pulse-glow" />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl animate-float" />
                  
                  {/* 3D Pet Circle - Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Rotating ring 1 */}
                    <div className="absolute w-[85%] h-[85%] rounded-full border-2 border-emerald-400/30 animate-spin" style={{ animationDuration: '20s' }} />
                    
                    {/* Rotating ring 2 */}
                    <div className="absolute w-[70%] h-[70%] rounded-full border-2 border-cyan-400/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                    
                    {/* Main 3D sphere */}
                    <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 shadow-2xl shadow-emerald-500/50 flex items-center justify-center transform-gpu">
                      {/* Inner glow */}
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-xl" />
                      
                      {/* Stethoscope Icon */}
                      <Stethoscope className="relative w-28 h-28 text-white drop-shadow-2xl z-10" />
                      
                      {/* Shine effect */}
                      <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-white/40 blur-2xl" />
                    </div>
                  </div>
                  
                  {/* Floating 3D Pet Icons */}
                  <div className="absolute top-12 right-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl shadow-pink-500/50 flex items-center justify-center animate-float transform hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '0s' }}>
                    <Heart className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                  
                  <div className="absolute bottom-16 left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl shadow-blue-500/50 flex items-center justify-center animate-bounce-subtle transform hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '0.5s' }}>
                    <PawPrint className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  
                  <div className="absolute top-1/3 left-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-xl shadow-purple-500/50 flex items-center justify-center animate-float transform hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '1s' }}>
                    <Shield className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                  
                  <div className="absolute bottom-8 right-12 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-500/50 flex items-center justify-center animate-bounce-subtle transform hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '1.5s' }}>
                    <PawPrint className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Feature Cards - Below the illustration */}
                <div className="mt-12 grid grid-cols-3 gap-4">
                  <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 backdrop-blur-xl hover:bg-white/10 hover:border-emerald-400/30 transition-all cursor-pointer">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MapPin className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">ค้นหา</div>
                    <div className="text-[10px] text-slate-400">โรงพยาบาล</div>
                  </div>
                  
                  <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 backdrop-blur-xl hover:bg-white/10 hover:border-purple-400/30 transition-all cursor-pointer">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="w-5 h-5 text-purple-400 mb-2" />
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">AI หมอ</div>
                    <div className="text-[10px] text-slate-400">ปรึกษา 24/7</div>
                  </div>
                  
                  <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 backdrop-blur-xl hover:bg-white/10 hover:border-pink-400/30 transition-all cursor-pointer">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Calendar className="w-5 h-5 text-pink-400 mb-2" />
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">นัดหมาย</div>
                    <div className="text-[10px] text-slate-400">จัดการง่าย</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Premium Design */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Stat 1 */}
            <div className="group text-center space-y-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-emerald-400/30 backdrop-blur-xl transition-all hover:scale-105">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">500+</div>
              <div className="text-xs text-slate-400">โรงพยาบาลเข้าร่วม</div>
            </div>

            {/* Stat 2 */}
            <div className="group text-center space-y-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-400/30 backdrop-blur-xl transition-all hover:scale-105">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">AI</div>
              <div className="text-xs text-slate-400">ปรึกษาสุขภาพ</div>
            </div>

            {/* Stat 3 */}
            <div className="group text-center space-y-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-pink-400/30 backdrop-blur-xl transition-all hover:scale-105">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-shadow">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">นัดหมาย</div>
              <div className="text-xs text-slate-400">ออนไลน์ง่ายๆ</div>
            </div>

            {/* Stat 4 */}
            <div className="group text-center space-y-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-400/30 backdrop-blur-xl transition-all hover:scale-105">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-xs text-slate-400">พร้อมดูแลตลอดเวลา</div>
            </div>

            {/* Stat 5 */}
            <div className="group text-center space-y-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-orange-400/30 backdrop-blur-xl transition-all hover:scale-105">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">10K+</div>
              <div className="text-xs text-slate-400">ผู้ใช้งานไว้วางใจ</div>
            </div>

            {/* Stat 6 */}
            <div className="group text-center space-y-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-cyan-400/30 backdrop-blur-xl transition-all hover:scale-105">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">100%</div>
              <div className="text-xs text-slate-400">ข้อมูลปลอดภัย</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Design */}
      <section id="features" className="relative py-24 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-5 py-2 text-sm backdrop-blur-xl">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-slate-900 dark:text-purple-200 font-semibold">ฟีเจอร์ทรงพลัง</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
              ฟีเจอร์ที่ช่วย<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ดูแลสัตว์เลี้ยง</span>ของคุณ
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              ระบบครบวงจรที่ออกแบบมาเพื่อให้คุณดูแลสัตว์เลี้ยงได้อย่างมั่นใจในทุกสถานการณ์
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-emerald-400/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-300 transition-colors">ค้นหาโรงพยาบาลฉุกเฉิน</h3>
                <p className="text-slate-300 leading-relaxed">
                  ระบุตำแหน่งของคุณอัตโนมัติและแสดงโรงพยาบาลใกล้ที่สุดพร้อมเส้นทาง
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-300 transition-colors">ปรึกษา AI คุณหมอ</h3>
                <p className="text-slate-300 leading-relaxed">
                  วิเคราะห์อาการเบื้องต้นและให้คำแนะนำอย่างรวดเร็วตลอด 24 ชั่วโมง
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-pink-400/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-pink-300 transition-colors">จัดการนัดหมาย & วัคซีน</h3>
                <p className="text-slate-300 leading-relaxed">
                  เก็บตารางฉีดวัคซีนและแจ้งเตือนอัตโนมัติไม่ให้พลาดนัดสำคัญ
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-300 transition-colors">ประวัติสุขภาพครบถ้วน</h3>
                <p className="text-slate-300 leading-relaxed">
                  บันทึกการรักษา, อาการ, ยา และไฟล์แนบอย่างเป็นระบบ
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-orange-400/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-300 transition-colors">ความปลอดภัยของข้อมูล</h3>
                <p className="text-slate-300 leading-relaxed">
                  ระบบจัดเก็บข้อมูลด้วยมาตรฐานความปลอดภัยระดับสูง
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-cyan-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-300 transition-colors">พร้อมช่วยเหลือ 24/7</h3>
                <p className="text-slate-300 leading-relaxed">
                  สำหรับเหตุการณ์ฉุกเฉินทุกเวลา ไม่ว่าจะกลางวันหรือกลางคืน
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section - Premium Design */}
      <section id="about" className="relative py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Content */}
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-5 py-2 text-sm backdrop-blur-xl">
                  <PawPrint className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-900 dark:text-emerald-200 font-semibold">เกี่ยวกับเรา</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  เราคือ<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ใคร?</span>
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Pet Urgent Path (PUP)</strong> คือแพลตฟอร์มที่พัฒนาขึ้นเพื่อช่วยเหลือเจ้าของสัตว์เลี้ยง
                  ในการดูแลสุขภาพและรับมือกับสถานการณ์ฉุกเฉินของสัตว์เลี้ยงอย่างมีประสิทธิภาพ
                </p>
              </div>

              <div className="space-y-6">
                <div className="group flex items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-emerald-400/30 transition-all hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">พันธกิจของเรา</h3>
                    <p className="text-slate-300">
                      สร้างระบบนิเวศที่ช่วยให้เจ้าของสัตว์เลี้ยงสามารถเข้าถึงบริการสุขภาพสัตว์ได้อย่างรวดเร็ว
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-400/30 transition-all hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ทีมของเรา</h3>
                    <p className="text-slate-300">
                      ทีมงานที่รักสัตว์และมีความเชี่ยวชาญด้านเทคโนโลยี พร้อมพัฒนาโซลูชันที่ตอบโจทย์ผู้ใช้งานจริง
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-pink-400/30 transition-all hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">เทคโนโลยี AI</h3>
                    <p className="text-slate-300">
                      ใช้ปัญญาประดิษฐ์ในการวิเคราะห์อาการเบื้องต้น ช่วยให้คุณตัดสินใจได้อย่างรวดเร็ว
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual Stats */}
            <div className="relative animate-fade-in-slow">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 border border-white/20 backdrop-blur-2xl shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 text-center border border-white/10 hover:border-emerald-400/30 transition-all hover:scale-105">
                    <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">500+</div>
                    <div className="text-sm text-slate-400">โรงพยาบาลพันธมิตร</div>
                  </div>
                  <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 text-center border border-white/10 hover:border-purple-400/30 transition-all hover:scale-105">
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-2">10K+</div>
                    <div className="text-sm text-slate-400">ผู้ใช้งานที่ไว้วางใจ</div>
                  </div>
                  <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 text-center border border-white/10 hover:border-pink-400/30 transition-all hover:scale-105">
                    <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">24/7</div>
                    <div className="text-sm text-slate-400">พร้อมให้บริการ</div>
                  </div>
                  <div className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 text-center border border-white/10 hover:border-cyan-400/30 transition-all hover:scale-105">
                    <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">99%</div>
                    <div className="text-sm text-slate-400">ความพึงพอใจ</div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/30">
                  <p className="text-base text-emerald-200 text-center font-medium italic">
                    "เราเชื่อว่าสัตว์เลี้ยงทุกตัวสมควรได้รับการดูแลที่ดีที่สุด"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Premium Design */}
      <section id="contact" className="relative py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-gradient-to-r from-pink-500/10 to-rose-500/10 px-5 py-2 text-sm backdrop-blur-xl">
              <Mail className="w-4 h-4 text-pink-400" />
              <span className="text-slate-900 dark:text-pink-200 font-semibold">ติดต่อเรา</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
              พร้อม<span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">ช่วยเหลือ</span>คุณเสมอ
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานของเราพร้อมตอบทุกข้อสงสัย
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">อีเมล</h3>
                    <p className="text-slate-700 dark:text-blue-200/60">arituch.y@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">โทรศัพท์</h3>
                    <p className="text-slate-700 dark:text-blue-200/60">062-352-5962 (24 ชั่วโมง)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-pink-400/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center">
                    <MapPinned className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">ที่อยู่</h3>
                    <p className="text-slate-700 dark:text-blue-200/60">กรุงเทพมหานคร, ประเทศไทย</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">ส่งข้อความถึงเรา</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-blue-200/70 mb-2">ชื่อ</label>
                    <input
                      type="text"
                      placeholder="ชื่อของคุณ"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-blue-200/40 focus:outline-none focus:border-green-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-blue-200/70 mb-2">อีเมล</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-blue-200/40 focus:outline-none focus:border-green-400/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-blue-200/70 mb-2">หัวข้อ</label>
                  <input
                    type="text"
                    placeholder="หัวข้อที่ต้องการติดต่อ"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-blue-200/40 focus:outline-none focus:border-green-400/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-blue-200/70 mb-2">ข้อความ</label>
                  <textarea
                    rows={4}
                    placeholder="รายละเอียดที่ต้องการสอบถาม..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-blue-200/40 focus:outline-none focus:border-green-400/50 transition-colors resize-none"
                  />
                </div>
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-6 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  ส่งข้อความ
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Design */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-[3rem] p-16 lg:p-20 border border-white/20 text-center overflow-hidden shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/30 to-transparent rounded-full blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/30 to-transparent rounded-full blur-[120px] animate-float" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-full blur-[150px]" />
            
            <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-gradient-to-r from-pink-500/10 to-rose-500/10 px-5 py-2 text-sm backdrop-blur-xl">
                <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
                <span className="text-slate-900 dark:text-pink-200 font-semibold">เริ่มต้นวันนี้</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                พร้อมดูแล<span className="bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">สัตว์เลี้ยง</span>ของคุณ<br />แล้วหรือยัง?
              </h2>
              
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                เริ่มใช้งาน PUP วันนี้ ฟรี! แล้วให้ระบบช่วยคุณเตรียมความพร้อม
                สำหรับทุกสถานการณ์ฉุกเฉินของสัตว์เลี้ยงที่คุณรัก
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="group relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white text-xl px-16 py-8 rounded-2xl font-bold shadow-2xl shadow-pink-500/50 transition-all hover:scale-110 hover:shadow-pink-500/60 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    สมัครสมาชิกฟรี
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-8 pt-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>ไม่ต้องบัตรเครดิต</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>ใช้งานได้ทันที</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>ยกเลิกได้ตลอดเวลา</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Premium Design */}
      <footer className="relative py-16 px-4 border-t border-white/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <PawPrint className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">PUP</span>
                <p className="text-xs text-slate-400">Pet Urgent Path</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-slate-300 text-center">
                2024 Pet Urgent Path. ดูแลสัตว์เลี้ยงของคุณด้วยความรักและความปลอดภัย
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>ทุกสิทธิ์สงวนไว้</span>
                <span>•</span>
                <span>นโยบายความเป็นส่วนตัว</span>
                <span>•</span>
                <span>เงื่อนไขการใช้งาน</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
