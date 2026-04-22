import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function checkRoles() {
    console.log('🔍 Checking user roles in the profiles table...');
    const { data: profiles, error } = await supabase.from('profiles').select('email, role');
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        profiles.forEach(p => console.log(`User: ${p.email} | Role: ${p.role}`));
    }
    process.exit(0);
}

checkRoles();
