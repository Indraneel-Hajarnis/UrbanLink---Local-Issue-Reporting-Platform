import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    console.log('🔍 Inspecting recent issues and their photo URLs...');
    
    const { data: issues, error } = await supabase
        .from('issues')
        .select('id, title, ward, photo_url, category, status')
        .order('submitted_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        issues.forEach(i => {
            console.log(`Issue: ${i.id} | Ward: ${i.ward} | Photo: ${i.photo_url || 'NULL'}`);
        });
    }

    process.exit(0);
}

inspectData();
