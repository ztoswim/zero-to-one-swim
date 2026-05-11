require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function debugPax() {
  const csvPath = path.join(__dirname, '../_old_legacy_code/new csv/packages_rows.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(csvContent, { columns: true });
  
  console.log('--- PAX DEBUG LOG ---');
  rows.filter(r => r.type === 'PV').forEach(r => {
    let pax = 1;
    const oldName = r.name;
    
    if (oldName.includes('👤👤👤👤') || oldName.includes('1v4')) pax = 4;
    else if (oldName.includes('👤👤👤') || oldName.includes('1v3')) pax = 3;
    else if (oldName.includes('👤👤') || oldName.includes('1v2')) pax = 2;
    else if (oldName.includes('👤') || oldName.includes('1v1')) pax = 1;
    
    console.log(`Name: [${oldName}] -> Calculated Pax: ${pax}`);
  });
}

debugPax();
