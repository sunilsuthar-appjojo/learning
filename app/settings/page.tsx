import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure system preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-10 h-10 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Settings Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This feature is under development
        </p>
      </div>
    </div>
  );
}
