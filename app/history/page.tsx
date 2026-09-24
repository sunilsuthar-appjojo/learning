'use client';

import { useState } from 'react';
import { Calendar, Code, Package, Terminal, Database, Layout, CheckCircle2, BookOpen, Clock, ChevronDown, ChevronUp, Zap, FileCode } from 'lucide-react';

interface HistoryEntry {
  date: string;
  title: string;
  description: string;
  technologies: string[];
  commands: string[];
  features: string[];
  category: 'setup' | 'feature' | 'enhancement' | 'database' | 'ui';
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  usedIn: string[];
  purpose: string;
  requestBody?: string;
  responseType: string;
  example: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'Register a new user account',
    usedIn: ['Login Page (Register Tab)'],
    purpose: 'Create new user accounts with email, password, and role. Validates email format, password strength, and checks for duplicate emails.',
    requestBody: '{ "name": "string", "email": "string", "password": "string (min 6 chars)", "role": "USER" }',
    responseType: 'User',
    example: '{ "message": "User registered successfully", "user": { "id": "1", "name": "John", "email": "john@email.com", "role": "USER" } }'
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Login with email and password',
    usedIn: ['Login Page (Login Tab)'],
    purpose: 'Authenticate users and create session. Returns JWT token stored in httpOnly cookie for 7 days.',
    requestBody: '{ "email": "string", "password": "string" }',
    responseType: 'User with session',
    example: '{ "message": "Login successful", "user": { "id": "1", "name": "John", "email": "john@email.com", "role": "USER" } }'
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    description: 'Logout and clear session',
    usedIn: ['User Menu (Logout Button)'],
    purpose: 'Clear authentication cookie and end user session. Redirects to login page.',
    responseType: 'Success message',
    example: '{ "message": "Logout successful" }'
  },
  {
    method: 'GET',
    path: '/api/auth/session',
    description: 'Get current user session',
    usedIn: ['UserMenu Component', 'Protected Pages'],
    purpose: 'Retrieve current logged-in user information from JWT token. Used for displaying user info.',
    responseType: 'Session User',
    example: '{ "user": { "id": "1", "name": "John", "email": "john@email.com", "role": "USER" } }'
  },
  {
    method: 'GET',
    path: '/api/users',
    description: 'Get all users (SUPER_ADMIN only)',
    usedIn: ['Users Page'],
    purpose: 'Fetch all registered users with their details and login activity. Only accessible by SUPER_ADMIN role.',
    responseType: 'Array<User>',
    example: '[{ "id": "1", "name": "John", "email": "john@email.com", "role": "USER", "createdAt": "2024-09-24", "lastLogin": "2024-09-24" }]'
  },
  {
    method: 'GET',
    path: '/api/tasks',
    description: 'Fetch all tasks from the database',
    usedIn: ['Task Management Page', 'Kanban Board', 'Dashboard'],
    purpose: 'Retrieve complete list of tasks with all details including title, description, status, priority, and timestamps.',
    responseType: 'Array<Task>',
    example: '[{ "id": "1", "title": "Design Homepage", "status": "in-progress", "priority": "high" }]'
  },
  {
    method: 'POST',
    path: '/api/tasks',
    description: 'Create a new task',
    usedIn: ['Task Management Page (Add Task)', 'Kanban Board', 'Dashboard Quick Add'],
    purpose: 'Create new tasks in the system. Accepts task details and returns the created task with auto-generated ID.',
    requestBody: '{ "title": "string", "description": "string", "status": "pending", "priority": "medium" }',
    responseType: 'Task',
    example: '{ "id": "2", "title": "Implement API", "status": "pending", "priority": "high", "createdAt": "2024-09-24" }'
  },
  {
    method: 'PUT',
    path: '/api/tasks/[id]',
    description: 'Update an existing task',
    usedIn: ['Task Management Page (Edit)', 'Kanban Board (Drag & Drop)', 'Task Modal'],
    purpose: 'Update task details including status changes from drag-and-drop operations. Performs optimistic updates.',
    requestBody: '{ "title": "string", "description": "string", "status": "in-progress", "priority": "high" }',
    responseType: 'Task',
    example: '{ "id": "2", "status": "in-progress", "updatedAt": "2024-09-24T13:00:00Z" }'
  },
  {
    method: 'DELETE',
    path: '/api/tasks/[id]',
    description: 'Delete a task permanently',
    usedIn: ['Task Management Page (Delete Button)', 'Kanban Board (Delete Action)'],
    purpose: 'Remove tasks from the database. Includes confirmation dialog in UI to prevent accidental deletion.',
    responseType: 'Message',
    example: '{ "message": "Task deleted successfully" }'
  },
  {
    method: 'GET',
    path: '/api/tasks/[id]',
    description: 'Fetch a single task by ID',
    usedIn: ['Task Details Page', 'Edit Task Modal', 'Task Preview'],
    purpose: 'Retrieve detailed information about a specific task for display or editing.',
    responseType: 'Task',
    example: '{ "id": "1", "title": "Design Homepage", "description": "Create wireframes", "status": "in-progress" }'
  },
  {
    method: 'GET',
    path: '/api/blogs',
    description: 'Fetch all blog posts',
    usedIn: ['Blog Management Page', 'Blog List', 'Homepage Blog Section'],
    purpose: 'Retrieve all blog posts with metadata for displaying blog listings and managing content.',
    responseType: 'Array<Blog>',
    example: '[{ "id": "1", "title": "Getting Started with Next.js", "author": "Admin", "status": "published" }]'
  },
  {
    method: 'POST',
    path: '/api/blogs',
    description: 'Create a new blog post',
    usedIn: ['Blog Management Page', 'Blog Editor', 'Admin Dashboard'],
    purpose: 'Publish new blog posts with rich content. Supports draft and published states.',
    requestBody: '{ "title": "string", "content": "string", "author": "string", "status": "draft" }',
    responseType: 'Blog',
    example: '{ "title": "My First Blog", "content": "Content here", "author": "John", "status": "published" }'
  },
  {
    method: 'PUT',
    path: '/api/blogs/[id]',
    description: 'Update an existing blog post',
    usedIn: ['Blog Management Page (Edit)', 'Blog Editor', 'Status Dropdown'],
    purpose: 'Edit blog content, update status (draft/published), and modify metadata.',
    requestBody: '{ "title": "string", "content": "string", "status": "published" }',
    responseType: 'Blog',
    example: '{ "id": "1", "status": "published", "updatedAt": "2024-09-22" }'
  },
  {
    method: 'DELETE',
    path: '/api/blogs/[id]',
    description: 'Delete a blog post',
    usedIn: ['Blog Management Page', 'Blog Actions Menu'],
    purpose: 'Remove blog posts from the system with soft delete option for recovery.',
    responseType: 'Message',
    example: '{ "message": "Blog deleted successfully" }'
  },
  {
    method: 'GET',
    path: '/api/blogs/[id]',
    description: 'Fetch a single blog post',
    usedIn: ['Blog Detail Page', 'Blog Preview', 'Edit Form'],
    purpose: 'Get complete blog post details including content, author, and metadata.',
    responseType: 'Blog',
    example: '{ "id": "1", "title": "Getting Started", "content": "Full content...", "status": "published" }'
  }
];

const historyData: HistoryEntry[] = [
  {
    date: '2024-09-24',
    title: 'Complete Authentication System with Session Management',
    description: 'Built a full-featured authentication system with user registration, login, session management, role-based access control, and protected routes. Includes JWT tokens, bcrypt password hashing, and middleware protection.',
    technologies: [
      'next-auth - Authentication library',
      'bcryptjs - Password hashing',
      'jsonwebtoken - JWT token management',
      'Prisma ORM - User database operations',
      'MongoDB - User data storage',
      'Next.js Middleware - Route protection',
      'Cookies - Session storage',
      'React Hooks - State management'
    ],
    commands: [
      'npm install next-auth bcryptjs jsonwebtoken',
      'npm install -D @types/bcryptjs @types/jsonwebtoken',
      'npx prisma generate',
      'npx prisma db push'
    ],
    features: [
      'User registration with validation',
      'User login with email/password',
      'JWT-based session management',
      'Secure password hashing with bcrypt',
      'Role-based access (USER, ADMIN, SUPER_ADMIN)',
      'Protected routes with middleware',
      'Auto-redirect on authentication',
      'Session persistence (7 days)',
      'User menu with logout',
      'Login activity tracking',
      'SUPER_ADMIN user management',
      'Beautiful login/register UI',
      'Form validation',
      'Password visibility toggle',
      'Loading states',
      'Error notifications',
      'Success messages',
      'Dark mode support'
    ],
    category: 'feature'
  },
  {
    date: '2024-09-24',
    title: 'Learning History with API Reference Tabs',
    description: 'Added comprehensive Learning History page with two tabs: Implementation History and API Reference documentation. Complete with all technologies, commands, and API endpoints used in the project.',
    technologies: [
      'React Hooks - useState for tab and expand states',
      'TypeScript - Full type safety with interfaces',
      'Tailwind CSS - Responsive styling and dark mode',
      'Lucide React - Icons for UI',
      'Next.js Client Components - Interactive functionality'
    ],
    commands: [],
    features: [
      'Two-tab interface (History & API Reference)',
      'Complete implementation timeline',
      'All API endpoints documented',
      'HTTP method color coding',
      'Usage location tracking',
      'Request/response examples',
      'Expandable API details',
      'Dark mode support',
      'Responsive design',
      'Copy-ready code examples'
    ],
    category: 'feature'
  },
  {
    date: '2024-09-24',
    title: 'Jira-Style Kanban Task Board Implementation',
    description: 'Transformed the task management page into a fully functional Jira-style kanban board with drag-and-drop functionality and smart notifications.',
    technologies: [
      '@hello-pangea/dnd - Drag and drop library',
      'React Hooks - useState, useEffect',
      'TypeScript - Full type safety',
      'Tailwind CSS - Styling and animations',
      'Next.js App Router - Routing',
      'Lucide React - Icons'
    ],
    commands: [
      'npm install @hello-pangea/dnd'
    ],
    features: [
      'Three-column Kanban layout (To Do, In Progress, Completed)',
      'Drag & drop tasks between columns',
      'Status change notifications',
      'Celebration notification on task completion',
      'Optimistic UI updates',
      'Visual feedback during drag operations',
      'Task count badges on columns',
      'Priority indicators (High, Medium, Low)',
      'Empty state with emojis',
      'Hover effects for edit/delete buttons',
      'Dark mode support',
      'Responsive design'
    ],
    category: 'feature'
  },
  {
    date: '2024-09-23',
    title: 'Task Management CRUD System',
    description: 'Complete task management system with create, read, update, and delete operations using Prisma ORM.',
    technologies: [
      'Prisma ORM - Database operations',
      'PostgreSQL/MongoDB - Database',
      'Next.js API Routes - Backend endpoints',
      'React - Frontend UI',
      'TypeScript - Type safety'
    ],
    commands: [
      'npm install prisma @prisma/client',
      'npx prisma init',
      'npx prisma generate',
      'npx prisma db push'
    ],
    features: [
      'Create new tasks with title, description, status, priority',
      'List all tasks',
      'Update existing tasks',
      'Delete tasks',
      'Task filtering by status',
      'Priority levels (Low, Medium, High)',
      'Toast notifications',
      'Modal form for task creation/editing',
      'Beautiful card-based UI'
    ],
    category: 'feature'
  },
  {
    date: '2024-09-22',
    title: 'Blog Management System',
    description: 'Full blog management system with API routes and database integration.',
    technologies: [
      'Prisma ORM - Database ORM',
      'Next.js API Routes - RESTful endpoints',
      'React - UI components',
      'TypeScript - Type safety',
      'MongoDB/PostgreSQL - Database'
    ],
    commands: [
      'npx prisma generate',
      'npx prisma db push'
    ],
    features: [
      'Create blog posts',
      'Edit blog posts',
      'Delete blog posts',
      'List all blogs',
      'Rich text editor support',
      'Blog status management',
      'Beautiful blog cards',
      'Responsive grid layout'
    ],
    category: 'feature'
  },
  {
    date: '2024-09-21',
    title: 'Dark Mode Theme System',
    description: 'Implemented a complete dark mode theme system with persistent storage and smooth transitions.',
    technologies: [
      'next-themes - Theme management',
      'React Context API - Global state',
      'localStorage - Theme persistence',
      'Tailwind CSS - Dark mode classes',
      'React Hooks - useTheme'
    ],
    commands: [
      'npm install next-themes'
    ],
    features: [
      'Light/Dark mode toggle',
      'System theme detection',
      'Persistent theme storage',
      'Smooth theme transitions',
      'Theme provider wrapper',
      'Custom theme toggle component',
      'All pages support dark mode'
    ],
    category: 'ui'
  },
  {
    date: '2024-09-20',
    title: 'Prisma Database Setup with MongoDB',
    description: 'Configured Prisma ORM with MongoDB database schema for all entities including tasks, blogs, users, courses, and lessons.',
    technologies: [
      'Prisma ORM - Database toolkit',
      'MongoDB - NoSQL database',
      'Prisma Client - Type-safe database client',
      'Database modeling - Schema design'
    ],
    commands: [
      'npm install prisma @prisma/client',
      'npx prisma init',
      'npx prisma generate',
      'npx prisma db push',
      'npx prisma studio'
    ],
    features: [
      'Task model with status and priority',
      'Blog model with content',
      'User model with authentication',
      'Course model',
      'Lesson model',
      'Category model',
      'Progress tracking model',
      'MongoDB connection setup',
      'Prisma schema configuration'
    ],
    category: 'database'
  },
  {
    date: '2024-09-19',
    title: 'Next.js Project Setup',
    description: 'Initial project setup with Next.js 15, TypeScript, Tailwind CSS, and complete project structure.',
    technologies: [
      'Next.js 15 - React framework with App Router',
      'TypeScript - Type safety',
      'Tailwind CSS - Utility-first CSS',
      'ESLint - Code quality',
      'Turbopack - Build tool',
      'PostCSS - CSS processing'
    ],
    commands: [
      'npx create-next-app@latest learning --typescript --tailwind --app --turbopack',
      'npm install',
      'npm install lucide-react',
      'npm run dev'
    ],
    features: [
      'App Router structure',
      'TypeScript configuration',
      'Tailwind CSS setup',
      'ESLint configuration',
      'Project folder structure',
      'Git initialization',
      'Package.json setup',
      'Next.js config'
    ],
    category: 'setup'
  },
  {
    date: '2024-09-19',
    title: 'Sidebar Navigation & Layout',
    description: 'Created a beautiful gradient sidebar with navigation menu and responsive layout.',
    technologies: [
      'Next.js Navigation - usePathname',
      'Lucide React - Icons library',
      'Tailwind CSS - Gradients and animations',
      'React Client Components - Interactive UI'
    ],
    commands: [],
    features: [
      'Fixed sidebar with gradient background',
      'Navigation menu with icons',
      'Active route highlighting',
      'Smooth hover animations',
      'Responsive design',
      'Logo section',
      'Version footer',
      'All page routes setup',
      'Beautiful indigo gradient'
    ],
    category: 'ui'
  },
  {
    date: '2024-09-18',
    title: 'API Routes Structure',
    description: 'Set up RESTful API routes for all entities with proper error handling.',
    technologies: [
      'Next.js API Routes - Server-side endpoints',
      'TypeScript - Type-safe APIs',
      'Error handling - Try-catch blocks',
      'HTTP methods - GET, POST, PUT, DELETE',
      'Prisma Client - Database queries'
    ],
    commands: [],
    features: [
      'Task API endpoints (CRUD)',
      'Blog API endpoints (CRUD)',
      'User API endpoints',
      'Course API endpoints',
      'Lesson API endpoints',
      'Progress API endpoints',
      'Proper error handling',
      'Status codes (200, 201, 404, 500)',
      'JSON responses'
    ],
    category: 'feature'
  }
];

const categoryColors = {
  setup: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  feature: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  enhancement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  database: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  ui: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const categoryIcons = {
  setup: Package,
  feature: Code,
  enhancement: CheckCircle2,
  database: Database,
  ui: Layout,
};

export default function LearningHistoryPage() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  const [activeTab, setActiveTab] = useState<'history' | 'api'>('history');
  const [expandedApis, setExpandedApis] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const toggleApi = (index: number) => {
    const newExpanded = new Set(expandedApis);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedApis(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500 text-white';
      case 'POST': return 'bg-green-500 text-white';
      case 'PUT': return 'bg-yellow-500 text-white';
      case 'DELETE': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Learning History</h1>
            <p className="text-indigo-100">Complete implementation timeline & API reference</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-indigo-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📚 Implementation History ({historyData.length})
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'api'
                ? 'bg-white text-indigo-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            ⚡ API Reference ({apiEndpoints.length})
          </button>
        </div>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyData.map((entry, index) => {
            const isExpanded = expandedItems.has(index);
            const CategoryIcon = categoryIcons[entry.category];

            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
                <div
                  onClick={() => toggleItem(index)}
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[entry.category]}`}>
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{entry.title}</h2>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[entry.category]}`}>
                            {entry.category.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{entry.description}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        Technologies Used
                      </h3>
                      <div className="grid gap-2">
                        {entry.technologies.map((tech, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {entry.commands.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-green-600" />
                          Commands Executed
                        </h3>
                        <div className="space-y-2">
                          {entry.commands.map((command, i) => (
                            <div key={i} className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">$</span>
                                <code>{command}</code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Code className="w-5 h-5 text-purple-600" />
                        Features Implemented
                      </h3>
                      <div className="grid gap-2">
                        {entry.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">API Endpoints Reference</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Complete list of all API endpoints in this project with usage details, request/response formats, and implementation locations.
                </p>
              </div>
            </div>
          </div>

          {apiEndpoints.map((api, index) => {
            const isExpanded = expandedApis.has(index);

            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
                <div
                  onClick={() => toggleApi(index)}
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getMethodColor(api.method)}`}>
                          {api.method}
                        </span>
                        <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">{api.path}</code>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{api.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {api.usedIn.map((usage, i) => (
                          <span key={i} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            📍 {usage}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="p-2 ml-4 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        Purpose
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        {api.purpose}
                      </p>
                    </div>

                    {api.requestBody && (
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Request Body</h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{api.requestBody}</code>
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Response Type</h4>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                        {api.responseType}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Example</h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{api.example}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
