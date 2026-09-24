import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-black dark:bg-gray-950 text-white flex flex-col border-r border-gray-800 transition-colors duration-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Link href="/" className="text-xl font-bold tracking-widest uppercase">
          LEARNING
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <Link 
          href="/" 
          className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Daily Logs
        </Link>
        <Link 
          href="/blogs" 
          className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          Projects
        </Link>
        <Link 
          href="/tasks" 
          className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          Tasks
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link 
          href="/admin" 
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-gray-200 transition-colors"
        >
          Admin Dashboard
        </Link>
      </div>
    </aside>
  );
}
