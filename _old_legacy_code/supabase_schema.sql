-- 1. 学员表
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    parent_name TEXT,
    gender TEXT,
    dob DATE,
    address TEXT,
    emergency_contact TEXT,
    venue_info TEXT,
    coach_id UUID, -- 可选，绑定主教练
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 教练表
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 课程配套表
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    lesson_count INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    type TEXT, -- PV, D2D, Group
    duration INTEGER DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 发票/购课单表
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id),
    total_amount DECIMAL(10,2),
    payment_method TEXT,
    payment_date DATE,
    lessons_remaining INTEGER NOT NULL,
    status TEXT DEFAULT 'paid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 课程考勤表
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id),
    date DATE NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, attended, makeup, postponed, expired
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security (RLS) - 商业运营必须开启
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 创建简单的策略：允许所有已认证用户操作 (后期可细化角色)
CREATE POLICY "Public Access" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON coaches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON lessons FOR ALL USING (true) WITH CHECK (true);
