import { Request } from 'express';
import { UserRole, UserStatus } from '../enums';

export interface JwtPayload {
  sub: string;
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  key?: string;
  location?: string;
}

export interface UploadedFileResponse {
  key: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserFilterOptions {
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  motherTongue?: string;
  country?: string;
  state?: string;
  city?: string;
  maritalStatus?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  education?: string;
  occupation?: string;
  minIncome?: number;
  maxIncome?: number;
}

export interface MatchFilters extends UserFilterOptions {
  hasPhoto?: boolean;
  isVerified?: boolean;
  onlineNow?: boolean;
}

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  recipientId: string;
  data?: Record<string, unknown>;
  channels?: string[];
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, unknown>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface SmsOptions {
  to: string;
  body: string;
}

export interface PushNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface WebhookEvent {
  gateway: string;
  event: string;
  payload: Record<string, unknown>;
  signature: string;
}

export interface CacheOptions {
  key: string;
  ttl?: number;
}

export interface RateLimitOptions {
  ttl: number;
  limit: number;
}

export interface SearchQuery {
  index: string;
  query: Record<string, unknown>;
  from?: number;
  size?: number;
  sort?: string[];
}

export interface QueueJobData<T = unknown> {
  type: string;
  payload: T;
  attempts?: number;
  priority?: number;
  delay?: number;
}
