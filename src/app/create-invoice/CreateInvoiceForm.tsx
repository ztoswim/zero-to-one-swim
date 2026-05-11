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
import { useTranslation } from '@/lib/i18n/useTranslation';

interface CreateInvoiceFormProps {
  students: any[];
  coaches: any[];
  packages: any[];
  lessons: any[];
  initialInvNumber: string;
}

const dayMap: Record<string, number> = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

export const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ 
  students: initialStudents, 
  coaches, 
  packages,
  lessons,
  initialInvNumber
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const [pkgCategory, setPkgCategory] = useState('Private');
  const [pkgType, setPkgType] = useState('1v1');

  // Helper to get local date string YYYY-MM-DD
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    invNumber: initialInvNumber,
    paymentDate: getLocalDate(),
    studentId: '',
    coachId: coaches[0]?.id || '',
    pkgId: '',
    method: 'cash',
    date: getLocalDate(),
    time: '12:00',
    mode: 'fixed',
    duration: 45,
    discount: 0,
    weekDays: [] as number[],
    dayTimes: {} as Record<number, string>,
    customDates: [] as { date: string, time: string }[],
    isSharedSlot: false,
  });

  // Derived State
  const currentPkg = useMemo(() => packages.find(p => p.id === form.pkgId), [packages, form.pkgId]);

  const filteredPackages = useMemo(() => {
    const paxValue = parseInt(pkgType.replace('1v', '')) || 1;
    
    return packages.filter(pkg => {
      // Pax check
      if (Number(pkg.pax) !== paxValue) return false;

      // Category logic mirroring PackagesView.tsx
      if (pkgCategory === 'Private Training') {
        return pkg.type === 'Private' && pkg.name.includes('Training');
      }
      if (pkgCategory === 'D2D Training') {
        return pkg.type === 'Door to Door' && pkg.name.includes('Training');
      }
      if (pkgCategory === 'Private') {
        return pkg.type === 'Private' && !pkg.name.includes('Training');
      }
      if (pkgCategory === 'Door to Door') {
        return pkg.type === 'Door to Door' && !pkg.name.includes('Training');
      }
      if (pkgCategory === 'Group') {
        return pkg.type === 'Group';
      }
      return false;
    }).sort((a, b) => a.lessonCount - b.lessonCount);
  }, [packages, pkgCategory, pkgType]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter(s => 
      !q || s.name.toLowerCase().includes(q) || (s.phone || '').toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const finalTotalPrice = useMemo(() => {
    if (!currentPkg) return 0;
    const pax = currentPkg.pax || 1;
    const basePrice = parseFloat(currentPkg.price.toString()) || 0;
    const transport = parseFloat((currentPkg.transportFee || 0).toString()) || 0;
    const discount = parseFloat((form.discount || 0).toString()) || 0;
    
    // Calculate total for the group, then divide by pax to get per-person share
    const perPersonTotal = (basePrice + transport) / pax;
    return Math.max(0, perPersonTotal - discount);
  }, [currentPkg, form.discount]);

  const personalPrice = useMemo(() => {
    return finalTotalPrice;
  }, [finalTotalPrice]);

  // Schedule Generation
  const fixedDates = useMemo(() => {
    if (!form.date || !currentPkg) return [];
    const dates = [];
    // Important: parsing "YYYY-MM-DD" as local time by avoiding Date.parse/new Date(string)
    const [y, m, d] = form.date.split('-').map(Number);
    const startDate = new Date(y, m - 1, d); // Local time
    for (let i = 0; i < currentPkg.lessonCount; i++) {
      const next = new Date(startDate);
      next.setDate(next.getDate() + (i * 7));
      // Manual formatting to avoid toISOString UTC shift
      const ny = next.getFullYear();
      const nm = String(next.getMonth() + 1).padStart(2, '0');
      const nd = String(next.getDate()).padStart(2, '0');
      dates.push(`${ny}-${nm}-${nd}`);
    }
    return dates;
  }, [form.date, currentPkg]);

  const weeklyDates = useMemo(() => {
    if (!form.date || !currentPkg || !form.weekDays.length) return [];
    const dates = [];
    const sortedDays = [...form.weekDays].sort((a, b) => a - b);
    const [y, m, d] = form.date.split('-').map(Number);
    let current = new Date(y, m - 1, d); // Local time
    let safety = 0;
    while (dates.length < currentPkg.lessonCount && safety < 100) {
      safety++;
      if (sortedDays.includes(current.getDay())) {
        const ny = current.getFullYear();
        const nm = String(current.getMonth() + 1).padStart(2, '0');
        const nd = String(current.getDate()).padStart(2, '0');
        dates.push(`${ny}-${nm}-${nd}`);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [form.date, currentPkg, form.weekDays]);

  // Conflict Checking
  const conflicts = useMemo(() => {
    if (!form.coachId || !form.time || !form.date) return [];
    const targetDates = form.mode === 'fixed' ? fixedDates : (form.mode === 'weekly' ? weeklyDates : form.customDates.map(d => d.date));
    const isOverlap = (s1: string, e1: string, s2: string, e2: string) => s1 < e2 && s2 < e1;
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

  // Reset pkgType when category changes if current type is not available
  useEffect(() => {
    const availableTypes = ['1v1', '1v2', '1v3', '1v4'].filter(type => {
      const paxValue = parseInt(type.replace('1v', '')) || 1;
      return packages.some(pkg => {
        if (Number(pkg.pax) !== paxValue) return false;
        if (pkgCategory === 'Private Training') return pkg.type === 'Private' && pkg.name.includes('Training');
        if (pkgCategory === 'D2D Training') return pkg.type === 'Door to Door' && pkg.name.includes('Training');
        if (pkgCategory === 'Private') return pkg.type === 'Private' && !pkg.name.includes('Training');
        if (pkgCategory === 'Door to Door') return pkg.type === 'Door to Door' && !pkg.name.includes('Training');
        if (pkgCategory === 'Group') return pkg.type === 'Group';
        return false;
      });
    });

    if (availableTypes.length > 0 && !availableTypes.includes(pkgType)) {
      setPkgType(availableTypes[0]);
    }
  }, [pkgCategory, packages, pkgType]);

  // Sync Duration when package changes
  useEffect(() => {
    if (currentPkg?.duration) {
      setForm(prev => ({ ...prev, duration: currentPkg.duration }));
    }
  }, [currentPkg]);

  // SMART AUTO-FILL
  // 1. Move to nearest slot when STUDENT changes
  useEffect(() => {
    if (!form.studentId) return;
    const student = students.find(s => s.id === form.studentId);
    if (!student) return;

    // Even if no fixed slots, we can still auto-fill the coach
    if (!student.fixedSlots || student.fixedSlots.length === 0) {
      if (student.coachId) {
        setForm(prev => ({ ...prev, coachId: student.coachId }));
      }
      return;
    }

    const [y, m, d] = form.date.split('-').map(Number);
    const baseDate = new Date(y, m - 1, d);
    const currentDay = baseDate.getDay();

    let minDiff = 8;
    let bestSlot: any = null;

    student.fixedSlots.forEach((slot: any) => {
      const targetDay = dayMap[slot.day];
      const diff = (targetDay - currentDay + 7) % 7;
      if (diff < minDiff) {
        minDiff = diff;
        bestSlot = slot;
      }
    });

    if (bestSlot) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + minDiff);
      const ny = targetDate.getFullYear();
      const nm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const nd = String(targetDate.getDate()).padStart(2, '0');
      const newDateStr = `${ny}-${nm}-${nd}`;

      // Auto-detect mode: 
      // Weekly only if multiple slots EXIST AND all have the SAME duration
      const allSameDuration = student.fixedSlots.every((s: any) => (s.duration || 45) === (student.fixedSlots[0].duration || 45));
      const isMultiple = student.fixedSlots.length > 1 && allSameDuration;
      
      const weekDays = isMultiple 
        ? student.fixedSlots.map((s: any) => dayMap[s.day])
        : [];
      
      const dayTimes: Record<number, string> = {};
      student.fixedSlots.forEach((s: any) => {
        dayTimes[dayMap[s.day]] = s.time;
      });

      setForm(prev => ({
        ...prev,
        date: newDateStr,
        duration: bestSlot.duration || prev.duration,
        time: bestSlot.time || prev.time,
        coachId: bestSlot.coachId || student.coachId || prev.coachId,
        mode: isMultiple ? 'weekly' : 'fixed',
        weekDays: weekDays,
        dayTimes: dayTimes
      }));
    }
  }, [form.studentId]);

  // 2. Update time/coach/duration when DATE changes (if it matches a slot)
  useEffect(() => {
    if (!form.studentId || !form.date) return;
    const student = students.find(s => s.id === form.studentId);
    if (!student || !student.fixedSlots) return;

    const [y, m, d] = form.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    
    const matchingSlot = student.fixedSlots.find((slot: any) => slot.day === dayName);
    if (matchingSlot) {
      setForm(prev => ({
        ...prev,
        duration: matchingSlot.duration || prev.duration,
        time: matchingSlot.time || prev.time,
        coachId: matchingSlot.coachId || prev.coachId
      }));
    }
  }, [form.date]);

  // Sync customDates based on mode
  useEffect(() => {
    if (currentPkg) {
      if (form.mode === 'custom') {
        if (form.customDates.length !== currentPkg.lessonCount) {
          const initial = fixedDates.map(d => ({ date: d, time: form.time }));
          setForm(prev => ({ ...prev, customDates: initial }));
        }
      } else {
        const student = students.find(s => s.id === form.studentId);
        const dates = form.mode === 'fixed' ? fixedDates : weeklyDates;
        
        const synced = dates.map(d => {
          const dateObj = new Date(d);
          const dayId = dateObj.getDay();
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayId];
          
          // Priority: 
          // 1. Manually set time for this weekday (dayTimes)
          // 2. Student's fixed slot time
          // 3. Global form.time
          const dayTime = form.dayTimes[dayId];
          const slot = student?.fixedSlots?.find((s: any) => s.day === dayName);
          
          return { 
            date: d, 
            time: dayTime || (slot ? slot.time : form.time) 
          };
        });
        
        setForm(prev => ({ ...prev, customDates: synced }));
      }
    }
  }, [form.mode, currentPkg, fixedDates, weeklyDates, form.time, form.studentId]);

  // Helper for scrollable select
  const handleSelectWheel = (e: React.WheelEvent<HTMLSelectElement>, onChange: (val: string) => void) => {
    e.preventDefault();
    const select = e.currentTarget;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(select.options.length - 1, select.selectedIndex + delta));
    if (newIndex !== select.selectedIndex) {
      onChange(select.options[newIndex].value);
    }
  };

  const formErrors = useMemo(() => {
    const errs = [];
    if (!form.invNumber) errs.push(t('common.invoiceId') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.paymentDate) errs.push(t('common.date') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.studentId) errs.push(t('common.student') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.coachId) errs.push(t('common.coach') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.pkgId) errs.push(t('nav.packages') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.method) errs.push(t('common.paymentMode') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.date) errs.push(t('common.firstSessionDate') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (!form.time) errs.push(t('common.firstSessionTime') + ' ' + t('common.required', { defaultValue: 'Required' }));
    if (conflicts.length > 0 && !form.isSharedSlot) errs.push('Slot Occupied (Need Shared Slot)');
    return errs;
  }, [form, conflicts, t]);

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
      transportFee: currentPkg?.transportFee || "0.00",
      paymentMethod: form.method, 
      paymentDate: form.paymentDate, 
      lessonsRemaining: currentPkg?.lessonCount || 0, 
      duration: form.duration 
    };
    const res = await createInvoiceAction({ invId: crypto.randomUUID(), invoiceData, schedule });
    if (res.success) { alert('Invoice created successfully!'); router.push('/schedule'); }
    else alert('Error: ' + res.error);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 min-h-0">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-start min-h-0 overflow-y-auto pb-6 pr-2">
        <div className="space-y-4">
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-200"><User className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-bold text-gray-900">{t('common.customerDetails')}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('common.selectStaff')}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8 pb-8 border-b border-gray-50">
              <div className="form-group"><label className="label">{t('common.invoiceId')} <span className="req">*</span></label><input type="text" value={form.invNumber} onChange={(e) => setForm({...form, invNumber: e.target.value})} className="input-field h-12 text-sm font-black text-primary-600 bg-primary-50/30 border-primary-100" placeholder="INV-XXXXXX" /></div>
              <div className="form-group"><label className="label">{t('common.date')} <span className="req">*</span></label><WheelDateInput value={form.paymentDate} onChange={(val) => setForm({...form, paymentDate: val})} className="h-12 text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="form-group relative">
                <label className="label">{t('common.selectStudent')} <span className="req">*</span></label>
                <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="input-field pl-4 h-12 text-sm" placeholder={t('common.search')} />
                {studentSearch && (
                  <div className="absolute z-30 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto">
                    {filteredStudents.map(s => (
                      <div key={s.id} onClick={() => { setForm({...form, studentId: s.id}); setStudentSearch(''); }} className="p-5 hover:bg-primary-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 transition-all">
                        <div><div className="font-black text-gray-900 text-sm">{s.name}</div><div className="text-[11px] text-gray-400 font-bold uppercase">{s.phone}</div></div>
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-black text-xs">{form.studentId === s.id ? '✓' : '+'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="label">{t('common.assignedCoach')} <span className="req">*</span></label>
                <div className="relative">
                  <select 
                    value={form.coachId}
                    onChange={(e) => setForm({...form, coachId: e.target.value})}
                    onWheel={(e) => handleSelectWheel(e, (val) => setForm({...form, coachId: val}))}
                    className="input-field h-12 appearance-none pr-10 cursor-pointer text-sm"
                  >
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                </div>
              </div>
              {form.studentId && (
                <div className="md:col-span-2 pt-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">{t('common.currentSelection')}</p>
                  <div className="flex flex-col gap-4">
                    <div className="px-5 py-3 bg-white rounded-2xl border-2 border-primary-500 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center text-sm font-black">1</div><div className="font-black text-gray-900 text-sm">{students.find(s => s.id === form.studentId)?.name}</div></div>
                      <button onClick={() => setForm({...form, studentId: ''})} className="text-primary-500 font-black hover:scale-125 transition-transform">{t('common.cancel').toUpperCase()}</button>
                    </div>
                    {(() => {
                      const student = students.find(s => s.id === form.studentId);
                      const slots = student?.fixedSlots || [];
                      if (slots.length === 0) return null;
                      return (
                        <div className="bg-primary-50/50 p-5 rounded-[2rem] border-2 border-dashed border-primary-100">
                          <p className="text-[12px] font-black text-primary-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="w-3 h-3" /> {t('common.detectFixedSlots')}</p>
                          <div className="flex flex-wrap gap-2">
                            {slots.map((slot: any) => (
                              <button 
                                key={slot.id} 
                                type="button" 
                                onClick={() => { 
                                  const duration = slot.duration || 45; 
                                  // Always calculate relative to TODAY to avoid jumping forward indefinitely
                                  const dayMap: Record<string, number> = {
                                    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
                                  };
                                  
                                  const today = new Date();
                                  const currentDay = today.getDay();
                                  const targetDay = dayMap[slot.day];
                                  const diff = (targetDay - currentDay + 7) % 7;
                                  
                                  const targetDate = new Date(today);
                                  targetDate.setDate(today.getDate() + diff);
                                  const ny = targetDate.getFullYear();
                                  const nm = String(targetDate.getMonth() + 1).padStart(2, '0');
                                  const nd = String(targetDate.getDate()).padStart(2, '0');
                                  const newDateStr = `${ny}-${nm}-${nd}`;

                                  setForm({ 
                                    ...form, 
                                    date: newDateStr,
                                    duration: duration, 
                                    time: slot.time, 
                                    coachId: slot.coachId || form.coachId 
                                  }); 
                                }} 
                                className="px-4 py-2 bg-white border border-primary-200 rounded-xl text-[12px] font-black text-primary-700 hover:bg-primary-500 hover:text-white transition-all shadow-sm flex items-center gap-2"
                              >
                                {t(`days.${slot.day}`)} @ {slot.time} ({slot.duration}m)
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              <div className="md:col-span-2 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group hover:bg-primary-50 transition-all cursor-pointer mt-4" onClick={() => setShowStudentModal(true)}>
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform"><UserPlus className="w-8 h-8 text-primary-500" /></div>
                <h4 className="text-lg font-black text-gray-900 tracking-tight">{t('common.newStudent')}</h4>
              </div>
            </div>
          </div>
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-200"><PackageIcon className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-bold text-gray-900">{t('common.financialSummary')}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('common.packageSelection')}</p></div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-1.5 bg-gray-100/50 p-1.5 rounded-3xl w-full border border-gray-100">
                {[
                  { id: 'Private', label: t('packages.catPrivate') },
                  { id: 'Door to Door', label: 'D2D' }, // D2D is often kept as short code, but let's use catD2D if possible
                  { id: 'Private Training', label: t('packages.catPrivateTraining') },
                  { id: 'D2D Training', label: t('packages.catD2DTraining') },
                  { id: 'Group', label: t('packages.catGroup') }
                ].map(cat => (
                  <button key={cat.id} type="button" onClick={() => setPkgCategory(cat.id)} className={`flex-1 min-w-[80px] px-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${pkgCategory === cat.id ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {cat.id === 'Door to Door' ? t('packages.catD2D') : cat.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['1v1', '1v2', '1v3', '1v4'].filter(type => {
                  const paxValue = parseInt(type.replace('1v', '')) || 1;
                  return packages.some(pkg => {
                    if (Number(pkg.pax) !== paxValue) return false;
                    if (pkgCategory === 'Private Training') return pkg.type === 'Private' && pkg.name.includes('Training');
                    if (pkgCategory === 'D2D Training') return pkg.type === 'Door to Door' && pkg.name.includes('Training');
                    if (pkgCategory === 'Private') return pkg.type === 'Private' && !pkg.name.includes('Training');
                    if (pkgCategory === 'Door to Door') return pkg.type === 'Door to Door' && !pkg.name.includes('Training');
                    if (pkgCategory === 'Group') return pkg.type === 'Group';
                    return false;
                  });
                }).map(type => (
                  <button key={type} type="button" onClick={() => setPkgType(type)} className={`px-6 py-2.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all border-2 ${pkgType === type ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-transparent text-gray-400 bg-gray-50/50'}`}>{type}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
                {filteredPackages.map(pkg => (
                  <label key={pkg.id} className={`relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all bg-white shadow-sm hover:translate-y-[-2px] flex flex-col items-center text-center ${form.pkgId === pkg.id ? 'border-primary-500 ring-4 ring-primary-50 z-10' : 'border-gray-100 opacity-60'}`}>
                    <input type="radio" value={pkg.id} checked={form.pkgId === pkg.id} onChange={() => setForm({...form, pkgId: pkg.id})} className="hidden" />
                    <div className="text-3xl font-black text-gray-900 mb-0.5 tracking-tighter">{pkg.lessonCount}</div>
                    <div className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-2">{t('common.sessions')}</div>
                    <div className="text-primary-500 font-black text-xl tracking-tighter">
                      RM{parseFloat(pkg.price.toString()) + parseFloat((pkg.transportFee || 0).toString())}
                    </div>
                    {Number(pkg.transportFee) > 0 && (
                      <div className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('common.inclTransport', { amount: pkg.transportFee })}</div>
                    )}
                  </label>
                ))}
              </div>
              <div className="form-group pt-4 border-t border-gray-100">
                <label className="label">{t('common.paymentMode')} <span className="req">*</span></label>
                <div className="relative">
                  <select 
                    value={form.method}
                    onChange={(e) => setForm({...form, method: e.target.value})}
                    onWheel={(e) => handleSelectWheel(e, (val) => setForm({...form, method: val}))}
                    className="input-field h-12 appearance-none pr-10 cursor-pointer"
                  >
                    <option value="cash">{t('common.cashPhysical')}</option>
                    <option value="transfer">{t('common.onlineTransfer')}</option>
                    <option value="ewallet">{t('common.ewalletPayment')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-200"><CalendarIcon className="w-6 h-6" /></div>
              <div><h2 className="text-xl font-bold text-gray-900">{t('common.schedulePlan')}</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('common.timingAndRecurrence')}</p></div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="form-group">
                <label className="label">{t('common.classMode')}</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                  {[
                    { id: 'fixed', label: t('common.modeFixed') },
                    { id: 'weekly', label: t('common.modeWeekly') },
                    { id: 'custom', label: t('common.modeCustom') }
                  ].map(m => (
                    <button 
                      key={m.id} 
                      type="button" 
                      onClick={() => setForm({...form, mode: m.id})}
                      className={`py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${form.mode === m.id ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.mode !== 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group"><label className="label">{t('common.firstSessionDate')} <span className="req">*</span></label><WheelDateInput value={form.date} onChange={(val) => setForm({...form, date: val})} className="h-12 text-sm" /></div>
                  <div className="form-group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">{t('common.firstSessionTime')} <span className="req">*</span></label>
                      {(() => {
                        const student = students.find(s => s.id === form.studentId);
                        const dateObj = new Date(form.date);
                        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
                        const hasSlot = student?.fixedSlots?.some((slot: any) => slot.day === dayName);
                        return hasSlot ? (<span className="text-[10px] font-black bg-primary-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">{t('common.autoFilled')}</span>) : null;
                      })()}
                    </div>
                    <WheelTimeInput value={form.time} onChange={(val) => setForm({...form, time: val})} className="h-12 text-sm" />
                  </div>
                </div>
              )}

              {form.mode === 'weekly' && (
                <div className="space-y-3 bg-primary-50/30 p-5 rounded-3xl border-2 border-dashed border-primary-100 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[12px] font-black text-primary-600 uppercase tracking-widest">{t('common.modeWeekly')}</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1.5">
                      {[
                        { id: 0, label: t('common.sun') },
                        { id: 1, label: t('common.mon') },
                        { id: 2, label: t('common.tue') },
                        { id: 3, label: t('common.wed') },
                        { id: 4, label: t('common.thu') },
                        { id: 5, label: t('common.fri') },
                        { id: 6, label: t('common.sat') }
                      ].map((day) => {
                        const active = form.weekDays.includes(day.id);
                        return (
                          <button 
                            key={day.id} 
                            type="button"
                            onClick={() => {
                              const next = active ? form.weekDays.filter(d => d !== day.id) : [...form.weekDays, day.id];
                              setForm({...form, weekDays: next});
                            }}
                            className={`h-11 rounded-xl text-[12px] font-black transition-all border-2 flex flex-col items-center justify-center gap-0.5 ${active ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-200' : 'bg-white border-gray-100 text-gray-400 hover:border-primary-200'}`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time selection for active weekdays */}
                    {form.weekDays.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {form.weekDays.sort((a, b) => a - b).map(dayId => {
                          const dayLabel = [t('common.sun'), t('common.mon'), t('common.tue'), t('common.wed'), t('common.thu'), t('common.fri'), t('common.sat')][dayId];
                          const student = students.find(s => s.id === form.studentId);
                          const slot = student?.fixedSlots?.find((s: any) => dayMap[s.day] === dayId);
                          const currentTime = form.dayTimes[dayId] || (slot ? slot.time : form.time);

                          return (
                            <div key={dayId} className="bg-white p-3 rounded-2xl border border-primary-100 flex items-center justify-between shadow-sm">
                              <span className="text-[12px] font-black text-primary-600 uppercase tracking-widest">{dayLabel} {t('common.time')}</span>
                              <WheelTimeInput 
                                value={currentTime} 
                                onChange={(val) => {
                                  setForm(prev => ({
                                    ...prev,
                                    dayTimes: { ...prev.dayTimes, [dayId]: val }
                                  }));
                                }} 
                                className="!py-1 !px-3 !h-8 !text-[11px] !w-32 !border-primary-50"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="form-group mb-6">
              <label className="label mb-1">{t('common.lessonDuration')} <span className="req">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 45, 50, 90].map(d => (
                  <button key={d} type="button" onClick={() => setForm({...form, duration: d})} className={`py-3 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all border-2 ${form.duration === d ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-transparent text-gray-400 bg-gray-50/50'}`}>{d}m</button>
                ))}
              </div>
              <div className="mt-3">
                <input 
                  type="number" 
                  value={form.duration}
                  onChange={(e) => setForm({...form, duration: parseInt(e.target.value) || 0})}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -5 : 5;
                    setForm(prev => ({ ...prev, duration: Math.max(0, prev.duration + delta) }));
                  }}
                  step="5"
                  className="w-full px-4 py-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl font-black text-center text-sm text-gray-600 outline-none" 
                  placeholder={t('common.customMins')} 
                />
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {t('common.schedulePlan')}
                </h3>
                <span className="text-[12px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {form.customDates.length} / {currentPkg?.lessonCount || 0} {t('common.sessions')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[32rem] overflow-y-auto no-scrollbar pr-2">
                {form.customDates.map((cd, idx) => {
                  const isConflict = conflicts.some(l => l.date === cd.date);
                  return (
                    <div key={idx} className={`flex items-center gap-2 bg-white p-2.5 rounded-2xl shadow-sm border-2 transition-all ${isConflict ? 'border-red-100 bg-red-50/30' : 'border-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-lg text-[12px] font-black flex items-center justify-center flex-shrink-0 ${isConflict ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-400'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <WheelDateInput 
                          value={cd.date} 
                          onChange={(val) => { 
                            const next = [...form.customDates]; 
                            next[idx].date = val; 
                            setForm({...form, customDates: next}); 
                          }} 
                          readOnly={form.mode !== 'custom'}
                          className="!h-10 !py-0 !text-[11px] !rounded-xl border-gray-100 flex-1" 
                        />
                        <WheelTimeInput 
                          value={cd.time} 
                          onChange={(val) => { 
                            const next = [...form.customDates]; 
                            next[idx].time = val; 
                            setForm({...form, customDates: next}); 
                          }} 
                          readOnly={form.mode !== 'custom'}
                          className="!h-10 !py-0 !text-[11px] !rounded-xl border-gray-100 flex-1" 
                        />
                      </div>
                      {isConflict && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse ml-1" />}
                    </div>
                  );
                })}
              </div>

              {conflicts.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-900 leading-tight uppercase tracking-wide">{t('common.timeConflictDetected')}</p>
                    <p className="text-[12px] text-red-600 font-bold mt-1 leading-relaxed">
                      Coach is already teaching <span className="underline">{conflictNames.join(', ')}</span> during some of these slots.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="shared-slot"
                        checked={form.isSharedSlot}
                        onChange={(e) => setForm({...form, isSharedSlot: e.target.checked})}
                        className="w-4 h-4 rounded-lg border-red-300 text-red-600 focus:ring-red-500" 
                      />
                      <label htmlFor="shared-slot" className="text-[12px] font-black text-red-700 uppercase tracking-widest cursor-pointer">{t('common.allowSharedSlot')}</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-[380px] flex-shrink-0 sticky top-4">
        <div className="card shadow-2xl border-0 overflow-hidden" style={{boxShadow: '0 30px 60px -15px rgba(249, 115, 22, 0.2)'}}>
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white relative">
            <h3 className="text-[12px] font-black opacity-80 mb-1 uppercase tracking-[0.4em]">{t('common.finalAmountDue')}</h3>
            <div className="text-5xl font-black tracking-tighter flex items-start gap-1">
              <span className="text-xl mt-2 opacity-80">RM</span>{finalTotalPrice}
              {currentPkg && currentPkg.pax > 1 && (
                <span className="text-[12px] font-bold opacity-80 self-end mb-2 ml-1">/ {t('common.perPerson')}</span>
              )}
            </div>
          </div>
          <div className="p-10 space-y-10 bg-white">
            <div className="space-y-8">
              <div className="group"><p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('common.selectedCourse')}</p><p className="text-xl font-black text-gray-900 leading-tight">{currentPkg ? `${currentPkg.name} (1v${currentPkg.pax})` : t('common.selectPackage')}</p></div>
              <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                <div className="space-y-4">
                  <div><p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('nav.coaches')}</p><p className="font-black text-gray-800 text-lg">{coaches.find(c => c.id === form.coachId)?.name || 'Unknown'}</p></div>
                  {Number(currentPkg?.transportFee) > 0 && (
                    <div>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('common.transportFee')}</p>
                      <p className="font-black text-primary-600 text-lg">
                        RM{(parseFloat(currentPkg!.transportFee!.toString()) / (currentPkg!.pax || 1)).toFixed(2)}
                        {currentPkg!.pax > 1 && <span className="text-[12px] ml-1 opacity-60 font-bold">({t('common.shared')})</span>}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right"><p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('common.sessions')}</p><p className="font-black text-gray-800 text-lg">{currentPkg ? currentPkg.lessonCount : 0} {t('common.sessions')}</p></div>
              </div>
              <div className="pt-6 group">
                <label className="text-[12px] font-black text-primary-500 uppercase tracking-[0.2em] mb-3 block">{t('common.applyDiscount')}</label>
                <div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">RM</div><input type="number" value={form.discount} onChange={(e) => setForm({...form, discount: Number(e.target.value)})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-4 font-black text-xl outline-none text-primary-600" placeholder="0.00" /></div>
              </div>
            </div>
            {formErrors.length > 0 && (
              <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-start gap-4 animate-in">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div className="flex-1"><p className="text-[11px] text-red-600 font-black uppercase tracking-wider mb-2">{t('common.requiredLabel')}</p><div className="grid grid-cols-1 gap-y-1">{formErrors.map(err => (<div key={err} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-red-400"></div><span className="text-[10px] text-red-500 font-black uppercase tracking-widest">{err}</span></div>))}</div></div>
              </div>
            )}
            <button onClick={handleSubmit} className="btn btn-primary w-full py-8 text-2xl font-black shadow-2xl shadow-primary-200 transition-all disabled:opacity-20 group" disabled={formErrors.length > 0}>{t('common.confirmSubmit')} <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></button>
          </div>
        </div>
      </div>
      <StudentModal show={showStudentModal} onClose={() => setShowStudentModal(false)} onSave={() => {}} />
    </div>
  );
};
