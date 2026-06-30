"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Send,
  Check,
  X,
  MessageCircle,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface UserProfile {
  firstName?: string;
  lastName?: string;
  age?: number;
  city?: string;
  state?: string;
  country?: string;
  photos?: { url: string; isPrimary: boolean }[];
}

interface ProfessionalDetail {
  designation?: string;
  company?: string;
}

interface InterestUser {
  id: number;
  uuid: string;
  email: string;
  role: string;
  profile?: UserProfile;
  professionalDetail?: ProfessionalDetail;
}

interface InterestData {
  id: number;
  uuid: string;
  fromUserId: number;
  toUserId: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message?: string;
  createdAt: string;
  fromUser: InterestUser;
  toUser: InterestUser;
}

interface PaginatedResponse {
  data: InterestData[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

interface InterestItem {
  id: number;
  uuid: string;
  name: string;
  age: number;
  location: string;
  role: string;
  avatar?: string;
  message?: string;
  sentAt: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
}

function toInterestItem(
  interest: InterestData,
  isReceived: boolean
): InterestItem {
  const user = isReceived ? interest.fromUser : interest.toUser;
  const profile = user.profile;
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const name = `${firstName} ${lastName}`.trim() || user.email;
  const location = [profile?.city, profile?.state, profile?.country]
    .filter(Boolean)
    .join(", ");
  const designation = user.professionalDetail?.designation ?? "";
  const company = user.professionalDetail?.company ?? "";
  const role = [designation, company].filter(Boolean).join(" at ") || user.role;
  const avatar =
    profile?.photos?.find((p) => p.isPrimary)?.url ??
    profile?.photos?.[0]?.url;
  return {
    id: interest.id,
    uuid: interest.uuid,
    name,
    age: profile?.age ?? 0,
    location,
    role,
    avatar,
    message: interest.message,
    sentAt: interest.createdAt,
    status: interest.status,
  };
}

function extractInterests(resp: { data: unknown }): InterestData[] {
  const d = resp.data;
  if (Array.isArray(d)) return d;
  return (d as PaginatedResponse)?.data ?? [];
}

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState("received");
  const [received, setReceived] = useState<InterestItem[]>([]);
  const [sent, setSent] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  const fetchInterests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get("/api/v1/interests/received?page=1&limit=20"),
        api.get("/api/v1/interests/sent?page=1&limit=20"),
      ]);
      setReceived(
        extractInterests(receivedRes).map((i) => toInterestItem(i, true))
      );
      setSent(
        extractInterests(sentRes).map((i) => toInterestItem(i, false))
      );
    } catch {
      setError("Failed to load interests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  const accepted = useMemo(
    () => [...received, ...sent].filter((i) => i.status === "accepted"),
    [received, sent]
  );

  const handleAction = async (
    id: number,
    action: "accept" | "reject" | "cancel"
  ) => {
    const key = `${action}-${id}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await api.patch(`/api/v1/interests/${id}/${action}`);
      toast.success(
        `Interest ${
          action === "accept"
            ? "accepted"
            : action === "reject"
            ? "rejected"
            : "cancelled"
        } successfully`
      );
      fetchInterests();
    } catch {
      toast.error(`Failed to ${action} interest`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const renderInterestCard = (
    interest: InterestItem,
    tabType: "received" | "sent"
  ) => (
    <motion.div
      key={interest.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src={interest.avatar ?? ""} alt={interest.name} />
              <AvatarFallback>{getInitials(interest.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">
                    {interest.name}, {interest.age}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {interest.role}
                  </p>
                </div>
                <Badge
                  variant={
                    interest.status === "accepted"
                      ? "success"
                      : interest.status === "rejected" ||
                        interest.status === "cancelled"
                      ? "danger"
                      : "secondary"
                  }
                  className="text-[10px] shrink-0"
                >
                  {interest.status === "accepted"
                    ? "Accepted"
                    : interest.status === "rejected"
                    ? "Rejected"
                    : interest.status === "cancelled"
                    ? "Cancelled"
                    : "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {interest.location}
              </p>
              {interest.message && (
                <p className="text-sm mt-2 bg-muted/50 rounded-lg p-3 italic text-muted-foreground">
                  &ldquo;{interest.message}&rdquo;
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(interest.sentAt)}
                </span>
                {interest.status === "pending" &&
                  (tabType === "received" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                        onClick={() => handleAction(interest.id, "reject")}
                        disabled={actionLoading[`reject-${interest.id}`]}
                      >
                        {actionLoading[`reject-${interest.id}`] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => handleAction(interest.id, "accept")}
                        disabled={actionLoading[`accept-${interest.id}`]}
                      >
                        {actionLoading[`accept-${interest.id}`] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                      onClick={() => handleAction(interest.id, "cancel")}
                      disabled={actionLoading[`cancel-${interest.id}`]}
                    >
                      {actionLoading[`cancel-${interest.id}`] ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Cancel
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Interests</h1>
        <p className="text-muted-foreground mt-1">
          Manage your interests and connections
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">{error}</p>
          <Button variant="outline" onClick={fetchInterests}>
            Try Again
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="received" className="gap-2">
              <Heart className="h-4 w-4" />
              Received
              <Badge variant="secondary" className="ml-1 text-[10px] h-5">
                {received.filter((i) => i.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent
              <Badge variant="secondary" className="ml-1 text-[10px] h-5">
                {sent.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-2">
              <Check className="h-4 w-4" />
              Accepted
              <Badge variant="secondary" className="ml-1 text-[10px] h-5">
                {accepted.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <TabsContent value="received" className="mt-0 space-y-3">
                {received.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="No interests received"
                    description="When someone sends you an interest, it will appear here."
                  />
                ) : (
                  received.map((i) => renderInterestCard(i, "received"))
                )}
              </TabsContent>

              <TabsContent value="sent" className="mt-0 space-y-3">
                {sent.length === 0 ? (
                  <EmptyState
                    icon={Send}
                    title="No interests sent"
                    description="Browse profiles and send interests to connect."
                  />
                ) : (
                  sent.map((i) => renderInterestCard(i, "sent"))
                )}
              </TabsContent>

              <TabsContent value="accepted" className="mt-0 space-y-3">
                {accepted.length === 0 ? (
                  <EmptyState
                    icon={Check}
                    title="No accepted interests"
                    description="Your accepted interests will appear here."
                  />
                ) : (
                  accepted.map((i) => (
                    <motion.div
                      key={i.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <Check className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {i.name}, {i.age}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {i.role}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" className="gap-1" onClick={() => toast.success('Messaging feature coming soon')}>
                              <MessageCircle className="h-3.5 w-3.5" />
                              Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
