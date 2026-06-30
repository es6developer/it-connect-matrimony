export type UserStatus = "active" | "inactive" | "suspended" | "banned";
export type UserRole = "user" | "premium" | "admin" | "superadmin";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type ReportPriority = "low" | "medium" | "high" | "critical";
export type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed";
export type BlogStatus = "draft" | "published" | "archived";
export type SubscriptionPlan = "free" | "basic" | "premium" | "vip";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  role: UserRole;
  gender?: string;
  age?: number;
  occupation?: string;
  company?: string;
  location?: string;
  createdAt: string;
  lastActive?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number;
  paymentMethod?: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  transactionId: string;
  description: string;
  createdAt: string;
}

export interface Verification {
  id: string;
  userId: string;
  userName: string;
  documentType: string;
  documentUrl: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  description: string;
  priority: ReportPriority;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  action?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface SiteSetting {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  group: string;
  description?: string;
}

export interface DashboardStats {
  totalUsers: number;
  newToday: number;
  premiumUsers: number;
  revenue: number;
  revenueGrowth: number;
  userGrowth: number;
  pendingVerifications: number;
  openTickets: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
