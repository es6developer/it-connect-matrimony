# Database Architecture

## Database Selection Rationale

### MySQL (Primary Database)

**Why MySQL**: The platform requires strong ACID compliance for financial transactions, referential integrity for complex relational data (profiles, interests, matches, messages), and support for complex JOIN operations across user and profile data.

| Feature | Requirement | MySQL Capability |
|---------|-------------|------------------|
| ACID Compliance | Critical for payments | InnoDB with full ACID |
| Foreign Keys | Referential integrity | Foreign key constraints |
| JSON Support | Flexible profile fields | JSON column type |
| Full-Text Search | Basic profile search | Built-in full-text indexes |
| Replication | High availability | Multi-AZ + Read replicas |
| Maturity | Production stability | Battle-tested at scale |

**Configuration**:
- Engine: InnoDB
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Version: MySQL 8.0
- Max connections: 500

### Redis (Cache & Queue)

**Why Redis**: Ultra-low latency caching, atomic operations for rate limiting, OTP/token storage with TTL, BullMQ job queue backend, WebSocket pub/sub for real-time features.

| Use Case | Data Structure |
|----------|---------------|
| OTP storage | String with TTL |
| Refresh tokens | String with TTL |
| Rate limiting | Sorted Set / String with TTL |
| Session cache | Hash with TTL |
| BullMQ queues | Lists, Sorted Sets, Streams |
| WebSocket pub/sub | Pub/Sub channels |
| Cache-aside | Strings (JSON serialized) |
| Distributed locks | Redlock algorithm |

### Elasticsearch (Search Engine)

**Why Elasticsearch**: Complex filtered search across 30+ profile attributes with relevance scoring, fuzzy matching for name search, aggregations for filter facets, and fast full-text search capabilities that MySQL cannot provide at scale.

| Feature | Benefit |
|---------|--------|
| Full-text search | Name, education, occupation search |
| Filter aggregations | Faceted search counts |
| Geo-distance | Location-based search |
| Fuzzy matching | Typo-tolerant name search |
| Custom scoring | Compatibility-weighted results |
| Near real-time | Index updates within 1s |

## Schema Design Principles

### Naming Conventions
- **Tables**: `snake_case`, plural (e.g., `users`, `profiles`, `partner_preferences`)
- **Columns**: `snake_case` (e.g., `first_name`, `email_verified_at`)
- **Indexes**: `idx_{table}_{column(s)}` (e.g., `idx_users_email`)
- **Unique constraints**: `uk_{table}_{column(s)}` (e.g., `uk_users_email`)
- **Foreign keys**: `fk_{child_table}_{parent_table}` (implicit via TypeORM)

### Soft Deletes
All user-related tables implement soft deletes using `deleted_at TIMESTAMP NULL`:
- Users: `deleted_at` column for account deactivation
- Conversations: soft delete per participant
- Messages: soft delete for recall
- Photos/Videos: soft delete for recovery

### Audit Columns
Every table includes:
```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL DEFAULT NULL
```

### Entity Relationships

```
users (1) ───── (1) profiles
users (1) ───── (M) photos
users (1) ───── (M) videos
users (1) ───── (1) professional_details
users (1) ───── (M) education_details
users (1) ───── (1) family_details
users (1) ───── (1) lifestyle_details
users (1) ───── (1) horoscope_details
users (1) ───── (M) languages
users (1) ───── (1) partner_preferences
users (1) ───── (M) interests (sender)
users (1) ───── (M) interests (receiver)
users (1) ───── (M) matches
users (1) ───── (M) conversations (via participants)
users (1) ───── (M) messages
users (1) ───── (M) notifications
users (1) ───── (M) payments
users (1) ───── (1) subscriptions
```

## Indexing Strategy

### Table: `users` (~1M rows)
```sql
PRIMARY KEY (id)                                          -- PK, auto-increment
UNIQUE KEY uk_users_uuid (uuid)                           -- UUID lookup
UNIQUE KEY uk_users_email (email)                         -- Login by email
UNIQUE KEY uk_users_phone (phone)                         -- Login by phone
KEY idx_users_status (status)                             -- Admin filtering
KEY idx_users_role (role)                                 -- Admin filtering
KEY idx_users_gender_status_dob (gender, status, date_of_birth) -- Profile search
KEY idx_users_created_at (created_at)                     -- Date range queries
KEY idx_users_deleted_at (deleted_at)                     -- Soft delete filter
```

### Table: `profiles` (~1M rows)
```sql
PRIMARY KEY (id)
UNIQUE KEY uk_profiles_user_id (user_id)
KEY idx_profiles_religion (religion)
KEY idx_profiles_mother_tongue (mother_tongue)
KEY idx_profiles_community (community)
KEY idx_profiles_marital_status (marital_status)
KEY idx_profiles_height (height)
KEY idx_profiles_country_state (country, state)
KEY idx_profiles_diet_smoking_drinking (diet, smoking, drinking)
FULLTEXT KEY ft_profiles_about (about)                    -- Full-text search
```

### Table: `messages` (~50M rows)
```sql
PRIMARY KEY (id)
KEY idx_messages_conversation_id (conversation_id, created_at) -- Conversation timeline
KEY idx_messages_sender_id (sender_id)                    -- User's sent messages
```

### Table: `interests` (~5M rows)
```sql
PRIMARY KEY (id)
UNIQUE KEY uk_interests_from_to (from_user_id, to_user_id) -- Prevent duplicate
KEY idx_interests_from_user (from_user_id, status)        -- Sent interests
KEY idx_interests_to_user (to_user_id, status)            -- Received interests
KEY idx_interests_created_at (created_at)                 -- Recent interests
```

## Migration Strategy

### TypeORM Migrations
```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/AddNewField

# Create empty migration
npm run migration:create -- src/database/migrations/CustomMigration

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Migration Configuration (`database.config.ts`)
```typescript
{
  synchronize: process.env.NODE_ENV !== 'production', // Never auto-sync in prod
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsRun: true,                                // Auto-run on startup
  logging: process.env.NODE_ENV !== 'production',
}
```

### Migration Workflow
1. Developer modifies entity file
2. Run `npm run migration:generate` to create migration file
3. Review and test migration locally
4. Commit migration file alongside entity changes
5. CI/CD runs `npm run migration:run` as part of deployment
6. Rollback: `npm run migration:revert` if needed

### Zero-Downtime Migrations
- **Add column**: `ALTER TABLE ... ADD COLUMN ... DEFAULT NULL` (non-blocking in MySQL 8.0)
- **Add index**: `ALTER TABLE ... ADD INDEX ...` using ALGORITHM=INPLACE, LOCK=NONE
- **Drop column**: Mark as deprecated first, drop in next release
- **Rename column**: Add new column, dual-write, backfill, drop old
- **Large table changes**: Use pt-online-schema-change (Percona Toolkit)

## Sharding Considerations for 1M Users

### Current Architecture
Single MySQL RDS instance with read replicas. Expected to handle 1M users with proper optimization.

### Sharding Trigger Points
- > 50M messages
- > 10M interests/matches
- Database > 500GB
- Write throughput > 5000 TPS

### Proposed Sharding Strategy
**Vertical sharding first** (by service domain):
- `chat_db`: conversations, messages
- `user_db`: users, profiles, profile details
- `social_db`: interests, matches
- `billing_db`: payments, subscriptions, coupons

**Horizontal sharding** (if needed, for messages):
- Shard key: `conversation_id % 16`
- 16 shards for messages table
- Connection routing via proxy (ProxySQL)

### Read Replicas
- Up to 5 read replicas
- Load balance read queries (search, profile views, activity feeds)
- Replica lag monitoring (alert if > 5 seconds)

## Backup and Recovery Strategy

### Automated Backups
| Type | Frequency | Retention | Tool |
|------|-----------|-----------|------|
| Daily snapshot | Daily | 35 days | RDS automated snapshots |
| Weekly snapshot | Weekly | 12 weeks | RDS automated snapshots |
| Monthly snapshot | Monthly | 12 months | Manual snapshot |
| Binary log | Continuous | 24 hours | RDS binlog retention |
| Logical backup | Daily | 7 days | `mysqldump` to S3 |

### Point-in-Time Recovery (PITR)
```bash
# Restore to specific timestamp
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier it-connect-prod-mysql \
  --target-db-instance-identifier it-connect-prod-mysql-pitr \
  --restore-time "2024-01-15T14:30:00Z" \
  --db-instance-class db.r6g.large \
  --multi-az true
```

### Backup to S3
```bash
# Daily logical backup via cron
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --quick \
  -h ${DB_HOST} \
  -u ${DB_USER} \
  -p${DB_PASS} \
  it_connect_matrimony \
  | gzip \
  | aws s3 cp - s3://it-connect-backups/daily/$(date +%Y-%m-%d).sql.gz
```

### Disaster Recovery
| Scenario | RTO | RPO | Recovery Method |
|----------|-----|-----|-----------------|
| Single AZ failure | < 5 min | < 1 sec | Multi-AZ automatic failover |
| Regional failure | < 1 hour | < 5 min | Cross-region read replica promotion |
| Data corruption | < 4 hours | < 24 hours | PITR from snapshot |
| Accidental DROP TABLE | < 2 hours | < 5 min | PITR to new instance |
| Ransomware/Encryption | < 4 hours | < 1 hour | S3 backups + PITR |

### Recovery Testing
- Monthly automated recovery drill in staging
- Quarterly full DR exercise in production-like environment
- Validate data integrity post-recovery
- Document runbook with timings for each scenario
