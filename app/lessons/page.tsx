import { FileText } from 'lucide-react';

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lessons
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and organize lesson content
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Lessons Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This feature is under development
        </p>
      </div>
    </div>
  );
}
