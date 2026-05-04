require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const DATA_DIR = path.join(__dirname, '../data before');

async function runSuperSync() {
    console.log('🌟 Starting Super Sync...');

    try {
        const coachesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'coach_rows.csv'), 'utf-8'), { columns: true });
        const studentsRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'student_rows.csv'), 'utf-8'), { columns: true });
        const packagesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'package_rows.csv'), 'utf-8'), { columns: true });
        const coursesRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'create_course_rows.csv'), 'utf-8'), { columns: true });
        const attendanceRaw = parse(fs.readFileSync(path.join(DATA_DIR, 'attendance_rows.csv'), 'utf-8'), { columns: true });

        // 1. Map Coaches (ByName to UUID)
        console.log('Mapping Coaches...');
        const coachIdMap = {}; // Old CSV ID -> New Supabase UUID
        const { data: dbCoaches } = await supabase.from('coaches').select('id, name');
        
        for (const row of coachesRaw) {
            let coach = dbCoaches?.find(c => c.name === row.name);
            if (!coach) {
                const { data } = await supabase.from('coaches').insert({ name: row.name, status: 'active', phone: row.phone || '' }).select().single();
                coach = data;
            }
            if (coach) coachIdMap[row.id] = coach.id;
        }

        // 2. Map Students (ByName to UUID)
        console.log('Mapping Students...');
        const studentIdMap = {};
        const { data: dbStudents } = await supabase.from('students').select('id, name');
        for (const row of studentsRaw) {
            let student = dbStudents?.find(s => s.name === row.name);
            if (!student) {
                const { data } = await supabase.from('students').insert({ name: row.name, phone: row.phone || '', status: 'active' }).select().single();
                student = data;
            }
            if (student) studentIdMap[row.id] = student.id;
        }

        // 3. Pre-analyze Attendance to find Coach for each Course
        console.log('Analyzing attendance for coach mapping...');
        const courseCoachMapping = {}; // course_id -> coach_uuid
        attendanceRaw.forEach(att => {
            if (att.create_course_id && att.coach_id && coachIdMap[att.coach_id]) {
                if (!courseCoachMapping[att.create_course_id]) {
                    courseCoachMapping[att.create_course_id] = coachIdMap[att.coach_id];
                }
            }
        });

        // 4. Sync Invoices with Coach ID
        console.log('Syncing Invoices with Coaches...');
        const packageMap = {};
        const { data: dbPackages } = await supabase.from('packages').select('id, name');
        packagesRaw.forEach(p => {
            const dbP = dbPackages?.find(dbp => dbp.name.startsWith(p.name.substring(0, 5)));
            if (dbP) packageMap[p.id] = dbP.id;
        });

        for (const row of coursesRaw) {
            if (!studentIdMap[row.student_id]) continue;
            
            const sessionsTotal = parseInt(packagesRaw.find(p => p.id === row.package_id)?.volume) || 1;
            const remaining = Math.round(sessionsTotal * (1 - parseFloat(row.progress || 0)));

            const invData = {
                invoice_number: row.invoice_number || `OLD-${row.id}`,
                student_id: studentIdMap[row.student_id],
                package_id: packageMap[row.package_id] || null,
                coach_id: courseCoachMapping[row.id] || null, // THE FIX!
                total_amount: parseFloat(row.total) || 0,
                payment_date: row.payment_date || null,
                lessons_remaining: remaining,
                status: 'paid'
            };

            await supabase.from('invoices').upsert(invData, { onConflict: 'invoice_number' });
        }

        console.log('✅ All tasks completed successfully!');
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
    }
}

runSuperSync();
