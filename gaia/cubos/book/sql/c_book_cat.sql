-- phpMyAdmin SQL Dump
-- version 5.2.1deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 27, 2025 at 10:43 AM
-- Server version: 11.4.4-MariaDB-deb12-log
-- PHP Version: 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gen_vivalibrocom`
--

-- --------------------------------------------------------

--
-- Table structure for table `c_book_cat`
--

CREATE TABLE `c_book_cat` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `img` varchar(200) DEFAULT NULL,
  `parent` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(400) NOT NULL,
  `edited` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `c_book_cat`
--

INSERT INTO `c_book_cat` (`id`, `img`, `parent`, `name`, `edited`) VALUES
(1, NULL, 0, 'φιλοσοφία', '2024-07-23 12:02:26'),
(13, NULL, 30, 'διαδίκτυο', '2024-07-23 12:02:26'),
(14, NULL, 25, 'ανθρώπινα δικαιώματα', '2024-07-23 12:02:26'),
(15, NULL, 0, 'πολιτική', '2024-07-23 12:02:26'),
(17, NULL, 15, 'πολιτική φιλοσοφία', '2024-07-23 12:02:26'),
(19, NULL, 15, 'πολιτικά κείμενα', '2024-07-23 12:02:26'),
(23, NULL, 0, 'επιστήμες', '2024-07-23 12:02:26'),
(24, NULL, 23, 'μαθηματικά', '2024-07-23 12:02:26'),
(25, NULL, 0, 'κοινωνικές επιστήμες', '2024-07-23 12:02:26'),
(26, NULL, 0, 'τέχνη', '2024-07-23 12:02:26'),
(27, NULL, 26, 'θέατρο', '2024-07-23 12:02:26'),
(28, NULL, 17, 'αναρχία', '2024-07-23 12:02:26'),
(29, NULL, 17, 'μαρξισμός', '2024-07-23 12:02:26'),
(30, NULL, 0, 'τεχνολογία', '2024-07-23 12:02:26'),
(31, NULL, 0, 'ψυχολογία', '2024-07-23 12:02:26'),
(32, NULL, 26, 'μουσική', '2024-07-23 12:02:26'),
(33, NULL, 25, 'μετανάστευση', '2024-07-23 12:02:26'),
(35, NULL, 0, 'ιστορία', '2024-07-23 12:02:26'),
(36, NULL, 38, 'πεζογραφία', '2024-07-23 12:02:26'),
(37, NULL, 38, 'ποίηση', '2024-07-23 12:02:26'),
(39, NULL, 26, 'κινηματογράφος', '2024-07-23 12:02:26'),
(40, NULL, 0, 'οικονομικά', '2024-07-23 12:02:26'),
(41, NULL, 0, 'προγραμματισμός', '2024-07-23 12:02:26'),
(43, NULL, 0, 'ΜΜΕ', '2024-07-23 12:02:26'),
(44, NULL, 46, 'παιδαγωγική', '2024-07-23 12:02:26'),
(45, NULL, 46, 'ειδικά παιδιά', '2024-07-23 12:02:26'),
(46, NULL, 0, 'παιδιά', '2024-07-23 12:02:26'),
(47, NULL, 25, 'εγκληματολογία', '2024-07-23 12:02:26'),
(48, NULL, 25, 'κοινωνιολογία', '2024-07-23 12:25:29'),
(49, NULL, 0, 'υγεία', '2024-07-23 12:02:26'),
(50, NULL, 38, 'παραμύθια', '2024-07-23 12:02:26'),
(51, NULL, 0, 'μύθοι', '2024-07-23 12:02:26'),
(52, NULL, 27, 'αγγλικό θέατρο', '2024-07-23 12:02:26'),
(53, NULL, 15, 'πολιτική θεωρία', '2024-07-23 12:02:26'),
(54, NULL, 0, 'ψυχανάλυση', '2024-07-23 12:02:26'),
(55, NULL, 15, 'διπλωματία', '2024-07-23 12:02:26'),
(56, NULL, 35, 'ιστορία χωρών', '2024-07-23 12:02:26'),
(57, NULL, 15, 'πολιτικό δοκίμιο', '2024-07-23 12:02:26'),
(59, NULL, 0, 'Μιχαήλ Μπακούνιν', '2024-07-23 12:02:26'),
(60, NULL, 0, 'Peter Kropotkin', '2024-07-29 16:06:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `c_book_cat`
--
ALTER TABLE `c_book_cat`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `c_book_cat`
--
ALTER TABLE `c_book_cat`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
