'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WheelDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const WheelDateInput: React.FC<WheelDateInputProps> = ({ value, onChange, className = '' }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, [value]);

  const maxDays = (y: number, m: number) => new Date(y, m, 0).getDate();

  const syncAndEmit = (y: string, m: string, d: string) => {
    let yy = parseInt(y) || new Date().getFullYear();
    let mm = parseInt(m) || 1;
    let dd = parseInt(d) || 1;

    if (mm < 1) mm = 12;
    if (mm > 12) mm = 1;

    const max = maxDays(yy, mm);
    if (dd < 1) dd = max;
    if (dd > max) dd = 1; // Loop back or cap

    const newYear = yy.toString();
    const newMonth = mm.toString().padStart(2, '0');
    const newDay = dd.toString().padStart(2, '0');

    setYear(newYear);
    setMonth(newMonth);
    setDay(newDay);
    onChange(`${newYear}-${newMonth}-${newDay}`);
  };

  const handleWheel = (type: 'year' | 'month' | 'day', e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    let yy = parseInt(year);
    let mm = parseInt(month);
    let dd = parseInt(day);

    if (type === 'year') yy += delta;
    if (type === 'month') mm += delta;
    if (type === 'day') dd += delta;

    syncAndEmit(yy.toString(), mm.toString(), dd.toString());
  };

  const handleBlur = () => {
    syncAndEmit(year, month, day);
  };

  return (
    <div className={`w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-50 transition-all bg-white font-medium text-gray-900 flex items-center justify-center gap-1 ${className}`}>
      <div className="flex items-center gap-1 font-black text-gray-900 tracking-tighter select-none">
        <input
          className="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none w-[2.5ch]"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          onWheel={(e) => handleWheel('day', e)}
          onBlur={handleBlur}
          maxLength={2}
        />
        <span className="text-gray-300">/</span>
        <input
          className="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none w-[2.5ch]"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          onWheel={(e) => handleWheel('month', e)}
          onBlur={handleBlur}
          maxLength={2}
        />
        <span className="text-gray-300">/</span>
        <input
          className="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none w-[4.5ch]"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          onWheel={(e) => handleWheel('year', e)}
          onBlur={handleBlur}
          maxLength={4}
        />
      </div>
    </div>
  );
};
