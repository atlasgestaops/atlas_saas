-- Add assigned_role column to project_tasks table
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS assigned_role text;

-- Create index for efficient querying of tasks by assigned role
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_role ON public.project_tasks(assigned_role);

-- Adjust RLS Policies to accept dev and gestao as administrators

-- 1. Deals RLS
DROP POLICY IF EXISTS "Deals manageable by owner or admin" ON public.deals;
CREATE POLICY "Deals manageable by owner or admin" ON public.deals FOR ALL TO authenticated USING (
  owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dev', 'gestao'))
);

-- 2. Projects RLS
DROP POLICY IF EXISTS "Projects manageable by admin" ON public.projects;
CREATE POLICY "Projects manageable by admin" ON public.projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dev', 'gestao'))
);

-- 3. Project Tasks RLS
DROP POLICY IF EXISTS "Tasks manageable by admin" ON public.project_tasks;
CREATE POLICY "Tasks manageable by admin" ON public.project_tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dev', 'gestao'))
);
