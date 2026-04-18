-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'hospital', 'admin');

-- Create enum for pet types
CREATE TYPE public.pet_type AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'other');

-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  opening_time TIME NOT NULL DEFAULT '08:00:00',
  closing_time TIME NOT NULL DEFAULT '18:00:00',
  is_open_24h BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(2, 1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create hospital_specialties table
CREATE TABLE public.hospital_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  specialty_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pet_type public.pet_type NOT NULL,
  breed TEXT,
  age INTEGER,
  weight DECIMAL(5, 2),
  gender TEXT,
  image_url TEXT,
  medical_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  prescribed_medication TEXT,
  next_visit_date TIMESTAMPTZ,
  veterinarian_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  vaccine_name TEXT NOT NULL,
  vaccination_date TIMESTAMPTZ NOT NULL,
  next_vaccination_date TIMESTAMPTZ,
  veterinarian_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_chat_history table
CREATE TABLE public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for hospitals
CREATE POLICY "Anyone can view hospitals"
  ON public.hospitals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hospital users can update own hospital"
  ON public.hospitals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Hospital users can insert own hospital"
  ON public.hospitals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'hospital') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for hospital_specialties
CREATE POLICY "Anyone can view specialties"
  ON public.hospital_specialties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hospital users can manage own specialties"
  ON public.hospital_specialties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.hospitals
      WHERE id = hospital_id AND user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for pets
CREATE POLICY "Users can view own pets"
  ON public.pets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hospital'));

CREATE POLICY "Users can manage own pets"
  ON public.pets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for appointments
CREATE POLICY "Users can view related appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create appointments for own pets"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid()));

CREATE POLICY "Users and hospitals can update related appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for medical_records
CREATE POLICY "Users and hospitals can view related records"
  ON public.medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Hospitals can create medical records"
  ON public.medical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Hospitals can update own records"
  ON public.medical_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for vaccinations
CREATE POLICY "Users can view own pet vaccinations"
  ON public.vaccinations FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create vaccinations for own pets"
  ON public.vaccinations FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid()));

CREATE POLICY "Hospitals can update vaccination records"
  ON public.vaccinations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.hospitals WHERE id = hospital_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for ai_chat_history
CREATE POLICY "Users can view own chat history"
  ON public.ai_chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own chat history"
  ON public.ai_chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile and assign default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();