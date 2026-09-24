"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, X } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Toast state
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Edit modal state
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Delete modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // 3 sec baad toast gayab
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (!res.ok) throw new Error("Logs fetch karne me error");
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kuch galat ho gaya");

      setTitle("");
      setContent("");
      await fetchBlogs();
      showToast("Update successfully add ho gaya!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchBlogs();
      showToast("Log deleted successfully!");
    } catch (err) {
      showToast("Failed to delete", 'error');
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!res.ok) throw new Error("Update failed");

      setEditingBlog(null);
      await fetchBlogs();
      showToast("Log updated successfully!");
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setEditTitle(blog.title);
    setEditContent(blog.content);
  };

  // Grouping blogs by Date
  const groupedBlogs = blogs.reduce((acc, blog) => {
    const date = new Date(blog.created_at).toLocaleDateString(undefined, {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(blog);
    return acc;
  }, {} as Record<string, Blog[]>);

  return (
    <div className="p-10 font-[family-name:var(--font-geist-sans)] max-w-6xl mx-auto transition-colors duration-200">
      
      {/* Toast UI */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg transition-all ${toast.type === 'success' ? 'bg-black text-white dark:bg-white dark:text-black border-2 border-transparent' : 'bg-red-500 text-white'}`}>
          <p className="font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-6 w-full max-w-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-black dark:text-white">Edit Log</h2>
              <button onClick={() => setEditingBlog(null)} className="text-gray-500 hover:text-black dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-1 uppercase tracking-wider">Project / Task Title</label>
                <input
                  type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-black dark:border-white focus:ring-0 focus:outline-none focus:border-black transition-all text-black dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-1 uppercase tracking-wider">What did you do?</label>
                <textarea
                  required rows={5} value={editContent} onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-black dark:border-white focus:ring-0 focus:outline-none focus:border-black transition-all text-black dark:text-white"
                />
              </div>

              <div className="flex space-x-4 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold py-3 uppercase transition-colors">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditingBlog(null)} className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white font-bold py-3 uppercase transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to delete this log? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 uppercase transition-colors">
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button onClick={() => setDeletingId(null)} className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white font-bold py-3 uppercase transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-2">Daily Log</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Record your daily learning, project tasks, and updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Create Update Form */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-none border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-colors duration-200 sticky top-8">
            <h2 className="text-xl font-bold mb-6 text-black dark:text-white uppercase tracking-wide border-b-2 border-black dark:border-white pb-2">New Update</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-1 uppercase tracking-wider">Project / Task Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-black dark:border-white focus:ring-0 focus:outline-none focus:border-black transition-all text-black dark:text-white"
                  placeholder="e.g. Set up Next.js Sidebar"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-1 uppercase tracking-wider">What did you do?</label>
                <textarea
                  required rows={5} value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-black dark:border-white focus:ring-0 focus:outline-none focus:border-black transition-all text-black dark:text-white"
                  placeholder="Describe your progress, challenges, or learnings..."
                />
              </div>
              {error && <p className="text-red-600 dark:text-red-400 font-medium text-sm">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 text-white dark:text-black font-bold py-3 px-4 uppercase tracking-wider transition-colors disabled:opacity-50 border-2 border-transparent dark:border-white"
              >
                {loading ? "Saving..." : "Log Update"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Display Logs List (Grouped by Date) */}
        <div className="lg:col-span-7 bg-slate-100 dark:bg-gray-900/50 p-8 border border-gray-200 dark:border-gray-800 transition-colors duration-200">
          <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-wide border-b-2 border-black dark:border-white pb-2 mb-8">Timeline</h2>

          <div className="space-y-12">
            {Object.keys(groupedBlogs).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">No updates logged yet. Start by writing your first entry!</p>
            ) : (
              Object.keys(groupedBlogs).map((date) => (
                <div key={date} className="relative">
                  {/* Date Header */}
                  <div className="sticky top-0 z-10 bg-slate-100 dark:bg-gray-900/90 backdrop-blur py-2 mb-4">
                    <h3 className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-1 text-sm font-bold uppercase tracking-widest shadow-sm">
                      {date}
                    </h3>
                  </div>

                  {/* Tasks for this date */}
                  <div className="space-y-6 pl-4 border-l-2 border-black dark:border-white ml-2">
                    {groupedBlogs[date].map((blog) => (
                      <div key={blog.id} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 relative shadow-sm hover:shadow-md transition-all group">
                        <div className="absolute top-4 -left-[21px] w-2 h-2 rounded-full bg-black dark:bg-white ring-4 ring-slate-100 dark:ring-gray-900"></div>

                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-xl text-black dark:text-white pr-16">{blog.title}</h4>
                          
                          {/* Action Buttons (Edit/Delete) */}
                          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(blog)} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingId(blog.id)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{blog.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
