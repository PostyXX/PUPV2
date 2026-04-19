import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Heart, Edit, Trash2, Search, Filter } from "lucide-react";
import { mockPets, Pet } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { getRole } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { getMyPets, getAllPets, createPet, updatePet, deletePet } from "@/lib/db";

const Pets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();
  const STORAGE_KEY = "pup_pets";
  const role = getRole();

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<Pet["type"]>("dog");
  const [breed, setBreed] = useState("");
  const [ageYears, setAgeYears] = useState<number>(0);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [gender, setGender] = useState<Pet["gender"]>("male");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState("");
  const [rawImage, setRawImage] = useState<string>("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Pet["type"]>("all");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(50); // percentage 0-100
  const [cropY, setCropY] = useState(50); // percentage 0-100

  const splitAgeToYearMonth = (age: number | null | undefined) => {
    const safe = age ?? 0;
    const years = Math.max(0, Math.floor(safe));
    const months = 0;
    return { years, months };
  };

  const combineYearMonthToAgeInt = (years: number, months: number) => {
    const y = isNaN(years) ? 0 : Math.max(0, years);
    const m = isNaN(months) ? 0 : Math.max(0, Math.min(11, months));
    const totalYears = y + m / 12;
    return Math.round(totalYears);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = role === 'user' ? await getMyPets() : await getAllPets();
        setPets(data.map(p => ({
          id: p.id,
          petId: p.petId,
          name: p.name,
          type: (['dog','cat','bird','rabbit','other'] as const).includes(p.type as any) ? p.type as Pet['type'] : 'other',
          breed: p.breed || "",
          age: p.age ?? 0,
          weight: p.weight ?? 0,
          gender: p.gender === 'male' || p.gender === 'female' ? p.gender : 'male',
          image: p.image || 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400',
          medicalNotes: p.medicalNotes || "",
        })));
      } catch {
        toast({ title: t('pets.toast.loadError'), description: t('pets.toast.loadErrorDesc'), variant: "destructive" });
      }
    };
    load();
  }, []);

  const displayedPets = pets
    .filter((p) =>
      (typeFilter === "all" || p.type === typeFilter) &&
      (
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.breed.toLowerCase().includes(query.toLowerCase())
      )
    );

  const resetForm = () => {
    setName("");
    setType("dog");
    setBreed("");
    setAgeYears(0);
    setAgeMonths(0);
    setWeight(0);
    setGender("male");
    setNotes("");
    setImage("");
    setRawImage("");
    setCropZoom(1);
    setCropX(50);
    setCropY(50);
    setEditingPetId(null);
  };

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: t('pets.toast.imageError'),
        description: t('pets.toast.imageErrorDesc'),
        variant: "destructive",
      });
      return;
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // ~5MB
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: t('pets.toast.imageSizeError'),
        description: t('pets.toast.imageSizeErrorDesc'),
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawImage(reader.result);
        setImage(reader.result);
        setCropZoom(1);
        setCropX(50);
        setCropY(50);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = () => {
    const source = rawImage || image;
    if (!source) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const targetWidth = 800;
      const targetHeight = 600;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const zoom = Math.max(1, cropZoom);
      const imgW = img.width;
      const imgH = img.height;

      const centerX = (cropX / 100) * imgW;
      const centerY = (cropY / 100) * imgH;

      const viewW = targetWidth / zoom;
      const viewH = targetHeight / zoom;

      let sx = centerX - viewW / 2;
      let sy = centerY - viewH / 2;

      sx = Math.max(0, Math.min(sx, imgW - viewW));
      sy = Math.max(0, Math.min(sy, imgH - viewH));

      ctx.drawImage(img, sx, sy, viewW, viewH, 0, 0, targetWidth, targetHeight);
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImage(croppedDataUrl);
      setRawImage("");
    };
    img.src = source;
  };

  const handleAddPet = async () => {
    const ageInt = combineYearMonthToAgeInt(ageYears, ageMonths);
    try {
      const p = await createPet({ name, type, breed: breed || null, age: ageInt, weight: Number(weight) || 0, gender, image: image || null, medicalNotes: notes || null });
      const newPet: Pet = {
        id: p.id, petId: p.petId, name: p.name,
        type: (['dog','cat','bird','rabbit','other'] as const).includes(p.type as any) ? p.type as Pet['type'] : 'other',
        breed: p.breed || "", age: p.age ?? 0, weight: p.weight ?? 0,
        gender: p.gender === 'male' || p.gender === 'female' ? p.gender : 'male',
        image: p.image || "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400",
        medicalNotes: p.medicalNotes || "",
      };
      setPets((prev) => [newPet, ...prev]);
      toast({ title: t('pets.toast.addSuccess'), description: t('pets.toast.addSuccessOnline') });
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: t('pets.toast.addError'), description: t('pets.toast.addErrorDesc'), variant: "destructive" });
    }
  };

  const handleStartEditPet = (pet: Pet) => {
    setEditingPetId(pet.id);
    setName(pet.name);
    setType(pet.type);
    setBreed(pet.breed);
    const split = splitAgeToYearMonth(pet.age);
    setAgeYears(split.years);
    setAgeMonths(split.months);
    setWeight(pet.weight);
    setGender(pet.gender);
    setNotes(pet.medicalNotes);
    setImage(pet.image);
    setIsDialogOpen(true);
  };

  const handleUpdatePet = async () => {
    if (!editingPetId) return;
    try {
      const ageInt = combineYearMonthToAgeInt(ageYears, ageMonths);
      const p = await updatePet(editingPetId, { name, type, breed: breed || null, age: ageInt, weight: Number(weight) || 0, gender, image: image || null, medicalNotes: notes || null });
      setPets(prev => prev.map(prevPet => prevPet.id === p.id ? {
        id: p.id, petId: p.petId, name: p.name,
        type: (['dog','cat','bird','rabbit','other'] as const).includes(p.type as any) ? p.type as Pet['type'] : 'other',
        breed: p.breed || "", age: p.age ?? 0, weight: p.weight ?? 0,
        gender: p.gender === 'male' || p.gender === 'female' ? p.gender : 'male',
        image: p.image || prevPet.image, medicalNotes: p.medicalNotes || "",
      } : prevPet));
      toast({ title: t('pets.toast.updateSuccess'), description: t('pets.toast.updateSuccessOnline') });
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: t('pets.toast.updateError'), description: t('pets.toast.updateErrorDesc'), variant: "destructive" });
    }
  };

  const handleDeletePet = async (id: string) => {
    try {
      await deletePet(id);
      setPets(pets.filter(pet => pet.id !== id));
      toast({ title: t('pets.toast.deleteSuccess'), description: t('pets.toast.deleteSuccessOnline') });
    } catch {
      toast({ title: t('pets.toast.deleteError'), description: t('pets.toast.deleteErrorDesc'), variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('pets.title')}</h1>
            <p className="text-muted-foreground">{t('pets.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('pets.searchPlaceholder')}
                className="pl-9 w-56"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pets.filterAll')}</SelectItem>
                  <SelectItem value="dog">{t('pets.filterDog')}</SelectItem>
                  <SelectItem value="cat">{t('pets.filterCat')}</SelectItem>
                  <SelectItem value="bird">{t('pets.filterBird')}</SelectItem>
                  <SelectItem value="rabbit">{t('pets.filterRabbit')}</SelectItem>
                  <SelectItem value="other">{t('pets.filterOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('pets.addButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPetId ? t('pets.dialog.titleEdit') : t('pets.dialog.titleAdd')}</DialogTitle>
                <DialogDescription>{t('pets.dialog.description')}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('pets.form.name')}</Label>
                  <Input id="name" placeholder={t('pets.form.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('pets.form.type')}</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('pets.form.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">{t('pets.filterDog')}</SelectItem>
                      <SelectItem value="cat">{t('pets.filterCat')}</SelectItem>
                      <SelectItem value="bird">{t('pets.filterBird')}</SelectItem>
                      <SelectItem value="rabbit">{t('pets.filterRabbit')}</SelectItem>
                      <SelectItem value="other">{t('pets.filterOther')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">{t('pets.form.breed')}</Label>
                  <Input id="breed" placeholder={t('pets.form.breedPlaceholder')} value={breed} onChange={(e) => setBreed(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age-years">{t('pets.form.age')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="age-years"
                      type="number"
                      placeholder="0"
                      value={ageYears}
                      onChange={(e) => setAgeYears(Number(e.target.value))}
                    />
                    <span className="self-center text-sm">{t('pets.form.ageYears')}</span>
                    <Input
                      id="age-months"
                      type="number"
                      placeholder="0"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(Number(e.target.value))}
                    />
                    <span className="self-center text-sm">{t('pets.form.ageMonths')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">{t('pets.form.weight')}</Label>
                  <Input id="weight" type="number" placeholder="0.0" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('pets.form.gender')}</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('pets.form.gender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('pets.form.genderMale')}</SelectItem>
                      <SelectItem value="female">{t('pets.form.genderFemale')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">{t('pets.form.notes')}</Label>
                  <Input id="notes" placeholder={t('pets.form.notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                    <span>{t('pets.form.commonDiseases')}</span>
                    {[
                      "โรคผิวหนัง",
                      "ภูมิแพ้",
                      "โรคหัวใจ",
                      "โรคไต",
                      "โรคข้อเสื่อม",
                    ].map((disease) => (
                      <button
                        key={disease}
                        type="button"
                        className="px-2 py-1 rounded-full border bg-background hover:bg-muted text-xs"
                        onClick={() => {
                          setNotes((prev) => {
                            if (!prev) return disease;
                            if (prev.includes(disease)) return prev;
                            return prev + (prev.endsWith(".") || prev.endsWith(" ") ? " " : ", ") + disease;
                          });
                        }}
                      >
                        {disease}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>{t('pets.form.image')}</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-sm cursor-pointer transition-colors ${
                      isDraggingImage ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      handleImageFile(file);
                    }}
                    onClick={() => {
                      const input = document.getElementById("pet-image-file-input") as HTMLInputElement | null;
                      input?.click();
                    }}
                  >
                    <p className="font-medium">{t('pets.form.imageDragDrop')}</p>
                    <p className="text-xs text-muted-foreground">{t('pets.form.imageSupported')}</p>
                    <input
                      id="pet-image-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="image">{t('pets.form.imageUrl')}</Label>
                    <Input
                      id="image"
                      placeholder="https://..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                  {image && (
                    <div className="mt-2 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('pets.form.imagePreview')}</p>
                        <div className="w-full max-h-48 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                          <div
                            className="relative w-full h-48 overflow-hidden"
                            style={{ backgroundColor: "#000" }}
                          >
                            <img
                              src={rawImage || image}
                              alt="ตัวอย่างรูปสัตว์เลี้ยง"
                              className="absolute inset-0 w-full h-full"
                              style={{
                                objectFit: "cover",
                                objectPosition: `${cropX}% ${cropY}%`,
                                transform: `scale(${cropZoom})`,
                                transformOrigin: "center center",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {rawImage && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">{t('pets.form.cropAdjust')}</p>
                          <div className="grid grid-cols-3 gap-3 text-xs items-center">
                            <span>{t('pets.form.cropZoom')}</span>
                            <Input
                              type="range"
                              min={1}
                              max={3}
                              step={0.1}
                              value={cropZoom}
                              onChange={(e) => setCropZoom(Number(e.target.value))}
                            />
                            <span className="text-right">{cropZoom.toFixed(1)}x</span>
                            <span>{t('pets.form.cropHorizontal')}</span>
                            <Input
                              type="range"
                              min={0}
                              max={100}
                              value={cropX}
                              onChange={(e) => setCropX(Number(e.target.value))}
                            />
                            <span className="text-right">{cropX}%</span>
                            <span>{t('pets.form.cropVertical')}</span>
                            <Input
                              type="range"
                              min={0}
                              max={100}
                              value={cropY}
                              onChange={(e) => setCropY(Number(e.target.value))}
                            />
                            <span className="text-right">{cropY}%</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-1"
                            onClick={applyCrop}
                          >
                            {t('pets.form.cropApply')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={editingPetId ? handleUpdatePet : handleAddPet}
                className="mt-4 w-full bg-gradient-primary hover:opacity-90"
              >
                {editingPetId ? t('pets.form.saveEditButton') : t('pets.form.saveButton')}
              </Button>
              </div>
              </DialogContent>
              </Dialog>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPets.map((pet, idx) => (
            <Card key={pet.id} className="hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 group animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
              <CardHeader className="relative overflow-hidden">
                <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
                  <img 
                    src={pet.image} 
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur text-foreground border border-border">
                    {pet.type === 'dog' ? t('pets.filterDog') : pet.type === 'cat' ? t('pets.filterCat') : pet.type === 'bird' ? t('pets.filterBird') : pet.type === 'rabbit' ? t('pets.filterRabbit') : t('pets.filterOther')}
                  </span>
                </div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {pet.name}
                  {pet.breed && (
                    <span className="text-base font-normal text-muted-foreground">({pet.breed})</span>
                  )}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-full text-xs bg-secondary/15 text-secondary-foreground border border-secondary/30">{pet.gender === 'male' ? '♂ ' + t('pets.form.genderMale') : '♀ ' + t('pets.form.genderFemale')}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    {t('pets.form.age')} {splitAgeToYearMonth(pet.age).years} {t('pets.form.ageYears')}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent-foreground border border-accent/20">{pet.weight} kg</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t('pets.card.medicalNotes')}</p>
                  <p className="text-sm mt-1">{pet.medicalNotes}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('pets.card.petId')}</p>
                    <p className="text-sm font-mono font-medium">{pet.petId}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => navigator.clipboard && navigator.clipboard.writeText(pet.petId)}
                  >
                    {t('pets.card.copyId')}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary"
                    onClick={() => handleStartEditPet(pet)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('pets.card.editButton')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    onClick={() => handleDeletePet(pet.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('pets.card.deleteButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayedPets.length === 0 && (
          <Card className="py-20">
            <CardContent className="text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{pets.length === 0 ? t('pets.title') : t('pets.searchPlaceholder')}</h3>
                <p className="text-muted-foreground">{pets.length === 0 ? t('pets.subtitle') : t('pets.filterAll')}</p>
              </div>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('pets.addButton')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Pets;
