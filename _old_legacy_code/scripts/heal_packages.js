require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const DATA_DIR = path.join(__dirname, '../data before');

async function heal() {
    console.log('🩹 Starting data healing...');

    // 1. Load CSV data
    const packageCsv = fs.readFileSync(path.join(DATA_DIR, 'package_rows.csv'), 'utf-8');
    const packageRows = parse(packageCsv, { columns: true });
    
    const invoiceCsv = fs.readFileSync(path.join(DATA_DIR, 'create_course_rows.csv'), 'utf-8');
    const invoiceRows = parse(invoiceCsv, { columns: true });

    // 2. Fetch current packages from DB
    const { data: dbPackages } = await supabase.from('packages').select('*');
    const packageMapByName = {};
    dbPackages.forEach(p => { packageMapByName[p.name] = p.id; });

    console.log(`Current DB has ${dbPackages.length} packages.`);

    // 3. Fetch all invoices from DB
    let allInvoices = [];
    let from = 0;
    let step = 1000;
    while (true) {
        const { data, error } = await supabase.from('invoices').select('*').range(from, from + step - 1);
        if (error) break;
        allInvoices.push(...data);
        if (data.length < step) break;
        from += step;
    }
    console.log(`Fetched ${allInvoices.length} invoices to check.`);

    let healedInvoices = 0;
    let newPackages = 0;

    for (const inv of allInvoices) {
        // Check if package is unknown (no match in dbPackages)
        if (!inv.package_id || !dbPackages.find(p => p.id === inv.package_id)) {
            // Find original invoice row from CSV
            const csvInv = invoiceRows.find(r => r.invoice_number === inv.invoice_number);
            if (!csvInv) continue;

            // Find original package name from CSV
            const csvPkg = packageRows.find(p => p.id === csvInv.package_id);
            if (!csvPkg) continue;

            // Does this package exist in DB by name?
            let dbPkgId = packageMapByName[csvPkg.name];

            if (!dbPkgId) {
                // Create the package!
                console.log(`Creating missing package: ${csvPkg.name}`);
                const { data: newPkg, error } = await supabase.from('packages').insert({
                    name: csvPkg.name,
                    lesson_count: parseInt(csvPkg.quantity) || 0,
                    price: parseFloat(csvPkg.fee) || 0,
                    type: csvPkg.type,
                    duration: (csvPkg.description || '').includes('90') || csvPkg.name.includes('90') ? 90 : 45
                }).select().single();
                
                if (error) {
                    console.error(`Failed to create package ${csvPkg.name}:`, error.message);
                    continue;
                }
                dbPkgId = newPkg.id;
                packageMapByName[csvPkg.name] = dbPkgId;
                newPackages++;
            }

            // Update invoice
            await supabase.from('invoices').update({ package_id: dbPkgId }).eq('id', inv.id);
            healedInvoices++;
        }
    }

    console.log(`✅ Healing complete! Created ${newPackages} missing packages and healed ${healedInvoices} invoices.`);
}

heal();
