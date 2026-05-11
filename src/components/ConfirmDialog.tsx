'use client';

import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, Trash2, LogOut, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'info',
  loading = false
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');
  
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <Trash2 className="w-8 h-8 text-red-500" />;
      case 'warning': return <AlertCircle className="w-8 h-8 text-orange-500" />;
      default: return <HelpCircle className="w-8 h-8 text-primary-500" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-100';
      case 'warning': return 'bg-orange-500 hover:bg-orange-600 shadow-orange-100';
      default: return 'bg-primary-500 hover:bg-primary-600 shadow-primary-100';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="default">
      <div className="flex flex-col items-center text-center py-6">
        <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center animate-in zoom-in duration-300 ${
          variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-orange-50' : 'bg-primary-50'
        }`}>
          {getIcon()}
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-3">{title}</h3>
        <p className="text-gray-500 font-medium text-base max-w-sm leading-relaxed mb-10">
          {message}
        </p>

        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {finalCancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-14 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${getButtonClass()}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              finalConfirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
