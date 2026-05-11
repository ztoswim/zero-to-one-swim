'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Calendar, Medal, Clock, MapPin, LogOut, ShieldAlert, UserCog, DollarSign } from 'lucide-react';

import { useState, useEffect } from 'react';
import { getCurrentUserProfile } from '@/app/staff-access/actions';
import { hasPermission, Permission } from '@/lib/permissions';
import { ConfirmDialog } from './ConfirmDialog';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/useTranslation';

type NavItem = {
  id: string; // Use id for translation key
  name: string;
  href: string;
  icon: any;
  permission?: Permission;
  rootOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'overview',
    items: [
      { id: 'dashboard', name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'view_dashboard_metrics' },
    ]
  },
  {
    title: 'schedules',
    items: [
      { id: 'schedule', name: 'Schedule', href: '/schedule', icon: Calendar, permission: 'view_schedule' },
      { id: 'fixedSchedule', name: 'Fixed Schedule', href: '/fixed-schedule', icon: Clock, permission: 'manage_fixed_schedule' },
    ]
  },
  {
    title: 'academy',
    items: [
      { id: 'students', name: 'Students', href: '/students', icon: Users, permission: 'view_students' },
      { id: 'coaches', name: 'Coaches', href: '/coaches', icon: Medal, permission: 'view_coaches' },
      { id: 'admins', name: 'Course Advisors', href: '/course-advisor', icon: UserCog, permission: 'manage_users' },
    ]
  },
  {
    title: 'finance',
    items: [
      { id: 'invoices', name: 'Invoices', href: '/invoices', icon: FileText, permission: 'view_invoices' },
      { id: 'payroll', name: 'Payroll', href: '/payroll', icon: DollarSign, permission: 'view_invoices' },
    ]
  },
  {
    title: 'settings',
    items: [
      { id: 'locations', name: 'Locations', href: '/locations', icon: MapPin, permission: 'view_locations' },
      { id: 'packages', name: 'Packages', href: '/packages', icon: Medal, permission: 'view_coaches' },
    ]
  },
  {
    title: 'system',
    items: [
      { id: 'staffAccess', name: 'Staff Access', href: '/staff-access', icon: ShieldAlert, permission: 'manage_users' },
    ]
  }
];

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Initial load from localStorage
    const savedMode = localStorage.getItem('viewMode');
    if (savedMode === 'coach') setIsCoachMode(true);
    
    async function fetchUser() {
      try {
        const profile = await getCurrentUserProfile();
        setUser(profile);
      } catch (e) {
        console.error("Failed to fetch user:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  async function performLogout() {
    setLoggingOut(true);
    const { logout } = await import('@/app/login/actions');
    await logout();
  }

  const filterItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (!user) {
        // Show common items even before user data for instant feel
        const publicIds = ['dashboard', 'schedule', 'students', 'invoices'];
        return publicIds.includes(item.id);
      }
      
      if (isCoachMode) {
        const coachAllowed = ['schedule', 'fixedSchedule', 'coaches', 'payroll'];
        if (!coachAllowed.includes(item.id)) return false;
      }

      if (item.rootOnly && user.role !== 'root' && user.role !== 'super_admin') return false;
      if (item.permission && !hasPermission(user, item.permission)) return false;
      return true;
    });
  };

  const allVisibleItems = navGroups.flatMap(group => filterItems(group.items));

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 flex items-center justify-between z-[9999]">
        <img src="/logo.png" alt="Zero To One Swim" className="h-8 w-auto object-contain" />
        <LanguageSwitcher />
      </div>

      {/* DESKTOP SIDEBAR */}
      <nav className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 z-[100]">
        <div className="p-8 flex items-center justify-between gap-4">
          <img src="/logo.png" alt="Zero To One Swim" className="h-10 w-auto object-contain" />
          <LanguageSwitcher />
        </div>
        <div className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar pb-10">
          {user?.linkedCoachId && (user.role === 'root' || user.role === 'super_admin') && (
            <div className="px-6 py-4 mb-4 bg-primary-50/50 rounded-2xl border border-primary-100 mx-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{t('nav.coachView')}</span>
                <div 
                  onClick={() => {
                    const newMode = !isCoachMode;
                    setIsCoachMode(newMode);
                    localStorage.setItem('viewMode', newMode ? 'coach' : 'root');
                  }}
                  className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${isCoachMode ? 'bg-primary-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isCoachMode ? 'translate-x-5' : ''}`} />
                </div>
              </div>
              <p className="text-[8px] text-primary-400 font-bold leading-tight">{t('nav.coachViewDesc')}</p>
            </div>
          )}

          {navGroups.map((group) => {
            const visibleGroupItems = filterItems(group.items);
            if (visibleGroupItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <h3 className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">
                  {t(`nav.group_${group.title}`)}
                </h3>
                <div className="space-y-1">
                  {visibleGroupItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-sm">{t(`nav.${item.id}`)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-8 border-t border-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
              user?.role === 'root' ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'
            }`}>
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">
                {loading ? '...' : (user?.role === 'root' ? t('nav.root') : (user?.role === 'super_admin' ? t('nav.root') : t('nav.staff')))}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {user?.fullName || 'Manage Hub'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-50 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loggingOut ? t('nav.loggingOut') : <><LogOut className="w-4 h-4" /> {t('nav.logout')}</>}
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 px-1 py-1 z-[9999] flex justify-around items-center safe-area-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.04)] h-16">
        {allVisibleItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300 ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'fill-primary-500/10' : 'text-primary-500'} ${!isActive ? 'text-gray-400' : ''}`} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-0.5 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {t(`nav.${item.id}`).split(' ')[0]}
              </span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center min-w-[64px] h-full text-red-400 active:scale-90 transition-transform"
        >
          <div className="p-1.5 rounded-xl bg-red-50/50">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5 opacity-60">{t('nav.logout')}</span>
        </button>
      </nav>

      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={performLogout}
        title={t('nav.signOut')}
        message={t('nav.signOutConfirm')}
        confirmText={t('nav.signOut').toUpperCase()}
        loading={loggingOut}
      />
    </>
  );
}
