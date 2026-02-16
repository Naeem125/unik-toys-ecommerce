-- Create a simple store_settings table to hold global configuration (single row)
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipping_free_threshold NUMERIC(10,2) NOT NULL DEFAULT 3000,
  shipping_default_cost NUMERIC(10,2) NOT NULL DEFAULT 300,
  shipping_message TEXT DEFAULT 'Free shipping on orders over Rs 3000!',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure there is at least one row
INSERT INTO store_settings (shipping_free_threshold, shipping_default_cost, shipping_message)
SELECT 3000, 300, 'Free shipping on orders over Rs 3000!'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);


