# Supabase Setup Guide

This project has been migrated from MongoDB/PostgreSQL to Supabase. Follow these steps to set up your Supabase database.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note down your project URL and anon key from the project settings

## 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Database Setup

### Run the Migrations

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the migration files in order:

#### First, create the tables:

Copy and paste the contents of `migrations/001_create_tables.sql` into the SQL editor and run it.

#### Then, insert sample data:

Copy and paste the contents of `migrations/002_insert_sample_data.sql` into the SQL editor and run it.

## 4. Enable Row Level Security (RLS)

For security, enable RLS on your tables:

```sql
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access on products" ON products
    FOR SELECT USING (is_active = true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read their orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 5. Authentication Setup

Supabase handles authentication automatically. Users will be stored in the `auth.users` table.

### User Metadata

When users register, their name will be stored in `user_metadata`. You can access this in your application:

```javascript
const user = supabase.auth.user();
const userName = user.user_metadata.name;
```

## 6. Features Available

### ✅ Completed Features:

- **User Authentication**: Login/Register with Supabase Auth
- **Product Management**: CRUD operations for products
- **Category Management**: Manage product categories
- **Admin Panel**: Add/edit/delete products at `/admin`
- **Search Functionality**: Search products by name/description
- **Cart Functionality**: Add items to cart (client-side)
- **Responsive Design**: Mobile-friendly interface
- **Golden Theme**: Professional black and golden color scheme

### 🔧 Admin Panel Features:

- Add new products with images, pricing, and details
- Edit existing products
- Delete products
- Manage product categories
- Set featured products
- Stock management

### 🛒 Shopping Features:

- Browse products by category
- Search products
- Add to cart
- View product details
- Responsive product grid

## 7. Running the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000
```

## 8. Admin Access

To access the admin panel:

1. Register a new account or login
2. Go to `/admin`
3. Start adding products!

## 9. Database Schema

### Tables:

- **categories**: Product categories with slugs and sorting
- **products**: Product information with images, pricing, and metadata
- **orders**: Order information (linked to auth.users)

### Key Features:

- UUID primary keys
- Automatic timestamps
- JSONB for flexible data storage (images, dimensions, etc.)
- Proper foreign key relationships
- Indexes for performance

## 10. Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your Supabase URL and anon key in `.env.local`
2. **"Row Level Security"**: Make sure you've enabled RLS and created appropriate policies
3. **"Table doesn't exist"**: Run the migration files in the correct order
4. **CORS issues**: Supabase handles CORS automatically, but check your domain settings

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the migration files in the `migrations/` folder
- Check the browser console for error messages

## 11. Next Steps

After setup, you can:

1. Customize the admin panel
2. Add more product fields
3. Implement order management
4. Add payment processing with Stripe
5. Set up email notifications
6. Add product reviews and ratings
