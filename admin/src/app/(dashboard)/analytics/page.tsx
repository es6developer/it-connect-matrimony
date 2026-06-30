"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, Heart, Activity, Loader2 } from "lucide-react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("year");
  const [userGrowthData, setUserGrowthData] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [matchData, setMatchData] = useState<number[]>([]);
  const [engagementData, setEngagementData] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (p: string) => {
    try {
      setLoading(true);
      const [usersRes, revenueRes, matchesRes, engagementRes] = await Promise.all([
        adminApi.analytics.users(p),
        adminApi.analytics.revenue(p),
        adminApi.analytics.matches(p),
        adminApi.analytics.engagement(p),
      ]);
      const users = usersRes.data.data ?? usersRes.data ?? [];
      const revenue = revenueRes.data.data ?? revenueRes.data ?? [];
      const matches = matchesRes.data.data ?? matchesRes.data ?? [];
      const engagement = engagementRes.data.data ?? engagementRes.data ?? [];

      setUserGrowthData(Array.isArray(users) ? users.map((d: any) => d.value ?? d.count ?? d) : []);
      setRevenueData(Array.isArray(revenue) ? revenue.map((d: any) => d.value ?? d.amount ?? d) : []);
      setMatchData(Array.isArray(matches) ? matches.map((d: any) => d.value ?? d.count ?? d) : []);
      setEngagementData(Array.isArray(engagement) ? engagement.map((d: any) => d.value ?? d.rate ?? d) : []);

      const totalUsers = Array.isArray(users) ? users.reduce((s: number, d: any) => s + (d.value ?? d.count ?? d), 0) : 0;
      const totalRevenue = Array.isArray(revenue) ? revenue.reduce((s: number, d: any) => s + (d.value ?? d.amount ?? d), 0) : 0;
      const totalMatches = Array.isArray(matches) ? matches.reduce((s: number, d: any) => s + (d.value ?? d.count ?? d), 0) : 0;
      void totalRevenue;
      const avgEngagement = Array.isArray(engagement) && engagement.length > 0
        ? engagement.reduce((s: number, d: any) => s + (d.value ?? d.rate ?? d), 0) / engagement.length
        : 0;

      setMetrics([
        { label: "Total Users", value: formatNumber(totalUsers), change: "+" + ((totalUsers / 1000) * 100).toFixed(0) + "%", trend: "up", icon: Users },
        { label: "Active Users", value: formatNumber(Math.round(totalUsers * 0.7)), change: "+12%", trend: "up", icon: Activity },
        { label: "Total Matches", value: formatNumber(totalMatches), change: "+" + ((totalMatches / 100) * 100).toFixed(0) + "%", trend: "up", icon: Heart },
        { label: "Avg. Engagement", value: avgEngagement.toFixed(1) + "%", change: avgEngagement > 50 ? "+5%" : "-2%", trend: avgEngagement > 50 ? "up" : "down", icon: Activity },
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const maxUser = Math.max(...userGrowthData, 1);
  const maxRevenue = Math.max(...revenueData, 1);
  const maxMatch = Math.max(...matchData, 1);
  const maxEngagement = Math.max(...engagementData, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform analytics and insights</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-7 w-24 mt-3 rounded bg-muted" />
              <div className="h-4 w-16 mt-1 rounded bg-muted" />
            </div>
          ))
        ) : (
          metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className={cn("flex items-center gap-1 text-xs font-medium", m.trend === "up" ? "text-emerald-600" : "text-red-600")}>
                    {m.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {m.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-3">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            );
          })
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-medium mb-1">User Growth</h3>
            <p className="text-xs text-muted-foreground mb-4">Periodic new user registrations</p>
            <div className="flex items-end gap-1.5" style={{ height: 180 }}>
              {userGrowthData.length > 0 ? userGrowthData.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{formatNumber(val)}</span>
                  <div className="w-full rounded-sm bg-blue-500/80 transition-all hover:bg-blue-500" style={{ height: `${(val / maxUser) * 150}px` }} />
                  <span className="text-[9px] text-muted-foreground">{months[i] || i}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground self-center w-full text-center">No data</p>}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-medium mb-1">Revenue</h3>
            <p className="text-xs text-muted-foreground mb-4">Periodic revenue ($)</p>
            <div className="flex items-end gap-1.5" style={{ height: 180 }}>
              {revenueData.length > 0 ? revenueData.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">${(val / 1000).toFixed(0)}k</span>
                  <div className="w-full rounded-sm bg-emerald-500/80 transition-all hover:bg-emerald-500" style={{ height: `${(val / maxRevenue) * 150}px` }} />
                  <span className="text-[9px] text-muted-foreground">{months[i] || i}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground self-center w-full text-center">No data</p>}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-medium mb-1">Matches</h3>
            <p className="text-xs text-muted-foreground mb-4">Periodic successful matches</p>
            <div className="flex items-end gap-1.5" style={{ height: 180 }}>
              {matchData.length > 0 ? matchData.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{val}</span>
                  <div className="w-full rounded-sm bg-rose-500/80 transition-all hover:bg-rose-500" style={{ height: `${(val / maxMatch) * 150}px` }} />
                  <span className="text-[9px] text-muted-foreground">{months[i] || i}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground self-center w-full text-center">No data</p>}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-medium mb-1">Engagement Rate</h3>
            <p className="text-xs text-muted-foreground mb-4">Periodic active user engagement (%)</p>
            <div className="flex items-end gap-1.5" style={{ height: 180 }}>
              {engagementData.length > 0 ? engagementData.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{val}%</span>
                  <div className="w-full rounded-sm bg-purple-500/80 transition-all hover:bg-purple-500" style={{ height: `${(val / maxEngagement) * 150}px` }} />
                  <span className="text-[9px] text-muted-foreground">{months[i] || i}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground self-center w-full text-center">No data</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
