-- Add assigned_to column to project_tasks for per-user task assignment
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES profiles(id);

-- Create index for efficient querying of tasks by assigned user
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
