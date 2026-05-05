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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Navigation />
      <main className="flex-1 min-w-0 relative">
        <div className="w-full min-h-screen pb-24 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
