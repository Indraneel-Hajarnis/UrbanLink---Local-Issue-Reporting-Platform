import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Locality to Ward Mapping (Mumbai & MMR)
const WARD_MAPPING = [
    // BMC Wards
    { ward: 'A', regex: /Colaba|Cuffe Parade|Fort|Nariman Point|Marine Drive|Churchgate/i },
    { ward: 'B', regex: /Sandhurst Road|P D'Mello|Mohammed Ali|Dongri|Masjid Bunder/i },
    { ward: 'C', regex: /Marine Lines|Kalbadevi|Bhuleshwar|Chandanwadi|Princess Street/i },
    { ward: 'D', regex: /Grant Road|Malabar Hill|Tardeo|Breach Candy|Kemps Corner|Walkeshwar|Girgaon/i },
    { ward: 'E', regex: /Byculla|Agripada|Mazgaon|Reay Road|Mumbai Central|Madanpura/i },
    { ward: 'F/N', regex: /Matunga|Sion|Wadala|Antop Hill/i },
    { ward: 'F/S', regex: /Parel|Sewri|Naigaon|Lalbaug/i },
    { ward: 'G/N', regex: /Dadar|Mahim|Dharavi|Matunga West/i },
    { ward: 'G/S', regex: /Worli|Prabhadevi|Lower Parel|Elphinstone Road|Curry Road/i },
    { ward: 'H/E', regex: /Santacruz (E|East)|Khar (E|East)|Bandra (E|East)|Kalina|Vakola|Kherwadi/i },
    { ward: 'H/W', regex: /Bandra (W|West)|Khar (W|West)|Santacruz (W|West)|Juhu Tara|Pali Hill/i },
    { ward: 'K/E', regex: /Andheri (E|East)|Jogeshwari (E|East)|Vile Parle (E|East)|Gundavali|Marol|Saki Naka|Sahar|MIDC/i },
    { ward: 'K/W', regex: /Andheri (W|West)|Juhu|Versova|Vile Parle (W|West)|Oshiwara|Lokhandwala/i },
    { ward: 'L', regex: /Kurla|Chandivali|Saki Naka|Powai|Chunabhatti/i },
    { ward: 'M/E', regex: /Govandi|Mankhurd|Deonar|Trombay|Baiganwadi/i },
    { ward: 'M/W', regex: /Chembur|Mahul|Tilak Nagar|Shell Colony/i },
    { ward: 'N', regex: /Ghatkopar|Vidyavihar|Pant Nagar|Vikhroli/i },
    { ward: 'P/N', regex: /Malad|Marve|Aksa|Madh|Rathodi/i },
    { ward: 'P/S', regex: /Goregaon|Aarey|Motilal Nagar|Bangur Nagar/i },
    { ward: 'R/C', regex: /Borivali|Gorai|Eksar|Shimpoli/i },
    { ward: 'R/N', regex: /Dahisar|IC Colony|Rawalpada/i },
    { ward: 'R/S', regex: /Kandivali|Charkop|Thakur Village|Poisar/i },
    { ward: 'S', regex: /Bhandup|Powai|Kanjurmarg|Vikhroli|Nahur/i },
    { ward: 'T', regex: /Mulund|Nahur/i },
    // Other MMR Corporations
    { ward: 'TMC', regex: /Thane|Majiwada|Ghodbunder|Kalwa|Mumbra|Shilphata|Wagle Estate|Naupada|Pokhran/i },
    { ward: 'NMMC', regex: /Navi Mumbai|Vashi|Nerul|Belapur|Airoli|Sanpada|Koparkhairane|Ghansoli|Turbhe|Juinagar|Seawoods/i },
    { ward: 'KDMC', regex: /Kalyan|Dombivli|Thakurli|Titwala|Mohone/i },
    { ward: 'MBMC', regex: /Mira Road|Bhayandar|Kashimira/i },
    { ward: 'VVMC', regex: /Vasai|Virar|Nallasopara|Naigaon/i },
    { ward: 'PMC', regex: /Panvel|Kharghar|Kalamboli|Kamothe|New Panvel/i },
    { ward: 'UMC', regex: /Ulhasnagar/i },
];

function getWardFromLocation(text) {
    if (!text) return null;
    for (const entry of WARD_MAPPING) {
        if (entry.regex.test(text)) return entry.ward;
    }
    return null;
}

async function fixWards() {
    console.log('🚀 Starting ward cleanup...');
    
    const { data: issues, error } = await supabase
        .from('issues')
        .select('id, location, ward')
        .eq('ward', 'Unknown');

    if (error) {
        console.error('❌ Error fetching issues:', error);
        return;
    }

    console.log(`🔍 Found ${issues.length} issues with Unknown ward.`);

    let updatedCount = 0;
    for (const issue of issues) {
        const newWard = getWardFromLocation(issue.location);
        if (newWard) {
            console.log(`✅ Updating Issue ${issue.id}: "${issue.location}" -> ${newWard}`);
            const { error: updateError } = await supabase
                .from('issues')
                .update({ ward: newWard })
                .eq('id', issue.id);
            
            if (updateError) {
                console.error(`❌ Error updating issue ${issue.id}:`, updateError);
            } else {
                updatedCount++;
            }
        } else {
            console.log(`⚠️ Could not identify ward for: "${issue.location}"`);
        }
    }

    console.log(`\n✨ Done! Updated ${updatedCount} issues.`);
    process.exit(0);
}

fixWards();
