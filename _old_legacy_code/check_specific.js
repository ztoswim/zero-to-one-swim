require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const invNum = 'INV260405-0588';
    const { data: inv, error: invErr } = await supabase.from('invoices').select('*').eq('invoice_number', invNum).single();
    
    if (invErr) return console.error('Invoice Not Found:', invNum, invErr.message);
    
    console.log('--- Invoice ---');
    console.log(JSON.stringify(inv, null, 2));
    
    const { data: lessons, error: lErr } = await supabase.from('lessons').select('*').eq('invoice_id', inv.id);
    console.log('--- Lessons ---');
    console.log(`Found ${lessons ? lessons.length : 0} lessons.`);
    if (lessons) console.log(JSON.stringify(lessons, null, 2));
    
    const { data: pkg, error: pErr } = await supabase.from('packages').select('*').eq('id', inv.package_id).single();
    console.log('--- Package ---');
    console.log(JSON.stringify(pkg, null, 2));
}
check();
