"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserPlus, Crown, DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle, Headphones, Loader2, RefreshCw } from "lucide-react";
import { cn, formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
import { adminApi } from "@/lib/api";

const tickets = [
  { id: "TKT-001", subject: "Account verification delay", priority: "high", status: "open", userName: "Sarah Chen" },
  { id: "TKT-002", subject: "Payment not processed", priority: "urgent", status: "open", userName: "Mike Johnson" },
  { id: "TKT-003", subject: "Profile update issue", priority: "medium", status: "in_progress", userName: "Priya Sharma" },
  { id: "TKT-004", subject: "Feature request: Dark mode", priority: "low", status: "closed", userName: "Alex Lee" },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState("week");

  const [stats, setStats] = useState([
    { label: "Total Users", value: 0, change: "+0%", icon: Users, color: "text-blue-600 bg-blue-50", trend: "up" as const },
    { label: "New Today", value: 0, change: "+0%", icon: UserPlus, color: "text-emerald-600 bg-emerald-50", trend: "up" as const },
    { label: "Premium Users", value: 0, change: "+0%", icon: Crown, color: "text-purple-600 bg-purple-50", trend: "up" as const },
    { label: "Revenue", value: 0, isCurrency: true, change: "+0%", icon: DollarSign, color: "text-amber-600 bg-amber-50", trend: "up" as const },
  ]);

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [quickStats, setQuickStats] = useState({ pendingVerifications: 0, activeReports: 0, openTickets: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [statsRes, recentRes, revenueRes] = await Promise.all([
        adminApi.dashboard.stats(),
        adminApi.dashboard.recentRegistrations(),
        adminApi.dashboard.revenue(period),
      ]);

      const sd = statsRes.data?.data ?? statsRes.data;
      setStats([
        { label: "Total Users", value: sd.totalUsers ?? 0, change: `+${sd.userGrowth ?? 0}%`, icon: Users, color: "text-blue-600 bg-blue-50", trend: "up" },
        { label: "New Today", value: sd.newToday ?? 0, change: "+0%", icon: UserPlus, color: "text-emerald-600 bg-emerald-50", trend: "up" },
        { label: "Premium Users", value: sd.premiumUsers ?? 0, change: "+0%", icon: Crown, color: "text-purple-600 bg-purple-50", trend: "up" },
        { label: "Revenue", value: sd.revenue ?? 0, isCurrency: true, change: `+${sd.revenueGrowth ?? 0}%`, icon: DollarSign, color: "text-amber-600 bg-amber-50", trend: "up" },
      ]);

      setQuickStats({
        pendingVerifications: sd.pendingVerifications ?? 0,
        activeReports: sd.activeReports ?? 0,
        openTickets: sd.openTickets ?? 0,
      });

      const rd = revenueRes.data?.data ?? revenueRes.data;
      if (Array.isArray(rd)) {
        setChartData(rd.map((d: any) => d.value ?? d.count ?? 0));
        setChartLabels(rd.map((d: any) => d.label ?? d.date ?? ""));
      } else if (rd?.data) {
        setChartData(rd.data.map((d: any) => d.value ?? d.count ?? 0));
        setChartLabels(rd.data.map((d: any) => d.label ?? d.date ?? ""));
      }

      const ru = recentRes.data?.data ?? recentRes.data;
      setRecentUsers(Array.isArray(ru) ? ru : []);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiErr?.response?.data?.message || apiErr?.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const maxVal = chartData.length > 0 ? Math.max(...chartData) : 1;
  const days = chartLabels.length > 0 ? chartLabels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-lg p-2", stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("flex items-center gap-1 text-xs font-medium", stat.trend === "up" ? "text-emerald-600" : "text-red-600")}>
                  {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.isCurrency ? formatCurrency(stat.value) : formatNumber(stat.value)}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-medium">Revenue ({period})</h3>
          <div className="flex items-end gap-1.5" style={{ height: 160 }}>
            {(chartData.length > 0 ? chartData : [320, 280, 450, 380, 520, 490, 680]).map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{val}</span>
                <div
                  className="w-full rounded-md bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${(val / maxVal) * 140}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{days[i] ?? ""}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium">Quick Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Pending Verifications</span>
              </div>
              <span className="text-lg font-bold">{quickStats.pendingVerifications}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Active Reports</span>
              </div>
              <span className="text-lg font-bold">{quickStats.activeReports}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <Headphones className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Open Tickets</span>
              </div>
              <span className="text-lg font-bold">{quickStats.openTickets}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium">Recent Registrations</h3>
          <div className="space-y-3">
            {recentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent registrations</p>
            )}
            {recentUsers.map((user, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {(user.name ?? "").split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border",
                    user.role === "Premium" || user.role === "premium" ? "text-purple-600 bg-purple-50 border-purple-200" : "text-blue-600 bg-blue-50 border-blue-200"
                  )}>
                    {user.role}
                  </span>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{formatRelativeTime(user.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Support Tickets</h3>
            <Link href="/support" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
          </div>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.userName} · {ticket.id}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                    ticket.priority === "urgent" && "text-red-600 bg-red-50 border-red-200",
                    ticket.priority === "high" && "text-amber-600 bg-amber-50 border-amber-200",
                    ticket.priority === "medium" && "text-blue-600 bg-blue-50 border-blue-200",
                    ticket.priority === "low" && "text-gray-600 bg-gray-50 border-gray-200",
                  )}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
