-- Add new order statuses: on_hold, out_for_delivery, returned, refunded, payment_failed
-- This migration updates the CHECK constraints for orders and order_history tables

-- Update orders table constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'on_hold', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'refunded', 'cancelled', 'payment_failed'));

-- Update order_history table constraint
ALTER TABLE order_history 
DROP CONSTRAINT IF EXISTS order_history_status_check;

ALTER TABLE order_history 
ADD CONSTRAINT order_history_status_check 
CHECK (status IN ('pending', 'confirmed', 'on_hold', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'refunded', 'cancelled', 'payment_failed'));

