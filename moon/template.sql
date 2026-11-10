-- ============================================
-- GEN20 DATABASE SCHEMA
-- ============================================

-- 1. CREATE TABLE classification
CREATE TABLE IF NOT EXISTS `classification` (
                                                `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(500) NOT NULL,
    `title` varchar(500) DEFAULT NULL COMMENT 'loc',
    `description` text DEFAULT NULL COMMENT 'loc',
    `created` datetime NOT NULL DEFAULT current_timestamp(),
    `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. INSERT classification (with IGNORE to prevent duplicates)
INSERT IGNORE INTO `classification` (`id`, `name`, `title`, `description`) VALUES
(1, 'actions', 'Εκδηλώσεις/Δράσεις', ''),
(2, 'publications', 'Ανακοινώσεις', '');

-- 3. CREATE TABLE comment
CREATE TABLE IF NOT EXISTS `comment` (
                                         `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `userid` int(10) UNSIGNED NOT NULL COMMENT 'selectjoin.user.name',
    `type` enum('content','book') NOT NULL,
    `typeid` int(10) UNSIGNED NOT NULL,
    `content` mediumtext NOT NULL,
    `status` ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
    `reply_id` int(10) UNSIGNED NOT NULL DEFAULT 0,
    `created` datetime NOT NULL DEFAULT current_timestamp(),
    `modified` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `uid` (`userid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. INSERT comment
INSERT IGNORE INTO `comment` (`id`, `userid`, `type`, `typeid`, `content`, `status`, `reply_id`, `created`, `modified`) VALUES
(1, 1, 'content', 1, 'Great%20job%2C%20Niki!', 'active', 0, '2026-06-03 16:00:15', '2026-06-03 16:00:15');

-- 5. CREATE TABLE components
CREATE TABLE IF NOT EXISTS `components` (
                                            `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `path` varchar(500) NOT NULL,
    `type` varchar(50) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `author` varchar(255) DEFAULT NULL,
    `version` varchar(50) DEFAULT NULL,
    `props` longtext DEFAULT NULL,
    `dependencies` longtext DEFAULT NULL,
    `file_size` int(11) DEFAULT NULL,
    `modified` int(11) DEFAULT NULL,
    `status` ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
    `instances` int(11) DEFAULT 0,
    `created` datetime DEFAULT NULL,
    `updated` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_path` (`path`),
    KEY `idx_name` (`name`),
    KEY `idx_type` (`type`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. INSERT components
INSERT IGNORE INTO `components` (`id`, `name`, `path`, `type`, `description`, `author`, `version`, `props`, `dependencies`, `file_size`, `modified`, `status`, `instances`, `created`, `updated`) VALUES
(1, 'ContentArchive', 'ContentArchive.jsx', 'function', '', '', '1.0.0', '[]', '["react","react-router-dom"]', 13576, 1779810796, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(2, 'ContentOne', 'ContentOne.jsx', 'function', '', '', '1.0.0', '[]', '["react","react-router-dom","react-helmet-async"]', 16408, 1779799174, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(3, 'ErrorBoundary', 'ErrorBoundary.jsx', 'unknown', '', '', '1.0.0', '[]', '["react"]', 976, 1779800463, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(4, 'HeroSlides', 'HeroSlides.jsx', 'arrow', '', '', '1.0.0', '[]', '["react"]', 3160, 1779809345, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(5, 'Navigation', 'Navigation.jsx', 'arrow', '', '', '1.0.0', '[]', '["react","react-router-dom"]', 2779, 1780518235, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(6, 'Search', 'Search.jsx', 'function', '', '', '1.0.0', '[]', '["react"]', 1511, 1779799214, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(7, 'ShareToolbox', 'ShareToolbox.jsx', 'arrow', '', '', '1.0.0', '[]', '["react"]', 6283, 1779799219, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(8, 'Slides', 'Slides.jsx', 'arrow', '', '', '1.0.0', '[]', '["react"]', 7369, 1780764384, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45'),
(9, 'Subscribe', 'Subscribe.jsx', 'function', '', '', '1.0.0', '[]', '["react"]', 4530, 1779799220, 'active', 0, '2026-06-08 13:09:45', '2026-06-08 13:09:45');

-- 7. CREATE TABLE content
CREATE TABLE IF NOT EXISTS `content` (
                                         `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `classificationid` int(3) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-classification.name',
    `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
    `type` enum('post','page','block') NOT NULL,
    `userid` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-user.name',
    `status` ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
    `name` varchar(200) DEFAULT NULL,
    `title` varchar(200) DEFAULT NULL COMMENT 'loc',
    `excerpt` text DEFAULT NULL COMMENT 'loc',
    `description` text DEFAULT NULL COMMENT 'loc',
    `img` varchar(255) DEFAULT NULL,
    `published` datetime DEFAULT NULL,
    `created` datetime DEFAULT current_timestamp(),
    `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `lang` char(2) DEFAULT 'el',
    `view_count` int(10) UNSIGNED DEFAULT 0,
    `json` longtext DEFAULT NULL,
    `css` longtext DEFAULT NULL,
    `liking` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `userid` (`userid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. INSERT content
INSERT IGNORE INTO `content` (`id`, `classificationid`, `sort`, `type`, `userid`, `status`, `name`, `title`, `excerpt`, `description`, `img`, `published`, `created`, `updated`, `lang`, `view_count`, `json`, `css`, `liking`) VALUES
(1, 1, 0, 'post', 1, 'active', 'test-post', 'test-title', 'test-excerpt', 'test-description', 'https://sei.gr/wp-content/uploads/2026/03/viber_image_2026-03-16_09-36-55-762-768x1024.jpg', '2026-05-26 16:22:48', '2026-05-26 16:22:48', '2026-06-19 14:34:31', 'el', 0, '{}', '', 0),
(2, 1, 0, 'page', 1, 'active', 'test-page', 'test-title', 'test-except', 'test-description', 'https://www.902.gr/sites/default/files/styles/902-grid-8/public/MediaV2/20260408/afisa-imerida-eikona-ypo-elegxo-1.jpg?itok=9XZ7xrhW', '2026-05-26 16:25:03', '2026-05-26 16:25:03', '2026-06-19 14:34:35', 'el', 0, '{}', '', 0);

-- 9. CREATE TABLE content_components
CREATE TABLE IF NOT EXISTS `content_components` (
                                                    `id` int(11) NOT NULL AUTO_INCREMENT,
    `contentid` int(11) UNSIGNED NOT NULL,
    `componentid` int(11) NOT NULL,
    `area` enum('m','h','sr','sl','f') NOT NULL DEFAULT 'm',
    `sort_order` int(11) DEFAULT 0,
    `created` datetime DEFAULT NULL,
    `updated` datetime DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_component` (`contentid`,`componentid`,`area`),
    KEY `idx_content` (`contentid`),
    KEY `idx_component` (`componentid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. INSERT content_components
INSERT IGNORE INTO `content_components` (`id`, `contentid`, `componentid`, `area`, `sort_order`, `created`, `updated`) VALUES
(1, 1, 1, 'm', 0, NULL, '2026-06-08 16:47:37');

-- 11. CREATE TABLE language
CREATE TABLE IF NOT EXISTS `language` (
                                          `id` int(11) NOT NULL AUTO_INCREMENT,
    `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
    `code` varchar(10) DEFAULT NULL,
    `name` varchar(150) DEFAULT NULL,
    `status` ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
    `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'readonly',
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 12. INSERT language
INSERT IGNORE INTO `language` (`id`, `sort`, `code`, `name`, `status`, `created`) VALUES
(1, 0, 'ar', 'Arabic', 'closed', '2024-12-02 14:54:56'),
(2, 0, 'de', 'German', 'closed', '2024-12-02 14:54:56'),
(3, 0, 'el', 'Ελληνικά', 'active', '2024-12-02 14:54:56'),
(4, 0, 'en', 'English', 'closed', '2024-12-02 14:54:56'),
(5, 0, 'es', 'Spanish', 'closed', '2024-12-02 14:54:56'),
(6, 0, 'fr', 'French', 'closed', '2024-12-02 14:54:56');

-- 13. CREATE TABLE links
CREATE TABLE IF NOT EXISTS `links` (
                                       `id` int(11) NOT NULL AUTO_INCREMENT,
    `classificationid` int(10) UNSIGNED NOT NULL DEFAULT 1,
    `title` varchar(255) NOT NULL,
    `type` enum('website','video') NOT NULL DEFAULT 'website',
    `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
    `url` varchar(500) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `classificationid` (`classificationid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 14. INSERT links
INSERT IGNORE INTO `links` (`id`, `classificationid`, `title`, `type`, `sort`, `url`) VALUES
(1, 1, 'test link video', 'video', 0, 'https://www.youtube.com/watch?v=s09Qt3nrKoo'),
(2, 1, 'Test Link', 'website', 2, 'https://senariografoi.gr/');

-- 15. CREATE TABLE setup
CREATE TABLE IF NOT EXISTS `setup` (
    `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(200) DEFAULT NULL,
    `val` varchar(5000) DEFAULT NULL COMMENT 'loc-default',
    `tag` varchar(20) DEFAULT NULL COMMENT 'meta',
    `label` varchar(1000) DEFAULT NULL,
    `type` enum('text','decimal','json','img','pug','boolean','integer','meta') DEFAULT NULL,
    `description` longtext DEFAULT NULL,
    `permit` varchar(50) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 16. INSERT setup
INSERT IGNORE INTO `setup` (`id`, `name`, `val`, `tag`, `label`, `type`, `description`, `permit`) VALUES
(1, 'site_mail', 'nikosdrosakis%40gmail.com', 'contact', '0', 'text', 'The mail recipient of contact page', 'admin'),
(2, 'twitter', '', 'social', '0', 'text', 'Twitter account', 'admin'),
(3, 'facebook', 'https://web.facebook.com/profile.php?id=100082985457661', 'social', '0', 'text', 'Facebook account', 'admin'),
(4, 'github', '', 'social', '0', 'text', 'Github account', 'admin'),
(5, 'username', NULL, 'contact', '0', 'text', 'Email username', 'admin'),
(6, 'password', 'n130177!', 'contact', '0', 'text', 'Email password', 'admin'),
(7, 'pagin', '10', 'public', '0', 'integer', 'Pagination (number of result per list visible with page numbering)', 'admin'),
(8, 'description', NULL, 'setup', '0', 'text', 'Keywords of website for SEO divided by comma', 'admin'),
(9, 'seokeywords', 'cms,system,apps,bloggin,websites', 'head', '0', 'meta', 'Keywords of website for SEO divided by comma', 'admin'),
(10, 'seodescription', 'AIMD5%20is%20intended%20to%20be%20the%20root%20system%20for%20creating%20apps%20and%20websites%20and%20a%20creative%20lab%20where%20other%20elements%20can%20exist.%20', 'head', '0', 'meta', 'Description of website for SEO', 'admin'),
(11, 'system-version', '0.55', 'setup', '0', 'decimal', 'The systems version is', 'admin'),
(12, 'favicon', '%2Fimg%2Flogo.png', 'public', '0', 'img', 'Choose the logo of the website', 'admin'),
(13, 'title', 'Directors union', 'setup', '0', 'text', 'Set the title of the website', 'admin'),
(14, 'lang_default', 'el', 'language', '0', 'text', 'Default language (unchanged)', 'admin'),
(15, 'MEASUREMENT_ID', 'G-2TL1VM602B', 'analytics', '0', 'text', 'Analytics website ID', 'admin');

-- 17. CREATE TABLE user
CREATE TABLE IF NOT EXISTS `user` (
     `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'auto',
    `permission` enum('user','writer','editor','admin') NOT NULL DEFAULT 'user',
    `img` varchar(255) DEFAULT NULL COMMENT 'img-upload',
    `name` varchar(100) DEFAULT ΝΟΤ NULL UNIQUE,
    `pass` varchar(100) DEFAULT NULL COMMENT 'hidden',
    `fullname` varchar(200) DEFAULT NULL,
    `firstname` varchar(100) DEFAULT NULL,
    `lastname` varchar(100) DEFAULT NULL,
    `title` varchar(300) DEFAULT NULL COMMENT 'loc-default',
    `bio` mediumtext DEFAULT NULL COMMENT 'loc-default',
    `url` varchar(100) DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `city` mediumint(8) UNSIGNED NOT NULL DEFAULT 0,
    `tel` varchar(300) DEFAULT NULL,
    `status` ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
    `phase` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-phase',
    `display` tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
    `lang` char(2) NOT NULL DEFAULT 'en' COMMENT 'selectG-langs',
    `auth` varchar(50) DEFAULT NULL,
    `sp` varchar(100) DEFAULT NULL COMMENT 'hidden',
    `privacy` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectG-privacy',
    `last_login` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'readonly',
    `created` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
    `modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
    `edited` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 18. INSERT user
INSERT IGNORE INTO `user` (`id`, `permission`, `img`, `name`, `pass`, `fullname`, `firstname`, `lastname`, `title`, `bio`, `url`, `email`, `city`, `tel`, `status`, `phase`, `display`, `lang`, `auth`, `sp`, `privacy`, `last_login`, `created`, `modified`, `edited`) VALUES
(1, 'admin', '473246614_593180753458101_713413314025378162_n.jpg', 'enosi', '$2a$12$rJPePCfvbOH9gNEfSGL63usGrmIvTHAOG64oUjCz.IrthTinvP4xi', 'Ένωση Σκηνοθετών Δημιουργών', 'Ένωση', 'Σκηνοθετών και Δημιουργών', 'Καλλιτέχνης', '', '', 'directorscreatorsunion@gmail.com', 0, '', 'active', 1, 1, 'en', '1', 'dc9ce190cce8577167ca772964044d4f14f2d093f8ee5db46e405c94aa767fea', 1, 1781823737, '2026-06-19 02:59:28', '2026-06-19 02:59:28', '2026-06-19 02:59:28'),
(2, 'editor', 'image-1781794496588_1781794496.jpg', 'lenin', '$2y$10$5NBGuohvlEQjbfFQvJEFrekbRp6kNjvfYjYP14T1OzF0eiL7FGiUa', 'vladimir lenin', 'vladimir', 'lenin', '', '', 'http://drosakis.com', 'lenin@gmail.com', 0, 'newuser56', 'active', 2, 1, 'el', '1', '0', 1, 1723489102, '2026-06-18 17:59:06', '2026-06-18 14:59:06', '2026-06-18 14:59:06');

-- 19. CREATE TABLE user_subscription
CREATE TABLE IF NOT EXISTS `user_subscription` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `userid` int(11) UNSIGNED DEFAULT NULL COMMENT 'selectjoin-user.name',
    `linked_img` varchar(200) DEFAULT NULL,
    `access_token` text NOT NULL,
    `refresh_token` text DEFAULT NULL,
    `token_type` varchar(50) DEFAULT NULL,
    `scope` text DEFAULT NULL,
    `token_expiration` timestamp NULL DEFAULT NULL,
    `email_verified` tinyint(1) DEFAULT NULL,
    `issue_by` varchar(50) DEFAULT NULL,
    `issued_at` timestamp NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `service_name` varchar(100) NOT NULL,
    `service_id` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `uid` (`userid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 20. COMMIT
COMMIT;

-- ============================================
-- VERIFICATION QUERIES (optional)
-- ============================================
-- SELECT 'Tables created successfully!' AS status;
-- SHOW TABLES;