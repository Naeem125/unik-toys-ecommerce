import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Helper functions for common operations
export const supabaseHelpers = {
  // Get products with optional filters and optional pagination
  async getProducts(filters = {}) {
    let categoryId = null;

    // Step 1: Resolve category slug to ID if needed
    if (filters.category && filters.category !== 'all') {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.category)
        .single();

      if (categoryError) {
        console.error('Error fetching category:', categoryError.message);
        // Optional: return empty list if invalid category
        return filters.page && filters.limit
          ? { data: [], count: 0 }
          : [];
      }

      categoryId = categoryData?.id;
    }

    // Pagination support: when both page and limit are provided, use range + count
    let selectOptions = {};
    if (filters.page && filters.limit) {
      const page = Number(filters.page) || 1;
      const limit = Number(filters.limit) || 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      selectOptions = { count: 'exact' };
      // We'll apply range after building the base query
      filters._range = { from, to };
    } else if (filters.limit) {
      // Non-paginated limit (e.g. "featured products" sections)
      filters._singleLimit = Number(filters.limit);
    }

    // Step 2: Build products query (select first, then filters, as required by supabase-js v2)
    let query = supabase
      .from('products')
      .select(
        `
      *,
      categories (
        id,
        name,
        slug,
        image
      )
    `,
        selectOptions
      );

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (filters.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    }

    // Apply pagination / limit after filters
    if (filters._range) {
      query = query.range(filters._range.from, filters._range.to);
    } else if (filters._singleLimit) {
      query = query.limit(filters._singleLimit);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    if (filters.page && filters.limit) {
      return {
        data: data || [],
        count: typeof count === 'number' ? count : 0
      };
    }

    return data || [];
  }
  ,
  // Get product by slug
  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          image
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get category by slug
  async getCategoryBySlug(slug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },


  // Sign in user
  async signInUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Sign out user
  async signOutUser() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Create order
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user orders
  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Admin functions
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCategory(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
