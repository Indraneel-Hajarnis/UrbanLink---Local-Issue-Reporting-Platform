import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'aaanil@gmail.com';
    console.log(`🔍 Checking user ${email}...`);
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
        console.error('❌ Error listing users:', error.message);
        process.exit(1);
    }
    
    const user = users.find(u => u.email === email);
    if (user) {
        console.log('User found:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Email confirmed at: ${user.email_confirmed_at}`);
        console.log(`- Last sign in: ${user.last_sign_in_at}`);
        
        if (!user.email_confirmed_at) {
            console.log('🛠️ Confirming email...');
            const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            );
            if (updateError) console.error('❌ Error confirming email:', updateError.message);
            else console.log('✅ Email confirmed successfully!');
        }
    } else {
        console.log('❌ User not found.');
    }
    process.exit(0);
}

checkUser();
