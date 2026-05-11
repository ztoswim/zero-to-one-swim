'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Modal } from '@/components/Modal';
import { upsertPackage } from './actions';
import { Package, Hash, DollarSign, Layers, Users, Info, Settings2 } from 'lucide-react';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg?: any;
  onSave: (pkg: any) => void;
}

export function PackageModal({ isOpen, onClose, pkg, onSave }: PackageModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    lessonCount: '',
    type: 'Private',
    pax: '1',
    transportFee: '0.00',
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        price: pkg.price.toString(),
        lessonCount: pkg.lessonCount.toString(),
        type: pkg.type || 'Private',
        pax: (pkg.pax || 1).toString(),
        transportFee: (pkg.transportFee || '0.00').toString(),
      });
    } else {
      setFormData({
        name: '',
        price: '',
        lessonCount: '',
        type: 'Private',
        pax: '1',
        transportFee: '0.00',
      });
    }
  }, [pkg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      id: pkg?.id,
      price: parseFloat(formData.price),
      lessonCount: parseInt(formData.lessonCount),
      pax: parseInt(formData.pax),
      transportFee: formData.transportFee,
    };

    const result = await upsertPackage(data);
    if (result.success) {
      onSave({ ...data, id: pkg?.id || Math.random().toString() }); 
      onClose();
    }
    setLoading(false);
  };

  const categories = ['Private', 'Group', 'Door to Door'];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={pkg ? t('packages.editPackage') : t('packages.addPackage')}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-100">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-gray-900 tracking-tight">{t('packages.basicInfo')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                {t('packages.packageName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('packages.namePlaceholder')}
                  className="w-full pl-12 pr-6 h-14 bg-white border border-gray-200 focus:border-primary-500 rounded-2xl transition-all font-bold text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* Type */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                {t('packages.type')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full pl-12 pr-6 h-14 bg-white border border-gray-200 focus:border-primary-500 rounded-2xl transition-all font-bold text-gray-900 outline-none appearance-none"
                >
                  <option value="Private">{t('packages.catPrivate')}</option>
                  <option value="Door to Door">{t('packages.catD2D')}</option>
                  <option value="Group">{t('packages.catGroup')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONFIGURATION & PRICING */}
        <div className="bg-primary-50/30 border border-primary-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-100">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-gray-900 tracking-tight">{t('packages.configPricing')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                {t('packages.price')} (RM) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-12 pr-6 h-14 bg-white border border-gray-200 focus:border-primary-500 rounded-2xl transition-all font-bold text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* Lesson Count */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                {t('packages.lessonCount')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type="number"
                  value={formData.lessonCount}
                  onChange={(e) => setFormData({ ...formData, lessonCount: e.target.value })}
                  placeholder="0"
                  className="w-full pl-12 pr-6 h-14 bg-white border-2 border-gray-200 focus:border-primary-500 rounded-2xl transition-all font-bold text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* Pax */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                {t('packages.paxLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type="number"
                  value={formData.pax}
                  onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
                  placeholder="1"
                  className="w-full pl-12 pr-6 h-14 bg-white border-2 border-gray-200 focus:border-primary-500 rounded-2xl transition-all font-bold text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* Transport Fee */}
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                Transport Fee (RM)
              </label>
              <div className="relative">
                <Settings2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.transportFee}
                  onChange={(e) => setFormData({ ...formData, transportFee: e.target.value })}
                  placeholder="0.00"
                  className={`w-full pl-12 pr-6 h-14 bg-white border-2 rounded-2xl transition-all font-bold outline-none ${formData.type === 'Door to Door' ? 'border-primary-300 ring-2 ring-primary-50 text-primary-600' : 'border-gray-200 text-gray-400 opacity-50'}`}
                />
              </div>
              <p className="text-[8px] font-bold text-gray-400 mt-1 ml-1 uppercase">Added to total price</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest text-white bg-primary-500 shadow-xl shadow-primary-200 hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            {loading ? t('common.loading') : (pkg ? t('packages.updatePackage') : t('packages.confirmAddPackage'))}
          </button>
        </div>
      </form>
    </Modal>
  );
}
