'use client';

import { useState } from 'react';
import { Pencil, Trash2, Phone, Mail, Award } from "lucide-react";
import { Modal } from "@/components/Modal";
import { EditCoachDialog } from "./EditCoachDialog";
import { deleteCoachAction } from "./actions";

export function CoachesListClient({ coaches, canEdit, canDelete, dict }: any) {
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [deletingCoach, setDeletingCoach] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingCoach) return;
    setIsDeleting(true);
    try {
      await deleteCoachAction(deletingCoach.id);
      setDeletingCoach(null);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete coach:", error);
      alert("Failed to delete coach");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden animate-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b-2 border-slate-200">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.coachInfo}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.contactInfo}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.expertise}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.status}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{dict.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coaches.map((coach: any) => (
                <tr key={coach.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm" style={{ backgroundColor: `${coach.color}20`, color: coach.color }}>
                        {coach.nickname?.charAt(0) || coach.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-base leading-none mb-1">{coach.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{coach.nickname || 'NO NICKNAME'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {coach.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 lowercase tracking-tight">
                        <Mail className="w-3 h-3" /> {coach.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-black text-gray-700">
                      <Award className="w-4 h-4 text-primary-500" />
                      {coach.level === 'Junior' ? dict.coaches.juniorCoach : 
                       coach.level === 'Senior' ? dict.coaches.seniorCoach :
                       coach.level === 'Head' ? dict.coaches.headCoach : 
                       dict.coaches.juniorCoach}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest">
                      {dict.common.active}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {canEdit && (
                        <button 
                          onClick={() => setEditingCoach(coach)}
                          className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all" 
                          title={dict.common.edit}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => setDeletingCoach(coach)}
                          className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all" 
                          title={dict.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingCoach && (
        <EditCoachDialog 
          coach={editingCoach}
          isOpen={!!editingCoach}
          onClose={() => setEditingCoach(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCoach}
        onClose={() => setDeletingCoach(null)}
        title={dict.common.deleteConfirm || "Delete Coach"}
      >
        <div className="p-4 text-center">
          <p className="text-gray-600 mb-8">
            Are you sure you want to delete <span className="font-bold text-gray-900">{deletingCoach?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setDeletingCoach(null)}
              className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200 transition-all"
            >
              {dict.common.cancel}
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
            >
              {isDeleting ? dict.common.loading : dict.common.confirm}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
