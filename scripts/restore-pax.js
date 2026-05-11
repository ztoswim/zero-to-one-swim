require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const csvPath = path.join(__dirname, '../_old_legacy_code/new csv/packages_rows.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(csvContent, { columns: true });
  
  console.log(`🚀 Updating D2D and Private Training Class names...`);

  for (const r of rows) {
    const oldName = r.name;
    const price = parseFloat(r.price);
    const sessions = parseInt(r.lesson_count);
    const is90m = oldName.includes('90') || r.duration === '90';
    
    let pax = 1;

    // Pax Detection Logic (Accurate)
    const emojiCount = (oldName.match(/👤/g) || []).length;
    if (emojiCount > 0) pax = emojiCount;
    else {
      if (sessions === 1) {
        if (price >= 300) pax = 4;
        else if (price >= 250) pax = 3;
        else if (price >= 180) pax = 2;
      } else if (sessions === 4) {
        if (is90m) { if (price >= 1200) pax = 4; else if (price >= 1000) pax = 3; else if (price >= 800) pax = 2; }
        else { if (price >= 1000) pax = 4; else if (price >= 800) pax = 3; else if (price >= 600) pax = 2; }
      } else if (sessions === 10) {
        if (is90m) { if (price >= 2700) pax = 4; else if (price >= 2400) pax = 3; else if (price >= 1900) pax = 2; }
        else { if (price >= 2200) pax = 4; else if (price >= 1800) pax = 3; else if (price >= 1400) pax = 2; }
      }
      if (oldName.toUpperCase().includes('FAMILY')) pax = 2;
    }

    // New Professional Naming
    let type = 'Private';
    let shortName = 'Private Class';
    
    if (r.type === 'G') {
      type = 'Group';
      shortName = 'Group Class';
    } else if (r.type.includes('D2D')) {
      type = 'Door to Door';
      shortName = is90m ? 'Door to Door Training' : 'Door to Door';
    }

    if (type === 'Private' && is90m) {
      shortName = 'Private Training Class';
    }

    if (oldName.toUpperCase().includes('TRIAL')) shortName = 'Trial Lesson';
    if (oldName.toUpperCase().includes('FLEXI')) shortName = 'Flexi Session';
    if (oldName.toUpperCase().includes('FAMILY')) shortName = 'Family Program';

    await supabase.from('packages').update({ name: shortName, type: type, pax: pax }).eq('id', r.id);
  }
  
  console.log('✅ D2D Training Class names and pax updated successfully!');
}

run();
