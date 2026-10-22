<?php
namespace Core\Traits;
use Exception;
/**
 CREATE TABLE `classification` (
   `id` int UNSIGNED NOT NULL COMMENT 'same as code, numeric classification',
   `parent_id` int UNSIGNED NOT NULL DEFAULT 0 COMMENT 'parent classification id (0 = root)',
   `level` tinyint UNSIGNED NOT NULL DEFAULT 1,
   `name` varchar(300) NOT NULL,
   `name_el` varchar(300) DEFAULT NULL,
   `name_en` varchar(300) DEFAULT NULL,
   `description` text DEFAULT NULL,
   `sort_order` int UNSIGNED NOT NULL DEFAULT 0,
   `is_active` tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
   `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

   PRIMARY KEY (`id`),
   KEY `parent_id` (`parent_id`),
   KEY `level` (`level`),
   KEY `parent_level` (`parent_id`, `level`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 -- Για να υποστηρίζεις αναδρομικά queries (MariaDB 10.2+)
 -- Μπορείς να προσθέσεις και CTE support
 */

 trait Classification {

   protected function fetchContentArchive(){}
   protected function fetchContent($id){}
   protected function UpdateContent($id){}

 }