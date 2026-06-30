export type UserRole = "user" | "admin";
export type SubscriptionTier = "free" | "basic" | "premium" | "platinum";
export type InterestStatus = "pending" | "accepted" | "declined" | "withdrawn";
export type Gender = "male" | "female" | "other";
export type MaritalStatus = "never_married" | "divorced" | "widowed" | "separated";
export type ReligiousBackground = "hindu" | "muslim" | "christian" | "sikh" | "jain" | "buddhist" | "other";
export type DietPreference = "vegetarian" | "non_vegetarian" | "eggetarian" | "vegan";
export type DrinkingHabit = "yes" | "no" | "socially";
export type SmokingHabit = "yes" | "no" | "occasionally";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  isProfileCompleted: boolean;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  user?: User;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  maritalStatus: MaritalStatus;
  religiousBackground: ReligiousBackground;
  caste?: string;
  subcaste?: string;
  gotra?: string;
  motherTongue: string;
  dietPreference: DietPreference;
  drinkingHabit: DrinkingHabit;
  smokingHabit: SmokingHabit;
  height: number;
  weight?: number;
  bloodGroup?: string;
  disability?: string;

  education: EducationDetail[];
  highestEducation: string;
  college?: string;
  employedIn: "government" | "private" | "self_employed" | "business" | "not_working";
  occupation: string;
  annualIncome: number;
  currency: string;
  organization?: string;
  workLocation?: string;

  techStack: TechStack[];

  about?: string;
  hobbies: string[];
  interests: string[];
  languages: string[];

  photos: Photo[];
  profilePhotoUrl?: string;

  address?: Address;
  city: string;
  state: string;
  country: string;
  citizenship?: string;

  family: FamilyDetail;

  preferences?: MatchPreference;

  isVerified: boolean;
  isActive: boolean;
  lastActive: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationDetail {
  id?: string;
  degree: string;
  institution: string;
  year: number;
  field?: string;
  grade?: string;
}

export interface TechStack {
  id?: string;
  category: TechCategory;
  skills: string[];
  experienceYears?: number;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export type TechCategory =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "cloud"
  | "database"
  | "ai_ml"
  | "data_science"
  | "cybersecurity"
  | "blockchain"
  | "qa_testing"
  | "design"
  | "management"
  | "other";

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  isVerified: boolean;
  uploadedAt: string;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
}

export interface FamilyDetail {
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: number;
  brothers?: number;
  sisters?: number;
  familyType?: "nuclear" | "joint" | "extended";
  familyStatus?: "upper_middle" | "middle" | "lower_middle" | "affluent";
  familyValues?: "traditional" | "moderate" | "liberal";
}

export interface MatchPreference {
  ageMin: number;
  ageMax: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus: MaritalStatus[];
  religiousBackground: ReligiousBackground[];
  caste?: string[];
  motherTongue?: string[];
  dietPreference?: DietPreference[];
  drinkingHabit?: DrinkingHabit[];
  smokingHabit?: SmokingHabit[];
  employedIn?: string[];
  occupation?: string[];
  education?: string[];
  incomeMin?: number;
  incomeMax?: number;
  city?: string[];
  state?: string[];
  country?: string[];
  techCategories?: TechCategory[];
  techSkills?: string[];
  languages?: string[];
}

export interface Match {
  id: string;
  profileId: string;
  matchedProfileId: string;
  profile: Profile;
  matchedProfile: Profile;
  score: number;
  compatibility: CompatibilityBreakdown;
  status: "pending" | "interested" | "shortlisted" | "contacted";
  isDailyMatch: boolean;
  matchedAt: string;
  expiresAt?: string;
}

export interface CompatibilityBreakdown {
  overall: number;
  techStack: number;
  education: number;
  location: number;
  age: number;
  interests: number;
  background: number;
}

export interface Interest {
  id: string;
  senderId: string;
  receiverId: string;
  sender: Profile;
  receiver: Profile;
  status: InterestStatus;
  message?: string;
  sentAt: string;
  respondedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file" | "voice";
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  profileId: string;
  name: string;
  profilePhotoUrl?: string;
  lastSeen?: string;
  isOnline: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  amount: number;
  currency: string;
  features: SubscriptionFeatures;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFeatures {
  dailyMatches: number;
  canSendMessages: boolean;
  canSeePhotos: boolean;
  canSeeWhoLiked: boolean;
  canUseAdvancedFilters: boolean;
  canHighlightProfile: boolean;
  canSeeReadReceipts: boolean;
  prioritySupport: boolean;
  profileBadge: boolean;
  incognitoMode: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  durationDays: number;
  features: SubscriptionFeatures;
  isPopular: boolean;
  savings?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "interest_received"
    | "interest_accepted"
    | "interest_declined"
    | "new_message"
    | "daily_match"
    | "profile_view"
    | "subscription_expiring"
    | "subscription_activated"
    | "admin_announcement"
    | "verification_status";
  title: string;
  description?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SearchFilters {
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  maritalStatus?: MaritalStatus[];
  religiousBackground?: ReligiousBackground[];
  caste?: string;
  motherTongue?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  occupation?: string;
  employedIn?: string;
  incomeMin?: number;
  incomeMax?: number;
  dietPreference?: DietPreference;
  drinkingHabit?: DrinkingHabit;
  smokingHabit?: SmokingHabit;
  techCategories?: TechCategory[];
  techSkills?: string[];
  heightMin?: number;
  heightMax?: number;
  languages?: string[];
  hasPhoto?: boolean;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  profileViews: number;
  totalMatches: number;
  newInterests: number;
  unreadMessages: number;
  dailyMatches: number;
  profileCompletion: number;
  subscriptionStatus: SubscriptionTier;
  subscriptionDaysLeft: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  newUsersToday: number;
  totalMatches: number;
  totalInterests: number;
  totalMessages: number;
  revenue: number;
  revenueThisMonth: number;
  userGrowth: { date: string; count: number }[];
  subscriptionDistribution: Record<SubscriptionTier, number>;
  genderDistribution: Record<Gender, number>;
}
