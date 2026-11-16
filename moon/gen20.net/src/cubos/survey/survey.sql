sql = """-- GEN20 Survey Cubo
-- Database: gen_gen20net
-- Creates the research groups, questions and user answers tables.

CREATE TABLE IF NOT EXISTS `gen_gen20net`.`c_researchgrp` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title_el` VARCHAR(255) NOT NULL,
    `title_en` VARCHAR(255) DEFAULT NULL,
    `description_el` TEXT DEFAULT NULL,
    `description_en` TEXT DEFAULT NULL,
    `sort` INT NOT NULL DEFAULT 0,
    `status` TINYINT(1) NOT NULL DEFAULT 1,
    `created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_researchgrp_status_sort` (`status`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gen_gen20net`.`c_research` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `researchgrpid` INT UNSIGNED NOT NULL,
    `question_el` TEXT NOT NULL,
    `question_en` TEXT DEFAULT NULL,
    `option1_el` VARCHAR(500) DEFAULT NULL,
    `option1_en` VARCHAR(500) DEFAULT NULL,
    `option2_el` VARCHAR(500) DEFAULT NULL,
    `option2_en` VARCHAR(500) DEFAULT NULL,
    `option3_el` VARCHAR(500) DEFAULT NULL,
    `option3_en` VARCHAR(500) DEFAULT NULL,
    `option4_el` VARCHAR(500) DEFAULT NULL,
    `option4_en` VARCHAR(500) DEFAULT NULL,
    `sort` INT NOT NULL DEFAULT 0,
    `status` TINYINT(1) NOT NULL DEFAULT 1,
    `created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_research_group_sort` (`researchgrpid`, `sort`),
    CONSTRAINT `fk_research_group`
        FOREIGN KEY (`researchgrpid`)
        REFERENCES `gen_gen20net`.`c_researchgrp` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gen_gen20net`.`c_research_answer` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `researchid` INT UNSIGNED NOT NULL,
    `userid` INT UNSIGNED NOT NULL,
    `answer` TINYINT UNSIGNED NOT NULL,
    `created` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_research_answer_user` (`researchid`, `userid`),
    KEY `idx_research_answer_user` (`userid`),
    CONSTRAINT `fk_research_answer_question`
        FOREIGN KEY (`researchid`)
        REFERENCES `gen_gen20net`.`c_research` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `chk_research_answer_option`
        CHECK (`answer` BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""
path = "/mnt/data/gen20_survey.sql"
with open(path, "w", encoding="utf-8") as f:
    f.write(sql)
print(path)
