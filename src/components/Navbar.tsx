import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useI18n();

  const handleSignOut = async () => {
    try {
      setIsLoggedIn(false);
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "แล้วพบกันใหม่!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/pup-logo.svg" alt="PUP Logo" className="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            PUP
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('navbar.dashboard')}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleSignOut}
              >
                <span className="hidden sm:inline">{t('navbar.logout')}</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {t('navbar.login')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
