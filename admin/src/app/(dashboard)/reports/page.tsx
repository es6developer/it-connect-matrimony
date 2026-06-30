"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { Search, Flag, AlertTriangle, Shield, X, Loader2 } from "lucide-react";

type ActionType = "warn" | "suspend" | "dismiss" | null;

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [action, setAction] = useState<ActionType>(null);
  const [actionNote, setActionNote] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.reports.list();
        setReports(res.data.data ?? res.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (report: any, actionType: ActionType) => {
    try {
      setActionLoading(true);
      if (actionType === "warn") {
        await adminApi.reports.update(report.id, { action: "warned", note: actionNote });
      } else if (actionType === "suspend") {
        await adminApi.users.suspend(report.reportedUserId, actionNote || "Reported for violation");
      } else if (actionType === "dismiss") {
        await adminApi.reports.dismiss(report.id);
      }
      setSelectedReport(null);
      setAction(null);
      setActionNote("");
      const res = await adminApi.reports.list();
      setReports(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = reports.filter((r) => {
    if (search && !r.reportedUserName?.toLowerCase().includes(search.toLowerCase()) && !r.reporterName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const getPriorityColor = (p: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-600 bg-red-50 border-red-200",
      high: "text-amber-600 bg-amber-50 border-amber-200",
      medium: "text-blue-600 bg-blue-50 border-blue-200",
      low: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[p] ?? colors.low;
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      investigating: "text-blue-600 bg-blue-50 border-blue-200",
      resolved: "text-emerald-600 bg-emerald-50 border-emerald-200",
      dismissed: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[s] ?? colors.pending;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Manage user reports and complaints</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by name..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No reports found.</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id}
              onClick={() => setSelectedReport(r)}
              className="rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-lg p-2 mt-0.5", getPriorityColor(r.priority))}>
                    <Flag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {r.reporterName} against {r.reportedUserName} · {formatRelativeTime(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium border", getPriorityColor(r.priority))}>
                    {r.priority}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium border", getStatusColor(r.status))}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && !action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Report Details</h3>
              <button onClick={() => setSelectedReport(null)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Report ID</p>
                  <p className="text-sm font-medium">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border mt-1", getPriorityColor(selectedReport.priority))}>
                    {selectedReport.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reporter</p>
                  <p className="text-sm font-medium">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reported User</p>
                  <p className="text-sm font-medium">{selectedReport.reportedUserName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p className="text-sm">{selectedReport.reason}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                <p className="text-sm">{formatDate(selectedReport.createdAt)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <button onClick={() => setAction("warn")}
                className="flex items-center gap-1.5 rounded-md border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
                <AlertTriangle className="h-4 w-4" /> Warn User
              </button>
              <button onClick={() => setAction("suspend")}
                className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                <Shield className="h-4 w-4" /> Suspend User
              </button>
              <button onClick={() => setAction("dismiss")}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                <X className="h-4 w-4" /> Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2 capitalize">{action} User</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {action === "warn" && "Send a warning to the reported user."}
              {action === "suspend" && "Temporarily suspend the reported user's account."}
              {action === "dismiss" && "Dismiss this report as invalid."}
            </p>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add a note or reason..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors min-h-[80px]"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setAction(null); setActionNote(""); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleAction(selectedReport, action)} disabled={actionLoading}
                className={cn("rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors flex items-center gap-1",
                  action === "suspend" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90",
                  actionLoading && "opacity-50"
                )}>
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
