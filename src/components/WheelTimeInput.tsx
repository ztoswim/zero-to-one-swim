'use client';

import React, { useState, useEffect } from 'react';

interface WheelTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const WheelTimeInput: React.FC<WheelTimeInputProps> = ({ value, onChange, className = '' }) => {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    if (value) {
      const [hStr, mStr] = value.split(':');
      let h = parseInt(hStr);
      const isPM = h >= 12;
      setAmpm(isPM ? 'PM' : 'AM');
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      setHour(String(displayH).padStart(2, '0'));
      setMinute(mStr);
    }
  }, [value]);

  const syncAndEmit = (h: string, m: string, am: string) => {
    let hh = parseInt(h) || 12;
    let mm = parseInt(m) || 0;

    if (hh < 1) hh = 12;
    if (hh > 12) hh = 1;
    if (mm < 0) mm = 55;
    if (mm > 59) mm = 0;

    const newHourStr = String(hh).padStart(2, '0');
    const newMinuteStr = String(mm).padStart(2, '0');
    
    setHour(newHourStr);
    setMinute(newMinuteStr);
    setAmpm(am);

    let internalH = hh % 12;
    if (am === 'PM') internalH += 12;
    onChange(`${String(internalH).padStart(2, '0')}:${newMinuteStr}`);
  };

  const handleWheel = (type: 'hour' | 'minute' | 'ampm', e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    let hh = parseInt(hour);
    let mm = parseInt(minute);
    let am = ampm;

    if (type === 'hour') hh += delta;
    if (type === 'minute') {
      mm += delta * 5;
      if (mm >= 60) { mm -= 60; hh += 1; }
      if (mm < 0) { mm += 60; hh -= 1; }
    }
    if (type === 'ampm') {
      am = am === 'AM' ? 'PM' : 'AM';
    }

    syncAndEmit(hh.toString(), mm.toString(), am);
  };

  const toggleAmpm = () => {
    syncAndEmit(hour, minute, ampm === 'AM' ? 'PM' : 'AM');
  };

  return (
    <div className={`w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-50 transition-all bg-white font-medium text-gray-900 flex items-center justify-center gap-1 ${className}`}>
      <div className="flex items-center gap-1 font-black text-gray-900 tracking-tighter select-none">
        <input
          className="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none w-[2.5ch]"
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          onWheel={(e) => handleWheel('hour', e)}
          onBlur={() => syncAndEmit(hour, minute, ampm)}
          maxLength={2}
        />
        <span className="text-gray-300">:</span>
        <input
          className="hover:bg-primary-50 px-0.5 py-1 rounded cursor-ns-resize transition-colors text-center bg-transparent outline-none appearance-none w-[2.5ch]"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          onWheel={(e) => handleWheel('minute', e)}
          onBlur={() => syncAndEmit(hour, minute, ampm)}
          maxLength={2}
        />
        <div
          className="hover:bg-primary-50 px-1 py-1 rounded cursor-ns-resize transition-colors ml-0.5 text-primary-500 cursor-pointer text-center w-[3.5ch]"
          onWheel={(e) => handleWheel('ampm', e)}
          onClick={toggleAmpm}
        >
          {ampm}
        </div>
      </div>
    </div>
  );
};
