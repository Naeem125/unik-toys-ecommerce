-- Update order_history to remove 'system' and 'default', add 'superadmin'
-- This migration updates the existing schema

-- First, update any existing 'system' entries (if any) to 'admin' as fallback
-- Note: In practice, you may want to delete these or handle them differently
UPDATE order_history 
SET changed_by_type = 'admin' 
WHERE changed_by_type = 'system';

-- Drop the old constraint
ALTER TABLE order_history 
DROP CONSTRAINT IF EXISTS order_history_changed_by_type_check;

-- Add new constraint without 'system' and with 'superadmin'
ALTER TABLE order_history 
ADD CONSTRAINT order_history_changed_by_type_check 
CHECK (changed_by_type IN ('admin', 'superadmin', 'user'));

-- Remove default value (make it NOT NULL)
ALTER TABLE order_history 
ALTER COLUMN changed_by_type DROP DEFAULT,
ALTER COLUMN changed_by_type SET NOT NULL;

