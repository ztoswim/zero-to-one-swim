'use client';

import React, { useState } from 'react';
import { Container } from '@/components/Container';
import { Receipt, User, DollarSign, Calendar, Download, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface PayrollViewProps {
  data: {
    invoices: any[];
    users: any[];
  }
}

export function PayrollView({ data }: PayrollViewProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredInvoices = data?.invoices.filter((inv: any) => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.student?.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.creator?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('nav.payroll')}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {t('common.invoiceTracking')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder={t('common.searchInvoices')}
              className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm md:min-w-[300px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary px-8 h-12 shadow-lg shadow-primary-200 flex items-center gap-2 rounded-xl whitespace-nowrap">
            <Download className="w-4 h-4" /> {t('common.exportReport')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl shadow-slate-100/50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('common.totalRevenue')}</p>
            <h3 className="text-3xl font-black text-gray-900">RM {filteredInvoices?.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0).toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl shadow-slate-100/50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('common.invoicesIssued')}</p>
            <h3 className="text-3xl font-black text-gray-900">{filteredInvoices?.length}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl shadow-slate-100/50 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
            <User className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('common.activeStaff')}</p>
            <h3 className="text-3xl font-black text-gray-900">{data?.users.length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.invoiceDetails')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.issuedBy')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.studentCoach')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('common.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices?.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900">#{inv.invoiceNumber}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                        {inv.creator?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-800">{inv.creator?.fullName || 'System / Legacy'}</span>
                        <span className="text-[9px] font-bold text-primary-500 uppercase tracking-widest">{inv.creator?.role || 'Staff'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-600">{t('common.student')}: <span className="text-gray-900">{inv.student?.name}</span></span>
                      <span className="text-xs font-bold text-gray-400 mt-1">{t('common.coach')}: <span className="text-gray-600">{inv.coach?.name}</span></span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-lg font-black text-gray-900">RM {Number(inv.totalAmount).toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
