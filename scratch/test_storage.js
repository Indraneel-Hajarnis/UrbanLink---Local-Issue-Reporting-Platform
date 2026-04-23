import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('🧪 Testing Supabase Storage upload...');
    const fileName = `test_${Date.now()}.txt`;
    const content  = 'Hello UrbanLink';
    
    const { data, error } = await supabase.storage
        .from('issue-photos')
        .upload(fileName, content, { contentType: 'text/plain' });
    
    if (error) {
        console.error('❌ Upload failed:', error);
    } else {
        console.log('✅ Upload successful:', data.path);
        const { data: urlData } = supabase.storage.from('issue-photos').getPublicUrl(fileName);
        console.log('🔗 Public URL:', urlData.publicUrl);
        
        // Cleanup
        await supabase.storage.from('issue-photos').remove([fileName]);
        console.log('🗑️ Test file removed.');
    }
    process.exit(0);
}

testUpload();
