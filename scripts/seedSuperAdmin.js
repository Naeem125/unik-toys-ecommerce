require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error("❌ SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be defined in .env.local");
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local");
    process.exit(1);
  }

  console.log(`Seeding super admin: ${email}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email confirmation step
    user_metadata: {
      name,
      role: "superadmin" // Single superadmin who can create admins and users
    }
  });

  if (error) {
    console.error("❌ Failed to create super admin:", error.message);
    process.exit(1);
  }

  console.log("✅ Super admin created successfully:", data.user.email);
  console.log("📧 Email:", data.user.email);
  console.log("👤 Name:", name);
  console.log("🔑 Role: superadmin");
  console.log("\n⚠️  This is the ONLY superadmin account. Protect these credentials!");
  process.exit(0);
}

seedSuperAdmin();
