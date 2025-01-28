-- phpMyAdmin SQL Dump
-- version 5.2.1deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 22, 2025 at 09:41 PM
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
-- Table structure for table `c_trelingo_performance`
--

CREATE TABLE `c_trelingo_performance` (
  `id` int(11) NOT NULL,
  `cubo_trelingo_wordid` int(11) NOT NULL,
  `correct_italian` tinyint(1) DEFAULT 0,
  `correct_spanish` tinyint(1) DEFAULT 0,
  `attempts_italian` int(11) DEFAULT 0,
  `attempts_spanish` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `c_trelingo_performance`
--
ALTER TABLE `c_trelingo_performance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cubo_trelingo_wordid` (`cubo_trelingo_wordid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `c_trelingo_performance`
--
ALTER TABLE `c_trelingo_performance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `c_trelingo_performance`
--
ALTER TABLE `c_trelingo_performance`
  ADD CONSTRAINT `c_trelingo_performance_ibfk_1` FOREIGN KEY (`cubo_trelingo_wordid`) REFERENCES `c_trelingo_word` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
