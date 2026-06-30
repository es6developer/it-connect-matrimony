"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Users,
  MessageCircle,
  Eye,
  ArrowRight,
  Sparkles,
  UserPlus,
  Star,
  MapPin,
  Briefcase,
  Code2,
  Loader2,
  Crown,
  Shield,
  Bell,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/auth-store";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import api from "@/lib/api";

const activityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  interest: Heart,
  match: Star,
  message: MessageCircle,
  view: Eye,
  subscription: Crown,
  verification: Shield,
  system: Bell,
};

const activityColorMap: Record<string, string> = {
  interest: "text-rose-500 bg-rose-500/10",
  match: "text-amber-500 bg-amber-500/10",
  message: "text-blue-500 bg-blue-500/10",
  view: "text-green-500 bg-green-500/10",
  subscription: "text-purple-500 bg-purple-500/10",
  verification: "text-cyan-500 bg-cyan-500/10",
  system: "text-gray-500 bg-gray-500/10",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  description?: string;
  isRead: boolean;
  createdAt: string;
}

interface MatchedUser {
  firstName: string;
  lastName: string;
  profile?: { age: number; city: string; state: string };
  professionalDetail?: { companyName: string; jobTitle: string; techStack: string[] };
}

interface RecommendationData {
  matchedUser: MatchedUser;
  compatibilityScore: number | null;
  aiScore: number | null;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    profileViews: 0,
    totalMatches: 0,
    newInterests: 0,
    messages: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [completionRes, notifRes, recRes] = await Promise.all([
          api.get("/api/v1/profiles/me/completion"),
          api.get("/api/v1/notifications", { params: { page: 1, limit: 5 } }),
          api.get("/api/v1/recommendations/daily"),
        ]);

        setProfileCompletion(completionRes.data?.data?.percentage ?? 0);
        setNotifications(notifRes.data?.data ?? notifRes.data ?? []);
        const recs = recRes.data?.data ?? [];
        setRecommendations(recs);

        try {
          const statsRes = await api.get("/api/v1/users/me/stats");
          const s = statsRes.data?.data ?? statsRes.data ?? {};
          setStats({
            profileViews: s.totalProfileViews ?? 0,
            totalMatches: s.totalMatches ?? 0,
            newInterests: s.totalInterests ?? 0,
            messages: s.totalMessages ?? 0,
          });
        } catch {
          setStats({
            profileViews: 0,
            totalMatches: recs.length,
            newInterests: 0,
            messages: 0,
          });
        }
      } catch {
        setError("Failed to load dashboard. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentActivity = notifications.map((n) => ({
    type: n.type,
    message: n.description ?? n.title,
    time: formatRelativeTime(n.createdAt),
    icon: activityIconMap[n.type] ?? Bell,
    color: activityColorMap[n.type] ?? "text-gray-500 bg-gray-500/10",
  }));

  const recommendationCards = recommendations.map((r) => {
    const mu = r.matchedUser;
    return {
      name: `${mu.firstName} ${mu.lastName}`,
      age: mu.profile?.age ?? 0,
      location: mu.profile ? `${mu.profile.city}, ${mu.profile.state}` : "",
      role: mu.professionalDetail
        ? `${mu.professionalDetail.jobTitle} at ${mu.professionalDetail.companyName}`
        : "",
      techStack: mu.professionalDetail?.techStack ?? [],
      matchScore: Math.round(r.compatibilityScore ?? r.aiScore ?? 0),
      avatar: "",
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] ?? "there"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your daily overview and recommendations
            </p>
          </div>
          <Link href="/search">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Discover Matches
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Progress value={profileCompletion} showValue indicatorColor="bg-gradient-to-r from-blue-500 to-purple-500" />
                    <p className="text-sm text-muted-foreground">
                      Complete your profile to get better matches
                    </p>
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      Complete Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Profile Views", value: String(stats.profileViews), icon: Eye, color: "text-blue-500 bg-blue-500/10" },
                { label: "Total Matches", value: String(stats.totalMatches), icon: Heart, color: "text-rose-500 bg-rose-500/10" },
                { label: "New Interests", value: String(stats.newInterests), icon: Users, color: "text-purple-500 bg-purple-500/10" },
                { label: "Messages", value: String(stats.messages), icon: MessageCircle, color: "text-emerald-500 bg-emerald-500/10" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions</CardDescription>
                </div>
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-0">
                {recentActivity.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <div key={i}>
                      <div className="flex items-start gap-3 py-3">
                        <div className={`h-8 w-8 rounded-full ${activity.color} flex items-center justify-center shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      {i < recentActivity.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  );
                })}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Premium Features</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock unlimited matches and see who liked you
                </p>
                <Link href="/subscriptions">
                  <Button variant="premium" size="sm" className="w-full gap-2">
                    <Sparkles className="h-4 w-4" />
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Daily Recommendations
              </h2>
              <Link href="/matches">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recommendationCards.map((rec, i) => (
                <motion.div
                  key={rec.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <Link href="/matches">
                    <Card className="hover:border-primary/30 transition-all duration-200 hover:shadow-md cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage src={rec.avatar} alt={rec.name} />
                            <AvatarFallback>
                              {getInitials(rec.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                                {rec.name}, {rec.age}
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-xs shrink-0"
                              >
                                {rec.matchScore}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {rec.role}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {rec.location}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rec.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  className="inline-flex items-center gap-1 rounded-md bg-primary/5 text-primary text-[10px] px-1.5 py-0.5 font-medium"
                                >
                                  <Code2 className="h-2.5 w-2.5" />
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              {recommendationCards.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No recommendations yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
