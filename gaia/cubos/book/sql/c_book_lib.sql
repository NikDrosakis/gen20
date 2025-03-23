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
-- Table structure for table `c_book_lib`
--

CREATE TABLE `c_book_lib` (
  `id` int(10) UNSIGNED NOT NULL,
  `userid` int(10) UNSIGNED NOT NULL COMMENT 'selectjoin-gen_vivalibrocom.user.name',
  `img` varchar(200) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `privacy` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `modified` int(11) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `c_book_lib`
--

INSERT INTO `c_book_lib` (`id`, `userid`, `img`, `name`, `status`, `privacy`, `modified`, `created`) VALUES
(3, 2, NULL, 'Nelson Library', 2, 0, 0, '2024-08-19 22:41:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `c_book_lib`
--
ALTER TABLE `c_book_lib`
  ADD PRIMARY KEY (`id`),
  ADD KEY `libraries_ibfk_1` (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `c_book_lib`
--
ALTER TABLE `c_book_lib`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `c_book_lib`
--
ALTER TABLE `c_book_lib`
  ADD CONSTRAINT `c_book_lib_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
