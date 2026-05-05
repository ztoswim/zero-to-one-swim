const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to bypass RLS if any

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteToSuperAdmin(email) {
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'super_admin' })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error promoting user:', error);
  } else {
    console.log('Successfully promoted user to super_admin:', data);
  }
}

promoteToSuperAdmin('xmrxperfectx@gmail.com');
