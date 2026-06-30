-- ===================================================================
-- IT Connect Matrimony - Complete Database Schema
-- Platform for IT professionals to find their ideal life partner
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ===================================================================

-- -----------------------------------------------------------
-- DROP ALL TABLES (in reverse dependency order)
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `site_settings` CASCADE;
DROP TABLE IF EXISTS `feedback` CASCADE;
DROP TABLE IF EXISTS `faqs` CASCADE;
DROP TABLE IF EXISTS `blogs` CASCADE;
DROP TABLE IF EXISTS `data_retention_logs` CASCADE;
DROP TABLE IF EXISTS `gdpr_consents` CASCADE;
DROP TABLE IF EXISTS `user_activities` CASCADE;
DROP TABLE IF EXISTS `profile_views` CASCADE;
DROP TABLE IF EXISTS `daily_recommendations` CASCADE;
DROP TABLE IF EXISTS `saved_searches` CASCADE;
DROP TABLE IF EXISTS `search_history` CASCADE;
DROP TABLE IF EXISTS `audit_logs` CASCADE;
DROP TABLE IF EXISTS `activity_logs` CASCADE;
DROP TABLE IF EXISTS `admin_users` CASCADE;
DROP TABLE IF EXISTS `ticket_replies` CASCADE;
DROP TABLE IF EXISTS `tickets` CASCADE;
DROP TABLE IF EXISTS `blocked_users` CASCADE;
DROP TABLE IF EXISTS `reports` CASCADE;
DROP TABLE IF EXISTS `verification_records` CASCADE;
DROP TABLE IF EXISTS `sessions` CASCADE;
DROP TABLE IF EXISTS `device_tokens` CASCADE;
DROP TABLE IF EXISTS `notification_templates` CASCADE;
DROP TABLE IF EXISTS `notifications` CASCADE;
DROP TABLE IF EXISTS `coupon_redemptions` CASCADE;
DROP TABLE IF EXISTS `coupons` CASCADE;
DROP TABLE IF EXISTS `payments` CASCADE;
DROP TABLE IF EXISTS `subscriptions` CASCADE;
DROP TABLE IF EXISTS `messages` CASCADE;
DROP TABLE IF EXISTS `conversation_participants` CASCADE;
DROP TABLE IF EXISTS `conversations` CASCADE;
DROP TABLE IF EXISTS `matches` CASCADE;
DROP TABLE IF EXISTS `interests` CASCADE;
DROP TABLE IF EXISTS `partner_preferences` CASCADE;
DROP TABLE IF EXISTS `videos` CASCADE;
DROP TABLE IF EXISTS `photos` CASCADE;
DROP TABLE IF EXISTS `horoscope_details` CASCADE;
DROP TABLE IF EXISTS `languages` CASCADE;
DROP TABLE IF EXISTS `lifestyle_details` CASCADE;
DROP TABLE IF EXISTS `family_details` CASCADE;
DROP TABLE IF EXISTS `education_details` CASCADE;
DROP TABLE IF EXISTS `professional_details` CASCADE;
DROP TABLE IF EXISTS `profiles` CASCADE;
DROP TABLE IF EXISTS `users` CASCADE;

-- ===================================================================
-- 1. users
-- ===================================================================
CREATE TABLE `users` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `email`                 VARCHAR(255)        NOT NULL,
    `phone`                 VARCHAR(20)         DEFAULT NULL,
    `password_hash`         VARCHAR(255)        NOT NULL,
    `first_name`            VARCHAR(100)        NOT NULL,
    `last_name`             VARCHAR(100)        NOT NULL,
    `date_of_birth`         DATE                DEFAULT NULL,
    `gender`                ENUM('male','female','other','prefer_not_to_say') NOT NULL DEFAULT 'prefer_not_to_say',
    `role`                  ENUM('guest','registered','premium','verified','moderator','admin','super_admin','customer_support') NOT NULL DEFAULT 'registered',
    `status`                ENUM('active','inactive','suspended','deleted') NOT NULL DEFAULT 'active',
    `email_verified_at`     TIMESTAMP           NULL DEFAULT NULL,
    `phone_verified_at`     TIMESTAMP           NULL DEFAULT NULL,
    `is_two_factor_enabled` TINYINT(1)          NOT NULL DEFAULT 0,
    `two_factor_secret`     VARCHAR(255)        DEFAULT NULL,
    `two_factor_recovery_codes` TEXT            DEFAULT NULL,
    `profile_completion_percentage` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `last_login_at`         TIMESTAMP           NULL DEFAULT NULL,
    `last_active_at`        TIMESTAMP           NULL DEFAULT NULL,
    `ip_address`            VARCHAR(45)         DEFAULT NULL,
    `device_info`           JSON                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`            TIMESTAMP           NULL DEFAULT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_uuid` (`uuid`),
    UNIQUE KEY `uk_users_email` (`email`),
    UNIQUE KEY `uk_users_phone` (`phone`),
    KEY `idx_users_status` (`status`),
    KEY `idx_users_role` (`role`),
    KEY `idx_users_gender` (`gender`),
    KEY `idx_users_gender_status_dob` (`gender`, `status`, `date_of_birth`),
    KEY `idx_users_created_at` (`created_at`),
    KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 2. profiles
-- ===================================================================
CREATE TABLE `profiles` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `headline`              VARCHAR(255)        DEFAULT NULL,
    `about_me`              TEXT                DEFAULT NULL,
    `bio`                   TEXT                DEFAULT NULL,
    `date_of_birth`         DATE                DEFAULT NULL,
    `age`                   TINYINT UNSIGNED    DEFAULT NULL,
    `gender`                ENUM('male','female','other','prefer_not_to_say') DEFAULT NULL,
    `marital_status`        ENUM('never_married','divorced','widowed','separated','annulled') DEFAULT NULL,
    `religion`              VARCHAR(100)        DEFAULT NULL,
    `caste`                 VARCHAR(100)        DEFAULT NULL,
    `sub_caste`             VARCHAR(100)        DEFAULT NULL,
    `community`             VARCHAR(100)        DEFAULT NULL,
    `mother_tongue`         VARCHAR(100)        DEFAULT NULL,
    `height`                DECIMAL(5,2)        DEFAULT NULL,
    `weight`                DECIMAL(5,2)        DEFAULT NULL,
    `body_type`             ENUM('slim','average','athletic','heavy','obese') DEFAULT NULL,
    `blood_group`           VARCHAR(5)          DEFAULT NULL,
    `disability`            ENUM('none','physical','visual','hearing','speech','multiple') NOT NULL DEFAULT 'none',
    `diet`                  ENUM('vegetarian','non_veg','eggetarian','vegan') DEFAULT NULL,
    `smoking`               ENUM('yes','no','occasionally') DEFAULT NULL,
    `drinking`              ENUM('yes','no','socially') DEFAULT NULL,
    `country`               VARCHAR(100)        DEFAULT NULL,
    `state`                 VARCHAR(100)        DEFAULT NULL,
    `city`                  VARCHAR(100)        DEFAULT NULL,
    `pincode`               VARCHAR(10)         DEFAULT NULL,
    `address`               TEXT                DEFAULT NULL,
    `latitude`              DECIMAL(10,8)       DEFAULT NULL,
    `longitude`             DECIMAL(11,8)       DEFAULT NULL,
    `hide_profile`          TINYINT(1)          NOT NULL DEFAULT 0,
    `hide_photos`           TINYINT(1)          NOT NULL DEFAULT 0,
    `hide_contact`          TINYINT(1)          NOT NULL DEFAULT 0,
    `private_mode`          TINYINT(1)          NOT NULL DEFAULT 0,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_profiles_user_id` (`user_id`),
    KEY `idx_profiles_marital_status` (`marital_status`),
    KEY `idx_profiles_religion` (`religion`),
    KEY `idx_profiles_caste` (`caste`),
    KEY `idx_profiles_city` (`city`),
    KEY `idx_profiles_state` (`state`),
    KEY `idx_profiles_country` (`country`),
    KEY `idx_profiles_mother_tongue` (`mother_tongue`),
    KEY `idx_profiles_height` (`height`),
    KEY `idx_profiles_gender_marital_status` (`gender`, `marital_status`),
    KEY `idx_profiles_gender_age` (`gender`, `age`),
    KEY `idx_profiles_city_status` (`city`, `hide_profile`),
    KEY `idx_profiles_created_at` (`created_at`),
    FULLTEXT KEY `ft_profiles_about_me` (`about_me`),

    CONSTRAINT `fk_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `chk_profiles_age` CHECK (`age` IS NULL OR (`age` >= 18 AND `age` <= 120))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 3. professional_details
-- ===================================================================
CREATE TABLE `professional_details` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `current_company`       VARCHAR(255)        DEFAULT NULL,
    `designation`           VARCHAR(255)        DEFAULT NULL,
    `years_of_experience`   DECIMAL(4,1)        DEFAULT NULL,
    `current_salary`        DECIMAL(15,2)       DEFAULT NULL,
    `currency`              VARCHAR(3)          DEFAULT 'INR',
    `expected_salary`       DECIMAL(15,2)       DEFAULT NULL,
    `technology_stack`      JSON                DEFAULT NULL,
    `skills`                JSON                DEFAULT NULL,
    `work_mode`             ENUM('remote','hybrid','onsite') DEFAULT NULL,
    `preferred_countries`   JSON                DEFAULT NULL,
    `visa_status`           VARCHAR(100)        DEFAULT NULL,
    `work_permit`           VARCHAR(100)        DEFAULT NULL,
    `is_startup_employee`   TINYINT(1)          NOT NULL DEFAULT 0,
    `is_entrepreneur`       TINYINT(1)          NOT NULL DEFAULT 0,
    `startup_name`          VARCHAR(255)        DEFAULT NULL,
    `startup_description`   TEXT                DEFAULT NULL,
    `github_url`            VARCHAR(2048)       DEFAULT NULL,
    `linkedin_url`          VARCHAR(2048)       DEFAULT NULL,
    `portfolio_url`         VARCHAR(2048)       DEFAULT NULL,
    `resume_url`            VARCHAR(2048)       DEFAULT NULL,
    `notice_period`         VARCHAR(100)        DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_professional_details_user_id` (`user_id`),
    KEY `idx_professional_details_company` (`current_company`),
    KEY `idx_professional_details_designation` (`designation`),
    KEY `idx_professional_details_experience` (`years_of_experience`),
    KEY `idx_professional_details_work_mode` (`work_mode`),
    KEY `idx_professional_details_created_at` (`created_at`),

    CONSTRAINT `fk_professional_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 4. education_details
-- ===================================================================
CREATE TABLE `education_details` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `degree`                VARCHAR(200)        DEFAULT NULL,
    `specialization`        VARCHAR(200)        DEFAULT NULL,
    `university`            VARCHAR(255)        DEFAULT NULL,
    `college`               VARCHAR(255)        DEFAULT NULL,
    `year_of_passing`       YEAR                DEFAULT NULL,
    `grade`                 VARCHAR(50)         DEFAULT NULL,
    `is_highest_degree`     TINYINT(1)          NOT NULL DEFAULT 0,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_education_details_user_id` (`user_id`),
    KEY `idx_education_details_degree` (`degree`),
    KEY `idx_education_details_university` (`university`),
    KEY `idx_education_details_year_of_passing` (`year_of_passing`),
    KEY `idx_education_details_user_degree` (`user_id`, `is_highest_degree`),
    KEY `idx_education_details_created_at` (`created_at`),

    CONSTRAINT `fk_education_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 5. family_details
-- ===================================================================
CREATE TABLE `family_details` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `father_name`           VARCHAR(100)        DEFAULT NULL,
    `father_occupation`     VARCHAR(255)        DEFAULT NULL,
    `mother_name`           VARCHAR(100)        DEFAULT NULL,
    `mother_occupation`     VARCHAR(255)        DEFAULT NULL,
    `siblings_count`        TINYINT UNSIGNED    DEFAULT NULL,
    `brother_count`         TINYINT UNSIGNED    DEFAULT NULL,
    `sister_count`          TINYINT UNSIGNED    DEFAULT NULL,
    `family_type`           ENUM('nuclear','joint') DEFAULT NULL,
    `family_status`         ENUM('middle_class','upper_middle','rich') DEFAULT NULL,
    `family_values`         ENUM('traditional','modern') DEFAULT NULL,
    `family_location`       VARCHAR(255)        DEFAULT NULL,
    `about_family`          TEXT                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_family_details_user_id` (`user_id`),
    KEY `idx_family_details_created_at` (`created_at`),

    CONSTRAINT `fk_family_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 6. lifestyle_details
-- ===================================================================
CREATE TABLE `lifestyle_details` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `diet`                  ENUM('vegetarian','non_veg','eggetarian','vegan') DEFAULT NULL,
    `smoking`               ENUM('yes','no','occasionally') DEFAULT NULL,
    `drinking`              ENUM('yes','no','socially') DEFAULT NULL,
    `exercise_frequency`    VARCHAR(100)        DEFAULT NULL,
    `hobbies`               JSON                DEFAULT NULL,
    `interests`             JSON                DEFAULT NULL,
    `fitness_routine`       VARCHAR(255)        DEFAULT NULL,
    `sleeping_habits`       VARCHAR(255)        DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_lifestyle_details_user_id` (`user_id`),
    KEY `idx_lifestyle_details_diet` (`diet`),
    KEY `idx_lifestyle_details_smoking` (`smoking`),
    KEY `idx_lifestyle_details_drinking` (`drinking`),
    KEY `idx_lifestyle_details_created_at` (`created_at`),

    CONSTRAINT `fk_lifestyle_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 7. languages
-- ===================================================================
CREATE TABLE `languages` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `language`              VARCHAR(100)        NOT NULL,
    `proficiency`           ENUM('native','fluent','intermediate','basic') NOT NULL DEFAULT 'intermediate',
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_languages_user_id` (`user_id`),
    KEY `idx_languages_language` (`language`),
    KEY `idx_languages_proficiency` (`proficiency`),
    KEY `idx_languages_user_language` (`user_id`, `language`),
    KEY `idx_languages_created_at` (`created_at`),

    CONSTRAINT `fk_languages_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 8. horoscope_details
-- ===================================================================
CREATE TABLE `horoscope_details` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `birth_place`           VARCHAR(255)        DEFAULT NULL,
    `birth_time`            TIME                DEFAULT NULL,
    `birth_date`            DATE                DEFAULT NULL,
    `rashi`                 VARCHAR(100)        DEFAULT NULL,
    `nakshatra`             VARCHAR(100)        DEFAULT NULL,
    `manglik`               ENUM('yes','no','unknown') DEFAULT 'unknown',
    `gotra`                 VARCHAR(100)        DEFAULT NULL,
    `kundali_file`          VARCHAR(2048)       DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_horoscope_details_user_id` (`user_id`),
    KEY `idx_horoscope_details_manglik` (`manglik`),
    KEY `idx_horoscope_details_rashi` (`rashi`),
    KEY `idx_horoscope_details_nakshatra` (`nakshatra`),
    KEY `idx_horoscope_details_created_at` (`created_at`),

    CONSTRAINT `fk_horoscope_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 9. photos
-- ===================================================================
CREATE TABLE `photos` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `url`                   VARCHAR(2048)       NOT NULL,
    `thumbnail_url`         VARCHAR(2048)       DEFAULT NULL,
    `is_primary`            TINYINT(1)          NOT NULL DEFAULT 0,
    `is_verified`           TINYINT(1)          NOT NULL DEFAULT 0,
    `is_private`            TINYINT(1)          NOT NULL DEFAULT 0,
    `verification_status`   ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    `moderation_note`       TEXT                DEFAULT NULL,
    `ai_safety_score`       DECIMAL(3,2)        DEFAULT NULL,
    `upload_order`          INT UNSIGNED        NOT NULL DEFAULT 0,
    `file_size`             INT UNSIGNED        DEFAULT NULL,
    `mime_type`             VARCHAR(50)         DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_photos_user_id` (`user_id`),
    KEY `idx_photos_user_primary` (`user_id`, `is_primary`),
    KEY `idx_photos_verification_status` (`verification_status`),
    KEY `idx_photos_is_verified` (`is_verified`),
    KEY `idx_photos_upload_order` (`upload_order`),
    KEY `idx_photos_created_at` (`created_at`),

    CONSTRAINT `fk_photos_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 10. videos
-- ===================================================================
CREATE TABLE `videos` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `url`                   VARCHAR(2048)       NOT NULL,
    `thumbnail_url`         VARCHAR(2048)       DEFAULT NULL,
    `title`                 VARCHAR(255)        DEFAULT NULL,
    `description`           TEXT                DEFAULT NULL,
    `is_verified`           TINYINT(1)          NOT NULL DEFAULT 0,
    `verification_status`   ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    `duration`              INT UNSIGNED        DEFAULT NULL COMMENT 'Duration in seconds',
    `file_size`             INT UNSIGNED        DEFAULT NULL COMMENT 'File size in bytes',
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_videos_user_id` (`user_id`),
    KEY `idx_videos_verification_status` (`verification_status`),
    KEY `idx_videos_created_at` (`created_at`),

    CONSTRAINT `fk_videos_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 11. partner_preferences
-- ===================================================================
CREATE TABLE `partner_preferences` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `age_min`               TINYINT UNSIGNED    DEFAULT NULL,
    `age_max`               TINYINT UNSIGNED    DEFAULT NULL,
    `height_min`            DECIMAL(5,2)        DEFAULT NULL,
    `height_max`            DECIMAL(5,2)        DEFAULT NULL,
    `marital_status`        JSON                DEFAULT NULL,
    `religion`              JSON                DEFAULT NULL,
    `caste`                 JSON                DEFAULT NULL,
    `community`             JSON                DEFAULT NULL,
    `mother_tongue`         JSON                DEFAULT NULL,
    `country`               JSON                DEFAULT NULL,
    `state`                 JSON                DEFAULT NULL,
    `city`                  JSON                DEFAULT NULL,
    `education`             JSON                DEFAULT NULL,
    `occupation`            JSON                DEFAULT NULL,
    `min_income`            DECIMAL(15,2)       DEFAULT NULL,
    `max_income`            DECIMAL(15,2)       DEFAULT NULL,
    `currency`              VARCHAR(3)          DEFAULT 'INR',
    `work_mode`             JSON                DEFAULT NULL,
    `technology_stack`      JSON                DEFAULT NULL,
    `diet`                  JSON                DEFAULT NULL,
    `smoking`               JSON                DEFAULT NULL,
    `drinking`              JSON                DEFAULT NULL,
    `manglik`               ENUM('yes','no','any','unknown') DEFAULT 'any',
    `description`           TEXT                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_partner_preferences_user_id` (`user_id`),
    KEY `idx_partner_preferences_age_range` (`age_min`, `age_max`),
    KEY `idx_partner_preferences_income_range` (`min_income`, `max_income`),
    KEY `idx_partner_preferences_created_at` (`created_at`),

    CONSTRAINT `fk_partner_preferences_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `chk_partner_preferences_age_range` CHECK (`age_min` IS NULL OR `age_max` IS NULL OR `age_min` <= `age_max`)
    CONSTRAINT `chk_partner_preferences_height_range` CHECK (`height_min` IS NULL OR `height_max` IS NULL OR `height_min` <= `height_max`)
    CONSTRAINT `chk_partner_preferences_income_range` CHECK (`min_income` IS NULL OR `max_income` IS NULL OR `min_income` <= `max_income`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 12. interests
-- ===================================================================
CREATE TABLE `interests` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `from_user_id`          BIGINT UNSIGNED     NOT NULL,
    `to_user_id`            BIGINT UNSIGNED     NOT NULL,
    `status`                ENUM('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
    `message`               TEXT                DEFAULT NULL,
    `is_read`               TINYINT(1)          NOT NULL DEFAULT 0,
    `read_at`               TIMESTAMP           NULL DEFAULT NULL,
    `actioned_at`           TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_interests_uuid` (`uuid`),
    UNIQUE KEY `uk_interests_from_to` (`from_user_id`, `to_user_id`),
    KEY `idx_interests_from_user_id` (`from_user_id`),
    KEY `idx_interests_to_user_id` (`to_user_id`),
    KEY `idx_interests_status` (`status`),
    KEY `idx_interests_from_user_status` (`from_user_id`, `status`),
    KEY `idx_interests_to_user_status` (`to_user_id`, `status`),
    KEY `idx_interests_created_at` (`created_at`),

    CONSTRAINT `fk_interests_from_user_id` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_interests_to_user_id` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 13. matches
-- ===================================================================
CREATE TABLE `matches` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `matched_user_id`       BIGINT UNSIGNED     NOT NULL,
    `compatibility_score`   DECIMAL(5,2)        DEFAULT NULL,
    `ai_score`              DECIMAL(5,2)        DEFAULT NULL,
    `is_mutual`             TINYINT(1)          NOT NULL DEFAULT 0,
    `matched_at`            TIMESTAMP           NULL DEFAULT NULL,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_matches_uuid` (`uuid`),
    UNIQUE KEY `uk_matches_user_pair` (`user_id`, `matched_user_id`),
    KEY `idx_matches_user_id` (`user_id`),
    KEY `idx_matches_matched_user_id` (`matched_user_id`),
    KEY `idx_matches_is_mutual` (`is_mutual`),
    KEY `idx_matches_is_active` (`is_active`),
    KEY `idx_matches_compatibility_score` (`compatibility_score`),
    KEY `idx_matches_created_at` (`created_at`),

    CONSTRAINT `fk_matches_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_matches_matched_user_id` FOREIGN KEY (`matched_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 14. conversations
-- ===================================================================
CREATE TABLE `conversations` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `type`                  ENUM('direct','group') NOT NULL DEFAULT 'direct',
    `created_by`            BIGINT UNSIGNED     NOT NULL,
    `title`                 VARCHAR(255)        DEFAULT NULL,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `last_message_at`       TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_conversations_uuid` (`uuid`),
    KEY `idx_conversations_created_by` (`created_by`),
    KEY `idx_conversations_type` (`type`),
    KEY `idx_conversations_is_active` (`is_active`),
    KEY `idx_conversations_last_message_at` (`last_message_at`),
    KEY `idx_conversations_created_at` (`created_at`),

    CONSTRAINT `fk_conversations_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 15. conversation_participants
-- ===================================================================
CREATE TABLE `conversation_participants` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `conversation_id`       BIGINT UNSIGNED     NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `last_read_at`          TIMESTAMP           NULL DEFAULT NULL,
    `is_muted`              TINYINT(1)          NOT NULL DEFAULT 0,
    `is_blocked`            TINYINT(1)          NOT NULL DEFAULT 0,
    `joined_at`             TIMESTAMP           NULL DEFAULT NULL,
    `left_at`               TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_conversation_participants` (`conversation_id`, `user_id`),
    KEY `idx_conversation_participants_user_id` (`user_id`),
    KEY `idx_conversation_participants_created_at` (`created_at`),

    CONSTRAINT `fk_conversation_participants_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_conversation_participants_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 16. messages
-- ===================================================================
CREATE TABLE `messages` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `conversation_id`       BIGINT UNSIGNED     NOT NULL,
    `sender_id`             BIGINT UNSIGNED     NOT NULL,
    `content`               LONGTEXT            DEFAULT NULL,
    `message_type`          ENUM('text','image','video','audio','document','location') NOT NULL DEFAULT 'text',
    `media_url`             VARCHAR(2048)       DEFAULT NULL,
    `thumbnail_url`         VARCHAR(2048)       DEFAULT NULL,
    `file_size`             INT UNSIGNED        DEFAULT NULL,
    `duration`              INT UNSIGNED        DEFAULT NULL COMMENT 'Duration in seconds for audio/video',
    `is_read`               TINYINT(1)          NOT NULL DEFAULT 0,
    `read_at`               TIMESTAMP           NULL DEFAULT NULL,
    `is_delivered`          TINYINT(1)          NOT NULL DEFAULT 0,
    `delivered_at`          TIMESTAMP           NULL DEFAULT NULL,
    `is_deleted_for_all`    TINYINT(1)          NOT NULL DEFAULT 0,
    `deleted_at`            TIMESTAMP           NULL DEFAULT NULL,
    `reply_to_message_id`   BIGINT UNSIGNED     DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_messages_uuid` (`uuid`),
    KEY `idx_messages_conversation_id` (`conversation_id`),
    KEY `idx_messages_sender_id` (`sender_id`),
    KEY `idx_messages_conversation_created` (`conversation_id`, `created_at`),
    KEY `idx_messages_message_type` (`message_type`),
    KEY `idx_messages_is_read` (`is_read`),
    KEY `idx_messages_reply_to_message_id` (`reply_to_message_id`),
    KEY `idx_messages_created_at` (`created_at`),

    CONSTRAINT `fk_messages_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_messages_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_messages_reply_to_message_id` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 17. subscriptions
-- ===================================================================
CREATE TABLE `subscriptions` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `plan_type`             ENUM('free','premium','gold','platinum') NOT NULL DEFAULT 'free',
    `status`                ENUM('active','expired','cancelled','pending') NOT NULL DEFAULT 'pending',
    `start_date`            DATE                DEFAULT NULL,
    `end_date`              DATE                DEFAULT NULL,
    `auto_renew`            TINYINT(1)          NOT NULL DEFAULT 0,
    `amount`                DECIMAL(10,2)       DEFAULT NULL,
    `currency`              VARCHAR(3)          DEFAULT 'INR',
    `payment_gateway`       VARCHAR(50)         DEFAULT NULL,
    `payment_id`            VARCHAR(255)        DEFAULT NULL,
    `features`              JSON                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_subscriptions_uuid` (`uuid`),
    KEY `idx_subscriptions_user_id` (`user_id`),
    KEY `idx_subscriptions_plan_type` (`plan_type`),
    KEY `idx_subscriptions_status` (`status`),
    KEY `idx_subscriptions_user_status` (`user_id`, `status`),
    KEY `idx_subscriptions_dates` (`start_date`, `end_date`),
    KEY `idx_subscriptions_created_at` (`created_at`),

    CONSTRAINT `fk_subscriptions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 18. payments
-- ===================================================================
CREATE TABLE `payments` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `subscription_id`       BIGINT UNSIGNED     DEFAULT NULL,
    `amount`                DECIMAL(10,2)       NOT NULL,
    `currency`              VARCHAR(3)          NOT NULL DEFAULT 'INR',
    `gateway`               ENUM('razorpay','stripe') NOT NULL,
    `gateway_payment_id`    VARCHAR(255)        DEFAULT NULL,
    `gateway_order_id`      VARCHAR(255)        DEFAULT NULL,
    `gateway_signature`     VARCHAR(255)        DEFAULT NULL,
    `status`                ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
    `payment_method`        VARCHAR(50)         DEFAULT NULL,
    `invoice_url`           VARCHAR(2048)       DEFAULT NULL,
    `receipt_url`           VARCHAR(2048)       DEFAULT NULL,
    `description`           TEXT                DEFAULT NULL,
    `metadata`              JSON                DEFAULT NULL,
    `refund_id`             VARCHAR(255)        DEFAULT NULL,
    `refund_amount`         DECIMAL(10,2)       DEFAULT NULL,
    `refund_reason`         TEXT                DEFAULT NULL,
    `refunded_at`           TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payments_uuid` (`uuid`),
    KEY `idx_payments_user_id` (`user_id`),
    KEY `idx_payments_subscription_id` (`subscription_id`),
    KEY `idx_payments_gateway` (`gateway`),
    KEY `idx_payments_status` (`status`),
    KEY `idx_payments_gateway_payment_id` (`gateway_payment_id`),
    KEY `idx_payments_created_at` (`created_at`),

    CONSTRAINT `fk_payments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_payments_subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 19. coupons
-- ===================================================================
CREATE TABLE `coupons` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `code`                  VARCHAR(50)         NOT NULL,
    `type`                  ENUM('percentage','fixed') NOT NULL,
    `value`                 DECIMAL(10,2)       NOT NULL,
    `max_discount`          DECIMAL(10,2)       DEFAULT NULL,
    `min_order_amount`      DECIMAL(10,2)       DEFAULT NULL,
    `max_uses`              INT UNSIGNED        DEFAULT NULL,
    `used_count`            INT UNSIGNED        NOT NULL DEFAULT 0,
    `valid_from`            DATETIME            NOT NULL,
    `valid_until`           DATETIME            NOT NULL,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `applicable_plans`      JSON                DEFAULT NULL,
    `created_by`            BIGINT UNSIGNED     NOT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_coupons_code` (`code`),
    KEY `idx_coupons_type` (`type`),
    KEY `idx_coupons_is_active` (`is_active`),
    KEY `idx_coupons_validity` (`valid_from`, `valid_until`),
    KEY `idx_coupons_created_by` (`created_by`),
    KEY `idx_coupons_created_at` (`created_at`),

    CONSTRAINT `fk_coupons_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 20. coupon_redemptions
-- ===================================================================
CREATE TABLE `coupon_redemptions` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `coupon_id`             BIGINT UNSIGNED     NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `subscription_id`       BIGINT UNSIGNED     DEFAULT NULL,
    `payment_id`            BIGINT UNSIGNED     DEFAULT NULL,
    `discount_amount`       DECIMAL(10,2)       NOT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_coupon_redemptions_coupon_user` (`coupon_id`, `user_id`),
    KEY `idx_coupon_redemptions_user_id` (`user_id`),
    KEY `idx_coupon_redemptions_subscription_id` (`subscription_id`),
    KEY `idx_coupon_redemptions_payment_id` (`payment_id`),
    KEY `idx_coupon_redemptions_created_at` (`created_at`),

    CONSTRAINT `fk_coupon_redemptions_coupon_id` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_coupon_redemptions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_coupon_redemptions_subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    CONSTRAINT `fk_coupon_redemptions_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 21. notifications
-- ===================================================================
CREATE TABLE `notifications` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `type`                  VARCHAR(100)        NOT NULL,
    `title`                 VARCHAR(255)        NOT NULL,
    `body`                  TEXT                DEFAULT NULL,
    `data`                  JSON                DEFAULT NULL,
    `is_read`               TINYINT(1)          NOT NULL DEFAULT 0,
    `read_at`               TIMESTAMP           NULL DEFAULT NULL,
    `is_pushed`             TINYINT(1)          NOT NULL DEFAULT 0,
    `pushed_at`             TIMESTAMP           NULL DEFAULT NULL,
    `channel`               ENUM('push','email','sms','whatsapp') NOT NULL DEFAULT 'push',
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_notifications_uuid` (`uuid`),
    KEY `idx_notifications_user_id` (`user_id`),
    KEY `idx_notifications_type` (`type`),
    KEY `idx_notifications_is_read` (`is_read`),
    KEY `idx_notifications_channel` (`channel`),
    KEY `idx_notifications_user_read` (`user_id`, `is_read`),
    KEY `idx_notifications_created_at` (`created_at`),

    CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 22. notification_templates
-- ===================================================================
CREATE TABLE `notification_templates` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `type`                  VARCHAR(100)        NOT NULL,
    `channel`               ENUM('push','email','sms','whatsapp') NOT NULL,
    `subject`               VARCHAR(255)        DEFAULT NULL,
    `template_body`         TEXT                NOT NULL,
    `variables`             JSON                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_notification_templates_type_channel` (`type`, `channel`),
    KEY `idx_notification_templates_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 23. device_tokens
-- ===================================================================
CREATE TABLE `device_tokens` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `token`                 VARCHAR(512)        NOT NULL,
    `platform`              ENUM('ios','android','web') NOT NULL,
    `device_name`           VARCHAR(255)        DEFAULT NULL,
    `device_id`             VARCHAR(255)        DEFAULT NULL,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `last_used_at`          TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_device_tokens_token` (`token`(255)),
    KEY `idx_device_tokens_user_id` (`user_id`),
    KEY `idx_device_tokens_platform` (`platform`),
    KEY `idx_device_tokens_is_active` (`is_active`),
    KEY `idx_device_tokens_created_at` (`created_at`),

    CONSTRAINT `fk_device_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 24. sessions
-- ===================================================================
CREATE TABLE `sessions` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `token`                 VARCHAR(512)        NOT NULL,
    `refresh_token`         VARCHAR(512)        DEFAULT NULL,
    `ip_address`            VARCHAR(45)         DEFAULT NULL,
    `user_agent`            TEXT                DEFAULT NULL,
    `device_info`           JSON                DEFAULT NULL,
    `location`              VARCHAR(255)        DEFAULT NULL,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `last_activity`         TIMESTAMP           NULL DEFAULT NULL,
    `expires_at`            TIMESTAMP           NOT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sessions_token` (`token`(255)),
    KEY `idx_sessions_user_id` (`user_id`),
    KEY `idx_sessions_refresh_token` (`refresh_token`(255)),
    KEY `idx_sessions_is_active` (`is_active`),
    KEY `idx_sessions_user_active` (`user_id`, `is_active`),
    KEY `idx_sessions_expires_at` (`expires_at`),
    KEY `idx_sessions_created_at` (`created_at`),

    CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 25. verification_records
-- ===================================================================
CREATE TABLE `verification_records` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `type`                  ENUM('email','phone','company_email','govt_id','linkedin','employment') NOT NULL,
    `status`                ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    `document_url`          VARCHAR(2048)       DEFAULT NULL,
    `verified_by`           BIGINT UNSIGNED     DEFAULT NULL,
    `verified_at`           TIMESTAMP           NULL DEFAULT NULL,
    `rejection_reason`      TEXT                DEFAULT NULL,
    `metadata`              JSON                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_verification_records_user_id` (`user_id`),
    KEY `idx_verification_records_type` (`type`),
    KEY `idx_verification_records_status` (`status`),
    KEY `idx_verification_records_verified_by` (`verified_by`),
    KEY `idx_verification_records_user_type` (`user_id`, `type`),
    KEY `idx_verification_records_created_at` (`created_at`),

    CONSTRAINT `fk_verification_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_verification_records_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 26. reports
-- ===================================================================
CREATE TABLE `reports` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `reporter_id`           BIGINT UNSIGNED     NOT NULL,
    `reported_user_id`      BIGINT UNSIGNED     NOT NULL,
    `reason`                VARCHAR(255)        NOT NULL,
    `description`           TEXT                DEFAULT NULL,
    `evidence_urls`         JSON                DEFAULT NULL,
    `status`                ENUM('pending','investigated','resolved','dismissed') NOT NULL DEFAULT 'pending',
    `assigned_to`           BIGINT UNSIGNED     DEFAULT NULL,
    `resolution_notes`      TEXT                DEFAULT NULL,
    `resolved_at`           TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reports_uuid` (`uuid`),
    KEY `idx_reports_reporter_id` (`reporter_id`),
    KEY `idx_reports_reported_user_id` (`reported_user_id`),
    KEY `idx_reports_status` (`status`),
    KEY `idx_reports_assigned_to` (`assigned_to`),
    KEY `idx_reports_created_at` (`created_at`),

    CONSTRAINT `fk_reports_reporter_id` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_reports_reported_user_id` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_reports_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 27. blocked_users
-- ===================================================================
CREATE TABLE `blocked_users` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `blocker_id`            BIGINT UNSIGNED     NOT NULL,
    `blocked_id`            BIGINT UNSIGNED     NOT NULL,
    `reason`                VARCHAR(255)        DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_blocked_users_pair` (`blocker_id`, `blocked_id`),
    KEY `idx_blocked_users_blocker_id` (`blocker_id`),
    KEY `idx_blocked_users_blocked_id` (`blocked_id`),
    KEY `idx_blocked_users_created_at` (`created_at`),

    CONSTRAINT `fk_blocked_users_blocker_id` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_blocked_users_blocked_id` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 28. tickets
-- ===================================================================
CREATE TABLE `tickets` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `subject`               VARCHAR(255)        NOT NULL,
    `description`           TEXT                NOT NULL,
    `category`              VARCHAR(100)        DEFAULT NULL,
    `priority`              ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
    `status`                ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
    `assigned_to`           BIGINT UNSIGNED     DEFAULT NULL,
    `resolved_at`           TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tickets_uuid` (`uuid`),
    KEY `idx_tickets_user_id` (`user_id`),
    KEY `idx_tickets_priority` (`priority`),
    KEY `idx_tickets_status` (`status`),
    KEY `idx_tickets_assigned_to` (`assigned_to`),
    KEY `idx_tickets_category` (`category`),
    KEY `idx_tickets_user_status` (`user_id`, `status`),
    KEY `idx_tickets_created_at` (`created_at`),

    CONSTRAINT `fk_tickets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_tickets_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 29. ticket_replies
-- ===================================================================
CREATE TABLE `ticket_replies` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `ticket_id`             BIGINT UNSIGNED     NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `message`               TEXT                NOT NULL,
    `attachments`           JSON                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_ticket_replies_ticket_id` (`ticket_id`),
    KEY `idx_ticket_replies_user_id` (`user_id`),
    KEY `idx_ticket_replies_created_at` (`created_at`),

    CONSTRAINT `fk_ticket_replies_ticket_id` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_ticket_replies_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 30. admin_users
-- ===================================================================
CREATE TABLE `admin_users` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `role`                  ENUM('moderator','admin','super_admin') NOT NULL DEFAULT 'moderator',
    `permissions`           JSON                DEFAULT NULL,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `last_login_at`         TIMESTAMP           NULL DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_users_uuid` (`uuid`),
    UNIQUE KEY `uk_admin_users_user_id` (`user_id`),
    KEY `idx_admin_users_role` (`role`),
    KEY `idx_admin_users_is_active` (`is_active`),
    KEY `idx_admin_users_created_at` (`created_at`),

    CONSTRAINT `fk_admin_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 31. activity_logs
-- ===================================================================
CREATE TABLE `activity_logs` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `user_id`               BIGINT UNSIGNED     DEFAULT NULL,
    `action`                VARCHAR(255)        NOT NULL,
    `resource_type`         VARCHAR(100)        DEFAULT NULL,
    `resource_id`           BIGINT UNSIGNED     DEFAULT NULL,
    `description`           TEXT                DEFAULT NULL,
    `metadata`              JSON                DEFAULT NULL,
    `ip_address`            VARCHAR(45)         DEFAULT NULL,
    `user_agent`            TEXT                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_activity_logs_uuid` (`uuid`),
    KEY `idx_activity_logs_user_id` (`user_id`),
    KEY `idx_activity_logs_action` (`action`),
    KEY `idx_activity_logs_resource` (`resource_type`, `resource_id`),
    KEY `idx_activity_logs_created_at` (`created_at`),

    CONSTRAINT `fk_activity_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 32. audit_logs
-- ===================================================================
CREATE TABLE `audit_logs` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `admin_id`              BIGINT UNSIGNED     DEFAULT NULL,
    `action`                VARCHAR(255)        NOT NULL,
    `resource_type`         VARCHAR(100)        NOT NULL,
    `resource_id`           BIGINT UNSIGNED     DEFAULT NULL,
    `old_values`            JSON                DEFAULT NULL,
    `new_values`            JSON                DEFAULT NULL,
    `ip_address`            VARCHAR(45)         DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_audit_logs_uuid` (`uuid`),
    KEY `idx_audit_logs_admin_id` (`admin_id`),
    KEY `idx_audit_logs_action` (`action`),
    KEY `idx_audit_logs_resource` (`resource_type`, `resource_id`),
    KEY `idx_audit_logs_created_at` (`created_at`),

    CONSTRAINT `fk_audit_logs_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 33. search_history
-- ===================================================================
CREATE TABLE `search_history` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `search_query`          VARCHAR(512)        NOT NULL,
    `filters`               JSON                DEFAULT NULL,
    `result_count`          INT UNSIGNED        DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_search_history_user_id` (`user_id`),
    KEY `idx_search_history_query` (`search_query`(255)),
    KEY `idx_search_history_user_created` (`user_id`, `created_at`),
    KEY `idx_search_history_created_at` (`created_at`),

    CONSTRAINT `fk_search_history_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 34. saved_searches
-- ===================================================================
CREATE TABLE `saved_searches` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `name`                  VARCHAR(255)        NOT NULL,
    `filters`               JSON                NOT NULL,
    `notify_on_match`       TINYINT(1)          NOT NULL DEFAULT 0,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_saved_searches_user_id` (`user_id`),
    KEY `idx_saved_searches_notify` (`notify_on_match`),
    KEY `idx_saved_searches_user_notify` (`user_id`, `notify_on_match`),
    KEY `idx_saved_searches_created_at` (`created_at`),

    CONSTRAINT `fk_saved_searches_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 35. daily_recommendations
-- ===================================================================
CREATE TABLE `daily_recommendations` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `recommended_user_id`   BIGINT UNSIGNED     NOT NULL,
    `score`                 DECIMAL(5,2)        DEFAULT NULL,
    `reason`                VARCHAR(255)        DEFAULT NULL,
    `is_viewed`             TINYINT(1)          NOT NULL DEFAULT 0,
    `is_dismissed`          TINYINT(1)          NOT NULL DEFAULT 0,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_daily_recommendations_pair_date` (`user_id`, `recommended_user_id`, DATE(`created_at`)),
    KEY `idx_daily_recommendations_user_id` (`user_id`),
    KEY `idx_daily_recommendations_recommended_user_id` (`recommended_user_id`),
    KEY `idx_daily_recommendations_score` (`score`),
    KEY `idx_daily_recommendations_is_viewed` (`is_viewed`),
    KEY `idx_daily_recommendations_created_at` (`created_at`),

    CONSTRAINT `fk_daily_recommendations_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_daily_recommendations_recommended_user_id` FOREIGN KEY (`recommended_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 36. profile_views
-- ===================================================================
CREATE TABLE `profile_views` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `viewer_id`             BIGINT UNSIGNED     NOT NULL,
    `viewed_user_id`        BIGINT UNSIGNED     NOT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_profile_views_viewer_id` (`viewer_id`),
    KEY `idx_profile_views_viewed_user_id` (`viewed_user_id`),
    KEY `idx_profile_views_viewer_viewed` (`viewer_id`, `viewed_user_id`),
    KEY `idx_profile_views_viewed_created` (`viewed_user_id`, `created_at`),
    KEY `idx_profile_views_created_at` (`created_at`),

    CONSTRAINT `fk_profile_views_viewer_id` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONSTRAINT `fk_profile_views_viewed_user_id` FOREIGN KEY (`viewed_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 37. user_activities
-- ===================================================================
CREATE TABLE `user_activities` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `activity_type`         VARCHAR(100)        NOT NULL,
    `description`           TEXT                DEFAULT NULL,
    `metadata`              JSON                DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_user_activities_user_id` (`user_id`),
    KEY `idx_user_activities_activity_type` (`activity_type`),
    KEY `idx_user_activities_user_type` (`user_id`, `activity_type`),
    KEY `idx_user_activities_created_at` (`created_at`),

    CONSTRAINT `fk_user_activities_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 38. gdpr_consents
-- ===================================================================
CREATE TABLE `gdpr_consents` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     NOT NULL,
    `consent_type`          VARCHAR(100)        NOT NULL,
    `is_accepted`           TINYINT(1)          NOT NULL DEFAULT 0,
    `accepted_at`           TIMESTAMP           NULL DEFAULT NULL,
    `ip_address`            VARCHAR(45)         DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_gdpr_consents_user_type` (`user_id`, `consent_type`),
    KEY `idx_gdpr_consents_consent_type` (`consent_type`),
    KEY `idx_gdpr_consents_is_accepted` (`is_accepted`),
    KEY `idx_gdpr_consents_created_at` (`created_at`),

    CONSTRAINT `fk_gdpr_consents_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 39. data_retention_logs
-- ===================================================================
CREATE TABLE `data_retention_logs` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     DEFAULT NULL,
    `action`                VARCHAR(255)        NOT NULL,
    `data_type`             VARCHAR(100)        NOT NULL,
    `executed_at`           TIMESTAMP           NOT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_data_retention_logs_user_id` (`user_id`),
    KEY `idx_data_retention_logs_action` (`action`),
    KEY `idx_data_retention_logs_data_type` (`data_type`),
    KEY `idx_data_retention_logs_executed_at` (`executed_at`),
    KEY `idx_data_retention_logs_created_at` (`created_at`),

    CONSTRAINT `fk_data_retention_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 40. blogs
-- ===================================================================
CREATE TABLE `blogs` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `uuid`                  CHAR(36)            NOT NULL,
    `author_id`             BIGINT UNSIGNED     NOT NULL,
    `title`                 VARCHAR(255)        NOT NULL,
    `slug`                  VARCHAR(255)        NOT NULL,
    `content`               LONGTEXT            NOT NULL,
    `excerpt`               TEXT                DEFAULT NULL,
    `cover_image`           VARCHAR(2048)       DEFAULT NULL,
    `tags`                  JSON                DEFAULT NULL,
    `category`              VARCHAR(100)        DEFAULT NULL,
    `status`                ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    `published_at`          TIMESTAMP           NULL DEFAULT NULL,
    `view_count`            INT UNSIGNED        NOT NULL DEFAULT 0,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_blogs_uuid` (`uuid`),
    UNIQUE KEY `uk_blogs_slug` (`slug`),
    KEY `idx_blogs_author_id` (`author_id`),
    KEY `idx_blogs_category` (`category`),
    KEY `idx_blogs_status` (`status`),
    KEY `idx_blogs_author_status` (`author_id`, `status`),
    KEY `idx_blogs_published_at` (`published_at`),
    KEY `idx_blogs_view_count` (`view_count`),
    KEY `idx_blogs_created_at` (`created_at`),
    FULLTEXT KEY `ft_blogs_content_title` (`title`, `content`),

    CONSTRAINT `fk_blogs_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 41. faqs
-- ===================================================================
CREATE TABLE `faqs` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `question`              TEXT                NOT NULL,
    `answer`                LONGTEXT            NOT NULL,
    `category`              VARCHAR(100)        DEFAULT NULL,
    `order`                 INT UNSIGNED        NOT NULL DEFAULT 0,
    `is_active`             TINYINT(1)          NOT NULL DEFAULT 1,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_faqs_category` (`category`),
    KEY `idx_faqs_order` (`order`),
    KEY `idx_faqs_is_active` (`is_active`),
    KEY `idx_faqs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 42. feedback
-- ===================================================================
CREATE TABLE `feedback` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`               BIGINT UNSIGNED     DEFAULT NULL,
    `type`                  VARCHAR(100)        DEFAULT NULL,
    `subject`               VARCHAR(255)        DEFAULT NULL,
    `message`               TEXT                NOT NULL,
    `rating`                TINYINT UNSIGNED    DEFAULT NULL,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_feedback_user_id` (`user_id`),
    KEY `idx_feedback_type` (`type`),
    KEY `idx_feedback_rating` (`rating`),
    KEY `idx_feedback_created_at` (`created_at`),

    CONSTRAINT `fk_feedback_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    CONSTRAINT `chk_feedback_rating` CHECK (`rating` IS NULL OR (`rating` >= 1 AND `rating` <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- 43. site_settings
-- ===================================================================
CREATE TABLE `site_settings` (
    `id`                    BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `key`                   VARCHAR(255)        NOT NULL,
    `value`                 LONGTEXT            NOT NULL,
    `type`                  VARCHAR(50)         DEFAULT 'string',
    `group`                 VARCHAR(100)        DEFAULT 'general',
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_site_settings_key` (`key`),
    KEY `idx_site_settings_group` (`group`),
    KEY `idx_site_settings_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- END OF SCHEMA
-- IT Connect Matrimony - v1.0.0
-- ===================================================================
