import axios from "axios";

const api = axios.create({
  baseURL: '',
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const adminApi = {
  auth: {
    login: (data: { email: string; password: string }) => api.post("/api/v1/admin/auth/login", data),
    logout: () => api.post("/api/v1/admin/auth/logout"),
    me: () => api.get("/api/v1/admin/auth/me"),
  },

  dashboard: {
    stats: () => api.get("/api/v1/admin/dashboard/stats"),
    userGrowth: (period?: string) => api.get("/api/v1/admin/dashboard/user-growth", { params: { period } }),
    revenue: (period?: string) => api.get("/api/v1/admin/dashboard/revenue", { params: { period } }),
    subscriptionDistribution: () => api.get("/api/v1/admin/dashboard/subscription-distribution"),
    recentRegistrations: () => api.get("/api/v1/admin/dashboard/recent-registrations"),
  },

  users: {
    list: (params?: Record<string, unknown>) => api.get("/api/v1/admin/users", { params }),
    get: (id: string) => api.get(`/api/v1/admin/users/${id}`),
    create: (data: Record<string, unknown>) => api.post("/api/v1/admin/users", data),
    update: (id: string, data: Record<string, unknown>) => api.patch(`/api/v1/admin/users/${id}`, data),
    suspend: (id: string, reason?: string) => api.post(`/api/v1/admin/users/${id}/suspend`, { reason }),
    activate: (id: string) => api.post(`/api/v1/admin/users/${id}/activate`),
    ban: (id: string, reason?: string) => api.post(`/api/v1/admin/users/${id}/ban`, { reason }),
    delete: (id: string) => api.delete(`/api/v1/admin/users/${id}`),
    impersonate: (id: string) => api.post(`/api/v1/admin/users/${id}/impersonate`),
    activity: (id: string) => api.get(`/api/v1/admin/users/${id}/activity`),
  },

  verifications: {
    list: (params?: Record<string, unknown>) => api.get("/api/v1/admin/verifications", { params }),
    approve: (id: string, data?: { reason?: string }) => api.post(`/api/v1/admin/verifications/${id}/approve`, data),
    reject: (id: string, data: { reason: string }) => api.post(`/api/v1/admin/verifications/${id}/reject`, data),
  },

  subscriptions: {
    list: (params?: Record<string, unknown>) => api.get("/api/v1/admin/subscriptions", { params }),
    create: (data: Record<string, unknown>) => api.post("/api/v1/admin/subscriptions", data),
    cancel: (id: string) => api.post(`/api/v1/admin/subscriptions/${id}/cancel`),
    plans: () => api.get("/api/v1/admin/subscriptions/plans"),
    distribution: () => api.get("/api/v1/admin/subscriptions/distribution"),
  },

  payments: {
    list: (params?: Record<string, unknown>) => api.get("/api/v1/admin/payments", { params }),
    get: (id: string) => api.get(`/api/v1/admin/payments/${id}`),
    refund: (id: string, data?: { amount?: number; reason?: string }) => api.post(`/api/v1/admin/payments/${id}/refund`, data),
    summary: () => api.get("/api/v1/admin/payments/summary"),
  },

  reports: {
    list: (params?: Record<string, unknown>) => api.get("/api/v1/admin/reports", { params }),
    update: (id: string, data: Record<string, unknown>) => api.patch(`/api/v1/admin/reports/${id}`, data),
    dismiss: (id: string) => api.post(`/api/v1/admin/reports/${id}/dismiss`),
  },

  support: {
    tickets: (params?: Record<string, unknown>) => api.get("/api/v1/admin/support/tickets", { params }),
    getTicket: (id: string) => api.get(`/api/v1/admin/support/tickets/${id}`),
    reply: (id: string, data: { message: string }) => api.post(`/api/v1/admin/support/tickets/${id}/reply`, data),
    close: (id: string) => api.post(`/api/v1/admin/support/tickets/${id}/close`),
  },

  analytics: {
    users: (period?: string) => api.get("/api/v1/admin/analytics/users", { params: { period } }),
    revenue: (period?: string) => api.get("/api/v1/admin/analytics/revenue", { params: { period } }),
    matches: (period?: string) => api.get("/api/v1/admin/analytics/matches", { params: { period } }),
    engagement: (period?: string) => api.get("/api/v1/admin/analytics/engagement", { params: { period } }),
  },

  blogs: {
    list: (params?: Record<string, unknown>) => api.get("/api/v1/admin/blogs", { params }),
    get: (id: string) => api.get(`/api/v1/admin/blogs/${id}`),
    create: (data: Record<string, unknown>) => api.post("/api/v1/admin/blogs", data),
    update: (id: string, data: Record<string, unknown>) => api.patch(`/api/v1/admin/blogs/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/admin/blogs/${id}`),
    publish: (id: string) => api.post(`/api/v1/admin/blogs/${id}/publish`),
    archive: (id: string) => api.post(`/api/v1/admin/blogs/${id}/archive`),
  },

  settings: {
    list: (group?: string) => api.get("/api/v1/admin/settings", { params: { group } }),
    update: (key: string, value: unknown) => api.patch(`/api/v1/admin/settings/${key}`, { value }),
    groups: () => api.get("/api/v1/admin/settings/groups"),
  },
};
