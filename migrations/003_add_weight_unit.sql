-- Add weight_unit column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10);

-- Set default value for existing products with weight
UPDATE products SET weight_unit = 'kg' WHERE weight IS NOT NULL AND weight_unit IS NULL;
