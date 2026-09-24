'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FolderTree,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Settings,
  GraduationCap,
  History
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Task Management', icon: ClipboardList },
  { href: '/categories', label: 'Categories', icon: FolderTree },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/lessons', label: 'Lessons', icon: FileText },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/history', label: 'Learning History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-2xl z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-6 border-b border-indigo-500/30">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            SS LEARNING
          </h1>
          <p className="text-xs text-indigo-200">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-lg font-semibold scale-105'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
        <p className="text-xs text-indigo-200 text-center">
          v1.0.0 | Made with ❤️
        </p>
      </div>
    </aside>
  );
}
