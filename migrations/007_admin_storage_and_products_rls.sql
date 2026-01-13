-- Migration: Allow admins and superadmins to manage products, categories, and storage
-- This migration adds RLS policies for admin/superadmin access to:
-- 1. Storage bucket (product-images) for image uploads
-- 2. Products table for CRUD operations
-- 3. Categories table for CRUD operations

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Policy: Allow admins and superadmins to upload files to product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload product images'
  ) THEN
    CREATE POLICY "Admins can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'product-images' AND
      (
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
      )
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to read files from product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can read product images'
  ) THEN
    CREATE POLICY "Admins can read product images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'product-images' AND
      (
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
      )
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to delete files from product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete product images'
  ) THEN
    CREATE POLICY "Admins can delete product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'product-images' AND
      (
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
      )
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to update files in product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update product images'
  ) THEN
    CREATE POLICY "Admins can update product images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'product-images' AND
      (
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
      )
    );
  END IF;
END $$;

-- ============================================
-- PRODUCTS TABLE RLS POLICIES
-- ============================================

-- Enable RLS on products table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'products' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy: Allow admins and superadmins to insert products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'admin_insert_products'
  ) THEN
    CREATE POLICY admin_insert_products
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to update products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'admin_update_products'
  ) THEN
    CREATE POLICY admin_update_products
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    )
    WITH CHECK (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to delete products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'admin_delete_products'
  ) THEN
    CREATE POLICY admin_delete_products
    ON public.products
    FOR DELETE
    TO authenticated
    USING (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to select all products (including inactive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'admin_select_products'
  ) THEN
    CREATE POLICY admin_select_products
    ON public.products
    FOR SELECT
    TO authenticated
    USING (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- ============================================
-- CATEGORIES TABLE RLS POLICIES
-- ============================================

-- Enable RLS on categories table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy: Allow admins and superadmins to insert categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'admin_insert_categories'
  ) THEN
    CREATE POLICY admin_insert_categories
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to update categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'admin_update_categories'
  ) THEN
    CREATE POLICY admin_update_categories
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    )
    WITH CHECK (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to delete categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'admin_delete_categories'
  ) THEN
    CREATE POLICY admin_delete_categories
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

-- Policy: Allow admins and superadmins to select all categories (including inactive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'admin_select_categories'
  ) THEN
    CREATE POLICY admin_select_categories
    ON public.categories
    FOR SELECT
    TO authenticated
    USING (
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin' OR
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'superadmin'
    );
  END IF;
END $$;

