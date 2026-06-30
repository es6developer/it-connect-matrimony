"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Heart,
  MessageCircle,
  Crown,
  LayoutDashboard,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/store/auth-store";
import { getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Matches", href: "/matches" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

const MOBILE_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Search", href: "/search", icon: Search },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Pricing", href: "/pricing", icon: Crown },
  { label: "About", href: "/about", icon: User },
  { label: "Blog", href: "/blog", icon: User },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const unreadCount = 3;

  const handleLogout = async () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "glass shadow-sm border-b border-white/20 dark:border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Image src="/logo.svg" alt="IT Connect Matrimony" width={36} height={36} className="rounded-xl" priority />
          </div>
          <span className="font-semibold text-base tracking-tight hidden sm:block group-hover:text-primary transition-colors duration-300">
            <span className="text-[#007AFF]">IT</span> Connect <span className="text-[#007AFF]">Matrimony</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                pathname === item.href
                  ? "text-white bg-[#007AFF] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
          )}

          {isAuthenticated && user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#FF3B30] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-full hover:bg-accent/50">
                    <Avatar className="h-8 w-8 ring-2 ring-[#007AFF]/20">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="text-xs font-medium bg-[#007AFF]/10 text-[#007AFF]">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1 px-1 py-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")} className="rounded-xl">
                    <LayoutDashboard className="mr-2.5 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-xl">
                    <User className="mr-2.5 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")} className="rounded-xl">
                    <Settings className="mr-2.5 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {(!user.subscriptionTier || user.subscriptionTier === "free") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/subscriptions/plans")} className="rounded-xl">
                        <Crown className="mr-2.5 h-4 w-4 text-amber-500" />
                        <span className="premium-text font-medium">Upgrade to Premium</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-destructive focus:text-destructive">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white shadow-sm hidden sm:inline-flex">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-l border-white/10">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <Image src="/logo.svg" alt="IT Connect Matrimony" width={32} height={32} className="rounded-lg" />
                    <span className="font-bold text-sm tracking-tight"><span className="text-[#007AFF]">IT</span> Connect <span className="text-[#007AFF]">Matrimony</span></span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {isAuthenticated && user && (
                  <div className="p-5 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-[#007AFF]/20">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-[#007AFF]/10 text-[#007AFF]">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {MOBILE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          pathname === item.href
                            ? "text-white bg-[#007AFF] shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-5 border-t border-border/50">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
