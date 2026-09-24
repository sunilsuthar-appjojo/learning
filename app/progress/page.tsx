import { TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track student progress and analytics
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Progress Tracking Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This feature is under development
        </p>
      </div>
    </div>
  );
}
