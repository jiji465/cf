-- Add client_id column to taxes table to allow associating taxes with specific clients
-- This is optional (nullable) to allow both client-specific and global taxes

ALTER TABLE taxes
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_taxes_client_id ON taxes(client_id);

-- Add comment to explain the column
COMMENT ON COLUMN taxes.client_id IS 'Optional client association. NULL means the tax is global/not client-specific.';
