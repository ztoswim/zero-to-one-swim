require('dotenv').config();
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
    console.log('🚀 Starting Precision Alignment...');
    
    // Clear existing
    await supabase.from('packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const csv = fs.readFileSync('data before/package_rows.csv', 'utf-8');
    const rows = parse(csv, { columns: true });

    const data = rows.map(r => {
        let name = (r.description || r.name || '').toUpperCase();
        let duration = name.includes('90') ? 90 : 45;
        let oldCat = (r.type || '').trim();
        let cat = 'Private';
        
        if (oldCat.includes('D2D (A)')) cat = 'D2D (A)';
        else if (oldCat.includes('D2D (B)')) cat = 'D2D (B)';
        else if (oldCat === 'G') cat = 'Group';
        else if (oldCat === 'PV') cat = 'Private';

        let nop = r.nop || '1';
        let type = `${cat}-1v${nop}`;

        return {
            name: r.description || r.name,
            lesson_count: parseInt(r.quantity) || 1,
            price: parseFloat(r.fee) || 0,
            type: type,
            duration: duration
        };
    });

    const { error } = await supabase.from('packages').insert(data);
    if (error) console.error('❌ Error:', error);
    else console.log(`✅ Successfully aligned ${data.length} packages with UI.`);
}

run();
