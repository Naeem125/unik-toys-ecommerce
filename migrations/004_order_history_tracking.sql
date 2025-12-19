-- Enterprise-level Order History Tracking
-- This migration adds comprehensive order history tracking

-- Create order_history table for tracking all order status changes
CREATE TABLE IF NOT EXISTS order_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    changed_by UUID, -- References auth.users.id (can be NULL for system changes)
    changed_by_type VARCHAR(20) NOT NULL CHECK (changed_by_type IN ('admin', 'superadmin', 'user')),
    previous_status VARCHAR(20),
    tracking_number VARCHAR(100),
    notes TEXT,
    metadata JSONB DEFAULT '{}', -- Store additional context (reason, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for efficient order history queries
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON order_history(created_at);
CREATE INDEX IF NOT EXISTS idx_order_history_status ON order_history(status);

-- Add cancelled_by and cancellation_reason to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add index for cancelled orders
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Note: History entries are created manually via API to ensure proper changed_by_type
-- No automatic trigger to avoid 'system' entries

-- Function to get order status timeline
CREATE OR REPLACE FUNCTION get_order_timeline(order_uuid UUID)
RETURNS TABLE (
    id UUID,
    status VARCHAR(20),
    changed_by_type VARCHAR(20),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oh.id,
        oh.status,
        oh.changed_by_type,
        oh.tracking_number,
        oh.notes,
        oh.created_at
    FROM order_history oh
    WHERE oh.order_id = order_uuid
    ORDER BY oh.created_at ASC;
END;
$$ LANGUAGE plpgsql;

