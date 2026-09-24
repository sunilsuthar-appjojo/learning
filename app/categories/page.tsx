'use client';

import { useState } from 'react';
import coursesData from '@/data/courses-catalog.json';
import { Layers, Play, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function CategoriesPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(coursesData.categories.map(cat => cat.id)));
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Get courses by category
  const getCoursesByCategory = (categoryId: string) => {
    return coursesData.courses.filter(course => course.categoryId === categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Layers className="w-10 h-10 text-indigo-600" />
            Course Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse courses organized by category
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Total Categories: {coursesData.categories.length} • Total Courses: {coursesData.courses.length}
          </p>
        </div>

        {/* Expand/Collapse All */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <ChevronUp className="w-4 h-4" />
            Collapse All
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {coursesData.categories.map((category) => {
            const courses = getCoursesByCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {courses.length} courses available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg">
                      {courses.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Courses List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group border border-gray-200 dark:border-gray-700"
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <img
                              src={`https://img.youtube.com/vi/${course.youtubeId}/mqdefault.jpg`}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <div className="mb-2">
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                                {course.topic}
                              </span>
                            </div>
                            
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[2.5rem]">
                              {course.title}
                            </h3>

                            <a
                              href={course.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                            >
                              <Play className="w-4 h-4" />
                              Watch
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
