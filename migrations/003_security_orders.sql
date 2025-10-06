-- Add foreign key to auth.users for orders.user_id (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security (idempotent safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders'
  ) THEN
    RAISE NOTICE 'orders table does not exist; skipping RLS enable';
  ELSE
    -- Enable RLS only if not already enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'orders' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;
END $$;

-- Policy: users can insert only their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'insert_own_order'
  ) THEN
    CREATE POLICY insert_own_order
    ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: users can select only their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'select_own_orders'
  ) THEN
    CREATE POLICY select_own_orders
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: users can update only their own orders (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'update_own_orders'
  ) THEN
    CREATE POLICY update_own_orders
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: admins can manage all orders (optional; expects a role claim)
-- Enable admin bypass using user_metadata.role claim embedded by Supabase
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'admin_all_orders'
  ) THEN
    CREATE POLICY admin_all_orders
    ON public.orders
    FOR ALL
    TO authenticated
    USING (((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin'))
    WITH CHECK (((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin'));
  END IF;
END $$;


