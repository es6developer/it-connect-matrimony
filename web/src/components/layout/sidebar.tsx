"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Heart,
  Users,
  MessageCircle,
  Crown,
  Settings,
  HelpCircle,
  ChevronLeft,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUIStore } from "@/lib/store/ui-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getInitials } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Search", href: "/search", icon: Search },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Interests", href: "/interests", icon: Users },
  { label: "Messages", href: "/chat", icon: MessageCircle },
  { label: "Subscriptions", href: "/subscriptions", icon: Crown },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const showSidebar = isDesktop ? true : sidebarOpen;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AnimatePresence mode="wait">
      {showSidebar && (
        <motion.aside
          initial={isDesktop ? false : { x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
            isDesktop ? "w-64" : "w-64"
          )}
        >
          <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="relative">
                <Image src="/logo.svg" alt="IT Connect Matrimony" width={32} height={32} className="rounded-xl" />
                <div className="absolute -inset-1 bg-[#007AFF]/10 rounded-xl blur-sm" />
              </div>
              <span className="font-semibold text-sm tracking-tight">
                <span className="text-[#007AFF]">IT</span> Connect <span className="text-[#007AFF]">Matrimony</span>
              </span>
            </Link>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={toggleSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {user && (
            <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/30">
              <Link
                href="/profile"
                className="flex items-center gap-3 group"
              >
                <Avatar className="h-10 w-10 ring-2 ring-[#007AFF]/20">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-[#007AFF]/10 text-[#007AFF] text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-[#007AFF] transition-colors duration-200">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 truncate">
                    {!user.subscriptionTier || user.subscriptionTier === "free"
                      ? "Free Account"
                      : `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Member`}
                  </p>
                </div>
              </Link>
            </div>
          )}

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[#007AFF] text-white shadow-sm"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                    {item.label === "Interests" && (
                      <Badge
                        className="ml-auto h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-white/20 text-white"
                      >
                        0
                      </Badge>
                    )}
                    {item.label === "Messages" && (
                      <Badge
                        className="ml-auto h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-[#FF3B30] text-white"
                      >
                        0
                      </Badge>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            {(!user?.subscriptionTier || user.subscriptionTier === "free") && (
              <Link href="/subscriptions">
                <Button
                  className="w-full gap-2 mb-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-xl text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-[18px] w-[18px]" />
              Logout
            </Button>
          </div>

          {isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/60 hover:text-sidebar-foreground shadow-sm z-50"
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
