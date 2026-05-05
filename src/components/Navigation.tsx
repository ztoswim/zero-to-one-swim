'use client';

import Link from 'next/link';
import { usePathname } from 'next/pathname';
import { LayoutDashboard, Users, FileText, Calendar, Medal, Clock, MapPin, LogOut } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Fixed Schedule', href: '/fixed-schedule', icon: Clock },
  { name: 'Locations', href: '/venues', icon: MapPin },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Coaches', href: '/coaches', icon: Medal },
];

export function Navigation() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      setLoggingOut(true);
      const { logout } = await import('@/app/login/actions');
      await logout();
    }
  }

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <nav className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
        <div className="p-8">
          <img src="/logo.png" alt="Zero To One Swim" className="h-12 w-auto object-contain" />
        </div>
        <div className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-8 border-t border-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-black">A</div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">Admin</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage Hub</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-50 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loggingOut ? 'SIGNING OUT...' : <><LogOut className="w-4 h-4" /> SIGN OUT</>}
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 py-2 z-50 flex justify-between items-center safe-area-bottom">
        {navItems.slice(0, 5).map((item) => { // Show top 5 on mobile
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl gap-1 transition-all ${
                isActive ? 'text-primary-500 scale-110' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-primary-500/10' : ''}`} />
              <span className="text-[9px] font-black uppercase tracking-tight">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 py-2 text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tight">Out</span>
        </button>
      </nav>
    </>
  );
}
