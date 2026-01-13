-- Migration: Allow public read access to active products and categories
-- This migration adds RLS policies for public/anonymous users to read active products and categories

-- ============================================
-- PRODUCTS TABLE PUBLIC READ POLICY
-- ============================================

-- Policy: Allow public users to read active products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'public_read_active_products'
  ) THEN
    CREATE POLICY public_read_active_products
    ON public.products
    FOR SELECT
    TO public
    USING (is_active = true);
  END IF;
END $$;

-- ============================================
-- CATEGORIES TABLE PUBLIC READ POLICY
-- ============================================

-- Policy: Allow public users to read active categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'public_read_active_categories'
  ) THEN
    CREATE POLICY public_read_active_categories
    ON public.categories
    FOR SELECT
    TO public
    USING (is_active = true);
  END IF;
END $$;

