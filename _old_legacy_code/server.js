require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = 3000;
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // API 路由
  if (req.url === '/api/data') {
    if (req.method === 'GET') {
      try {
        // 辅助函数：分块获取所有数据（绕过 Supabase 1000 条限制）
        const fetchAll = async (table) => {
          let allData = [];
          let from = 0;
          let step = 1000;
          let finished = false;
          while (!finished) {
            const { data, error } = await supabase.from(table).select('*').range(from, from + step - 1);
            if (error) throw error;
            allData.push(...data);
            if (data.length < step) finished = true;
            from += step;
          }
          return allData;
        };

        // 并行获取所有表数据
        const [students, coaches, packages, invoices, lessons] = await Promise.all([
          fetchAll('students'),
          fetchAll('coaches'),
          fetchAll('packages'),
          fetchAll('invoices'),
          fetchAll('lessons')
        ]);

        const combinedData = {
          students: students || [],
          coaches: coaches || [],
          packages: packages || [],
          invoices: invoices || [],
          lessons: lessons || []
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(combinedData));
      } catch (err) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: err.message }));
      }
    }
    
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '请使用 Supabase 直接操作以获得最佳性能' }));
      });
      return;
    }
  }

  // 静态文件服务
  let filePath = req.url;
  if (filePath === '/') filePath = '/pages/dashboard/index.html';
  else if (filePath.match(/^\/(dashboard|students|coaches|calendar|invoice|create-invoice)(\/?|\/index\.html)?$/)) {
    filePath = `/pages${filePath}${filePath.endsWith('.html') ? '' : filePath.endsWith('/') ? 'index.html' : '/index.html'}`;
  }
  
  const cleanPath = filePath.split('?')[0];
  const fullPath = path.join(__dirname, cleanPath);
  
  const ext = path.extname(fullPath);
  const contentTypes = { 
    '.html': 'text/html', 
    '.css': 'text/css', 
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };
  
  fs.readFile(fullPath, (err, c) => {
    if (err) { res.writeHead(404); res.end('Not Found'); }
    else { res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' }); res.end(c); }
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`✅ 商业版后端已启动: http://localhost:${PORT}`));