-- ============================================
-- GEN20 DATABASE SCHEMA (moon default setup)
-- ============================================

CREATE TABLE IF NOT EXISTS `classification` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `title` varchar(500) DEFAULT NULL COMMENT 'loc',
  `description` text DEFAULT NULL COMMENT 'loc',
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO `classification` VALUES
(1,'actions','Δράσεις','Ομάδα δράσεων','2026-11-21 02:54:53','2026-11-21 03:45:51');
CREATE TABLE IF NOT EXISTS `comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(10) unsigned NOT NULL COMMENT 'selectjoin.user.name',
  `type` enum('content','book') NOT NULL,
  `typeid` int(10) unsigned NOT NULL,
  `content` mediumtext NOT NULL,
  `status` enum('inactive','active','closed') NOT NULL DEFAULT 'active',
  `reply_id` int(10) unsigned NOT NULL DEFAULT 0,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `modified` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT IGNORE INTO `comment` VALUES
(1,1,'content',1,'Great%20job%2C%20Niki!','active',0,'2026-06-03 16:00:15','2026-06-03 16:00:15');
CREATE TABLE IF NOT EXISTS `content` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `classificationid` int(3) unsigned NOT NULL DEFAULT 1 COMMENT 'selectjoin-classification.name',
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `type` enum('post','page','block') NOT NULL,
  `userid` int(10) unsigned NOT NULL DEFAULT 1 COMMENT 'selectjoin-user.name',
  `status` enum('inactive','active','closed') NOT NULL DEFAULT 'active',
  `name` varchar(200) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL COMMENT 'loc',
  `excerpt` text DEFAULT NULL COMMENT 'loc',
  `description` text DEFAULT NULL COMMENT 'loc',
  `img` varchar(255) DEFAULT NULL,
  `published` datetime DEFAULT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lang` char(2) DEFAULT 'el',
  `view_count` int(10) unsigned DEFAULT 0,
  `json` longtext DEFAULT NULL,
  `css` longtext DEFAULT NULL,
  `liking` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT IGNORE INTO `content` VALUES
(1,1,0,'post',1,'active','first-action','First Action Title','First Action Excerpt','Αυτή είναι η πρώτη δημοσίευση δράσεων ','https://sei.gr/wp-content/uploads/2026/03/viber_image_2026-03-16_09-36-55-762-768x1024.jpg','2026-05-26 16:22:48','2026-05-26 16:22:48','2026-11-21 03:47:00','el',0,'{}','',0);
CREATE TABLE IF NOT EXISTS `language` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `status` enum('inactive','active','closed') NOT NULL DEFAULT 'active',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'readonly',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT IGNORE INTO `language` VALUES
(1,0,'ar','Arabic','closed','2024-12-02 14:54:56'),
(2,0,'de','German','closed','2024-12-02 14:54:56'),
(3,0,'el','Ελληνικά','active','2024-12-02 14:54:56'),
(4,0,'en','English','closed','2024-12-02 14:54:56'),
(5,0,'es','Spanish','closed','2024-12-02 14:54:56'),
(6,0,'fr','French','closed','2024-12-02 14:54:56');
CREATE TABLE IF NOT EXISTS `settings` (
  `id` mediumint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `val` varchar(5000) DEFAULT NULL COMMENT 'loc-default',
  `tag` varchar(20) DEFAULT NULL COMMENT 'meta',
  `label` varchar(1000) DEFAULT NULL,
  `type` enum('text','decimal','json','img','pug','boolean','integer','meta') DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `permit` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT IGNORE INTO `settings` VALUES
(1,'site_mail','nikosdrosakis%40gmail.com','contact','0','text','The mail recipient of contact page','admin'),
(2,'twitter','','social','0','text','Twitter account','admin'),
(3,'facebook','https://web.facebook.com/profile.php?id=100082985457661','social','0','text','Facebook account','admin'),
(4,'github','','social','0','text','Github account','admin'),
(5,'username',NULL,'contact','0','text','Email username','admin'),
(6,'password','n130177!','contact','0','text','Email password','admin'),
(7,'pagin','10','public','0','integer','Pagination (number of result per list visible with page numbering)','admin'),
(8,'description',NULL,'setup','0','text','Keywords of website for SEO divided by comma','admin'),
(9,'seokeywords','cms,system,apps,bloggin,websites','head','0','meta','Keywords of website for SEO divided by comma','admin'),
(10,'seodescription','AIMD5%20is%20intended%20to%20be%20the%20root%20system%20for%20creating%20apps%20and%20websites%20and%20a%20creative%20lab%20where%20other%20elements%20can%20exist.%20','head','0','meta','Description of website for SEO','admin'),
(11,'system-version','0.55','setup','0','decimal','The systems version is','admin'),
(12,'favicon','%2Fimg%2Flogo.png','public','0','img','Choose the logo of the website','admin'),
(13,'title','Directors union','setup','0','text','Set the title of the website','admin'),
(14,'lang_default','el','language','0','text','Default language (unchanged)','admin'),
(15,'MEASUREMENT_ID','G-2TL1VM602B','analytics','0','text','Analytics website ID','admin');
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'auto',
  `permission` enum('user','writer','editor','admin') NOT NULL DEFAULT 'user',
  `img` varchar(255) DEFAULT NULL COMMENT 'img-upload',
  `title` varchar(500) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `pass` varchar(100) DEFAULT NULL COMMENT 'hidden',
  `fullname` varchar(200) DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `bio` mediumtext DEFAULT NULL COMMENT 'loc-default',
  `url` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `city` mediumint(8) unsigned NOT NULL DEFAULT 0,
  `tel` varchar(300) DEFAULT NULL,
  `status` tinyint(1) unsigned NOT NULL DEFAULT 0 COMMENT 'selectG-status',
  `phase` tinyint(1) unsigned NOT NULL DEFAULT 0 COMMENT 'selectG-phase',
  `display` tinyint(1) unsigned NOT NULL DEFAULT 1,
  `lang` char(2) NOT NULL DEFAULT 'en' COMMENT 'selectG-langs',
  `auth` varchar(50) DEFAULT NULL,
  `sp` varchar(100) DEFAULT NULL COMMENT 'hidden',
  `privacy` tinyint(1) unsigned NOT NULL DEFAULT 1 COMMENT 'selectG-privacy',
  `last_login` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'readonly',
  `created` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
  `modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
  `edited` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
  `classificationid` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT IGNORE INTO `user` VALUES
(1,'admin','team-3.jpg','','gen20','$2a$12$rJPePCfvbOH9gNEfSGL63usGrmIvTHAOG64oUjCz.IrthTinvP4xi','Nikolas Drosakis','Νικόλας','Δροσάκης','Ο Νικόλας Δροσάκης απ’ το Ρέθυμνο, δέκα χρόνια ηθοποιός θεάτρου, τρίτη του σκηνοθεσία στο θέατρο, ιδρυτής της Γενιάς 20.','','info@gen20.net',0,'',2,2,1,'en','1','dc9ce190cce8577167ca772964044d4f14f2d093f8ee5db46e405c94aa767fea',1,1781089390,'2026-10-30 02:12:47','2026-10-30 00:12:47','2026-10-30 00:12:47',1);
CREATE TABLE IF NOT EXISTS `user_connection` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(10) unsigned NOT NULL,
  `service_name` varchar(50) NOT NULL,
  `service_id` varchar(100) NOT NULL,
  `token_expiration` timestamp NULL DEFAULT NULL,
  `secrets` blob NOT NULL,
  `key_id` varchar(20) NOT NULL,
  `issued_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_identity` (`service_name`,`service_id`),
  UNIQUE KEY `uq_user_service` (`userid`,`service_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `user_subscription` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) unsigned DEFAULT NULL COMMENT 'selectjoin-user.name',
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
