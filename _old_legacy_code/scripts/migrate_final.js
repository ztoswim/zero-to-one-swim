require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const DATA_DIR = path.join(__dirname, '../data before');

async function migrate() {
    console.log('🚀 Starting Final Migration (with Coach mapping)...');

    const studentsRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'student_rows.csv'), 'utf-8'), { columns: true });
    const coachesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'coach_rows.csv'), 'utf-8'), { columns: true });
    const packagesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'package_rows.csv'), 'utf-8'), { columns: true });
    const coursesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'create_course_rows.csv'), 'utf-8'), { columns: true });
    const lessonsRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'attendance_rows.csv'), 'utf-8'), { columns: true });

    // 1. Sync Coaches
    console.log('Syncing Coaches...');
    const coachMap = {};
    for (const row of coachesRaw) {
        const { data } = await supabase.from('coaches').upsert({
            name: row.name,
            phone: row.phone || '',
            email: row.email || `${row.name.toLowerCase().replace(/\s/g, '')}@swim.com`,
            status: 'active'
        }, { onConflict: 'name' }).select().single();
        coachMap[row.id] = data.id;
    }

    // 2. Sync Students
    console.log('Syncing Students...');
    const studentMap = {};
    for (const row of studentsRaw) {
        const { data } = await supabase.from('students').upsert({
            name: row.name,
            phone: row.phone || '',
            email: row.email || '',
            address: row.address || '',
            venue_info: row.venue || '',
            status: 'active'
        }, { onConflict: 'name' }).select().single();
        studentMap[row.id] = data.id;
    }

    // 3. Sync Packages (Simplified - No duration)
    console.log('Syncing Packages...');
    const packageMap = {};
    for (const row of packagesRaw) {
        const { data } = await supabase.from('packages').upsert({
            name: row.name,
            lesson_count: parseInt(row.volume) || 1,
            price: parseFloat(row.price) || 0,
            type: row.name.includes('D2D') ? 'D2D' : 'PV'
        }, { onConflict: 'name' }).select().single();
        packageMap[row.id] = data.id;
    }

    // Pre-map: Find which coach is teaching which invoice (from lessons)
    const invoiceCoachMap = {};
    lessonsRaw.forEach(l => {
        if (l.create_course_id && l.coach_id && coachMap[l.coach_id]) {
            if (!invoiceCoachMap[l.create_course_id]) {
                invoiceCoachMap[l.create_course_id] = coachMap[l.coach_id];
            }
        }
    });

    // 4. Sync Invoices
    console.log('Syncing Invoices...');
    const invoiceMap = {};
    for (const row of coursesRaw) {
        if (!studentMap[row.student_id]) continue;
        
        const sessionsTotal = parseInt(packagesRaw.find(p => p.id === row.package_id)?.volume) || 1;
        const remaining = Math.round(sessionsTotal * (1 - parseFloat(row.progress || 0)));

        const { data, error } = await supabase.from('invoices').upsert({
            invoice_number: row.invoice_number || `OLD-${row.id}`,
            student_id: studentMap[row.student_id],
            package_id: packageMap[row.package_id],
            coach_id: invoiceCoachMap[row.id] || null, // Mapping coach here!
            total_amount: parseFloat(row.total) || 0,
            payment_method: row.payment_method || 'Online Transfer',
            payment_date: row.payment_date || null,
            lessons_remaining: remaining,
            status: 'paid'
        }, { onConflict: 'invoice_number' }).select().single();
        
        if (data) invoiceMap[row.id] = data.id;
    }

    // 5. Sync Lessons
    console.log('Syncing Lessons...');
    for (const row of lessonsRaw) {
        if (!invoiceMap[row.create_course_id]) continue;

        await supabase.from('lessons').upsert({
            invoice_id: invoiceMap[row.create_course_id],
            student_id: studentMap[row.student_id],
            coach_id: coachMap[row.coach_id],
            date: row.lesson_date,
            time: row.start_time,
            status: row.status.toLowerCase() === 'attend' ? 'attended' : 
                    row.status.toLowerCase() === 'replacement' ? 'makeup' :
                    row.status.toLowerCase() === 'expired' ? 'expired' : 'scheduled'
        });
    }

    console.log('✅ Final Migration Complete! Please refresh the page.');
}

migrate();
