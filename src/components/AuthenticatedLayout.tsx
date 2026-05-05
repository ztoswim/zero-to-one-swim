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
    <div className="min-h-screen flex">
      <Navigation />
      <main className="flex-1 flex flex-col relative min-w-0">
        <div className="flex-1 overflow-y-auto w-full px-4 py-6 md:px-8 md:py-8 bg-gray-50 pb-24 h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
