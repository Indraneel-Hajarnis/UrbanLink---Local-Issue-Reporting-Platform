import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function checkManagers() {
    console.log('🔍 Checking Manager Profiles...');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, role, managed_ward')
        .eq('role', 'MANAGER');
    
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        profiles.forEach(p => console.log(`Manager: ${p.email} | Ward: ${p.managed_ward}`));
    }
    process.exit(0);
}

checkManagers();
