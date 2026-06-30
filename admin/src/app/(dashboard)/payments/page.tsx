"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Search, ArrowLeftRight, RotateCcw, Loader2 } from "lucide-react";

interface PaymentRow {
  id: string;
  userName: string;
  amount: number;
  status: string;
  gateway: string;
  transactionId: string;
  description: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refundModal, setRefundModal] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [payRes, sumRes] = await Promise.all([
          adminApi.payments.list(),
          adminApi.payments.summary(),
        ]);
        setPayments(payRes.data.data ?? payRes.data ?? []);
        setSummary(sumRes.data.data ?? sumRes.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRefund = async (id: string) => {
    try {
      setRefunding(true);
      await adminApi.payments.refund(id, { amount: refundAmount ? parseFloat(refundAmount) : undefined, reason: refundReason });
      setRefundModal(null);
      setRefundAmount("");
      setRefundReason("");
      const [payRes, sumRes] = await Promise.all([
        adminApi.payments.list(),
        adminApi.payments.summary(),
      ]);
      setPayments(payRes.data.data ?? payRes.data ?? []);
      setSummary(sumRes.data.data ?? sumRes.data ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setRefunding(false);
    }
  };

  const summaryData = summary ?? {
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    refundedAmount: 0,
    avgTransaction: 0,
  };

  const filtered = payments.filter((p) => {
    if (search && !p.userName?.toLowerCase().includes(search.toLowerCase()) && !p.transactionId?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * 20, page * 20);
  const totalPages = Math.ceil(filtered.length / 20);

  const columns: Column<PaymentRow>[] = [
    { key: "id", header: "ID", cell: (p) => <span className="text-xs font-mono text-muted-foreground">{p.id}</span> },
    { key: "userName", header: "User", cell: (p) => <span className="text-sm font-medium">{p.userName}</span> },
    { key: "description", header: "Description", hideOnMobile: true, cell: (p) => <span className="text-sm text-muted-foreground">{p.description}</span> },
    { key: "amount", header: "Amount", sortable: true, cell: (p) => <span className="font-medium">{formatCurrency(p.amount)}</span> },
    { key: "status", header: "Status", sortable: true,
      cell: (p) => (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
          p.status === "completed" && "text-emerald-600 bg-emerald-50 border-emerald-200",
          p.status === "pending" && "text-yellow-600 bg-yellow-50 border-yellow-200",
          p.status === "failed" && "text-red-600 bg-red-50 border-red-200",
          p.status === "refunded" && "text-blue-600 bg-blue-50 border-blue-200",
        )}>
          {p.status}
        </span>
      ),
    },
    { key: "gateway", header: "Gateway", hideOnMobile: true, cell: (p) => <span className="text-sm capitalize">{p.gateway}</span> },
    { key: "createdAt", header: "Date", sortable: true, hideOnMobile: true, cell: (p) => <span className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</span> },
    { key: "actions", header: "", className: "w-16",
      cell: (p) => p.status === "completed" ? (
        <button onClick={() => { setRefundModal(p.id); setRefundAmount(""); setRefundReason(""); }}
          className="rounded p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">Track and manage payments</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-bold mt-1">{loading ? "..." : formatCurrency(summaryData.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-lg font-bold mt-1 text-emerald-600">{loading ? "..." : formatCurrency(summaryData.completedPayments)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-lg font-bold mt-1 text-yellow-600">{loading ? "..." : formatCurrency(summaryData.pendingPayments)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Refunded</p>
          <p className="text-lg font-bold mt-1 text-blue-600">{loading ? "..." : formatCurrency(summaryData.refundedAmount)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg Transaction</p>
          <p className="text-lg font-bold mt-1">{loading ? "..." : formatCurrency(summaryData.avgTransaction)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search user or transaction..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button onClick={() => alert("Export feature coming soon")}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
          <ArrowLeftRight className="h-4 w-4" /> Export
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <DataTable columns={columns} data={paginated} page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Process Refund</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to refund this payment?</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium">Refund Amount</label>
                <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" placeholder="Full amount" />
              </div>
              <div>
                <label className="text-xs font-medium">Reason (optional)</label>
                <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1 min-h-[60px]" placeholder="Enter reason for refund..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRefundModal(null)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleRefund(refundModal)} disabled={refunding}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                {refunding && <Loader2 className="h-4 w-4 animate-spin" />}
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
