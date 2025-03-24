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
-- Table structure for table `c_book_libuser`
--

CREATE TABLE `c_book_libuser` (
  `id` int(10) UNSIGNED NOT NULL,
  `libid` int(10) UNSIGNED NOT NULL COMMENT 'selectjoin-gen_vivalibrocom.lib.name',
  `bookid` int(10) UNSIGNED NOT NULL,
  `score` tinyint(2) UNSIGNED NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `isread` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `registered` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `c_book_libuser`
--
ALTER TABLE `c_book_libuser`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookid` (`bookid`),
  ADD KEY `bookuser_ibfk_2` (`libid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `c_book_libuser`
--
ALTER TABLE `c_book_libuser`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `c_book_libuser`
--
ALTER TABLE `c_book_libuser`
  ADD CONSTRAINT `c_book_libuser_ibfk_1` FOREIGN KEY (`bookid`) REFERENCES `c_book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `c_book_libuser_ibfk_2` FOREIGN KEY (`libid`) REFERENCES `c_book_lib` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
