"use client";

import { useState } from "react";
import { useSidebarStore, useAdminAuth } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { collapsed, toggle } = useSidebarStore();
  const { user } = useAdminAuth();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const adminName = user?.name ?? "Admin";
  const initials = getInitials(adminName);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue.trim()) {
      alert(`Search coming soon. You searched for: "${searchValue}"`);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 transition-all duration-300",
        collapsed ? "ml-16" : "ml-60"
      )}
    >
      <button
        onClick={toggle}
        className="rounded-md p-1.5 hover:bg-muted transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search users, payments, tickets..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full rounded-md border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => alert("Notifications feature coming soon")}
          className="relative rounded-md p-1.5 hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
              {initials}
            </div>
            <span className="hidden text-sm font-medium md:block">{adminName}</span>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover p-1 shadow-lg">
                <button
                  onClick={() => { setShowProfile(false); alert("Profile page coming soon"); }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => { setShowProfile(false); router.push("/settings"); }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setShowProfile(false);
                    useAdminAuth.getState().logout();
                    router.push("/login");
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
