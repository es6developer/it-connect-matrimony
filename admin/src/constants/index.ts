export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Users", href: "/users", icon: "Users" },
  { label: "Verifications", href: "/verifications", icon: "ShieldCheck" },
  { label: "Subscriptions", href: "/subscriptions", icon: "Crown" },
  { label: "Payments", href: "/payments", icon: "CreditCard" },
  { label: "Reports", href: "/reports", icon: "Flag" },
  { label: "Support", href: "/support", icon: "Headphones" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Blogs", href: "/blogs", icon: "FileText" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export const USER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
  { label: "Banned", value: "banned" },
];

export const USER_ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Premium", value: "premium" },
  { label: "Admin", value: "admin" },
  { label: "Super Admin", value: "superadmin" },
];

export const VERIFICATION_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const TICKET_PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export const TICKET_STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Closed", value: "closed" },
];

export const ITEMS_PER_PAGE = 20;

export const STALE_TIMES = {
  dashboard: 30_000,
  users: 15_000,
  verifications: 10_000,
  payments: 15_000,
  subscriptions: 30_000,
  reports: 10_000,
  support: 10_000,
  blogs: 30_000,
  settings: 60_000,
};
