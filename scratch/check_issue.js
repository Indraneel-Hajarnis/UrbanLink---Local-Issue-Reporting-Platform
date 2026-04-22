import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function checkIssue() {
    const id = '76931ae9';
    console.log(`🔍 Checking Issue ${id}...`);
    const { data: issue, error } = await supabase
        .from('issues')
        .select('*')
        .ilike('id', `${id}%`)
        .single();
    
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('Issue Data:');
        console.dir(issue);
    }
    process.exit(0);
}

checkIssue();
