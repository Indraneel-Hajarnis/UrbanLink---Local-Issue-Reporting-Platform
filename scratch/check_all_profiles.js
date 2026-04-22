import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function checkAllProfiles() {
    console.log('🔍 Checking ALL Profiles...');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
    
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.table(profiles);
    }
    process.exit(0);
}

checkAllProfiles();
