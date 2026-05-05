'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package as PackageIcon, 
  Calendar as CalendarIcon, 
  Clock, 
  Medal, 
  Send, 
  Trash2, 
  AlertCircle, 
  Plus, 
  UserPlus,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { WheelDateInput } from '@/components/WheelDateInput';
import { WheelTimeInput } from '@/components/WheelTimeInput';
import { StudentModal } from '@/components/StudentModal';
import { createInvoiceAction } from './actions';

interface CreateInvoiceFormProps {
  students: any[];
  coaches: any[];
  packages: any[];
  lessons: any[];
  initialInvNumber: string;
}

export const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ 
  students: initialStudents, 
  coaches, 
  packages,
  lessons,
  initialInvNumber
}) => {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const [pkgCategory, setPkgCategory] = useState('Private');
  const [pkgType, setPkgType] = useState('1v1');
  const [is90m, setIs90m] = useState(false);

  const [form, setForm] = useState({
    invNumber: initialInvNumber,
    paymentDate: new Date().toISOString().split('T')[0],
    studentId: '',
    coachId: coaches[0]?.id || '',
    pkgId: '',
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    mode: 'fixed', // 'fixed', 'weekly', 'custom'
    duration: 45,
    discount: 0,
    weekDays: [] as number[],
    customDates: [] as { date: string, time: string }[],
    isSharedSlot: false,
  });

  // Derived State
  const currentPkg = useMemo(() => packages.find(p => p.id === form.pkgId), [packages, form.pkgId]);

  const filteredPackages = useMemo(() => {
    const combinedType = `${pkgCategory}-${pkgType}`;
    const targetDuration = is90m ? 90 : 45;
    return packages
      .filter(p => p.type === combinedType && p.duration === targetDuration)
      .sort((a, b) => a.lessonCount - b.lessonCount);
  }, [packages, pkgCategory, pkgType, is90m]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter(s => 
      !q || s.name.toLowerCase().includes(q) || (s.phone || '').toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const finalTotalPrice = useMemo(() => {
    if (!currentPkg) return 0;
    return Math.max(0, Number(currentPkg.price) - (form.discount || 0));
  }, [currentPkg, form.discount]);

  const personalPrice = useMemo(() => {
    return finalTotalPrice; // Simplified for now
  }, [finalTotalPrice]);

  // Schedule Generation
  const fixedDates = useMemo(() => {
    if (!form.date || !currentPkg) return [];
    const dates = [];
    const [y, m, d] = form.date.split('-').map(Number);
    const startDate = new Date(y, m - 1, d);
    for (let i = 0; i < currentPkg.lessonCount; i++) {
      const next = new Date(startDate);
      next.setDate(next.getDate() + (i * 7));
      dates.push(next.toISOString().split('T')[0]);
    }
    return dates;
  }, [form.date, currentPkg]);

  const weeklyDates = useMemo(() => {
    if (!form.date || !currentPkg || !form.weekDays.length) return [];
    const dates = [];
    const sortedDays = [...form.weekDays].sort((a, b) => a - b);
    const [y, m, d] = form.date.split('-').map(Number);
    let current = new Date(y, m - 1, d);
    let safety = 0;
    while (dates.length < currentPkg.lessonCount && safety < 100) {
      safety++;
      if (sortedDays.includes(current.getDay())) {
        dates.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [form.date, currentPkg, form.weekDays]);

  // Conflict Checking Logic
  const conflicts = useMemo(() => {
    if (!form.coachId || !form.time || !form.date) return [];
    const targetDates = form.mode === 'fixed' ? fixedDates : 
                       (form.mode === 'weekly' ? weeklyDates : 
                        form.customDates.map(d => d.date));
    
    const isOverlap = (s1: string, e1: string, s2: string, e2: string) => {
      return s1 < e2 && s2 < e1;
    };

    const addMins = (time: string, mins: number) => {
      const [h, m] = time.split(':').map(Number);
      const total = h * 60 + m + mins;
      const newH = Math.floor(total / 60) % 24;
      const newM = total % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const newStart = form.time;
    const newEnd = addMins(newStart, form.duration || 45);
    
    return lessons.filter(l => {
      if (l.coachId !== form.coachId) return false;
      if (!targetDates.includes(l.date)) return false;
      if (l.status === 'cancelled') return false;
      
      const existStart = l.time;
      const existEnd = addMins(existStart, l.duration || 45);
      return isOverlap(newStart, newEnd, existStart, existEnd);
    });
  }, [form.coachId, form.time, form.date, form.mode, form.duration, fixedDates, weeklyDates, form.customDates, lessons]);

  const conflictNames = useMemo(() => {
    const ids = [...new Set(conflicts.map(l => l.studentId))];
    return ids.map(id => students.find(s => s.id === id)?.name || 'Unknown');
  }, [conflicts, students]);

  // Sync Duration when package changes
  useEffect(() => {
    if (currentPkg?.duration) {
      setForm(prev => ({ ...prev, duration: currentPkg.duration }));
    }
  }, [currentPkg]);

  const formErrors = useMemo(() => {
    const errs = [];
    if (!form.invNumber) errs.push('Invoice Number');
    if (!form.paymentDate) errs.push('Payment Date');
    if (!form.studentId) errs.push('Student');
    if (!form.coachId) errs.push('Coach');
    if (!form.pkgId) errs.push('Lesson Package');
    if (!form.method) errs.push('Payment Mode');
    if (!form.date) errs.push('Start Date');
    if (!form.time) errs.push('Start Time');
    
    if (conflicts.length > 0 && !form.isSharedSlot) {
      errs.push('Slot Occupied (Need Shared Slot)');
    }
    return errs;
  }, [form, conflicts]);

  const handleSaveStudent = (newStudent: any) => {
    // In a real app, you'd call a server action to save the student and get an ID
    // For now, we'll just mock the ID
    const studentWithId = { ...newStudent, id: crypto.randomUUID() };
    setStudents([studentWithId, ...students]);
    setForm({ ...form, studentId: studentWithId.id });
    setShowStudentModal(false);
  };

  const handleSubmit = async () => {
    if (formErrors.length > 0) return;

    const schedule: { date: string; time: string }[] = [];
    if (form.mode === 'fixed') fixedDates.forEach(d => schedule.push({ date: d, time: form.time }));
    else if (form.mode === 'weekly') weeklyDates.forEach(d => schedule.push({ date: d, time: form.time }));
    else form.customDates.forEach(s => schedule.push(s));

    const invoiceData = {
      invoiceNumber: form.invNumber,
      studentId: form.studentId,
      coachId: form.coachId,
      packageId: form.pkgId,
      totalAmount: finalTotalPrice,
      paymentMethod: form.method,
      paymentDate: form.paymentDate,
      lessonsRemaining: currentPkg?.lessonCount || 0,
      duration: form.duration,
    };

    const res = await createInvoiceAction({
      invId: crypto.randomUUID(),
      invoiceData,
      schedule
    });

    if (res.success) {
      alert('Invoice created successfully!');
      router.push('/schedule');
    } else {
      alert('Error: ' + res.error);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 min-h-0">
      {/* Left Side: Form Sections */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-start min-h-0 overflow-y-auto pb-6 pr-2">
        
        <div className="space-y-4">
          {/* Step 1: Basic Info */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-200">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select Student and Staff</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8 pb-8 border-b border-gray-50">
              <div className="form-group">
                <label className="label">Invoice Number <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={form.invNumber}
                  onChange={(e) => setForm({...form, invNumber: e.target.value})}
                  className="input-field h-12 text-sm font-black text-primary-600 bg-primary-50/30 border-primary-100" 
                  placeholder="INV-XXXXXX" 
                />
              </div>
              <div className="form-group">
                <label className="label">Payment Date <span className="req">*</span></label>
                <WheelDateInput value={form.paymentDate} onChange={(val) => setForm({...form, paymentDate: val})} className="h-12 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Student Search */}
              <div className="form-group relative">
                <label className="label">Search Student <span className="req">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="input-field pl-4 h-12 text-sm" 
                    placeholder="Search student by name or phone..." 
                  />
                </div>

                {/* Search Results */}
                {studentSearch && (
                  <div className="absolute z-30 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto">
                    {filteredStudents.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => { setForm({...form, studentId: s.id}); setStudentSearch(''); }}
                        className="p-5 hover:bg-primary-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 transition-all"
                      >
                        <div>
                          <div className="font-black text-gray-900 text-sm">{s.name}</div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase">{s.phone}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-black text-xs">
                          {form.studentId === s.id ? '✓' : '+'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coach Selection */}
              <div className="form-group">
                <label className="label">Assigned Coach <span className="req">*</span></label>
                <div className="relative">
                  <select 
                    value={form.coachId}
                    onChange={(e) => setForm({...form, coachId: e.target.value})}
                    className="input-field h-12 appearance-none pr-10 cursor-pointer text-sm"
                  >
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Display Selected Student */}
              {form.studentId && (
                <div className="md:col-span-2 pt-2">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Current Selection</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-5 py-3 bg-white rounded-2xl border-2 border-primary-500 flex items-center gap-4 animate-in shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center text-sm font-black">1</div>
                        <div className="font-black text-gray-900 text-sm">
                          {students.find(s => s.id === form.studentId)?.name}
                        </div>
                      </div>
                      <button onClick={() => setForm({...form, studentId: ''})} className="text-primary-500 font-black hover:scale-125 transition-transform">&times;</button>
                    </div>
                  </div>
                </div>
              )}

              <div 
                className="md:col-span-2 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group hover:bg-primary-50 hover:border-primary-200 transition-all cursor-pointer mt-4"
                onClick={() => setShowStudentModal(true)}
              >
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-8 h-8 text-primary-500" />
                </div>
                <h4 className="text-lg font-black text-gray-900 tracking-tight">Register New Student</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Add to database and automatically select</p>
              </div>
            </div>
          </div>

          {/* Step 2: Course & Billing */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-200">
                <PackageIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Course & Billing</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select Plan and Payment Method</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="w-full px-1">
                <div className="flex flex-col gap-6 mb-6">
                  {/* Category Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100/50 p-1.5 rounded-3xl w-full border border-gray-100">
                    {['Private', 'D2D (A)', 'D2D (B)', 'Group'].map(cat => (
                      <button 
                        key={cat}
                        type="button" 
                        onClick={() => setPkgCategory(cat)}
                        className={`px-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pkgCategory === cat ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {cat === 'D2D (A)' ? 'D2D (Near)' : (cat === 'D2D (B)' ? 'D2D (Far)' : cat)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Type Selection */}
                    <div className="flex flex-wrap items-center gap-2">
                      {['1v1', '1v2', '1v3', '1v4'].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setPkgType(type)}
                          className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${pkgType === type ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600 bg-gray-50/50'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    {/* 90m Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-200 transition-all">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${is90m ? 'text-primary-500' : 'text-gray-400'}`}>90 Min Session</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" checked={is90m} onChange={() => setIs90m(!is90m)} className="sr-only peer" />
                        <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary-500"></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
                  {filteredPackages.map(pkg => (
                    <label 
                      key={pkg.id}
                      className={`relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all overflow-hidden bg-white shadow-sm hover:translate-y-[-2px] active:scale-95 flex flex-col justify-center items-center text-center ${form.pkgId === pkg.id ? 'border-primary-500 ring-4 ring-primary-50 z-10' : 'border-gray-100 opacity-60'}`}
                    >
                      <input type="radio" value={pkg.id} checked={form.pkgId === pkg.id} onChange={() => setForm({...form, pkgId: pkg.id})} className="hidden" />
                      <div className="text-3xl font-black text-gray-900 mb-0.5 tracking-tighter">{pkg.lessonCount}</div>
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Sessions</div>
                      <div className="text-[10px] font-bold text-gray-600 mb-2 px-2 leading-tight min-h-[2.5rem] flex items-center justify-center">{pkg.name}</div>
                      <div className="text-primary-500 font-black text-xl tracking-tighter">RM{pkg.price}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 gap-4 pt-6 border-t border-gray-100">
                <div className="form-group">
                  <label className="label">Payment Mode <span className="req">*</span></label>
                  <div className="relative">
                    <select 
                      value={form.method}
                      onChange={(e) => setForm({...form, method: e.target.value})}
                      className="input-field h-12 appearance-none pr-10 cursor-pointer"
                    >
                      <option value="cash">Cash / Physical</option>
                      <option value="transfer">Online Transfer</option>
                      <option value="ewallet">E-Wallet Payment</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 3: Schedule Plan */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-200">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Plan</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Timing and Recurrence</p>
              </div>
            </div>

            {/* Shared Slot Toggle & Warning */}
            {conflicts.length > 0 && (
              <div 
                className={`p-6 rounded-[2rem] border mb-6 flex flex-col gap-4 animate-in ${form.isSharedSlot ? 'bg-primary-50 border-primary-100' : 'bg-orange-50 border-orange-100'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${form.isSharedSlot ? 'bg-primary-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {form.isSharedSlot ? <User className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-black text-sm tracking-tight ${form.isSharedSlot ? 'text-primary-900' : 'text-orange-900'}`}>
                      {form.isSharedSlot ? 'Shared Slot Mode Active' : 'Time Slot Occupied'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {conflictNames.map(name => (
                        <span 
                          key={name} 
                          className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-current opacity-70 ${form.isSharedSlot ? 'bg-primary-100 text-primary-700' : 'bg-orange-100 text-orange-700'}`}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={form.isSharedSlot} onChange={() => setForm({...form, isSharedSlot: !form.isSharedSlot})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="form-group">
                <label className="label">First Session Date <span className="req">*</span></label>
                <WheelDateInput value={form.date} onChange={(val) => setForm({...form, date: val})} className="h-12 text-sm" />
              </div>
              <div className="form-group">
                <label className="label">First Session Time <span className="req">*</span></label>
                <WheelTimeInput value={form.time} onChange={(val) => setForm({...form, time: val})} className="h-12 text-sm" />
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="label">Lesson Duration <span className="req">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 45, 50, 90].map(d => (
                  <button 
                    key={d}
                    type="button"
                    onClick={() => setForm({...form, duration: d})}
                    className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${form.duration === d ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600 bg-gray-50/50'}`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="label ml-1">Recurrence Model <span className="req">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {v:'fixed', t:'Fixed Weekly', d:'Standard', i: CalendarIcon},
                  {v:'weekly', t:'Select Days', d:'Custom Week', i: Clock},
                  {v:'custom', t:'Manual Fix', d:'Hand Pick', i: Medal}
                ].map(mode => (
                  <label 
                    key={mode.v}
                    className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-center text-center gap-1 cursor-pointer transition-all hover:translate-y-[-2px] active:scale-95 shadow-sm ${form.mode === mode.v ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-50' : 'border-gray-50 bg-white opacity-60'}`}
                  >
                    <input type="radio" value={mode.v} checked={form.mode === mode.v} onChange={() => setForm({...form, mode: mode.v})} className="hidden" />
                    <div className="w-12 h-12 flex items-center justify-center text-primary-500 mb-2">
                      <mode.i className="w-8 h-8" />
                    </div>
                    <div className="font-black text-gray-900 uppercase tracking-tighter leading-tight">{mode.t}</div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{mode.d}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Weekly Dates Preview (Simplified) */}
            {(form.mode === 'fixed' && currentPkg) && (
              <div className="mt-6 bg-white p-4 rounded-[1.5rem] border border-primary-100 shadow-lg shadow-primary-50/50 animate-in">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
                  <h4 className="font-black text-gray-900 text-sm tracking-tighter">Automatic Generation</h4>
                  <div className="bg-primary-500 text-white px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">
                    {currentPkg.lessonCount} Slots
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {fixedDates.map((dt, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400">#{idx + 1}</span>
                        <span className="font-black text-gray-800 text-xs tracking-tighter">{dt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Summary Sidebar */}
      <div className="w-full xl:w-[380px] flex-shrink-0 sticky top-4">
        <div className="card shadow-2xl border-0 overflow-hidden" style={{boxShadow: '0 30px 60px -15px rgba(249, 115, 22, 0.2)'}}>
          {/* Top Header */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] font-black opacity-80 mb-1 uppercase tracking-[0.4em]">Final Amount Due</h3>
                <div className="text-5xl font-black tracking-tighter flex items-start gap-1">
                  <span className="text-xl mt-2 opacity-80">RM</span>
                  {finalTotalPrice}
                </div>
              </div>
              <div className="text-right opacity-20 font-black text-4xl rotate-12 -mr-4 tracking-tighter uppercase">Invoice</div>
            </div>
          </div>

          <div className="p-10 space-y-10 bg-white">
            <div className="space-y-8">
              <div className="group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Selected Course</p>
                <p className="text-xl font-black text-gray-900 leading-tight">{currentPkg ? currentPkg.name : 'Please select a package...'}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Coach</p>
                  <p className="font-black text-gray-800 text-lg">{coaches.find(c => c.id === form.coachId)?.name || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Quantity</p>
                  <p className="font-black text-gray-800 text-lg">{currentPkg ? currentPkg.lessonCount : 0} Sessions</p>
                </div>
              </div>

              <div className="flex justify-between items-center group">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Per Student Value</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-primary-500 opacity-60">RM</span>
                  <span className="text-4xl font-black text-primary-500 tracking-tighter">{personalPrice}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 group">
                <label className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-3 block">Apply Discount</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">RM</div>
                  <input 
                    type="number" 
                    value={form.discount}
                    onChange={(e) => setForm({...form, discount: Number(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-4 font-black text-xl focus:border-primary-500 focus:bg-white transition-all outline-none text-primary-600" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>

            {formErrors.length > 0 && (
              <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-start gap-5 animate-in">
                <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-red-600 font-black uppercase tracking-wider mb-3 leading-none">Incomplete Requirements:</p>
                  <div className="grid grid-cols-1 gap-y-2">
                    {formErrors.map(err => (
                      <div key={err} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        <span className="text-[9px] text-red-500 font-black uppercase tracking-widest leading-none">{err}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <button 
                onClick={handleSubmit}
                className="btn btn-primary w-full py-8 text-2xl font-black shadow-2xl shadow-primary-200 hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 group"
                disabled={formErrors.length > 0}
              >
                CONFIRM & SUBMIT <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="w-full py-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 flex flex-col items-center group"
          >
            <Trash2 className="w-6 h-6 text-gray-300 group-hover:text-red-500 mb-1 transition-colors" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-red-500 transition-colors">Clear Data</span>
          </button>
        </div>
      </div>

      <StudentModal show={showStudentModal} onClose={() => setShowStudentModal(false)} onSave={handleSaveStudent} />
    </div>
  );
};
