import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('🔍 Checking profiles table schema...');
    
    // We can try to select one row to see what columns we get
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        if (error.message.includes('managed_ward')) {
            console.log('➡️ Confirmed: managed_ward column is missing or causing issues.');
        }
    } else {
        console.log('✅ Columns found in profiles:', Object.keys(data[0] || {}));
    }

    // Try to get all issues to see if there's any data
    const { data: issues } = await supabase.from('issues').select('*').limit(1);
    console.log('✅ Columns found in issues:', Object.keys(issues?.[0] || {}));

    process.exit(0);
}

checkSchema();
