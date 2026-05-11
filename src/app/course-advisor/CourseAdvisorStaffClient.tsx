'use client';

import { Mail, Phone, Pencil, Trash2, CreditCard, Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCourseAdvisorAction } from "./actions";
import { AddCourseAdvisorDialog } from "./AddCourseAdvisorDialog";
import { EditCourseAdvisorDialog } from "./EditCourseAdvisorDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { hasPermission } from "@/lib/permissions";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CourseAdvisorStaffClientProps {
  initialAdmins: any[];
  currentUser: any;
}

export function CourseAdvisorStaffClient({ initialAdmins, currentUser }: CourseAdvisorStaffClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const result = await deleteCourseAdvisorAction(deletingId);
      if (result.success) {
        router.refresh();
        setAdmins(admins.filter(a => a.id !== deletingId));
      } else {
        alert(result.error || t('common.error'));
      }
    } catch (e) {
      alert(t('common.error'));
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  const canManage = hasPermission(currentUser, 'manage_users');

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('nav.admins')}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {t('common.manageOffice')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {canManage && <AddCourseAdvisorDialog />}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b-2 border-slate-200">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.adminInfo')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.contactDetails')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.employment')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.financialInfo')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest italic">{t('common.noAdmins')}</p>
                  </td>
                </tr>
              )}
              {admins.map((admin: any) => (
                <tr key={admin.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-lg text-white shadow-lg shrink-0">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-base leading-none mb-1">{admin.name}</div>
                        <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{admin.nickname || t('nav.staff')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-primary-400" />
                        {admin.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {admin.email || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-1">
                        {t('common.active')}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300" /> {t('common.joined')}: {admin.joinDate || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-primary-400" /> {admin.bankName || '-'}
                      </div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-5.5">{admin.bankAccount || '-'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {canManage && (
                        <>
                          <EditCourseAdvisorDialog admin={admin} />
                          <button 
                            onClick={() => setDeletingId(admin.id)}
                            className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all" 
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t('common.deleteAdmin')}
        message={t('common.deleteAdminConfirm')}
        confirmText={t('common.delete').toUpperCase()}
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
