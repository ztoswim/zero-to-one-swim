require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function count() {
    const { count, error } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', '2026-04-29T07:00:00Z')
        .lte('created_at', '2026-04-29T08:00:00Z');
    if (error) console.error(error);
    else console.log('Total migrated lessons:', count);
}
count();
