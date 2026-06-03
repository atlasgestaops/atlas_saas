-- Supabase Schema para AtlasOps
-- Criado com base no gemini.md

-- ============================================================
-- 1. Tabelas
-- ============================================================

-- profiles: extensão de auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'comercial',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- clients: empresas clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  segment text,
  size text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- deals: Oportunidades/Leads do CRM
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'lead',
  estimated_value numeric,
  estimated_mrr numeric,
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  next_action text,
  next_action_date date,
  lost_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- projects: Projetos de Delivery
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'automation',
  current_phase int2 NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'on-track',
  responsible_id uuid NOT NULL REFERENCES public.profiles(id),
  start_date date,
  estimated_end_date date,
  actual_end_date date,
  pdd_approved boolean NOT NULL DEFAULT false,
  uat_approved boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- project_tasks: Checklists de cada fase
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase int2 NOT NULL,
  task_index int2 NOT NULL,
  description text NOT NULL,
  is_done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES public.profiles(id),
  UNIQUE (project_id, phase, task_index)
);

-- deal_activities: Histórico de atividades do CRM
CREATE TABLE IF NOT EXISTS public.deal_activities (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Triggers para updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.clients;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.deals;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- 3. Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;

-- Profiles: todos autenticados veem, só o próprio edita
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Clients: todos autenticados
CREATE POLICY "Clients viewable by everyone" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients manageable by everyone" ON public.clients FOR ALL TO authenticated USING (true);

-- Deals: todos autenticados veem, gerencia se for dono ou admin
CREATE POLICY "Deals viewable by everyone" ON public.deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Deals manageable by owner or admin" ON public.deals FOR ALL TO authenticated USING (
  owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Projects: todos autenticados veem, só admin gerencia (cria/edita)
CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Projects manageable by admin" ON public.projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Project Tasks: todos veem, admin altera
CREATE POLICY "Tasks viewable by everyone" ON public.project_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks manageable by admin" ON public.project_tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Deal Activities: todos autenticados veem e inserem
CREATE POLICY "Activities viewable by everyone" ON public.deal_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Activities insertable by everyone" ON public.deal_activities FOR INSERT TO authenticated WITH CHECK (true);
-- Atividades são imutáveis, sem update/delete

-- ============================================================
-- 4. Função para criar profile automaticamente ao registrar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'comercial'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
