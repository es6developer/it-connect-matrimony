export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  role: 'user' | 'premium';
  isVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  company?: string;
  education: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  bio: string;
  photos: string[];
  techStack?: string[];
  interests: string[];
  height?: number;
  religion?: string;
  motherTongue?: string;
  maritalStatus: 'never_married' | 'divorced' | 'widowed' | 'separated';
  annualIncome?: string;
  familyBackground?: string;
  horoscope?: string;
  isVerified: boolean;
  isPremium: boolean;
  lastActive: string;
  compatibilityScore?: number;
}

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  matchType: 'mutual' | 'admin' | 'self';
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  matchedAt: string;
  user: Profile;
}

export interface Interest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'sent' | 'accepted' | 'rejected' | 'pending';
  message?: string;
  createdAt: string;
  updatedAt: string;
  user: Profile;
}

export interface Message {
  _id: string;
  text: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isTyping?: boolean;
}

export interface Recommendation {
  id: string;
  userId: string;
  compatibilityScore: number;
  mutualInterests: string[];
  profile: Profile;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OtpPayload {
  email: string;
  otp: string;
}

export interface FilterOptions {
  ageRange: [number, number];
  gender?: string[];
  location?: string[];
  occupation?: string[];
  education?: string[];
  techStack?: string[];
  interests?: string[];
  maritalStatus?: string[];
  incomeRange?: [number, number];
  sortBy?: 'relevance' | 'age' | 'lastActive' | 'newest';
}

export interface DashboardStats {
  profileViews: number;
  totalInterests: number;
  totalMatches: number;
  newLikes: number;
}

export interface ActivityItem {
  id: string;
  type: 'view' | 'interest' | 'match' | 'message';
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
}

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Dashboard: undefined;
  ChatDetail: { conversationId?: string; recipientId?: number; recipientName?: string };
  ProfileView: { userId: number };
  PhotoManager: { photos: any[] };
  Notifications: undefined;
  Subscriptions: undefined;
  Support: undefined;
  Settings: undefined;
  EditProfile: undefined;
  MatchDetail: { user: any };
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Otp: { email: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Matches: undefined;
  Chat: undefined;
  Profile: undefined;
};

export interface Notification {
  id: number;
  type: string;
  title: string;
  description?: string;
  isRead: boolean;
  createdAt: string;
}
