require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function rebrand() {
  const { data: packages, error } = await supabase.from('packages').select('*');
  if (error) {
    console.error('Error fetching packages:', error);
    return;
  }

  console.log(`Rebranding ${packages.length} packages to CONCISE format...`);

  for (const pkg of packages) {
    let baseType = pkg.type;
    let newType = baseType;
    let shortName = '';
    
    // 1. Map Types & Core Names
    if (baseType === 'PV' || baseType === 'Private') {
      newType = 'Private';
      shortName = 'Private Class';
    } else if (baseType === 'D2D (A)' || baseType === 'Door to Door (Zone A)' || baseType === 'Door to Door') {
      newType = 'Door to Door';
      shortName = 'Door to Door';
    } else if (baseType === 'D2D (B)' || baseType === 'Door to Door (Zone B)') {
      newType = 'Door to Door (Zone B)';
      shortName = 'D2D Zone B (Far)';
    } else if (baseType === 'G' || baseType === 'Group') {
      newType = 'Group';
      shortName = 'Group Class';
    } else {
      shortName = baseType;
    }

    // 2. Detect Pax
    let pax = 1;
    const name = pkg.name;
    if (name.includes('4 Students') || name.includes('👤👤👤👤') || name.includes('1v4')) pax = 4;
    else if (name.includes('3 Students') || name.includes('👤👤👤') || name.includes('1v3')) pax = 3;
    else if (name.includes('2 Students') || name.includes('👤👤') || name.includes('1v2')) pax = 2;
    else if (name.includes('1 Student') || name.includes('👤') || name.includes('1v1')) pax = 1;
    else if (name.toUpperCase().includes('FAMILY')) pax = 2;
    
    // 3. Handle Special Sessions
    if (name.toUpperCase().includes('TRIAL')) shortName = 'Trial Lesson';
    if (name.toUpperCase().includes('FLEXI')) shortName = 'Flexi Session';
    if (name.toUpperCase().includes('FAMILY')) shortName = 'Family Program';

    console.log(`Updating: "${name}" -> "${shortName}" | Pax: ${pax} | Type: ${newType}`);

    await supabase
      .from('packages')
      .update({ name: shortName, type: newType, pax: pax })
      .eq('id', pkg.id);
  }

  console.log('✅ CONCISE Rebranding complete!');
}

rebrand();
