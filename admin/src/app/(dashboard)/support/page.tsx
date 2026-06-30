"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { cn, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import { Search, Send, Paperclip, CheckCircle, Loader2 } from "lucide-react";

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [reply, setReply] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.support.tickets();
        setTickets(res.data.data ?? res.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    try {
      setSending(true);
      await adminApi.support.reply(selectedTicket.id, { message: reply });
      setReply("");
      const res = await adminApi.support.getTicket(selectedTicket.id);
      setSelectedTicket(res.data.data ?? res.data ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (id: string) => {
    try {
      setClosing(true);
      await adminApi.support.close(id);
      setSelectedTicket(null);
      const res = await adminApi.support.tickets();
      setTickets(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  const filtered = tickets.filter((t) => {
    if (search && !t.subject?.toLowerCase().includes(search.toLowerCase()) && !t.userName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const getPriorityColor = (p: string) => {
    const colors: Record<string, string> = {
      urgent: "text-red-600 bg-red-50 border-red-200",
      high: "text-amber-600 bg-amber-50 border-amber-200",
      medium: "text-blue-600 bg-blue-50 border-blue-200",
      low: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[p] ?? colors.low;
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      open: "text-blue-600 bg-blue-50 border-blue-200",
      in_progress: "text-amber-600 bg-amber-50 border-amber-200",
      closed: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[s] ?? colors.open;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Manage customer support requests</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search tickets..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No tickets found.</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium flex-shrink-0">
                    {getInitials(t.userName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.userName} · {t.category} · {t.id}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(t.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium border", getPriorityColor(t.priority))}>{t.priority}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium border", getStatusColor(t.status))}>
                    {t.status === "in_progress" ? "progress" : t.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl border bg-card shadow-lg max-h-[85vh] flex flex-col m-4">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{selectedTicket.subject}</h3>
                <p className="text-xs text-muted-foreground">{selectedTicket.id} · {selectedTicket.userName} · {selectedTicket.category}</p>
              </div>
              <button onClick={() => { setSelectedTicket(null); setReply(""); }}
                className="rounded p-1 hover:bg-muted transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-medium">{getInitials(selectedTicket.userName)}</div>
                  <span className="text-sm font-medium">{selectedTicket.userName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <p className="text-sm">{selectedTicket.message}</p>
              </div>

              {(selectedTicket.replies ?? []).map((r: any) => (
                <div key={r.id} className={cn("rounded-lg p-4", r.isAdmin ? "bg-primary/5 border border-primary/10 ml-6" : "bg-muted/30")}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium", r.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {getInitials(r.userName)}
                    </div>
                    <span className="text-sm font-medium">{r.userName}</span>
                    {r.isAdmin && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">Admin</span>}
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-sm">{r.message}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== "closed" && (
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors min-h-[60px] resize-none"
                  />
                  <button onClick={handleSendReply} disabled={!reply.trim() || sending}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => alert("Attach feature coming soon")}
                    className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors">
                    <Paperclip className="h-3 w-3" /> Attach
                  </button>
                  <span className="text-xs text-muted-foreground">Press Enter to send</span>
                </div>
              </div>
            )}

            <div className="border-t px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium border", getPriorityColor(selectedTicket.priority))}>{selectedTicket.priority}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium border", getStatusColor(selectedTicket.status))}>{selectedTicket.status}</span>
              </div>
              {selectedTicket.status !== "closed" && (
                <button onClick={() => handleCloseTicket(selectedTicket.id)} disabled={closing}
                  className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  {closing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
