require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error("❌ SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be defined in .env");
    process.exit(1);
  }

  console.log(`Seeding super admin: ${email}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email confirmation step
    user_metadata: {
      name,
      display_name: name,
      role: "superadmin"
    }
  });

  if (error) {
    console.error("❌ Failed to create super admin:", error.message);
    process.exit(1);
  }

  console.log("✅ Super admin created successfully:", data.user.email);
  process.exit(0);
}

seedSuperAdmin();
