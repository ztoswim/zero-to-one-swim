require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data: invoices, error: invErr } = await supabase.from('invoices').select('id, invoice_number, package_id, lessons_remaining').limit(10);
    const { data: packages, error: pkgErr } = await supabase.from('packages').select('id, name, lesson_count');
    
    if (invErr || pkgErr) return console.error(invErr || pkgErr);
    
    console.log('--- Invoices ---');
    console.log(JSON.stringify(invoices, null, 2));
    
    console.log('--- Packages (Sample) ---');
    console.log(JSON.stringify(packages.slice(0, 5), null, 2));
    
    // Check for orphaned package_ids
    const pkgIds = new Set(packages.map(p => p.id));
    const orphaned = invoices.filter(inv => inv.package_id && !pkgIds.has(inv.package_id));
    console.log('Orphaned package IDs found in invoices:', orphaned.length);
}
check();
