import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function verifyBucket() {
    console.log('📦 Verifying Supabase Storage buckets...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
        console.error('❌ Error listing buckets:', error.message);
    } else {
        const bucket = buckets.find(b => b.name === 'issue-photos');
        if (bucket) {
            console.log(`✅ Bucket "issue-photos" found (Public: ${bucket.public})`);
        } else {
            console.log('❌ Bucket "issue-photos" NOT found.');
        }
    }

    process.exit(0);
}

verifyBucket();
