"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Search, Plus, Loader2 } from "lucide-react";

interface SubscriptionRow {
  id: string;
  userName: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  autoRenew: boolean;
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createUserId, setCreateUserId] = useState("");
  const [createPlan, setCreatePlan] = useState("basic");
  const [createDuration, setCreateDuration] = useState("12");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, distRes] = await Promise.all([
          adminApi.subscriptions.list(),
          adminApi.subscriptions.distribution(),
        ]);
        setSubscriptions(subRes.data.data ?? subRes.data ?? []);
        setDistribution(distRes.data.data ?? distRes.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      await adminApi.subscriptions.create({ userId: createUserId, plan: createPlan, duration: parseInt(createDuration) });
      setShowCreate(false);
      setCreateUserId("");
      setCreatePlan("basic");
      setCreateDuration("12");
      const res = await adminApi.subscriptions.list();
      setSubscriptions(res.data.data ?? res.data ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setCreateLoading(false);
    }
  };

  const planDistribution = Array.isArray(distribution) && distribution.length > 0
    ? distribution.map((d: any) => ({
        plan: d.plan ?? d._id ?? "Unknown",
        count: d.count ?? d.total ?? 0,
        color: d.color ?? "bg-gray-400",
      }))
    : [];

  const totalPlans = planDistribution.reduce((s: number, p: any) => s + p.count, 0);

  const filtered = subscriptions.filter((s) => {
    if (search && !s.userName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter && s.plan !== planFilter) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * 20, page * 20);
  const totalPages = Math.ceil(filtered.length / 20);

  const columns: Column<SubscriptionRow>[] = [
    { key: "userName", header: "User", cell: (s) => <span className="text-sm font-medium">{s.userName}</span> },
    { key: "plan", header: "Plan", sortable: true,
      cell: (s) => (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
          s.plan === "free" && "text-gray-600 bg-gray-50 border-gray-200",
          s.plan === "basic" && "text-blue-600 bg-blue-50 border-blue-200",
          s.plan === "premium" && "text-purple-600 bg-purple-50 border-purple-200",
          s.plan === "vip" && "text-amber-600 bg-amber-50 border-amber-200",
        )}>
          {s.plan}
        </span>
      ),
    },
    { key: "status", header: "Status", sortable: true,
      cell: (s) => (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
          s.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
          s.status === "expired" ? "text-gray-600 bg-gray-50 border-gray-200" : "text-red-600 bg-red-50 border-red-200",
        )}>
          {s.status}
        </span>
      ),
    },
    { key: "amount", header: "Amount", sortable: true, hideOnMobile: true,
      cell: (s) => <span>{s.amount === 0 ? "Free" : formatCurrency(s.amount)}</span>,
    },
    { key: "endDate", header: "End Date", hideOnMobile: true,
      cell: (s) => <span className="text-sm text-muted-foreground">{formatDate(s.endDate)}</span>,
    },
    { key: "autoRenew", header: "Auto-Renew", hideOnMobile: true,
      cell: (s) => (
        <span className={cn("text-xs font-medium", s.autoRenew ? "text-emerald-600" : "text-muted-foreground")}>
          {s.autoRenew ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage user subscriptions and plans</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Create Subscription
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Active</p>
          <p className="text-xl font-bold mt-1">{loading ? "..." : subscriptions.filter((s: any) => s.status === "active").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Premium + VIP</p>
          <p className="text-xl font-bold mt-1">{loading ? "..." : subscriptions.filter((s: any) => s.plan === "premium" || s.plan === "vip").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Expired</p>
          <p className="text-xl font-bold mt-1">{loading ? "..." : subscriptions.filter((s: any) => s.status === "expired").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          <p className="text-xl font-bold mt-1">{loading ? "..." : formatCurrency(subscriptions.reduce((s: number, sub: any) => s + sub.amount, 0))}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-medium mb-4">Plan Distribution</h3>
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : totalPlans > 0 ? (
            <div className="space-y-3">
              {planDistribution.map((p: any) => (
                <div key={p.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{p.plan}</span>
                    <span className="text-sm font-medium">{((p.count / totalPlans) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", p.color)} style={{ width: `${(p.count / totalPlans) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No distribution data available.</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search by user..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <DataTable columns={columns} data={paginated} page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Create Subscription</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <input value={createUserId} onChange={(e) => setCreateUserId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" placeholder="USR-XXXX" />
              </div>
              <div>
                <label className="text-sm font-medium">Plan</label>
                <select value={createPlan} onChange={(e) => setCreatePlan(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none mt-1">
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (months)</label>
                <input type="number" value={createDuration} onChange={(e) => setCreateDuration(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors mt-1" placeholder="12" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={createLoading}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1">
                {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
