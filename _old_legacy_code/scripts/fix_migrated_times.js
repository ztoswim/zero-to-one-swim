require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fix() {
    console.log('🔍 Fetching ALL migrated lessons...');
    
    let allLessons = [];
    let from = 0;
    let step = 1000;
    let finished = false;

    while (!finished) {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .gte('created_at', '2026-04-29T07:00:00Z')
            .lte('created_at', '2026-04-29T08:00:00Z')
            .range(from, from + step - 1);

        if (error) {
            console.error('Error fetching lessons:', error);
            break;
        }
        allLessons.push(...data);
        console.log(`Fetched ${allLessons.length} lessons...`);
        if (data.length < step) finished = true;
        from += step;
    }

    console.log(`✨ Total migrated lessons found: ${allLessons.length}`);
    
    let count = 0;
    let skipped = 0;
    const chunkSize = 50;
    
    for (let i = 0; i < allLessons.length; i += chunkSize) {
        const chunk = allLessons.slice(i, i + chunkSize);
        
        await Promise.all(chunk.map(async (l) => {
            const [h, m] = l.time.split(':').map(Number);
            
            // Heuristic to avoid double-fixing:
            // Migrated UTC times are usually morning/afternoon (00:00 to 13:00 UTC).
            // If they are fixed, they should be shifted by 8 hours (08:00 to 21:00+).
            // Threshold 14 UTC covers up to 10 PM Malaysia time.
            if (h < 14) {
                let newH = h + 8;
                let newDate = l.date;
                
                if (newH >= 24) {
                    newH -= 24;
                    const d = new Date(l.date);
                    d.setUTCDate(d.getUTCDate() + 1);
                    newDate = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
                }
                
                const newTime = `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                
                const { error: updateError } = await supabase
                    .from('lessons')
                    .update({ time: newTime, date: newDate })
                    .eq('id', l.id);
                    
                if (updateError) console.error(`Failed to update lesson ${l.id}:`, updateError.message);
                else count++;
            } else {
                skipped++;
            }
        }));
        
        if (i % 200 === 0) console.log(`Progress: ${Math.min(i + chunkSize, allLessons.length)}/${allLessons.length}...`);
    }

    console.log(`✅ Success! Updated ${count} lessons. Skipped ${skipped} (already fixed or not UTC).`);
}

fix();
