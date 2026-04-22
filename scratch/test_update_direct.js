import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    const issueId = '76931ae9-d4c8-4796-986c-26757014dc96';
    const newStatus = 'In Progress';
    
    console.log(`🚀 Testing Status Update for Issue ${issueId}...`);
    console.log(`🔑 Using Key: ${supabaseKey.slice(0, 10)}...`);

    try {
        const { data, error } = await supabase
            .from('issues')
            .update({ status: newStatus })
            .eq('id', issueId)
            .select();
        
        if (error) {
            console.error('❌ SQL Error:', error);
        } else {
            console.log('✅ Update Success!');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('💥 Crash:', err);
    }
    process.exit(0);
}

testUpdate();
