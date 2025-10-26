-- Fix history table constraint to include 'client' entity type
-- This allows the clients_history_trigger to work properly

-- Drop the existing constraint
ALTER TABLE history DROP CONSTRAINT IF EXISTS history_entity_type_check;

-- Add the updated constraint that includes 'client'
ALTER TABLE history ADD CONSTRAINT history_entity_type_check 
  CHECK (entity_type IN ('obligation', 'tax', 'installment', 'client'));
