require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPackages() {
  const csvPath = path.join(__dirname, '../_old_legacy_code/new csv/packages_rows.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(csvContent, { columns: true });

  console.log(`Found ${rows.length} packages to import.`);

  const formattedData = rows.map(r => ({
    id: r.id,
    name: r.name,
    lesson_count: parseInt(r.lesson_count) || 1,
    price: parseFloat(r.price) || 0,
    type: r.type || 'Private',
    // duration is intentionally left out as requested, though it exists in schema
  }));

  // Batch insert/upsert
  const { data, error } = await supabase
    .from('packages')
    .upsert(formattedData, { onConflict: 'id' });

  if (error) {
    console.error('Error importing packages:', error);
  } else {
    console.log('Successfully imported packages!');
  }
}

importPackages();
