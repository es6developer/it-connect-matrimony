"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { Search, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";

const tabs = ["All", "Pending", "Approved", "Rejected"];

export default function VerificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showReasonModal, setShowReasonModal] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [reason, setReason] = useState("");
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.verifications.list();
        setVerifications(res.data.data ?? res.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load verifications");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await adminApi.verifications.approve(id);
      } else {
        await adminApi.verifications.reject(id, { reason });
      }
      const res = await adminApi.verifications.list();
      setVerifications(res.data.data ?? res.data ?? []);
      setShowReasonModal(null);
      setReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    }
  };

  const filtered = verifications.filter((v) => {
    if (activeTab !== "All" && v.status !== activeTab.toLowerCase()) return false;
    if (search && !v.userName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = verifications.filter((v) => v.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Verifications</h1>
          <p className="text-sm text-muted-foreground">{pendingCount} pending verifications</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
            {tab === "Pending" && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">{pendingCount}</span>}
          </button>
        ))}
        <div className="relative ml-auto hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No verifications found.</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {getInitials(v.userName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{v.userName}</p>
                    <p className="text-xs text-muted-foreground">{v.documentType} · {v.id}</p>
                    <p className="text-xs text-muted-foreground">Submitted {formatDate(v.submittedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {v.documentUrl && v.documentUrl !== "#" && (
                    <a href={v.documentUrl} target="_blank" rel="noreferrer"
                      className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> View
                    </a>
                  )}
                  {v.documentUrl === "#" && (
                    <button onClick={() => alert("Document URL not available")}
                      className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  )}

                  {v.status === "pending" && (
                    <>
                      <button onClick={() => setShowReasonModal({ id: v.id, action: "approve" })}
                        className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => setShowReasonModal({ id: v.id, action: "reject" })}
                        className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}

                  {v.status !== "pending" && (
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border",
                      v.status === "approved" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-red-600 bg-red-50 border-red-200",
                    )}>
                      {v.status === "approved" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {v.status}
                    </span>
                  )}
                </div>
              </div>

              {v.reason && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs font-medium text-amber-700">Rejection Reason:</p>
                  <p className="text-xs text-amber-600 mt-0.5">{v.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              {showReasonModal.action === "approve" ? "Approve Verification" : "Reject Verification"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showReasonModal.action === "approve"
                ? "Are you sure you want to approve this verification?"
                : "Please provide a reason for rejection."}
            </p>
            {showReasonModal.action === "reject" && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors min-h-[80px]"
              />
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowReasonModal(null); setReason(""); }}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={() => handleAction(showReasonModal.id, showReasonModal.action)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors",
                  showReasonModal.action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                )}>
                {showReasonModal.action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
