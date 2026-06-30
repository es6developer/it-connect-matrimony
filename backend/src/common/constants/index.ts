export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  DELETED: 'deleted',
} as const;

export const PLAN_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  VIP: 'vip',
} as const;

export const VERIFICATION_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
  IDENTITY: 'identity',
  PHOTO: 'photo',
  ADDRESS: 'address',
  INCOME: 'income',
  EDUCATION: 'education',
} as const;

export const NOTIFICATION_TYPES = {
  MATCH: 'match',
  MESSAGE: 'message',
  INTEREST: 'interest',
  LIKE: 'like',
  VIEW: 'view',
  SUBSCRIPTION: 'subscription',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  PROMOTIONAL: 'promotional',
  REMINDER: 'reminder',
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  ACCOUNT_PENDING: 'ACCOUNT_PENDING',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

  // File
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Rate Limit
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // External Services
  SMS_FAILED: 'SMS_FAILED',
  EMAIL_FAILED: 'EMAIL_FAILED',
  PUSH_FAILED: 'PUSH_FAILED',

  // Internal
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  THIRD_PARTY_ERROR: 'THIRD_PARTY_ERROR',
} as const;

export const MATCH_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
} as const;

export const INTEREST_STATUS = {
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
} as const;

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export const MARITAL_STATUS = {
  NEVER_MARRIED: 'never_married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  SEPARATED: 'separated',
  AWAITING_DIVORCE: 'awaiting_divorce',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  TRIAL: 'trial',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const PAYMENT_GATEWAY = {
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
} as const;

export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATE: 'profile_update',
  PHOTO_UPLOAD: 'photo_upload',
  INTEREST_SENT: 'interest_sent',
  INTEREST_ACCEPTED: 'interest_accepted',
  MESSAGE_SENT: 'message_sent',
  SEARCH_PERFORMED: 'search_performed',
  SUBSCRIPTION_CHANGED: 'subscription_changed',
  PAYMENT_MADE: 'payment_made',
  PASSWORD_CHANGED: 'password_changed',
  EMAIL_VERIFIED: 'email_verified',
  PHONE_VERIFIED: 'phone_verified',
} as const;

export const DIET = {
  VEGETARIAN: 'vegetarian',
  NON_VEGETARIAN: 'non_vegetarian',
  EGGETARIAN: 'eggetarian',
  JAIN: 'jain',
  VEGAN: 'vegan',
} as const;

export const SMOKING = {
  YES: 'yes',
  NO: 'no',
  OCCASIONALLY: 'occasionally',
} as const;

export const DRINKING = {
  YES: 'yes',
  NO: 'no',
  SOCIALLY: 'socially',
} as const;

export const FAMILY_TYPE = {
  NUCLEAR: 'nuclear',
  JOINT: 'joint',
  EXTENDED: 'extended',
} as const;

export const FAMILY_STATUS = {
  MIDDLE_CLASS: 'middle_class',
  UPPER_MIDDLE_CLASS: 'upper_middle_class',
  RICH: 'rich',
  AFFLUENT: 'affluent',
} as const;

export const FAMILY_VALUES = {
  TRADITIONAL: 'traditional',
  MODERATE: 'moderate',
  LIBERAL: 'liberal',
} as const;

export const WORK_MODE = {
  REMOTE: 'remote',
  HYBRID: 'hybrid',
  OFFICE: 'office',
} as const;
