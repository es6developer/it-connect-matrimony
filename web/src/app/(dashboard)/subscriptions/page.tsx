"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Check,
  X,
  Star,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  notIncluded: string[];
  popular: boolean;
  color: string;
}

interface CurrentSubscription {
  plan: Plan;
  status: string;
  expiresAt: string;
}

interface PaymentRecord {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: string;
  method: string;
}

const planColors: Record<string, string> = {
  premium: "from-amber-500 to-rose-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-500 to-blue-500",
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, subRes, historyRes] = await Promise.all([
        api.get<{ success: boolean; data: Plan[] }>("/api/v1/subscriptions/plans"),
        api.get<{ success: boolean; data: CurrentSubscription }>("/api/v1/subscriptions/my"),
        api.get<{ success: boolean; data: PaymentRecord[] }>("/api/v1/subscriptions/history"),
      ]);
      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (subRes.data.success) setCurrentSub(subRes.data.data);
      if (historyRes.data.success) setPaymentHistory(historyRes.data.data);
    } catch {
      setError("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribingPlanId(planId);
      const res = await api.post<{ success: boolean }>("/api/v1/subscriptions/create", { planId });
      if (res.data.success) {
        toast.success("Subscription created successfully");
        const subRes = await api.get<{ success: boolean; data: CurrentSubscription }>("/api/v1/subscriptions/my");
        if (subRes.data.success) setCurrentSub(subRes.data.data);
      }
    } catch {
      toast.error("Failed to create subscription");
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const res = await api.post<{ success: boolean }>("/api/v1/subscriptions/cancel");
      if (res.data.success) {
        toast.success("Subscription cancelled");
        const subRes = await api.get<{ success: boolean; data: CurrentSubscription }>("/api/v1/subscriptions/my");
        if (subRes.data.success) setCurrentSub(subRes.data.data);
      }
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const currentPlanId = currentSub?.plan?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Choose the perfect plan for your journey
        </p>
      </motion.div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative h-full border-2 transition-all duration-200",
                  plan.id === currentPlanId
                    ? "border-primary shadow-xl shadow-primary/10"
                    : plan.popular
                    ? "border-primary/50"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                {(plan.popular || plan.id === currentPlanId) && (
                  <div className={cn(
                    "absolute -top-3 z-10",
                    plan.popular && plan.id !== currentPlanId
                      ? "left-1/2 -translate-x-1/2"
                      : "right-4"
                  )}>
                    <Badge
                      variant={plan.id === currentPlanId ? "success" : "default"}
                      className={cn(
                        "px-4 py-1 text-xs whitespace-nowrap",
                        plan.id !== currentPlanId && plan.popular && "px-4 py-1"
                      )}
                    >
                      {plan.id === currentPlanId ? "Current Plan" : "Most Popular"}
                    </Badge>
                  </div>
                )}

                <CardHeader className={cn("text-center", plan.popular ? "pt-8" : "")}>
                  <div className="flex justify-center mb-4">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                        plan.color || planColors[plan.id] || "from-primary to-primary/50"
                      )}
                    >
                      <Crown className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {currentSub && plan.id === currentPlanId && (
                    <div className="space-y-1 pb-2 text-center border-b">
                      <p className="text-xs text-muted-foreground capitalize">
                        Status: <span className="font-medium">{currentSub.status}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(currentSub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded?.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground/50">
                        <X className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.id === currentPlanId ? "outline" : plan.popular ? "default" : "outline"}
                    className={cn(
                      "w-full mt-4",
                      plan.id === currentPlanId ? "cursor-default" : ""
                    )}
                    disabled={plan.id === currentPlanId || subscribingPlanId === plan.id}
                    onClick={plan.id !== currentPlanId ? () => handleSubscribe(plan.id) : undefined}
                  >
                    {subscribingPlanId === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Subscribing...
                      </>
                    ) : plan.id === currentPlanId ? (
                      "Current Plan"
                    ) : (
                      "Upgrade"
                    )}
                  </Button>

                  {plan.id === currentPlanId && currentSub?.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={handleCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Feature Comparison
          </CardTitle>
          <CardDescription>Compare all plans side by side</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="text-center">Free</TableHead>
                <TableHead className="text-center">Premium</TableHead>
                <TableHead className="text-center">Gold</TableHead>
                <TableHead className="text-center">Platinum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { feature: "Daily Matches", free: "5", premium: "20", gold: "35", platinum: "50" },
                { feature: "Send Messages", free: "✗", premium: "✓", gold: "✓", platinum: "✓" },
                { feature: "View Photos", free: "✗", premium: "✓", gold: "✓", platinum: "✓" },
                { feature: "See Who Liked You", free: "✗", premium: "✓", gold: "✓", platinum: "✓" },
                { feature: "Advanced Filters", free: "✗", premium: "✓", gold: "✓", platinum: "✓" },
                { feature: "Profile Highlight", free: "✗", premium: "✓", gold: "✓", platinum: "✓" },
                { feature: "Read Receipts", free: "✗", premium: "✗", gold: "✓", platinum: "✓" },
                { feature: "Incognito Mode", free: "✗", premium: "✗", gold: "✗", platinum: "✓" },
                { feature: "Priority Support", free: "✗", premium: "✗", gold: "✓", platinum: "✓" },
              ].map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="text-center">{row.free}</TableCell>
                  <TableCell className="text-center">{row.premium}</TableCell>
                  <TableCell className="text-center">{row.gold}</TableCell>
                  <TableCell className="text-center">{row.platinum}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>Your subscription payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment history yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">{payment.date}</TableCell>
                    <TableCell className="font-medium text-sm">{payment.plan}</TableCell>
                    <TableCell className="text-sm">{payment.amount}</TableCell>
                    <TableCell className="text-sm">{payment.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "active"
                            ? "success"
                            : payment.status === "completed"
                            ? "secondary"
                            : "warning"
                        }
                        className="text-[10px] capitalize"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
