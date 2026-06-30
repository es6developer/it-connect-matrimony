import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getStoreTokens = ():
  | { accessToken: string; refreshToken: string }
  | null => {
  try {
    const raw = localStorage.getItem("auth-store");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state?.accessToken || !state?.refreshToken) return null;
    return {
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    };
  } catch {
    return null;
  }
};

const getRefreshToken = (): string | null => {
  return getStoreTokens()?.refreshToken ?? null;
};

const setAccessToken = (token: string) => {
  try {
    const raw = localStorage.getItem("auth-store");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      parsed.state.accessToken = token;
      localStorage.setItem("auth-store", JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};

const clearAuth = () => {
  try {
    localStorage.removeItem("auth-store");
  } catch {
    // ignore
  }
};

const api = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getStoreTokens();
    if (tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${apiEndpoints.auth.refresh}`,
          { refreshToken }
        );

        const { accessToken } = response.data as { accessToken: string };
        setAccessToken(accessToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = getErrorMessage(error);
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? error.message ?? "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export default api;

export const apiEndpoints = {
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    logout: "/api/v1/auth/logout",
    refresh: "/api/v1/auth/refresh-token",
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password",
    verifyEmail: "/api/v1/auth/verify-email",
  },
  profiles: {
    base: "/api/v1/profiles",
    byId: (id: string) => `/api/v1/profiles/${id}`,
    me: "/api/v1/profiles/me",
    search: "/api/v1/search",
    uploadPhoto: "/api/v1/profiles/me/photos",
    deletePhoto: (id: string) => `/api/v1/profiles/me/photos/${id}`,
    setPrimaryPhoto: (id: string) => `/api/v1/profiles/me/photos/${id}/primary`,
  },
  matches: {
    base: "/api/v1/matches",
    daily: "/api/v1/matches/new",
    recommendations: "/api/v1/recommendations",
  },
  interests: {
    send: "/api/v1/interests",
    respond: (id: string) => `/api/v1/interests/${id}/respond`,
    received: "/api/v1/interests/received",
    sent: "/api/v1/interests/sent",
  },
  messages: {
    base: "/api/v1/chat",
    conversations: "/api/v1/chat/conversations",
    conversation: (id: string) => `/api/v1/chat/conversations/${id}`,
    markRead: (id: string) => `/api/v1/chat/messages/${id}/read`,
  },
  subscriptions: {
    base: "/api/v1/subscriptions",
    plans: "/api/v1/subscriptions/plans",
    current: "/api/v1/subscriptions/my",
    createOrder: "/api/v1/subscriptions/create",
    verifyPayment: "/api/v1/payments/verify",
  },
  users: {
    base: "/api/v1/users",
    byId: (id: string) => `/api/v1/users/${id}`,
    updateProfile: "/api/v1/users/me",
    changePassword: "/api/v1/users/change-password",
    deactivate: "/api/v1/users/me",
  },
  admin: {
    dashboard: "/api/v1/admin/dashboard",
    users: "/api/v1/admin/users",
    approveUser: (id: string) => `/api/v1/admin/users/${id}/status`,
    suspendUser: (id: string) => `/api/v1/admin/users/${id}/status`,
    reports: "/api/v1/admin/reports",
    analytics: "/api/v1/admin/analytics",
  },
  notifications: {
    base: "/api/v1/notifications",
    markRead: (id: string) => `/api/v1/notifications/${id}/read`,
    markAllRead: "/api/v1/notifications/read-all",
  },
};
