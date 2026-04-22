import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function listIssues() {
    console.log('🔍 Listing Issues...');
    const { data: issues, error } = await supabase
        .from('issues')
        .select('id, title, ward');
    
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.table(issues);
    }
    process.exit(0);
}

listIssues();
