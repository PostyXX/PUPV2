import { useEffect, useMemo, useState, Component, ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Navigation, Search } from "lucide-react";
import { mockHospitals, Hospital, Pet } from "@/data/mockData";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { getRole, getUserId } from "@/lib/session";
import { loadArray, saveArray } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const Hospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [radiusKm, setRadiusKm] = useState(20);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'hospital' | 'clinic'>('all');

  const { t } = useI18n();
  const role = getRole();
  const [petIdInput, setPetIdInput] = useState("");
  const [linkedPet, setLinkedPet] = useState<Pet | null>(null);
  const [petError, setPetError] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);

  // Configure default marker icons (CDN) to avoid bundling issues
  useEffect(() => {
    setIsClient(true);
    try {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch {}
  }, []);

  // Get user geolocation (optional)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // Silent fail: keep mock distances if permission denied
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // โหลดรายชื่อโรงพยาบาล/คลินิกจาก backend
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoadingLive(true);
      setLiveError(null);
      try {
        let url = `${API_BASE}/hospitals`;
        
        // ถ้ามีตำแหน่งผู้ใช้ ให้เรียก API /hospitals/search-nearby เพื่อค้นหาจาก OpenStreetMap
        if (userLocation) {
          url = `${API_BASE}/hospitals/search-nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&radius=${radiusKm}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`โหลดข้อมูลโรงพยาบาลไม่สำเร็จ (${res.status})`);
        }
        const data = await res.json() as Array<{
          id: string;
          name: string;
          type?: string;
          address?: string | null;
          phone?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          openingTime?: string | null;
          closingTime?: string | null;
          isOpen24h?: boolean | null;
          description?: string | null;
          rating?: number | null;
          image?: string | null;
          mapUrl?: string | null;
          distance?: number;
          source?: string;
        }>;

        if (!data || data.length === 0) {
          setLiveError("ไม่พบโรงพยาบาลหรือคลินิกสัตว์ใกล้เคียง กรุณาลองเพิ่มรัศมีการค้นหา");
          setHospitals([]);
          return;
        }

        const mapped: Hospital[] = data
          .filter(h => {
            // กรองตาม type ถ้าเลือก
            if (filterType === 'all') return true;
            return h.type === filterType;
          })
          .map(h => ({
            id: h.id,
            name: h.name,
            type: h.type || 'hospital',
            address: h.address || "ไม่มีข้อมูลที่อยู่",
            phone: h.phone || "ไม่มีข้อมูลเบอร์โทร",
            latitude: h.latitude ?? 0,
            longitude: h.longitude ?? 0,
            openingTime: h.openingTime || "08:00",
            closingTime: h.closingTime || "20:00",
            isOpen24h: Boolean(h.isOpen24h),
            description: h.description || (h.source === 'openstreetmap' ? 'ข้อมูลจาก OpenStreetMap' : t('systemHospitals.defaultDesc')),
            image: h.image || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
            rating: h.rating ?? 4.5,
            specialties: [],
            distance: h.distance ?? 0,
            mapUrl: h.mapUrl || undefined,
          }));

        setHospitals(mapped);
        if (mapped.length > 0) {
          setLiveError(null);
        }
      } catch (e: any) {
        setLiveError(e?.message || "ดึงข้อมูลโรงพยาบาลจากเซิร์ฟเวอร์ไม่สำเร็จ");
        setHospitals([]);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchHospitals();
  }, [userLocation, radiusKm, filterType]);

  // Filter hospitals by search term (API already handles distance filtering)
  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter((h) =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.distance - b.distance);
  }, [hospitals, searchTerm]);

  const handleLookupPet = async () => {
    const trimmed = petIdInput.trim();
    if (!trimmed) {
      setPetError(t('hospitals.linkPet.errorEmpty'));
      setLinkedPet(null);
      return;
    }

    // ถ้าเป็น role hospital ให้เรียก backend เพื่อเชื่อมสัตว์เลี้ยงเหมือนหน้า HospitalPets
    if (role === 'hospital') {
      const token = localStorage.getItem('pup_token');
      if (!token) {
        setPetError(t('hospitals.linkPet.error'));
        setLinkedPet(null);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/pets/link/by-petid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ petId: trimmed }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || t('hospitals.linkPet.error'));
        }

        const data = await res.json() as Pet & { petId: string };
        setLinkedPet(data as Pet);
        setPetError(null);

        // บันทึกลง localStorage key เดียวกับหน้า HospitalPets/Appointments
        const hospitalId = getUserId();
        const STORAGE_KEY = hospitalId
          ? `pup_hospital_linked_pets_${hospitalId}`
          : 'pup_hospital_linked_pets';

        type LinkedPetLocal = {
          id: string;
          petId: string;
          name: string;
          type?: string | null;
          breed?: string | null;
          age?: number | null;
          weight?: number | null;
          gender?: string | null;
        };

        const existing = loadArray<LinkedPetLocal>(STORAGE_KEY, []);
        const exists = existing.some(p => p.petId === data.petId);
        if (!exists) {
          const entry: LinkedPetLocal = {
            id: (data as any).id || data.petId,
            petId: data.petId,
            name: data.name,
            type: (data as any).type ?? null,
            breed: (data as any).breed ?? null,
            age: (data as any).age ?? null,
            weight: (data as any).weight ?? null,
            gender: (data as any).gender ?? null,
          };
          saveArray(STORAGE_KEY, [...existing, entry]);
        }
      } catch (e: any) {
        setPetError(e?.message || t('hospitals.linkPet.error'));
        setLinkedPet(null);
      }

      return;
    }

    // กรณี role อื่น (เช่น user) ใช้ lookup จาก local เหมือนเดิม
    const pets = loadArray<Pet>('pup_pets', []);
    const found = pets.find((p) => (p as any).petId === trimmed);
    if (!found) {
      setPetError(t('hospitals.linkPet.error'));
      setLinkedPet(null);
      return;
    }

    setLinkedPet(found as Pet);
    setPetError(null);
  };

  const getStatusBadge = (hospital: Hospital) => {
    if (hospital.isOpen24h) {
      return <Badge className="bg-gradient-primary text-white">{t('hospitals.status.open24h')}</Badge>;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const openHour = parseInt(hospital.openingTime.split(':')[0]);
    const closeHour = parseInt(hospital.closingTime.split(':')[0]);
    
    if (currentHour >= openHour && currentHour < closeHour) {
      return <Badge className="bg-green-100 text-green-700">{t('hospitals.status.open')}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700">{t('hospitals.status.closed')}</Badge>;
  };

  const navigateGoogleMaps = (h: Hospital) => {
    if (h.mapUrl) {
      window.open(h.mapUrl, "_blank");
      return;
    }
    if (h.latitude === 0 && h.longitude === 0) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}&destination_place_id=&travelmode=driving`;
    window.open(url, "_blank");
  };

  const callHospital = (h: Hospital) => {
    window.location.href = `tel:${h.phone.replace(/\s|-/g, "")}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('hospitals.systemTitle')}</h1>
          <p className="text-muted-foreground">{t('hospitals.systemSubtitle')}</p>
          <p className="text-xs mt-1 text-muted-foreground">
            {t('hospitals.systemNote')}{" "}
            {loadingLive ? t('hospitals.systemLoading') : liveError ? ` • ${liveError}` : ''}
          </p>
        </div>

        {role === 'hospital' && (
          <Card className="border-dashed border-primary/40 bg-background/60">
            <CardHeader>
              <CardTitle>{t('hospitals.linkPet.title')}</CardTitle>
              <CardDescription>
                {t('hospitals.linkPet.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Input
                  placeholder={t('hospitals.linkPet.placeholder')}
                  value={petIdInput}
                  onChange={(e) => setPetIdInput(e.target.value)}
                  className="sm:max-w-xs"
                />
                <Button onClick={handleLookupPet} className="bg-gradient-primary hover:opacity-90">
                  {t('hospitals.linkPet.button')}
                </Button>
              </div>
              {petError && (
                <p className="text-sm text-red-500">{petError}</p>
              )}
              {linkedPet && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/40 space-y-2">
                  <p className="text-sm font-semibold">{t('hospitals.linkPet.linkedTitle')}</p>
                  <p className="text-sm">{t('hospitals.linkPet.name')}: {linkedPet.name}</p>
                  <p className="text-sm">{t('hospitals.linkPet.breed')}: {linkedPet.breed}</p>
                  <p className="text-sm">{t('hospitals.linkPet.type')}: {linkedPet.type}</p>
                  <p className="text-sm">{t('hospitals.linkPet.age')}: {linkedPet.age} {t('pets.form.ageYears')}</p>
                  <p className="text-sm">{t('hospitals.linkPet.weight')}: {linkedPet.weight} kg</p>
                  <p className="text-sm">{t('hospitals.linkPet.notes')}: {linkedPet.medicalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Bar + Quick Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('hospitals.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">ประเภท:</span>
              <Button
                size="sm"
                variant={filterType === 'all' ? "default" : "outline"}
                className={filterType === 'all' ? "bg-gradient-primary" : ""}
                onClick={() => setFilterType('all')}
              >
                ทั้งหมด
              </Button>
              <Button
                size="sm"
                variant={filterType === 'hospital' ? "default" : "outline"}
                className={filterType === 'hospital' ? "bg-gradient-primary" : ""}
                onClick={() => setFilterType('hospital')}
              >
                🏥 โรงพยาบาล
              </Button>
              <Button
                size="sm"
                variant={filterType === 'clinic' ? "default" : "outline"}
                className={filterType === 'clinic' ? "bg-gradient-primary" : ""}
                onClick={() => setFilterType('clinic')}
              >
                🏪 คลินิก
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">รัศมี:</span>
              {[5, 10, 20, 50].map((km) => (
                <Button
                  key={km}
                  size="sm"
                  variant={radiusKm === km ? "default" : "outline"}
                  className={radiusKm === km ? "bg-gradient-primary" : ""}
                  onClick={() => setRadiusKm(km)}
                >
                  {km} กม.
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Map with ErrorBoundary and client-only guard */}
        <Card className="overflow-hidden shadow-luxury">
          <CardHeader className="pb-0 bg-gradient-primary text-white">
            <CardTitle>{t('hospitals.map.title')}</CardTitle>
            <CardDescription className="text-white/90">
              {t('hospitals.map.description')} {userLocation ? t('hospitals.map.userLocation') : t('hospitals.map.systemLocation')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[480px]">
              {isClient ? (
                <ErrorBoundary
                  // @ts-ignore
                  fallback={
                    <div className="h-full w-full bg-gradient-hero flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <MapPin className="w-12 h-12 mx-auto text-primary" />
                        <p className="font-semibold">{t('hospitals.map.error')}</p>
                        <p className="text-sm text-muted-foreground">{t('hospitals.map.errorDesc')}</p>
                      </div>
                    </div>
                  }
                >
                  <MapContainer
                    center={userLocation ? [userLocation.lat, userLocation.lng] : [13.7250, 100.5478]}
                    zoom={12}
                    scrollWheelZoom={true}
                    className="h-full w-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {userLocation && (
                      <>
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                          <Popup>{t('hospitals.map.yourLocation')}</Popup>
                        </Marker>
                        <Circle
                          center={[userLocation.lat, userLocation.lng]}
                          radius={radiusKm * 1000}
                          pathOptions={{ color: "#4f46e5", fillOpacity: 0.1 }}
                        />
                      </>
                    )}

                    {hospitals.filter(h => h.latitude !== 0 && h.longitude !== 0).map((h) => (
                      <Marker key={h.id} position={[h.latitude, h.longitude]}>
                        <Popup>
                          <div className="space-y-1">
                            <div className="font-semibold">{h.name}</div>
                            <div className="text-xs text-muted-foreground">📍 {h.distance} กม.</div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => navigateGoogleMaps(h)} className="bg-gradient-primary">{t('hospitals.map.navigate')}</Button>
                              <Button size="sm" variant="outline" onClick={() => callHospital(h)}>{t('hospitals.map.call')}</Button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </ErrorBoundary>
              ) : (
                <div className="h-full w-full bg-muted/40 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hospital List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('hospitals.list.title')} ({filteredHospitals.length})</h2>
          <div className="grid gap-4">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-luxury transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[300px_1fr] gap-6">
                    {/* Image */}
                    <div className="relative h-64 md:h-auto overflow-hidden">
                      <img 
                        src={hospital.image} 
                        alt={hospital.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(hospital)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold">{hospital.name}</h3>
                        </div>
                        <p className="text-muted-foreground">{hospital.description}</p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{t('hospitals.info.address')}</p>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            <p className="text-sm text-primary font-semibold mt-1">
                              📍 {hospital.distance} กม.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{t('hospitals.info.phone')}</p>
                            <p className="text-sm text-muted-foreground">{hospital.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{t('hospitals.info.hours')}</p>
                            <p className="text-sm text-muted-foreground">
                              {hospital.isOpen24h 
                                ? t('hospitals.status.open24h') 
                                : `${hospital.openingTime} - ${hospital.closingTime}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button onClick={() => navigateGoogleMaps(hospital)} className="flex-1 bg-gradient-primary hover:opacity-90">
                          <Navigation className="w-4 h-4 mr-2" />
                          {t('hospitals.button.navigate')}
                        </Button>
                        <Button onClick={() => callHospital(hospital)} variant="outline" className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary">
                          <Phone className="w-4 h-4 mr-2" />
                          {t('hospitals.button.call')}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="secondary" className="flex-1">{t('hospitals.button.details')}</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{hospital.name}</DialogTitle>
                              <DialogDescription>{hospital.address}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img src={hospital.image} alt={hospital.name} className="w-full h-48 object-cover rounded-md" />
                              <p className="text-sm text-muted-foreground">{hospital.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {hospital.specialties.map((s, i) => (
                                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary">{s}</Badge>
                                ))}
                              </div>
                              <div className="grid sm:grid-cols-2 gap-3">
                                <Button onClick={() => navigateGoogleMaps(hospital)} className="bg-gradient-primary">
                                  <Navigation className="w-4 h-4 mr-2" /> {t('hospitals.dialog.openMaps')}
                                </Button>
                                <Button onClick={() => callHospital(hospital)} variant="outline">
                                  <Phone className="w-4 h-4 mr-2" /> {t('hospitals.dialog.callHospital')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Hospitals;
