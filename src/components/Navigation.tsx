'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Calendar, Medal } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Coaches', href: '/coaches', icon: Medal },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-gray-900">
          Zero To One <span className="text-primary-500">Swim</span>
        </h1>
      </div>
      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-8 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Admin</p>
            <p className="text-xs text-gray-400">Manage Hub</p>
          </div>
        </div>
        <button 
          onClick={async () => {
            const { logout } = await import('@/app/login/actions');
            await logout();
          }}
          className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
