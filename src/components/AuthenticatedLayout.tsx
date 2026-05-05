'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop / Bottom Bar for Mobile */}
      <Navigation />
      
      <main className="flex-1 min-w-0 relative h-screen overflow-y-auto no-scrollbar scroll-smooth">
        {/* Added extra padding on mobile for "breath" */}
        <div className="w-full px-4 py-8 lg:px-8 lg:py-10 pb-28 lg:pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
