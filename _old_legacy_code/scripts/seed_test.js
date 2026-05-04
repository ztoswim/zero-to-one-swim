require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seed() {
    console.log('🌱 Seeding test data...');

    // 1. Coach
    const { data: coach } = await supabase.from('coaches').insert({
        name: 'Coach Alice',
        phone: '12345678',
        email: 'alice@test.com',
        color: '#6366f1'
    }).select().single();

    // 2. Packages
    const { data: pkg4 } = await supabase.from('packages').insert({
        name: 'PV4 - 👤',
        lesson_count: 4,
        price: 400,
        type: 'Private',
        duration: 45
    }).select().single();

    const { data: pkg10 } = await supabase.from('packages').insert({
        name: 'PV10 - 👤',
        lesson_count: 10,
        price: 900,
        type: 'Private',
        duration: 45
    }).select().single();

    // 3. Students
    await supabase.from('students').insert([
        { name: 'Test Student A', phone: '00001', coach_id: coach.id },
        { name: 'Test Student B', phone: '00002', coach_id: coach.id }
    ]);

    console.log('✅ Test data ready!');
}

seed();
