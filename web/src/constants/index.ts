export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
  },
  PROFILES: {
    BASE: "/api/profiles",
    ME: "/api/profiles/me",
    SEARCH: "/api/profiles/search",
    PHOTOS: "/api/profiles/photos",
  },
  MATCHES: {
    BASE: "/api/matches",
    DAILY: "/api/matches/daily",
    RECOMMENDATIONS: "/api/matches/recommendations",
  },
  INTERESTS: {
    SEND: "/api/interests/send",
    RECEIVED: "/api/interests/received",
    SENT: "/api/interests/sent",
  },
  MESSAGES: {
    BASE: "/api/messages",
    CONVERSATIONS: "/api/messages/conversations",
  },
  SUBSCRIPTIONS: {
    BASE: "/api/subscriptions",
    PLANS: "/api/subscriptions/plans",
    CURRENT: "/api/subscriptions/current",
    CREATE_ORDER: "/api/subscriptions/create-order",
    VERIFY_PAYMENT: "/api/subscriptions/verify-payment",
  },
  USERS: {
    BASE: "/api/users",
    PROFILE: "/api/users/profile",
    CHANGE_PASSWORD: "/api/users/change-password",
  },
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    USERS: "/api/admin/users",
    REPORTS: "/api/admin/reports",
    ANALYTICS: "/api/admin/analytics",
  },
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    READ_ALL: "/api/notifications/read-all",
  },
} as const;

export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  DASHBOARD: "/dashboard",
  PROFILE: {
    VIEW: (id: string) => `/profile/${id}`,
    SETUP: "/profile/setup",
    EDIT: "/profile/edit",
    PHOTOS: "/profile/photos",
  },
  SEARCH: "/search",
  MATCHES: {
    BASE: "/matches",
    DAILY: "/matches/daily",
    RECOMMENDATIONS: "/matches/recommendations",
  },
  INTERESTS: {
    RECEIVED: "/interests/received",
    SENT: "/interests/sent",
  },
  MESSAGES: {
    BASE: "/messages",
    CONVERSATION: (id: string) => `/messages/${id}`,
  },
  SUBSCRIPTIONS: {
    PLANS: "/subscriptions/plans",
    CURRENT: "/subscriptions/current",
    HISTORY: "/subscriptions/history",
  },
  SETTINGS: {
    BASE: "/settings",
    ACCOUNT: "/settings/account",
    PREFERENCES: "/settings/preferences",
    NOTIFICATIONS: "/settings/notifications",
    PRIVACY: "/settings/privacy",
    SECURITY: "/settings/security",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    REPORTS: "/admin/reports",
    ANALYTICS: "/admin/analytics",
    SETTINGS: "/admin/settings",
  },
  HELP: {
    FAQ: "/help/faq",
    CONTACT: "/help/contact",
    SAFETY: "/help/safety",
    TERMS: "/help/terms",
    PRIVACY: "/help/privacy",
  },
} as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    tier: "free" as const,
    price: 0,
    currency: "INR",
    durationDays: Infinity,
    isPopular: false,
    features: {
      dailyMatches: 5,
      canSendMessages: false,
      canSeePhotos: false,
      canSeeWhoLiked: false,
      canUseAdvancedFilters: false,
      canHighlightProfile: false,
      canSeeReadReceipts: false,
      prioritySupport: false,
      profileBadge: false,
      incognitoMode: false,
    },
  },
  {
    id: "basic",
    name: "Basic",
    tier: "basic" as const,
    price: 499,
    currency: "INR",
    durationDays: 30,
    isPopular: false,
    savings: null,
    features: {
      dailyMatches: 10,
      canSendMessages: true,
      canSeePhotos: true,
      canSeeWhoLiked: false,
      canUseAdvancedFilters: false,
      canHighlightProfile: false,
      canSeeReadReceipts: false,
      prioritySupport: false,
      profileBadge: false,
      incognitoMode: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    tier: "premium" as const,
    price: 999,
    currency: "INR",
    durationDays: 30,
    isPopular: true,
    savings: null,
    features: {
      dailyMatches: 20,
      canSendMessages: true,
      canSeePhotos: true,
      canSeeWhoLiked: true,
      canUseAdvancedFilters: true,
      canHighlightProfile: true,
      canSeeReadReceipts: false,
      prioritySupport: false,
      profileBadge: true,
      incognitoMode: false,
    },
  },
  {
    id: "platinum",
    name: "Platinum",
    tier: "platinum" as const,
    price: 1999,
    currency: "INR",
    durationDays: 30,
    isPopular: false,
    savings: null,
    features: {
      dailyMatches: 50,
      canSendMessages: true,
      canSeePhotos: true,
      canSeeWhoLiked: true,
      canUseAdvancedFilters: true,
      canHighlightProfile: true,
      canSeeReadReceipts: true,
      prioritySupport: true,
      profileBadge: true,
      incognitoMode: true,
    },
  },
] as const;

export const TECH_CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
  { value: "cloud", label: "Cloud" },
  { value: "database", label: "Database" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "data_science", label: "Data Science" },
  { value: "cybersecurity", label: "Cyber Security" },
  { value: "blockchain", label: "Blockchain" },
  { value: "qa_testing", label: "QA & Testing" },
  { value: "design", label: "Design" },
  { value: "management", label: "Management" },
  { value: "other", label: "Other" },
] as const;

export const TECH_SKILLS_BY_CATEGORY: Record<string, string[]> = {
  frontend: ["React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
  backend: ["Node.js", "Express", "Django", "Flask", "Spring Boot", "ASP.NET", "Ruby on Rails", "Go", "Rust", "PHP", "Laravel"],
  fullstack: ["MERN", "MEAN", "JAMstack", "Serverless"],
  mobile: ["React Native", "Flutter", "Swift", "Kotlin", "Ionic", "Xamarin"],
  devops: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "GitLab CI", "Terraform", "Ansible", "Chef", "Puppet"],
  cloud: ["AWS", "Azure", "GCP", "Cloudflare", "Heroku", "Vercel", "Netlify"],
  database: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Cassandra", "DynamoDB", "Firebase"],
  ai_ml: ["TensorFlow", "PyTorch", "Scikit-learn", "OpenAI", "LangChain", "Hugging Face"],
  data_science: ["Python", "R", "Pandas", "NumPy", "Tableau", "Power BI", "Apache Spark"],
  cybersecurity: ["Penetration Testing", "Ethical Hacking", "Cryptography", "SIEM", "Zero Trust"],
  blockchain: ["Solidity", "Ethereum", "Hyperledger", "Web3.js", "Smart Contracts"],
  qa_testing: ["Selenium", "Cypress", "Jest", "Playwright", "JUnit", "Postman"],
  design: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "UI/UX"],
  management: ["Agile", "Scrum", "Jira", "Confluence", "Product Management", "Project Management"],
  other: ["Technical Writing", "System Architecture", "Microservices"],
};

export const INDIAN_LANGUAGES = [
  "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu",
  "Gujarati", "Malayalam", "Kannada", "Odia", "Punjabi",
  "Assamese", "Maithili", "Sanskrit", "English",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const RELIGIOUS_BACKGROUNDS = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "christian", label: "Christian" },
  { value: "sikh", label: "Sikh" },
  { value: "jain", label: "Jain" },
  { value: "buddhist", label: "Buddhist" },
  { value: "other", label: "Other" },
] as const;

export const MARITAL_STATUSES = [
  { value: "never_married", label: "Never Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "self_employed", label: "Self Employed" },
  { value: "business", label: "Business" },
  { value: "not_working", label: "Not Working" },
] as const;

export const FAMILY_TYPES = [
  { value: "nuclear", label: "Nuclear" },
  { value: "joint", label: "Joint" },
  { value: "extended", label: "Extended" },
] as const;

export const FAMILY_VALUES = [
  { value: "traditional", label: "Traditional" },
  { value: "moderate", label: "Moderate" },
  { value: "liberal", label: "Liberal" },
] as const;

export const AGE_RANGE = { MIN: 18, MAX: 70 } as const;
export const HEIGHT_RANGE = { MIN: 100, MAX: 250 } as const;
export const INCOME_RANGE = { MIN: 0, MAX: 100_000_000 } as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_PHOTOS: 10,
  MAX_FILE_SIZE_MB: 5,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/heic"],
} as const;

export const QUERY_KEYS = {
  PROFILE: {
    ME: ["profile", "me"],
    BY_ID: (id: string) => ["profile", id],
    PHOTOS: ["profile", "photos"],
  },
  MATCHES: {
    ALL: ["matches"],
    DAILY: ["matches", "daily"],
    RECOMMENDATIONS: ["matches", "recommendations"],
  },
  INTERESTS: {
    RECEIVED: ["interests", "received"],
    SENT: ["interests", "sent"],
  },
  MESSAGES: {
    CONVERSATIONS: ["messages", "conversations"],
    CONVERSATION: (id: string) => ["messages", "conversation", id],
  },
  SUBSCRIPTIONS: {
    PLANS: ["subscriptions", "plans"],
    CURRENT: ["subscriptions", "current"],
  },
  SEARCH: (filters: Record<string, unknown>) => ["search", filters],
  NOTIFICATIONS: ["notifications"],
  USERS: {
    ALL: ["users"],
    BY_ID: (id: string) => ["users", id],
  },
  ADMIN: {
    DASHBOARD: ["admin", "dashboard"],
    USERS: ["admin", "users"],
    ANALYTICS: ["admin", "analytics"],
  },
} as const;

export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  MESSAGE: {
    SEND: "message:send",
    RECEIVE: "message:receive",
    READ: "message:read",
    TYPING: "message:typing",
    STOP_TYPING: "message:stop-typing",
  },
  NOTIFICATION: {
    NEW: "notification:new",
  },
  INTEREST: {
    RECEIVED: "interest:received",
    RESPONSE: "interest:response",
  },
  MATCH: {
    NEW: "match:new",
  },
  USER: {
    ONLINE: "user:online",
    OFFLINE: "user:offline",
    TYPING: "user:typing",
  },
} as const;

export const APP_NAME = "IT Connect Matrimony";
export const APP_DESCRIPTION = "Find your perfect tech match. A matrimony platform for IT professionals.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
