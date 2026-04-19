import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart, Search } from "lucide-react";
import { loadArray, saveArray } from "@/lib/storage";
import { getUserId } from "@/lib/session";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface LinkedPet {
  id: string;
  petId: string;
  name: string;
  type?: string | null;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  gender?: string | null;
}

const HospitalPets = () => {
  const [petIdInput, setPetIdInput] = useState("");
  const [pets, setPets] = useState<LinkedPet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const hospitalId = getUserId();
  const STORAGE_KEY = hospitalId
    ? `pup_hospital_linked_pets_${hospitalId}`
    : "pup_hospital_linked_pets";

  useEffect(() => {
    const stored = loadArray<LinkedPet>(STORAGE_KEY, []);
    const token = localStorage.getItem("pup_token");

    // ถ้ายังไม่มี token หรือไม่มีอะไรใน localStorage ให้ใช้ตามที่เก็บไว้ก่อน
    if (!token || stored.length === 0) {
      setPets(stored);
      return;
    }

    let cancelled = false;

    const refreshFromBackend = async () => {
      const refreshed: LinkedPet[] = [];

      for (const p of stored) {
        try {
          const res = await fetch(`${API_BASE}/pets/link/by-petid`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ petId: p.petId }),
          });

          if (!res.ok) continue;
          const data = (await res.json()) as LinkedPet;
          refreshed.push(data);
        } catch {
          // ถ้าดึงตัวใดตัวหนึ่งไม่สำเร็จ (เช่น pet ถูกลบไปแล้ว) ก็ข้ามไปเฉยๆ
        }
      }

      if (!cancelled) {
        // ถ้า backend มีปัญหาหรือดึงข้อมูลไม่ได้ ให้ยังใช้ข้อมูลเดิมจาก localStorage แทน
        setPets(refreshed.length > 0 ? refreshed : stored);
      }
    };

    refreshFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveArray(STORAGE_KEY, pets);
  }, [pets]);

  const filteredPets = pets.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.petId.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q)
    );
  });

  const handleRemovePet = (id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLinkByPetId = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = petIdInput.trim();
    if (!trimmed) return;

    const token = localStorage.getItem("pup_token");
    if (!token) {
      toast({
        title: "ยังไม่ได้เข้าสู่ระบบ",
        description: "กรุณาเข้าสู่ระบบในฐานะโรงพยาบาลก่อน",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pets/link/by-petid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ petId: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "ไม่พบสัตว์เลี้ยงตามรหัสที่ระบุ");
      }

      const data = await res.json() as LinkedPet;
      setPets((prev) => {
        const exists = prev.some((p) => p.petId === data.petId);
        return exists ? prev : [...prev, data];
      });
      toast({
        title: "เชื่อมข้อมูลสำเร็จ",
        description: `พบสัตว์เลี้ยงรหัส ${data.petId}`,
      });
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
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">สัตว์เลี้ยงในระบบของโรงพยาบาล</h1>
          <p className="text-muted-foreground">
            กรอกรหัส Pet ID ที่ผู้ใช้ให้มา เพื่อดึงและเชื่อมข้อมูลสัตว์เลี้ยงเข้าสู่ระบบของโรงพยาบาล
          </p>
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              ค้นหาและเชื่อมด้วย Pet ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLinkByPetId} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="petId">
                  รหัสสัตว์เลี้ยง (Pet ID)
                </label>
                <Input
                  id="petId"
                  placeholder="เช่น P-123456"
                  value={petIdInput}
                  onChange={(e) => setPetIdInput(e.target.value)}
                  className="max-w-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "กำลังค้นหา..." : "เชื่อมสัตว์เลี้ยงด้วย Pet ID"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {pets.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                สัตว์เลี้ยงที่เชื่อมในระบบ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 max-w-sm">
                <Input
                  placeholder="ค้นหาจากชื่อหรือ Pet ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-3 py-2 text-left font-semibold">Pet ID</th>
                      <th className="px-3 py-2 text-left font-semibold">ชื่อ</th>
                      <th className="px-3 py-2 text-left font-semibold">ประเภท</th>
                      <th className="px-3 py-2 text-left font-semibold">สายพันธุ์</th>
                      <th className="px-3 py-2 text-left font-semibold">เพศ</th>
                      <th className="px-3 py-2 text-left font-semibold">อายุ (ปี)</th>
                      <th className="px-3 py-2 text-left font-semibold">น้ำหนัก (กก.)</th>
                      <th className="px-3 py-2 text-right font-semibold">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPets.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/40">
                        <td className="px-3 py-2 whitespace-nowrap">{p.petId}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.type ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.breed ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.gender ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.age != null ? p.age : '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{p.weight != null ? p.weight : '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <Button
                            type="button"
                            variant="outline"
                            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemovePet(p.id)}
                          >
                            ลบ
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HospitalPets;
