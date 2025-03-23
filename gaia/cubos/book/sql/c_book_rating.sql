-- phpMyAdmin SQL Dump
-- version 5.2.1deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 27, 2025 at 10:44 AM
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
-- Table structure for table `c_book_rating`
--

CREATE TABLE `c_book_rating` (
  `userid` int(10) UNSIGNED NOT NULL,
  `bookid` int(10) UNSIGNED NOT NULL COMMENT 'selectjoin-gen_vivalibrocom.c_book.name',
  `stars` smallint(1) UNSIGNED NOT NULL DEFAULT 0,
  `created` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `c_book_rating`
--

INSERT INTO `c_book_rating` (`userid`, `bookid`, `stars`, `created`) VALUES
(1, 278244, 5, 1723310751),
(1, 271876, 5, 1723311022),
(1, 273247, 5, 1723311032),
(1, 275496, 1, 1723311056),
(1, 273454, 1, 1723322589),
(1, 274998, 5, 1724841339);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
