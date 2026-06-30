"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn, formatDate } from "@/lib/utils";
import { Search, Plus, FileText, Eye, Archive, BookOpen, Loader2, X } from "lucide-react";

interface BlogRow {
  id: string;
  title: string;
  author: string;
  status: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  viewCount: number;
}

export default function BlogsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<any | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.blogs.list();
        setBlogs(res.data.data ?? res.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(true);
      await adminApi.blogs.publish(id);
      const res = await adminApi.blogs.list();
      setBlogs(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      setActionLoading(true);
      await adminApi.blogs.archive(id);
      const res = await adminApi.blogs.list();
      setBlogs(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setActionLoading(true);
      await adminApi.blogs.create({
        title: newTitle,
        content: newContent,
        excerpt: newExcerpt,
        tags: newTags.split(",").map((t) => t.trim()),
        status: "draft",
      });
      setShowNewModal(false);
      setNewTitle("");
      setNewContent("");
      setNewExcerpt("");
      setNewTags("");
      const res = await adminApi.blogs.list();
      setBlogs(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    try {
      setActionLoading(true);
      await adminApi.blogs.update(showEditModal.id, {
        title: showEditModal.title,
        excerpt: showEditModal.excerpt,
        content: showEditModal.content,
        tags: showEditModal.tags?.split(",").map((t: string) => t.trim()) ?? [],
      });
      setShowEditModal(null);
      const res = await adminApi.blogs.list();
      setBlogs(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (blog: any) => {
    try {
      const res = await adminApi.blogs.get(blog.id);
      setViewModal(res.data.data ?? res.data ?? blog);
    } catch {
      setViewModal(blog);
    }
  };

  const filtered = blogs.filter((b) => {
    if (search && !b.title?.toLowerCase().includes(search.toLowerCase()) && !b.author?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * 20, page * 20);
  const totalPages = Math.ceil(filtered.length / 20);

  const columns: Column<BlogRow>[] = [
    { key: "title", header: "Title",
      cell: (b) => (
        <div>
          <p className="text-sm font-medium">{b.title}</p>
          <p className="text-xs text-muted-foreground">by {b.author}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", sortable: true,
      cell: (b) => (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
          b.status === "published" && "text-emerald-600 bg-emerald-50 border-emerald-200",
          b.status === "draft" && "text-yellow-600 bg-yellow-50 border-yellow-200",
          b.status === "archived" && "text-gray-600 bg-gray-50 border-gray-200",
        )}>
          {b.status}
        </span>
      ),
    },
    { key: "tags", header: "Tags", hideOnMobile: true,
      cell: (b) => (
        <div className="flex flex-wrap gap-1">
          {(b.tags ?? []).map((t: string) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{t}</span>
          ))}
        </div>
      ),
    },
    { key: "viewCount", header: "Views", sortable: true, hideOnMobile: true,
      cell: (b) => <span className="text-sm text-muted-foreground">{b.viewCount?.toLocaleString()}</span>,
    },
    { key: "createdAt", header: "Created", sortable: true, hideOnMobile: true,
      cell: (b) => <span className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</span>,
    },
    { key: "actions", header: "", className: "w-24",
      cell: (b) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(b)} className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors" title="View"><Eye className="h-3.5 w-3.5" /></button>
          <button onClick={() => {
            setShowEditModal({ id: b.id, title: b.title, excerpt: (b as any).excerpt ?? "", content: (b as any).content ?? "", tags: (b.tags ?? []).join(",") });
          }} className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors" title="Edit"><FileText className="h-3.5 w-3.5" /></button>
          {b.status === "draft" && (
            <button onClick={() => handlePublish(b.id)} disabled={actionLoading}
              className="rounded p-1 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50" title="Publish">
              <BookOpen className="h-3.5 w-3.5" />
            </button>
          )}
          {b.status === "published" && (
            <button onClick={() => handleArchive(b.id)} disabled={actionLoading}
              className="rounded p-1 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50" title="Archive">
              <Archive className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blogs</h1>
          <p className="text-sm text-muted-foreground">Manage blog posts and content</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search posts..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <DataTable columns={columns} data={paginated} page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{viewModal.title}</h3>
              <button onClick={() => setViewModal(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">by {viewModal.author} · {viewModal.id}</p>
              {viewModal.excerpt && <p className="text-sm text-muted-foreground">{viewModal.excerpt}</p>}
              {viewModal.content && <p className="text-sm">{viewModal.content}</p>}
              {(viewModal.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(viewModal.tags ?? []).map((t: string) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Status: {viewModal.status} · Views: {viewModal.viewCount}</p>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Blog Post</h3>
              <button onClick={() => setShowNewModal(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt</label>
                <textarea value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1 min-h-[60px]" />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1 min-h-[120px]" />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <input value={newTags} onChange={(e) => setNewTags(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" placeholder="tech, career, tips" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowNewModal(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={!newTitle.trim() || actionLoading}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Blog Post</h3>
              <button onClick={() => setShowEditModal(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input value={showEditModal.title} onChange={(e) => setShowEditModal({ ...showEditModal, title: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt</label>
                <textarea value={showEditModal.excerpt} onChange={(e) => setShowEditModal({ ...showEditModal, excerpt: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1 min-h-[60px]" />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea value={showEditModal.content} onChange={(e) => setShowEditModal({ ...showEditModal, content: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1 min-h-[120px]" />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <input value={showEditModal.tags} onChange={(e) => setShowEditModal({ ...showEditModal, tags: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEditModal(null)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleEdit} disabled={actionLoading}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
