require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const NEW_CSV = path.join(__dirname, '../new csv/packages_rows.csv');

async function cleanPackages() {
    console.log('🧹 Cleaning packages in Supabase...');
    
    if (!fs.existsSync(NEW_CSV)) {
        console.error('File not found:', NEW_CSV);
        return;
    }

    const csvContent = fs.readFileSync(NEW_CSV, 'utf-8');
    const rows = parse(csvContent, { columns: true });

    for (const row of rows) {
        let name = row.name;
        let duration = parseInt(row.duration) || 45;

        // --- 清洗逻辑 ---
        
        // 1. 识别 90 分钟
        const is90 = name.startsWith('90') || duration === 90;
        let cleanName = name.replace(/^90/, '').trim();

        // 2. 识别类别
        let category = 'Private';
        if (cleanName.includes('D2D')) {
            const type = cleanName.includes('🅰️') || cleanName.includes('A') ? 'A' : 'B';
            category = `D2D ${type}`;
        } else if (cleanName.includes('GROUP') || cleanName.includes('Group') || cleanName.includes('FAMILY') || cleanName.includes('TRIAL')) {
            category = 'Group';
        }

        // 3. 识别人数 (根据 👤 数量或名字里的数字)
        let people = 1;
        const emojiCount = (name.match(/👤/g) || []).length;
        if (emojiCount > 0) {
            people = emojiCount;
        } else if (cleanName.includes('1v')) {
            const match = cleanName.match(/1v(\d)/);
            if (match) people = parseInt(match[1]);
        }

        // 4. 识别课时
        let sessions = row.lesson_count || '1';
        if (cleanName.includes('Sessions')) {
            const sMatch = cleanName.match(/\((\d+) Sessions\)/);
            if (sMatch) sessions = sMatch[1];
        }

        // 5. 组装新名字
        if (category === 'Group') {
            const groupName = cleanName.split('-')[0].trim().replace(/👤/g, '');
            name = `${groupName} (${sessions} Sessions${is90 ? ', 90 mins' : ''})`;
        } else {
            name = `${category} 1v${people} (${sessions} Sessions${is90 ? ', 90 mins' : ''})`;
        }

        // 特殊处理 (保持原样如果已经很专业)
        if (row.name.includes('Sessions') && !row.name.includes('👤') && !row.name.includes('90')) {
            name = row.name;
        }

        console.log(`Updating ${row.id}: [${row.name}] -> [${name}]`);

        const { error } = await supabase.from('packages').update({
            name: name,
            duration: is90 ? 90 : 45
        }).eq('id', row.id);

        if (error) console.error(`Error updating ${row.id}:`, error.message);
    }

    console.log('✅ Packages cleaned and updated!');
}

cleanPackages();
