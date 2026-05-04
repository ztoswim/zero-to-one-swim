require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const DATA_DIR = path.join(__dirname, '../data before');

async function migrate() {
    console.log('🚀 Starting migration...');

    // 1. Migrate Coaches
    console.log('--- Migrating Coaches ---');
    const coachCsv = fs.readFileSync(path.join(DATA_DIR, 'coach_rows.csv'), 'utf-8');
    const coachRows = parse(coachCsv, { columns: true });
    const coachMap = {}; // old_id -> new_uuid

    for (const row of coachRows) {
        const { data, error } = await supabase.from('coaches').insert({
            name: row.name,
            phone: row.contact_number,
            email: row.email,
        }).select().single();
        
        if (error) console.error('Coach Error:', error);
        else coachMap[row.id] = data.id;
    }

    // 2. Migrate Packages
    console.log('--- Migrating Packages ---');
    const packageCsv = fs.readFileSync(path.join(DATA_DIR, 'package_rows.csv'), 'utf-8');
    const packageRows = parse(packageCsv, { columns: true });
    const packageMap = {};

    for (const row of packageRows) {
        if (!row.name || row.name === 'Transport Fee') continue;
        const description = row.description || '';
        const { data, error } = await supabase.from('packages').insert({
            name: row.name,
            lesson_count: parseInt(row.quantity) || 0,
            price: parseFloat(row.fee) || 0,
            type: row.type,
            duration: description.includes('90') || row.name.includes('90') ? 90 : 45
        }).select().single();

        if (error) console.error('Package Error:', error);
        else packageMap[row.id] = data.id;
    }

    // 3. Migrate Students
    console.log('--- Migrating Students ---');
    const studentCsv = fs.readFileSync(path.join(DATA_DIR, 'student_rows.csv'), 'utf-8');
    const studentRows = parse(studentCsv, { columns: true });
    const studentMap = {};

    for (const row of studentRows) {
        const { data, error } = await supabase.from('students').insert({
            name: row.name,
            phone: row.contact_number,
            parent_name: row.parent_name,
            gender: row.gender,
            dob: row.dob ? row.dob.split(' ')[0] : null,
            address: row.address,
            emergency_contact: row.emergency_contact,
            venue_info: row.class_venue,
            coach_id: coachMap[row.coach_id] || null,
            status: 'active'
        }).select().single();

        if (error) console.error('Student Error:', error);
        else studentMap[row.id] = data.id;
    }

    // 4. Migrate Invoices
    console.log('--- Migrating Invoices ---');
    const invoiceCsv = fs.readFileSync(path.join(DATA_DIR, 'create_course_rows.csv'), 'utf-8');
    const invoiceRows = parse(invoiceCsv, { columns: true });
    const invoiceMap = {};
    const usedInvoiceNumbers = new Set();
    for (const row of invoiceRows) {
        const pkg = packageRows.find(p => p.id === row.package_id);
        const quantity = pkg ? parseInt(pkg.quantity) : 4;
        const progress = parseFloat(row.progress) || 0;
        const remaining = Math.max(0, Math.round(quantity * (1 - progress)));

        let invNum = row.invoice_number || `INV-OLD-${row.id}`;
        let finalInvNum = invNum;
        let counter = 2;
        while (usedInvoiceNumbers.has(finalInvNum)) {
            finalInvNum = `${invNum}_DUP${counter}`;
            counter++;
        }
        usedInvoiceNumbers.add(finalInvNum);

        const { data, error } = await supabase.from('invoices').insert({
            invoice_number: finalInvNum,
            student_id: studentMap[row.student_id],
            package_id: packageMap[row.package_id],
            total_amount: parseFloat(row.total) || 0,
            payment_method: row.payment_method,
            payment_date: row.payment_date ? row.payment_date.split(' ')[0] : null,
            lessons_remaining: remaining,
            status: row.done === 'true' ? 'paid' : 'paid' 
        }).select().single();

        if (error) {
            console.error(`Invoice Error (ID ${row.id}):`, error.message);
        } else {
            invoiceMap[row.id] = data.id;
        }
    }

    // 5. Migrate Lessons (Attendance)
    console.log('--- Migrating Lessons ---');
    const lessonCsv = fs.readFileSync(path.join(DATA_DIR, 'attendance_rows.csv'), 'utf-8');
    const lessonRows = parse(lessonCsv, { columns: true });

    // Chunk lessons to avoid timeout
    const chunkSize = 100;
    for (let i = 0; i < lessonRows.length; i += chunkSize) {
        const chunk = lessonRows.slice(i, i + chunkSize);
        const inserts = chunk.map(row => {
            let status = 'attended';
            if (row.status === 'Replacement') status = 'makeup';
            if (row.status === 'Expired') status = 'expired';
            if (row.status === 'Transferred') status = 'cancelled';

            return {
                student_id: studentMap[row.student_id] || Object.values(studentMap)[0], // Fallback if name based matching failed in old system
                invoice_id: invoiceMap[row.create_course_id],
                coach_id: coachMap[row.coach_id],
                date: row.start_date ? (() => {
                    const d = new Date(row.start_date);
                    // Add 8 hours manually if not already in local time context
                    d.setUTCHours(d.getUTCHours() + 8);
                    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
                })() : row.createdAt.split(' ')[0],
                time: row.start_date ? (() => {
                    const d = new Date(row.start_date);
                    d.setUTCHours(d.getUTCHours() + 8);
                    return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
                })() : '00:00',
                duration: 50, // Default for old lessons
                status: status,
                remark: row.remark
            };
        }).filter(item => item.invoice_id && item.student_id);

        if (inserts.length > 0) {
            const { error } = await supabase.from('lessons').insert(inserts);
            if (error) console.error('Lesson Chunk Error:', error.message);
        }
        console.log(`Processed ${i + inserts.length} lessons...`);
    }

    console.log('✅ Migration complete!');
}

migrate();
