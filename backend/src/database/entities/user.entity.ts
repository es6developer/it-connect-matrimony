import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, OneToOne, OneToMany, Index,
} from 'typeorm';
import { UserRole, UserStatus, Gender, OAuthProvider } from '../../common/enums';
import { Profile } from './profile.entity';
import { ProfessionalDetail } from './professional-detail.entity';
import { EducationDetail } from './education-detail.entity';
import { FamilyDetail } from './family-detail.entity';
import { LifestyleDetail } from './lifestyle-detail.entity';
import { Language } from './language.entity';
import { HoroscopeDetail } from './horoscope-detail.entity';
import { Photo } from './photo.entity';
import { Video } from './video.entity';
import { PartnerPreference } from './partner-preference.entity';
import { Interest } from './interest.entity';
import { Match } from './match.entity';
import { Conversation } from './conversation.entity';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from './message.entity';
import { Subscription } from './subscription.entity';
import { Payment } from './payment.entity';
import { Coupon } from './coupon.entity';
import { CouponRedemption } from './coupon-redemption.entity';
import { Notification } from './notification.entity';
import { DeviceToken } from './device-token.entity';
import { Session } from './session.entity';
import { VerificationRecord } from './verification-record.entity';
import { Report } from './report.entity';
import { BlockedUser } from './blocked-user.entity';
import { Ticket } from './ticket.entity';
import { TicketReply } from './ticket-reply.entity';
import { AdminUser } from './admin-user.entity';
import { ActivityLog } from './activity-log.entity';
import { SearchHistory } from './search-history.entity';
import { SavedSearch } from './saved-search.entity';
import { DailyRecommendation } from './daily-recommendation.entity';
import { ProfileView } from './profile-view.entity';
import { UserActivity } from './user-activity.entity';
import { GdprConsent } from './gdpr-consent.entity';
import { DataRetentionLog } from './data-retention-log.entity';
import { Blog } from './blog.entity';
import { Feedback } from './feedback.entity';
import { UserActivity as UserActivityEntity } from './user-activity.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret: string | null;

  @Column({ type: 'text', nullable: true })
  twoFactorRecoveryCodes: string | null;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  profileCompletionPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'json', nullable: true })
  deviceInfo: object | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referralCode: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  referredBy: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  oauthProvider: OAuthProvider | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  oauthId: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToOne(() => ProfessionalDetail, (pd) => pd.user)
  professionalDetail: ProfessionalDetail;

  @OneToMany(() => EducationDetail, (ed) => ed.user)
  educationDetails: EducationDetail[];

  @OneToOne(() => FamilyDetail, (fd) => fd.user)
  familyDetail: FamilyDetail;

  @OneToOne(() => LifestyleDetail, (ld) => ld.user)
  lifestyleDetail: LifestyleDetail;

  @OneToMany(() => Language, (lang) => lang.user)
  languages: Language[];

  @OneToOne(() => HoroscopeDetail, (hd) => hd.user)
  horoscopeDetail: HoroscopeDetail;

  @OneToMany(() => Photo, (photo) => photo.user)
  photos: Photo[];

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToOne(() => PartnerPreference, (pp) => pp.user)
  partnerPreference: PartnerPreference;

  @OneToMany(() => Interest, (interest) => interest.fromUser)
  sentInterests: Interest[];

  @OneToMany(() => Interest, (interest) => interest.toUser)
  receivedInterests: Interest[];

  @OneToMany(() => Match, (match) => match.user)
  matches: Match[];

  @OneToMany(() => Match, (match) => match.matchedUser)
  matchedWith: Match[];

  @OneToMany(() => Conversation, (conv) => conv.createdBy)
  createdConversations: Conversation[];

  @OneToMany(() => ConversationParticipant, (cp) => cp.user)
  conversationParticipants: ConversationParticipant[];

  @OneToMany(() => Message, (msg) => msg.sender)
  sentMessages: Message[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Coupon, (coupon) => coupon.createdBy)
  createdCoupons: Coupon[];

  @OneToMany(() => CouponRedemption, (cr) => cr.user)
  couponRedemptions: CouponRedemption[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications: Notification[];

  @OneToMany(() => DeviceToken, (dt) => dt.user)
  deviceTokens: DeviceToken[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => VerificationRecord, (vr) => vr.user)
  verificationRecords: VerificationRecord[];

  @OneToMany(() => VerificationRecord, (vr) => vr.verifiedBy)
  verifiedRecords: VerificationRecord[];

  @OneToMany(() => Report, (report) => report.reporter)
  filedReports: Report[];

  @OneToMany(() => Report, (report) => report.reportedUser)
  receivedReports: Report[];

  @OneToMany(() => Report, (report) => report.assignedTo)
  assignedReports: Report[];

  @OneToMany(() => BlockedUser, (bu) => bu.blocker)
  blockedUsers: BlockedUser[];

  @OneToMany(() => BlockedUser, (bu) => bu.blocked)
  blockedBy: BlockedUser[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
  assignedTickets: Ticket[];

  @OneToMany(() => TicketReply, (tr) => tr.user)
  ticketReplies: TicketReply[];

  @OneToOne(() => AdminUser, (au) => au.user)
  adminUser: AdminUser;

  @OneToMany(() => ActivityLog, (al) => al.user)
  activityLogs: ActivityLog[];

  @OneToMany(() => SearchHistory, (sh) => sh.user)
  searchHistories: SearchHistory[];

  @OneToMany(() => SavedSearch, (ss) => ss.user)
  savedSearches: SavedSearch[];

  @OneToMany(() => DailyRecommendation, (dr) => dr.user)
  dailyRecommendations: DailyRecommendation[];

  @OneToMany(() => DailyRecommendation, (dr) => dr.recommendedUser)
  recommendedTo: DailyRecommendation[];

  @OneToMany(() => ProfileView, (pv) => pv.viewer)
  viewedProfiles: ProfileView[];

  @OneToMany(() => ProfileView, (pv) => pv.viewedUser)
  profileViews: ProfileView[];

  @OneToMany(() => UserActivityEntity, (ua) => ua.user)
  userActivities: UserActivityEntity[];

  @OneToMany(() => GdprConsent, (gc) => gc.user)
  gdprConsents: GdprConsent[];

  @OneToMany(() => DataRetentionLog, (drl) => drl.user)
  dataRetentionLogs: DataRetentionLog[];

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];

  @OneToMany(() => Feedback, (fb) => fb.user)
  feedbacks: Feedback[];
}
