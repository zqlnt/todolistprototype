/*
  # Add subtask support to tasks table

  1. Schema Changes
    - Add `parent_id` column to `tasks` table to support hierarchical task structure
    - Add foreign key constraint to ensure data integrity
    - Add index for performance on parent_id queries

  2. Security
    - RLS policies automatically apply to the new column
    - No additional security changes needed as existing policies cover subtasks

  3. Notes
    - Subtasks inherit the same security model as parent tasks
    - CASCADE delete ensures subtasks are removed when parent is deleted
*/

-- Add parent_id column to support subtasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN parent_id uuid;
  END IF;
END $$;

-- Add foreign key constraint for parent-child relationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_parent_id_fkey'
  ) THEN
    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for performance on parent_id queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_tasks_parent_id'
  ) THEN
    CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
  END IF;
END $$;