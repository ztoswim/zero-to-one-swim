const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signUp() {
  const email = 'xmrxperfectx@gmail.com';
  const password = 'Swim888888';

  console.log(`Attempting to sign up ${email}...`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('already registered')) {
       console.log('User already exists. Proceeding to promotion...');
    } else {
       console.error('Sign up error:', error.message);
       return;
    }
  } else {
    console.log('Sign up successful! Please check your email if confirmation is required.');
  }
}

signUp();
