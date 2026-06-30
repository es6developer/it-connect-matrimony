"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn, formatDate, getInitials, formatRelativeTime, getStatusColor } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  Activity,
  AlertTriangle,
  Ban,
  UserX,
  CheckCircle,
  MoreHorizontal,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";

const tabs = ["Overview", "Activity Log", "Subscription", "Reports"];

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  occupation: string;
  company: string;
  location: string;
  status: string;
  role: string;
  createdAt: string;
  lastActive: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  bio: string;
  interests: string[];
}

interface ActivityItem {
  action: string;
  details: string;
  createdAt: string;
  ipAddress: string;
}

interface SubscriptionData {
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number;
  paymentMethod: string;
}

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await adminApi.users.get(params.id as string);
      const body = res.data?.data ?? res.data;
      setUser(body?.user ?? body);
      setSubscription(body?.subscription ?? null);
      setReports(body?.reports ?? []);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiErr?.response?.data?.message || apiErr?.message || "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await adminApi.users.activity(params.id as string);
      const body = res.data?.data ?? res.data;
      setActivities(Array.isArray(body) ? body : body?.activities ?? []);
    } catch {}
  };

  useEffect(() => {
    if (params.id) {
      fetchUser();
      fetchActivity();
    }
  }, [params.id]);

  const handleAction = async (action: string) => {
    setConfirmAction(null);
    setShowActions(false);
    try {
      if (action === "suspend") await adminApi.users.suspend(params.id as string);
      else if (action === "ban") await adminApi.users.ban(params.id as string);
      else if (action === "impersonate") await adminApi.users.impersonate(params.id as string);
      else if (action === "delete") {
        await adminApi.users.delete(params.id as string);
        router.push("/users");
        return;
      }
      fetchUser();
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={fetchUser} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className="rounded-md p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">User ID: {params.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(user.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{user.name}</h2>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                      user.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-gray-600 bg-gray-50 border-gray-200",
                    )}>
                      {user.status}
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                      user.role === "premium" ? "text-purple-600 bg-purple-50 border-purple-200" : "text-blue-600 bg-blue-50 border-blue-200",
                      user.role === "admin" && "text-amber-600 bg-amber-50 border-amber-200",
                    )}>
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setShowActions(!showActions)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-1">
                  Actions <MoreHorizontal className="h-4 w-4" />
                </button>
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border bg-popover p-1 shadow-lg">
                      <button onClick={() => setConfirmAction("suspend")} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"><UserX className="h-4 w-4" /> Suspend</button>
                      <button onClick={() => setConfirmAction("ban")} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"><Ban className="h-4 w-4" /> Ban</button>
                      <button onClick={() => handleAction("impersonate")} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"><Shield className="h-4 w-4" /> Impersonate</button>
                      <hr className="my-1" />
                      <button onClick={() => setConfirmAction("delete")} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> {user.email}</div>
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}</div>
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> {user.location}</div>
              <div className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-muted-foreground" /> {user.occupation}</div>
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> Age {user.age}</div>
              <div className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-muted-foreground" /> Joined {formatDate(user.createdAt)}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {activeTab === "Overview" && (
                <div className="space-y-4">
                  {user.interests && user.interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {user.interests.map((i) => (
                          <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-xs">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Email Verified</p>
                      <p className="text-sm font-medium mt-0.5">{user.isEmailVerified ? "Yes" : "No"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Phone Verified</p>
                      <p className="text-sm font-medium mt-0.5">{user.isPhoneVerified ? "Yes" : "No"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Identity Verified</p>
                      <p className="text-sm font-medium mt-0.5">{user.isVerified ? "Yes" : "No"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Last Active</p>
                      <p className="text-sm font-medium mt-0.5">{formatRelativeTime(user.lastActive)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Activity Log" && (
                <div className="space-y-3">
                  {activities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No activity found</p>
                  )}
                  {activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.action}</p>
                        <p className="text-xs text-muted-foreground">{a.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(a.createdAt)}</p>
                        {a.ipAddress && <p className="text-[10px] text-muted-foreground">{a.ipAddress}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Subscription" && subscription && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-sm font-medium mt-0.5">{subscription.plan}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-medium mt-0.5">${subscription.amount}/mo</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium mt-0.5">{formatDate(subscription.startDate)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium mt-0.5">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Auto-renew is {subscription.autoRenew ? "enabled" : "disabled"}
                  </div>
                </div>
              )}

              {activeTab === "Subscription" && !subscription && (
                <p className="text-sm text-muted-foreground text-center py-4">No subscription data</p>
              )}

              {activeTab === "Reports" && (
                <div className="space-y-3">
                  {reports.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No reports</p>
                  )}
                  {reports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{r.reason}</p>
                        <p className="text-xs text-muted-foreground">{r.id} · {formatDate(r.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                          r.priority === "critical" && "text-red-600 bg-red-50 border-red-200",
                          r.priority === "high" && "text-amber-600 bg-amber-50 border-amber-200",
                        )}>
                          {r.priority}
                        </span>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                          getStatusColor(r.status)
                        )}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors">
                <Mail className="h-4 w-4" /> Send Email
              </button>
              <button onClick={() => handleAction("impersonate")} className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors">
                <Shield className="h-4 w-4" /> Impersonate
              </button>
              <button onClick={() => setConfirmAction("suspend")} className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors">
                <AlertTriangle className="h-4 w-4" /> Suspend User
              </button>
              <button onClick={() => setConfirmAction("ban")} className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <Ban className="h-4 w-4" /> Ban User
              </button>
            </div>
          </div>

          {subscription && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-medium mb-3">Subscription</h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">${subscription.amount}</p>
                <p className="text-xs text-muted-foreground">per month · {subscription.plan}</p>
                <span className={cn(
                  "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border",
                  subscription.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-gray-600 bg-gray-50 border-gray-200",
                )}>
                  {subscription.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmAction && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setConfirmAction(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-2">Confirm {confirmAction}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to {confirmAction} <strong>{user.name}</strong>?
                {confirmAction === "delete" && " This action cannot be undone."}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(confirmAction)}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium text-white transition-colors",
                    confirmAction === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
                  )}
                >
                  {confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
