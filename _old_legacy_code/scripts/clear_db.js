require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function clear() {
    console.log('🗑️ Starting database reset...');

    const tables = ['lessons', 'invoices', 'students', 'packages', 'coaches'];

    for (const table of tables) {
        console.log(`Clearing table: ${table}...`);
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
            console.error(`Error clearing ${table}:`, error.message);
            // Some tables might require a different approach if they have no id or strict RLS
            const { error: error2 } = await supabase.from(table).delete().gte('created_at', '1970-01-01');
            if (error2) console.error(`Fallback failed for ${table}:`, error2.message);
        }
    }

    console.log('✅ Database cleared!');
}

clear();
