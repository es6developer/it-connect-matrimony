"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Heart,
  MessageCircle,
  Star,
  Eye,
  Crown,
  Shield,
  CheckCheck,
  Calendar,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface NotificationItem {
  id: number;
  type: "interest" | "match" | "message" | "view" | "subscription" | "verification" | "system";
  title: string;
  description?: string;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons: Record<string, React.ElementType> = {
  interest: Heart,
  match: Star,
  message: MessageCircle,
  view: Eye,
  subscription: Crown,
  verification: Shield,
  system: Bell,
};

const notificationColors: Record<string, string> = {
  interest: "text-rose-500 bg-rose-500/10",
  match: "text-amber-500 bg-amber-500/10",
  message: "text-blue-500 bg-blue-500/10",
  view: "text-green-500 bg-green-500/10",
  subscription: "text-purple-500 bg-purple-500/10",
  verification: "text-emerald-500 bg-emerald-500/10",
  system: "text-muted-foreground bg-muted",
};

function groupNotificationsByDate(notifs: NotificationItem[]): Record<string, NotificationItem[]> {
  const groups: Record<string, NotificationItem[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  notifs.forEach((n: NotificationItem) => {
    const createdAt = n.createdAt;
    if (!createdAt) return;
    const date = new Date(createdAt).toDateString();
    let label: string;
    if (date === today) label = "Today";
    else if (date === yesterday) label = "Yesterday";
    else label = new Date(createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label]!.push(n);
  });
  return groups;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/notifications");
      setNotifs(res.data.data.data);
    } catch {
      // toast handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifs = filter === "unread" ? notifs.filter((n) => !n.isRead) : notifs;
  const grouped = groupNotificationsByDate(filteredNotifs);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/v1/notifications/read-all");
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      // toast handled by interceptor
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // toast handled by interceptor
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/api/v1/notifications/${id}`);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch {
      // toast handled by interceptor
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unread" ? "secondary" : "ghost"}
          size="sm"
          className="gap-2"
          onClick={() => setFilter("unread")}
        >
          Unread
          {unreadCount > 0 && (
            <Badge variant="default" className="text-[10px] h-5">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : Object.entries(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread" ? "You have no unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {dateLabel}
              </h3>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = notificationIcons[item.type] ?? Bell;
                  const colorClass = notificationColors[item.type] ?? "text-muted-foreground bg-muted";
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => markAsRead(item.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors",
                        item.isRead ? "hover:bg-accent/50" : "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          colorClass
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn("text-sm", !item.isRead && "font-semibold")}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </div>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
