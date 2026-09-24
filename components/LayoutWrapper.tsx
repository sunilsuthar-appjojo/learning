'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import UserMenu from './UserMenu';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-grow ml-64 min-h-screen">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </>
  );
}
