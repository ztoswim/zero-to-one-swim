/**
 * 全局配置与工具函数
 * 注意：此文件必须在 store.js 和所有页面 script 之前加载
 */

// ================= 全局配置 =================
const CONFIG = {
  PACKAGES: [
    // Private 1v1
    { id: 'p1v1s1', category: 'Private', type: '1v1', sessions: 1, price: 120, name: 'Private 1v1 (1 Session)' },
    { id: 'p1v1s4', category: 'Private', type: '1v1', sessions: 4, price: 400, name: 'Private 1v1 (4 Sessions)' },
    { id: 'p1v1s10', category: 'Private', type: '1v1', sessions: 10, price: 950, name: 'Private 1v1 (10 Sessions)' },
    // Private 1v2
    { id: 'p1v2s1', category: 'Private', type: '1v2', sessions: 1, price: 200, name: 'Private 1v2 (1 Session)' },
    { id: 'p1v2s4', category: 'Private', type: '1v2', sessions: 4, price: 640, name: 'Private 1v2 (4 Sessions)' },
    { id: 'p1v2s10', category: 'Private', type: '1v2', sessions: 10, price: 1500, name: 'Private 1v2 (10 Sessions)' },
    // Private 1v3
    { id: 'p1v3s1', category: 'Private', type: '1v3', sessions: 1, price: 270, name: 'Private 1v3 (1 Session)' },
    { id: 'p1v3s4', category: 'Private', type: '1v3', sessions: 4, price: 840, name: 'Private 1v3 (4 Sessions)' },
    { id: 'p1v3s10', category: 'Private', type: '1v3', sessions: 10, price: 1950, name: 'Private 1v3 (10 Sessions)' },
    // Private 1v4
    { id: 'p1v4s1', category: 'Private', type: '1v4', sessions: 1, price: 330, name: 'Private 1v4 (1 Session)' },
    { id: 'p1v4s4', category: 'Private', type: '1v4', sessions: 4, price: 1000, name: 'Private 1v4 (4 Sessions)' },
    { id: 'p1v4s10', category: 'Private', type: '1v4', sessions: 10, price: 2300, name: 'Private 1v4 (10 Sessions)' },
    // Door to Door (A) 1v1
    { id: 'd2da1v1s1', category: 'D2D', type: '1v1', sessions: 1, price: 150, name: 'D2D 1v1 (1 Session)' },
    { id: 'd2da1v1s4', category: 'D2D', type: '1v1', sessions: 4, price: 500, name: 'D2D 1v1 (4 Sessions)' },
    { id: 'd2da1v1s10', category: 'D2D', type: '1v1', sessions: 10, price: 1150, name: 'D2D 1v1 (10 Sessions)' },
    // Door to Door (A) 1v2
    { id: 'd2da1v2s1', category: 'D2D', type: '1v2', sessions: 1, price: 230, name: 'D2D 1v2 (1 Session)' },
    { id: 'd2da1v2s4', category: 'D2D', type: '1v2', sessions: 4, price: 740, name: 'D2D 1v2 (4 Sessions)' },
    { id: 'd2da1v2s10', category: 'D2D', type: '1v2', sessions: 10, price: 1700, name: 'D2D 1v2 (10 Sessions)' },
    // Door to Door (A) 1v3
    { id: 'd2da1v3s1', category: 'D2D', type: '1v3', sessions: 1, price: 300, name: 'D2D 1v3 (1 Session)' },
    { id: 'd2da1v3s4', category: 'D2D', type: '1v3', sessions: 4, price: 960, name: 'D2D 1v3 (4 Sessions)' },
    { id: 'd2da1v3s10', category: 'D2D', type: '1v3', sessions: 10, price: 2200, name: 'D2D 1v3 (10 Sessions)' },
    // Door to Door (A) 1v4
    { id: 'd2da1v4s1', category: 'D2D', type: '1v4', sessions: 1, price: 350, name: 'D2D 1v4 (1 Session)' },
    { id: 'd2da1v4s4', category: 'D2D', type: '1v4', sessions: 4, price: 1100, name: 'D2D 1v4 (4 Sessions)' },
    { id: 'd2da1v4s10', category: 'D2D', type: '1v4', sessions: 10, price: 2500, name: 'D2D 1v4 (10 Sessions)' }
  ],
  STATUS: {
    scheduled:   { badge: 'bg-blue-100 text-blue-700',   text: 'Scheduled' },
    completed:   { badge: 'bg-green-100 text-green-700', text: 'Completed' },
    absent:      { badge: 'bg-red-100 text-red-700',     text: 'Absent' },
    rescheduled: { badge: 'bg-yellow-100 text-yellow-700', text: 'Rescheduled' },
    cancelled:   { badge: 'bg-gray-100 text-gray-600',   text: 'Cancelled' },
    flex:        { badge: 'bg-indigo-100 text-indigo-700', text: 'Flex Cancel' },
    pending:     { badge: 'bg-purple-100 text-purple-700', text: 'Pending' },
    burn:        { badge: 'bg-red-100 text-red-700',    text: 'Burned (Deducted)' },
    makeup:      { badge: 'bg-orange-100 text-orange-700', text: 'Replacement' }
  },
  PAYMENT_METHODS: {
    cash: 'Cash',
    transfer: 'Transfer',
    ewallet: 'E-Wallet'
  }
};

// ================= 工具函数 =================
const U = {
  // 获取人员名称（学生或教练）
  name(id, students, coaches) {
    const list = [...(students || []), ...(coaches || [])];
    const person = list.find(x => x && x.id === id);
    return person ? person.name : 'Unknown';
  },

  // 获取星期
  weekDay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  },

  // 状态样式类
  badge(status) {
    return (CONFIG.STATUS[status] ? CONFIG.STATUS[status].badge : 'bg-gray-100 text-gray-600');
  },

  // 状态文本
  text(status) {
    return CONFIG.STATUS[status]?.text || status;
  },

  // 课时余额字体颜色
  balColor(rem) {
    if (rem <= 0) return 'text-red-600';
    if (rem <= 1) return 'text-orange-500';
    if (rem <= 2) return 'text-yellow-500';
    return 'text-green-600';
  },

  // 学生卡片左边框颜色
  border(rem) {
    if (rem <= 0) return 'border-red-500';
    if (rem <= 1) return 'border-orange-500';
    if (rem <= 2) return 'border-yellow-500';
    return 'border-green-500';
  },

  // 课程卡片左边框颜色
  lBorder(lesson) {
    if (!lesson) return 'border-blue-500';
    if (lesson.status === 'completed') return 'border-green-500';
    if (lesson.status === 'absent') return 'border-red-500';
    if (lesson.status === 'rescheduled') return 'border-yellow-500';
    if (lesson.type === 'makeup') return 'border-orange-500';
    return 'border-blue-500';
  },

  // 生成 WhatsApp 续费链接
  wa(phone, name, rem) {
    const msg = `Hi ${name}, you have ${rem} swimming sessions remaining. To ensure continuous progress, please consider renewing soon. Thank you!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  },

  // 付款方式映射
  payMethod(method) {
    const methods = {
      'cash': 'Cash',
      'transfer': 'Bank Transfer',
      'wallet': 'E-Wallet'
    };
    return methods[method] || method;
  },

  // 生成唯一ID
  id(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  },

  // 格式化日期 YYYY-MM-DD
  date(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化日期为 DD-MM-YYYY
  dateDMY(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  },

  // 获取指定日期前后范围内的天数
  getDaysRange(baseDateStr, daysBefore = 7, daysAfter = 7) {
    const days = [];
    const base = new Date(baseDateStr + 'T00:00:00');
    for (let i = -daysBefore; i <= daysAfter; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      days.push(this.date(d));
    }
    return days;
  },

  // 计算结束时间
  addMins(timeStr, mins) {
    if (!timeStr || !mins) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + Number(mins));
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 检查两个时间段是否重叠 [s1, e1] vs [s2, e2]
  isOverlap(s1, e1, s2, e2) {
    return s1 < e2 && s2 < e1;
  },

  // 格式化时间为 AM/PM
  timeAMPM(timeStr) {
    if (!timeStr) return '';
    let [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  },

  // 格式化配套名称（去除乱码/表情）
  packageName(id, packages) {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return 'Unknown Package';
    // 映射表：将旧的 ID 或 混乱名字 映射到 新的专业名字
    const names = {
      'PV1': 'Private 1v1 (1 Session)',
      'PV4': 'Private 1v1 (4 Sessions)',
      'PV10': 'Private 1v1 (10 Sessions)',
      'D2D(A)1': 'D2D A 1v1 (1 Session)',
      'D2D(A)4': 'D2D A 1v1 (4 Sessions)',
      'D2D(A)10': 'D2D A 1v1 (10 Sessions)',
      'GROUP4': 'Group (4 Sessions)',
      'GROUP10': 'Group (10 Sessions)'
    };
    // 提取关键部分
    const clean = pkg.name.split('-')[0].trim().replace(/🅰️|🅱️/g, '');
    return names[clean] || pkg.name;
  }
};window.U = U;

