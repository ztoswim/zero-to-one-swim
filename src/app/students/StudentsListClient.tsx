'use client';

import { useState } from 'react';
import { Pencil, Trash2, Phone, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { EditStudentDialog } from "./EditStudentDialog";
import { deleteStudentAction } from "./actions";

export function StudentsListClient({ students, locations, coaches, canEdit, canDelete, dict }: any) {
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await deleteStudentAction(deletingStudent.id);
      setDeletingStudent(null);
      window.location.reload(); // Refresh to show updated list
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student");
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.studentInfo}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.parentContact}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.lessonDetails}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.common.enrollment}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{dict.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student: any) => (
                <tr key={student.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center font-black text-lg shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-base leading-none mb-1">{student.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {student.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-600">{student.parentName || 'No Parent Name'}</div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <Phone className="w-3 h-3" /> {student.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        {student.location?.name || 'General Location'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        {dict.common.duration}: {student.lessonDuration || '45'} {dict.common.mins}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${student.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {student.status === 'active' ? dict.common.active : (student.status === 'inactive' ? dict.common.inactive : student.status)}
                      </span>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block ml-0.5">
                        {dict.common.since}: {student.startDate || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {canEdit && (
                        <button 
                          onClick={() => setEditingStudent(student)}
                          className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all" 
                          title={dict.common.edit}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => setDeletingStudent(student)}
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
      {editingStudent && (
        <EditStudentDialog 
          student={editingStudent}
          locations={locations}
          coaches={coaches}
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        title={dict.common.deleteConfirm || "Delete Student"}
      >
        <div className="p-4 text-center">
          <p className="text-gray-600 mb-8">
            Are you sure you want to delete <span className="font-bold text-gray-900">{deletingStudent?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setDeletingStudent(null)}
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
