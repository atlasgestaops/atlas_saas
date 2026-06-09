-- Add new fields to project_tasks table for custom inputs and deadlines
ALTER TABLE public.project_tasks 
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS field_type text NOT NULL DEFAULT 'checkbox',
  ADD COLUMN IF NOT EXISTS field_value text;
