-- Add due_date column to taxes, obligations, and installments tables
-- This allows storing complete dates (dd/mm/yyyy) instead of just day numbers

-- Add due_date to taxes table
ALTER TABLE taxes
ADD COLUMN due_date DATE;

-- Add due_date to obligations table
ALTER TABLE obligations
ADD COLUMN due_date DATE;

-- Add due_date to installments table
ALTER TABLE installments
ADD COLUMN due_date DATE;

-- Add comments to explain the columns
COMMENT ON COLUMN taxes.due_date IS 'Complete due date in dd/mm/yyyy format. Will appear in calendar.';
COMMENT ON COLUMN obligations.due_date IS 'Complete due date in dd/mm/yyyy format. Will appear in calendar.';
COMMENT ON COLUMN installments.due_date IS 'Complete due date in dd/mm/yyyy format. Will appear in calendar.';
