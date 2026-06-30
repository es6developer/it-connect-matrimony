"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn, formatDate, getStatusColor } from "@/lib/utils";
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  X,
  Loader2,
  Trash2,
  Ban,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", status: "active" });
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await adminApi.users.list({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      });
      const body = res.data?.data ?? res.data ?? {};
      const list = body?.data ?? body?.users ?? (Array.isArray(body) ? body : []);
      setUsers(Array.isArray(list) ? list : []);
      setTotalPages(body?.totalPages ?? body?.total_pages ?? 1);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiErr?.response?.data?.message || apiErr?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter, roleFilter]);

  const handleBulkAction = async (action: "suspend" | "ban" | "delete") => {
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        try {
          if (action === "suspend") await adminApi.users.suspend(id);
          else if (action === "ban") await adminApi.users.ban(id);
          else await adminApi.users.delete(id);
        } catch {}
      }
      setSelectedIds(new Set());
      fetchUsers();
    } catch {}
  };

  const handleRowAction = async (id: string, action: "suspend" | "ban" | "delete") => {
    setOpenMenuId(null);
    try {
      if (action === "suspend") await adminApi.users.suspend(id);
      else if (action === "ban") await adminApi.users.ban(id);
      else await adminApi.users.delete(id);
      fetchUsers();
    } catch {}
  };

  const handleAddUser = async () => {
    setIsAdding(true);
    try {
      await adminApi.users.create(newUser);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "user", status: "active" });
      fetchUsers();
    } catch {
    } finally {
      setIsAdding(false);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const columns: Column<UserRow>[] = [
    { key: "name", header: "Name", sortable: true,
      cell: (u) => (
        <Link href={`/users/${u.id}`} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
            {u.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </Link>
      ),
    },
    { key: "phone", header: "Phone", hideOnMobile: true },
    { key: "status", header: "Status", sortable: true,
      cell: (u) => (
        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border", getStatusColor(u.status))}>
          {u.status}
        </span>
      ),
    },
    { key: "role", header: "Role", sortable: true,
      cell: (u) => (
        <span className={cn(
          "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border",
          u.role === "premium" ? "text-purple-600 bg-purple-50 border-purple-200" : "text-blue-600 bg-blue-50 border-blue-200",
          u.role === "admin" && "text-amber-600 bg-amber-50 border-amber-200",
        )}>
          {u.role}
        </span>
      ),
    },
    { key: "createdAt", header: "Created", sortable: true, hideOnMobile: true,
      cell: (u) => <span className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</span>,
    },
    { key: "actions", header: "", className: "w-12",
      cell: (u) => (
        <div className="flex items-center gap-1 relative">
          <Link href={`/users/${u.id}`} className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors">
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === u.id ? null : u.id); }}
            className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {openMenuId === u.id && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-md border bg-popover p-1 shadow-lg">
                <button onClick={(e) => { e.stopPropagation(); handleRowAction(u.id, "suspend"); }} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  <AlertTriangle className="h-4 w-4" /> Suspend
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleRowAction(u.id, "ban"); }} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  <Ban className="h-4 w-4" /> Ban
                </button>
                <hr className="my-1" />
                <button onClick={(e) => { e.stopPropagation(); handleRowAction(u.id, "delete"); }} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add User
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border bg-background px-3 py-2 text-sm outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="rounded-md border bg-background px-3 py-2 text-sm outline-none">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="premium">Premium</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <Filter className="h-4 w-4" /> More Filters
        </button>
      </div>

      {showMoreFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Verified:</label>
            <select className="rounded-md border bg-background px-2 py-1 text-xs outline-none">
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">From:</label>
            <input type="date" className="rounded-md border bg-background px-2 py-1 text-xs outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">To:</label>
            <input type="date" className="rounded-md border bg-background px-2 py-1 text-xs outline-none" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchUsers} className="ml-auto flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => handleBulkAction("suspend")} className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">Suspend</button>
            <button onClick={() => handleBulkAction("ban")} className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-muted">Ban</button>
            <button onClick={() => handleBulkAction("delete")} className="rounded-md border bg-background px-2 py-1 text-xs text-red-600 hover:bg-red-50 border-red-200">Delete</button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelect={(id) => {
          const next = new Set(selectedIds);
          next.has(id) ? next.delete(id) : next.add(id);
          setSelectedIds(next);
        }}
        onSelectAll={() => {
          if (selectedIds.size === users.length) {
            setSelectedIds(new Set());
          } else {
            setSelectedIds(new Set(users.map(u => u.id)));
          }
        }}
      />

      {showAddModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add User</h2>
                <button onClick={() => setShowAddModal(false)} className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                  >
                    <option value="user">User</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddUser}
                    disabled={isAdding || !newUser.name || !newUser.email}
                    className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create User"}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
