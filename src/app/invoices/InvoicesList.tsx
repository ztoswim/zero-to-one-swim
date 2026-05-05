'use client';

import React, { useState, useMemo } from 'react';
import { Search, FileText, Zap, CheckCheck, Star, Trash2, ChevronRight, X, Calendar } from 'lucide-react';

interface InvoicesListProps {
  initialInvoices: any[];
  students: any[];
  packages: any[];
  coaches: any[];
}

export const InvoicesList: React.FC<InvoicesListProps> = ({ 
  initialInvoices, 
  students, 
  packages,
  coaches 
}) => {
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const processedInvoices = useMemo(() => {
    let list = initialInvoices.map(inv => {
      const relatedLessons = inv.lessons || [];
      const sessionProgress = relatedLessons.filter((l: any) => l.status === 'completed' || l.status === 'attended').length;
      const totalSessions = sessionProgress + (inv.lessonsRemaining || 0);
      const progressPercent = totalSessions > 0 ? (sessionProgress / totalSessions * 100) : (inv.lessonsRemaining === 0 ? 100 : 0);
      
      return {
        ...inv,
        usedCount: sessionProgress,
        totalSessions: totalSessions,
        progressPercent: progressPercent,
        relatedLessons
      };
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(inv => {
        const studentName = inv.student?.name?.toLowerCase() || '';
        const invNum = inv.invoiceNumber?.toLowerCase() || '';
        return studentName.includes(q) || invNum.includes(q);
      });
    }

    return list;
  }, [initialInvoices, search]);

  const openDetail = (inv: any) => {
    setSelectedInvoice(inv);
    setShowDetail(true);
  };

  return (
    <div className="space-y-10">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or invoice ID..." 
            className="w-full h-14 bg-white rounded-2xl border-2 border-gray-50 px-14 font-bold text-gray-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors">
            <Search className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {processedInvoices.map((inv) => (
          <div 
            key={inv.id} 
            className="bg-white rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary-100/50 transition-all cursor-pointer group border border-gray-50 flex flex-col md:flex-row md:items-center gap-6"
            onClick={() => openDetail(inv)}
          >
            {/* Left: Status Indicator */}
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 ${inv.lessonsRemaining === 0 ? 'bg-gray-50 text-gray-400' : 'bg-primary-50 text-primary-500 shadow-lg shadow-primary-100'}`}>
                {inv.lessonsRemaining === 0 ? <CheckCheck className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-black text-gray-900 truncate tracking-tight text-lg">{inv.invoiceNumber}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {inv.status}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-500 mb-2">
                {inv.student?.name}
              </p>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${inv.progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-primary-600 w-8 text-right">
                  {Math.round(inv.progressPercent)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  {inv.usedCount} / {inv.totalSessions} Sessions
                </span>
              </div>
            </div>

            {/* Right: Price & Actions */}
            <div className="flex items-center gap-6">
              <div className="text-right min-w-[80px]">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Amount</p>
                <p className="text-lg font-black text-primary-600 leading-none">RM{inv.totalAmount}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {processedInvoices.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No Invoices Found</h3>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedInvoice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" /> Billing Detail
              </h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="p-8 space-y-6 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-bold text-gray-900 text-sm">{selectedInvoice.paymentDate}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-black text-green-500 text-sm uppercase">{selectedInvoice.status} ✓</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Student</p>
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-900 font-bold text-xs rounded-xl inline-block">
                    {selectedInvoice.student?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Coach</p>
                    <p className="font-black text-gray-900 text-xs">
                      {coaches.find(c => c.id === selectedInvoice.coachId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Package</p>
                    <p className="font-black text-gray-900 text-xs">
                      {selectedInvoice.package?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-primary-500 rounded-3xl text-white shadow-xl shadow-primary-100 relative overflow-hidden">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Total Amount</p>
                <p className="text-4xl font-black tracking-tighter">RM{selectedInvoice.totalAmount}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Lessons History</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedInvoice.relatedLessons.map((l: any) => (
                    <div key={l.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-black text-gray-900 text-xs">{l.date}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{l.time}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${l.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
