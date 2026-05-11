'use client';

import { Container } from "@/components/Container";
import { useState } from "react";
import { getStaffAccessData, updateUserPermissions, updateUserRole, updateLinkedCoach, updateLinkedAdmin } from "./actions";
import { Shield, User, Settings2, Check, X, Trash2, Pencil } from "lucide-react";
import { PERMISSION_GROUPS, Permission, hasPermission } from "@/lib/permissions";
import { CreateUserDialog } from "./CreateUserDialog";
import { deleteUserAction, updateProfileNameAction } from "./actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface StaffAccessViewProps {
  initialData: {
    users: any[];
    coaches: any[];
    admins: any[];
  }
}

export function StaffAccessView({ initialData }: StaffAccessViewProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>(initialData.users);
  const [coaches, setCoaches] = useState<any[]>(initialData.coaches);
  const [admins, setAdmins] = useState<any[]>(initialData.admins);
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, userId: string | null }>({
    isOpen: false,
    userId: null
  });

  const refreshData = async () => {
    const data = await getStaffAccessData();
    setUsers(data.users);
    setCoaches(data.coaches);
    setAdmins(data.admins);
  };

  async function handleTogglePermission(userId: string, permissionId: string) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const currentEffective = hasPermission(user, permissionId as Permission);
    const newPermissions = {
      ...(user.permissions as Record<string, boolean> || {}),
      [permissionId]: !currentEffective
    };

    setUpdating(true);
    try {
      await updateUserPermissions(userId, newPermissions);
      const updatedUsers = users.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u);
      setUsers(updatedUsers);
      if (editingUser?.id === userId) {
        setEditingUser({ ...editingUser, permissions: newPermissions });
      }
    } catch (e) {
      alert(t('common.errorUpdatePermissions') || "Failed to update permissions");
    } finally {
      setUpdating(false);
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    setUpdating(true);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      alert(t('common.errorUpdateRole') || "Failed to update role");
    } finally {
      setUpdating(false);
    }
  }

  async function handleLinkCoach(userId: string, coachId: string | null) {
    setUpdating(true);
    try {
      await updateLinkedCoach(userId, coachId);
      setUsers(users.map(u => u.id === userId ? { ...u, linkedCoachId: coachId } : u));
      if (editingUser?.id === userId) {
        setEditingUser({ ...editingUser, linkedCoachId: coachId });
      }
    } catch (e) {
      alert(t('common.errorLinkCoach') || "Failed to link coach");
    } finally {
      setUpdating(false);
    }
  }

  async function handleLinkAdmin(userId: string, adminId: string | null) {
    setUpdating(true);
    try {
      await updateLinkedAdmin(userId, adminId);
      setUsers(users.map(u => u.id === userId ? { ...u, linkedAdminId: adminId } : u));
      if (editingUser?.id === userId) {
        setEditingUser({ ...editingUser, linkedAdminId: adminId });
      }
    } catch (e) {
      alert(t('common.errorLinkAdmin') || "Failed to link course advisor");
    } finally {
      setUpdating(false);
    }
  }

  async function performDelete() {
    if (!confirmDelete.userId) return;
    setUpdating(true);
    try {
      const result = await deleteUserAction(confirmDelete.userId);
      if (result.error) {
        alert(result.error);
      } else {
        setUsers(users.filter(u => u.id !== confirmDelete.userId));
        setEditingUser(null);
        setConfirmDelete({ isOpen: false, userId: null });
      }
    } catch (e) {
      alert(t('common.errorDeleteUser') || "Failed to delete user");
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateName() {
    if (!editingUser || !tempName.trim()) return;
    setUpdating(true);
    try {
      await updateProfileNameAction(editingUser.id, tempName);
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, fullName: tempName } : u));
      setEditingUser({ ...editingUser, fullName: tempName });
      setIsEditingName(false);
    } catch (e) {
      alert(t('common.errorUpdateName') || "Failed to update name");
    } finally {
      setUpdating(false);
    }
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('nav.staffAccess')}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {t('common.managePermissions')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <CreateUserDialog onSuccess={refreshData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setEditingUser(user)}
              className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all ${
                editingUser?.id === user.id 
                  ? 'border-primary-500 bg-primary-50/30 shadow-xl shadow-primary-100' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                  user.role === 'root' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {user.fullName?.charAt(0) || user.email?.charAt(0)}
                </div>
                <div>
                  <div className="font-black text-gray-900 leading-none mb-1">{user.fullName || 'Unnamed User'}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(`nav.${user.role}`) || user.role}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {editingUser ? (
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden animate-in">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                    <Settings2 className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input 
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="text-2xl font-black text-gray-900 tracking-tight bg-white border-2 border-primary-500 rounded-xl px-3 py-1 outline-none w-full max-w-md"
                          autoFocus
                        />
                        <button onClick={handleUpdateName} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('common.permissionsFor')} {editingUser.fullName}</h2>
                        <button 
                          onClick={() => { setTempName(editingUser.fullName); setIsEditingName(true); }}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-primary-50 hover:text-primary-500 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {editingUser.id.slice(0, 12)}</p>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, userId: editingUser.id })}
                        className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> {t('common.deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">{t('common.systemRole')}</span>
                    <select 
                      value={editingUser.role}
                      onChange={(e) => handleChangeRole(editingUser.id, e.target.value)}
                      disabled={updating}
                      className="h-10 px-4 rounded-xl border-2 border-slate-200 font-bold text-xs outline-none focus:border-primary-500 disabled:opacity-50 bg-white"
                    >
                      <option value="root">{t('nav.root')}</option>
                      <option value="admin">{t('nav.admin')}</option>
                      <option value="coach">{t('nav.coach')}</option>
                      <option value="parent">{t('nav.parent')}</option>
                    </select>
                  </div>

                  {(editingUser.role === 'coach' || editingUser.role === 'root') && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest mr-2">{t('common.linkCoach')}</span>
                      <select 
                        value={editingUser.linkedCoachId || ""}
                        onChange={(e) => handleLinkCoach(editingUser.id, e.target.value || null)}
                        disabled={updating}
                        className="h-10 px-4 rounded-xl border-2 border-primary-100 font-bold text-xs outline-none focus:border-primary-500 disabled:opacity-50 bg-primary-50/30 text-primary-700"
                      >
                        <option value="">{t('common.noLinkedCoach')}</option>
                        {coaches.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.nickname})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(editingUser.role === 'admin' || editingUser.role === 'root') && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">{t('common.linkAdmin')}</span>
                      <select 
                        value={editingUser.linkedAdminId || ""}
                        onChange={(e) => handleLinkAdmin(editingUser.id, e.target.value || null)}
                        disabled={updating}
                        className="h-10 px-4 rounded-xl border-2 border-slate-200 font-bold text-xs outline-none focus:border-slate-500 disabled:opacity-50 bg-slate-50/50 text-slate-700"
                      >
                        <option value="">{t('common.noLinkedAdmin')}</option>
                        {admins.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.nickname})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 space-y-4">
                {PERMISSION_GROUPS.map((group: any) => {
                  const isPageActive = hasPermission(editingUser, group.pagePermission as Permission);
                  const isDisabled = editingUser.role === 'root' || updating;
                  const isExpanded = expandedGroups.includes(group.name);

                  return (
                    <div key={group.name} className="border-2 border-slate-50 rounded-[2rem] overflow-hidden transition-all">
                      <div 
                        className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isPageActive ? 'bg-primary-50/20' : 'bg-white'}`}
                        onClick={() => toggleGroup(group.name)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPageActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'bg-slate-50 text-slate-300'}`}>
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{t(`permissions.${group.name}`) || group.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('common.moduleAccess')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.pageAccess')}</span>
                             <div 
                                onClick={(e) => { e.stopPropagation(); handleTogglePermission(editingUser.id, group.pagePermission); }}
                                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${isPageActive ? 'bg-green-500' : 'bg-slate-200'}`}
                             >
                                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isPageActive ? 'translate-x-5' : ''}`} />
                             </div>
                          </div>
                          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                             <Settings2 className="w-5 h-5 text-slate-300" />
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-6 pt-0 animate-in">
                          <div className="h-px bg-slate-100 mb-6" />
                          {group.actions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {group.actions.map((action: any) => {
                                const isActionChecked = hasPermission(editingUser, action.id as Permission);
                                return (
                                  <label 
                                    key={action.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                      isActionChecked 
                                        ? 'border-primary-100 bg-white shadow-sm' 
                                        : 'border-slate-50 bg-slate-50/30'
                                    } ${!isPageActive ? 'opacity-50 pointer-events-none' : ''}`}
                                  >
                                    <span className="text-[11px] font-bold text-gray-700">{t(`permissions.${action.id}`) || action.label}</span>
                                    <div className="relative inline-flex items-center">
                                      <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={!!isActionChecked}
                                        disabled={isDisabled || !isPageActive}
                                        onChange={() => handleTogglePermission(editingUser.id, action.id)}
                                      />
                                      <div className={`w-8 h-4 rounded-full transition-colors ${isActionChecked ? 'bg-primary-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isActionChecked ? 'translate-x-4' : ''}`}></div>
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400 font-bold uppercase text-center py-4">{t('common.noSubActions') || 'No sub-actions for this module'}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 rounded-3xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm mb-6">
                <User className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">{t('common.selectStaff')}</h3>
              <p className="text-slate-400 text-sm font-bold mt-2">{t('common.selectStaffDesc')}</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, userId: null })}
        onConfirm={performDelete}
        title={t('common.deleteAccount')}
        message={t('common.deleteAccountConfirm')}
        variant="danger"
        confirmText={t('common.deleteAccount').toUpperCase()}
        loading={updating}
      />
    </>
  );
}
