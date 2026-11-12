-- badge.sql — schema for badge cubo package
-- Compatible with gen20 GPM (MariaDB)

CREATE TABLE IF NOT EXISTS `badges` (
                                        `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                        `level`         TINYINT UNSIGNED NOT NULL,
                                        `title`         VARCHAR(100) NOT NULL,
    `icon`          VARCHAR(16)  NOT NULL DEFAULT '🏆',
    `description`   VARCHAR(255) NOT NULL DEFAULT '',
    `domain`        VARCHAR(120) NOT NULL DEFAULT '*',   -- '*' = all domains
    `sort_order`    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `active`        TINYINT(1) NOT NULL DEFAULT 1,
    `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_badge_level_domain` (`level`, `domain`),
    KEY `idx_badge_domain_active` (`domain`, `active`, `sort_order`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_badges` (
                                             `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                             `user_id`       BIGINT UNSIGNED NOT NULL,
                                             `badge_id`      INT UNSIGNED NOT NULL,
                                             `awarded_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                             PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_badge` (`user_id`, `badge_id`),
    KEY `idx_user_badges_user` (`user_id`),
    CONSTRAINT `fk_user_badges_badge`
    FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`)
    ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: 10 default levels, visible on all domains
INSERT INTO `badges` (`level`, `title`, `icon`, `description`, `sort_order`)
VALUES
    (1,  'Newcomer',  '🏆', 'Welcome to the journey! This badge marks your first step.', 1),
    (2,  'Explorer',  '🌍', 'You have completed your first goal!',                      2),
    (3,  'Builder',   '🔨', 'You shipped something real.',                              3),
    (4,  'Connector', '🤝', 'You brought people together.',                             4),
    (5,  'Achiever',  '⭐', 'Halfway there — steady progress.',                          5),
    (6,  'Innovator', '💡', 'You tried something nobody else did.',                     6),
    (7,  'Guardian',  '🛡️', 'You kept the community safe.',                             7),
    (8,  'Mentor',    '🧭', 'You helped others level up.',                              8),
    (9,  'Champion',  '👑', 'A leader among peers.',                                    9),
    (10, 'Legend',    '🏅', 'The highest honor in the cubo.',                           10)
    ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Uninstall (for `GPM uninstall`):
-- DROP TABLE IF EXISTS `user_badges`;
-- DROP TABLE IF EXISTS `badges`;