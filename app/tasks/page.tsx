'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Trash2, X, Check, Clock, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

type StatusType = 'pending' | 'in-progress' | 'completed';

interface StatusColumn {
  id: StatusType;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const statusColumns: StatusColumn[] = [
  {
    id: 'pending',
    title: 'To Do',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  }
];

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');

  // Notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'info' | 'celebration' }>>([]);

  const showNotification = (message: string, type: 'success' | 'info' | 'celebration' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      showNotification('Failed to load tasks', 'info');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as StatusType;
    const oldStatus = source.droppableId as StatusType;
    
    // Find the task
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Optimistically update UI
    const updatedTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    // Show appropriate notification
    if (newStatus === 'completed') {
      showNotification(
        `🎉 Congratulations! "${task.title}" completed successfully!`,
        'celebration'
      );
    } else {
      const statusText = newStatus === 'in-progress' ? 'In Progress' : 'To Do';
      const oldStatusText = oldStatus === 'pending' ? 'To Do' : oldStatus === 'in-progress' ? 'In Progress' : 'Completed';
      showNotification(
        `Moved "${task.title}" from ${oldStatusText} to ${statusText}`,
        'info'
      );
    }

    // Update on server
    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to update task');
    } catch (err) {
      // Revert on error
      setTasks(tasks);
      showNotification('Failed to update task status', 'info');
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { title, description, status, priority };
      
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error('Failed to update task');
        showNotification('Task updated successfully!', 'success');
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error('Failed to create task');
        showNotification('Task created successfully!', 'success');
      }
      
      await fetchTasks();
      closeModal();
    } catch (err: any) {
      showNotification(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      
      await fetchTasks();
      showNotification('Task deleted successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      default: return '⚪';
    }
  };

  const getTasksByStatus = (status: StatusType): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-6 py-4 rounded-xl shadow-2xl transition-all animate-in slide-in-from-right min-w-[320px] ${
              notif.type === 'celebration'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white'
                : notif.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {notif.type === 'celebration' && <Sparkles className="w-5 h-5 mt-0.5 animate-pulse" />}
              {notif.type === 'success' && <Check className="w-5 h-5 mt-0.5" />}
              {notif.type === 'info' && <AlertCircle className="w-5 h-5 mt-0.5" />}
              <p className="font-semibold flex-1">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Task Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Drag and drop tasks between columns to update their status
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col h-full">
                {/* Column Header */}
                <div className={`${column.bgColor} rounded-t-2xl px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={column.color}>{column.icon}</div>
                      <h2 className="font-bold text-gray-900 dark:text-white">
                        {column.title}
                      </h2>
                    </div>
                    <span className={`${column.color} font-bold text-sm px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-800`}>
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 ${column.bgColor} rounded-b-2xl p-4 space-y-3 min-h-[500px] transition-colors ${
                        snapshot.isDraggingOver ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    >
                      {columnTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600">
                          <div className="text-4xl mb-2">
                            {column.id === 'pending' ? '📝' : column.id === 'in-progress' ? '⚡' : '✨'}
                          </div>
                          <p className="text-sm font-medium">No tasks</p>
                        </div>
                      )}
                      
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                                snapshot.isDragging ? 'rotate-2 shadow-2xl ring-2 ring-indigo-500' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white pr-2 line-clamp-2 flex-1">
                                  {task.title}
                                </h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openModal(task)}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                    title="Edit task"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              {task.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getPriorityColor(task.priority)}`}>
                                  {getPriorityIcon(task.priority)} {task.priority}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Check className="w-5 h-5" />
                  {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
