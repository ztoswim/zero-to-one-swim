'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'wide';
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'default', maxWidth }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className={`bg-white w-full ${maxWidth || (size === 'wide' ? 'max-w-7xl' : 'max-w-xl')} rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden`}>
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{title}</h2>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:rotate-90 transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
