export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum MaritalStatus {
  NEVER_MARRIED = 'never_married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
  AWAITING_DIVORCE = 'awaiting_divorce',
}

export enum WorkMode {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  OFFICE = 'office',
}

export enum Diet {
  VEGETARIAN = 'vegetarian',
  NON_VEGETARIAN = 'non_vegetarian',
  EGGETARIAN = 'eggetarian',
  JAIN = 'jain',
  VEGAN = 'vegan',
}

export enum Smoking {
  YES = 'yes',
  NO = 'no',
  OCCASIONALLY = 'occasionally',
}

export enum Drinking {
  YES = 'yes',
  NO = 'no',
  SOCIALLY = 'socially',
}

export enum FamilyType {
  NUCLEAR = 'nuclear',
  JOINT = 'joint',
  EXTENDED = 'extended',
}

export enum FamilyStatus {
  MIDDLE_CLASS = 'middle_class',
  UPPER_MIDDLE_CLASS = 'upper_middle_class',
  RICH = 'rich',
  AFFLUENT = 'affluent',
}

export enum FamilyValues {
  TRADITIONAL = 'traditional',
  MODERATE = 'moderate',
  LIBERAL = 'liberal',
}

export enum InterestStatus {
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  TRIAL = 'trial',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
  IDENTITY = 'identity',
  PHOTO = 'photo',
  ADDRESS = 'address',
  INCOME = 'income',
  EDUCATION = 'education',
}

export enum NotificationType {
  MATCH = 'match',
  MESSAGE = 'message',
  INTEREST = 'interest',
  LIKE = 'like',
  VIEW = 'view',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  PROMOTIONAL = 'promotional',
  REMINDER = 'reminder',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  PHOTO_UPLOAD = 'photo_upload',
  INTEREST_SENT = 'interest_sent',
  INTEREST_ACCEPTED = 'interest_accepted',
  MESSAGE_SENT = 'message_sent',
  SEARCH_PERFORMED = 'search_performed',
  SUBSCRIPTION_CHANGED = 'subscription_changed',
  PAYMENT_MADE = 'payment_made',
  PASSWORD_CHANGED = 'password_changed',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
}

export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
}

export enum OAuthProvider {
  GOOGLE = 'google',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum Religion {
  HINDU = 'hindu',
  MUSLIM = 'muslim',
  CHRISTIAN = 'christian',
  SIKH = 'sikh',
  JAIN = 'jain',
  BUDDHIST = 'buddhist',
  PARSI = 'parsi',
  OTHER = 'other',
}

export enum MotherTongue {
  HINDI = 'hindi',
  ENGLISH = 'english',
  TAMIL = 'tamil',
  TELUGU = 'telugu',
  KANNADA = 'kannada',
  MALAYALAM = 'malayalam',
  MARATHI = 'marathi',
  GUJARATI = 'gujarati',
  BENGALI = 'bengali',
  PUNJABI = 'punjabi',
  ORIYA = 'oriya',
  URDU = 'urdu',
  OTHER = 'other',
}
