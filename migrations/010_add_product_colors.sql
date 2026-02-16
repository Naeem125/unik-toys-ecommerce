-- Add colors array column to products for storing available color options
ALTER TABLE products
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';


