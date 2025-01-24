-- phpMyAdmin SQL Dump
-- version 5.2.1deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 22, 2025 at 09:38 PM
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
-- Table structure for table `c_diary`
--

CREATE TABLE `c_diary` (
  `id` int(11) NOT NULL,
  `time` time NOT NULL,
  `description` text NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `c_diary`
--

INSERT INTO `c_diary` (`id`, `time`, `description`, `created`) VALUES
(4, '09:48:00', 'αναζήτηση σπιτιου ημέρας', '2024-11-06 00:00:00'),
(5, '09:54:00', 'ΠΛΗΡΩΜΗ ΔΕΗ 55', '2024-11-06 00:00:00'),
(6, '10:28:00', 'spitogatoς, xe αναζήτηση, τηλ, εγγραφή στο golden home', '2024-11-06 00:00:00'),
(7, '10:00:00', 'gen20 - επαναφορά διόρθωση', '2024-11-06 00:00:00'),
(8, '10:30:00', 'προετοιμασία', '2024-11-06 00:00:00'),
(9, '10:45:00', 'supermarket, λάδι', '2024-11-06 00:00:00'),
(10, '10:50:00', 'Προετοιμασία λούσιμο χτένισμα, σφουγγάρισμα πριν φύγω ήρθαν τα μαλλιά', '2024-11-06 00:00:00'),
(11, '11:30:00', 'δρόμος μακρύς με κίνηση άργησα ΧΑΛΑΝΔΡΙ ΜΕ ΦΟΡΜΕΣ καστινγκ διαφημιστικό', '2024-11-06 00:00:00'),
(12, '12:40:00', 'γρήγορη πίτα', '2024-11-06 00:00:00'),
(13, '12:58:00', 'GEN20 πίσω ανοίγω διορθωσεις δεν ήρθε ακόμα, μήπως να βγει εντελως', '2024-11-06 00:00:00'),
(14, '13:30:00', 'ήρθαν ιδιοκτήτες απ’ τη βαρβάρα (σφουγγάρισμα/λάδι)', '2024-11-06 00:00:00'),
(15, '13:52:00', 'GEN20 has_maria method & πολλές αλλαγές', '2024-11-06 00:00:00'),
(16, '16:28:00', 'GEN20 επανήλθε, διορθώσεις στο φορμ', '2024-11-06 00:00:00'),
(17, '17:22:00', 'GEN20 insert new row bug, not fixed', '2024-11-06 00:00:00'),
(18, '18:04:00', 'φακές', '2024-11-06 00:00:00'),
(19, '18:19:00', 'GEN20 onkeyup search updateForm', '2024-11-06 00:00:00'),
(20, '18:57:00', 'τρία λεπτά η νίκη του trump', '2024-11-06 00:00:00'),
(21, '19:18:00', 'το search buildTable δεν είναι σωστό, το mediac έχει διορθώσεις, ποιο το εναλλακτικό πλάνο …. Διορθώσεις', '2024-11-06 00:00:00'),
(22, '19:36:00', 'τα λεπτά που φεύγουν είναι πολύτιμα', '2024-11-06 00:00:00'),
(23, '20:09:00', 'ανδρέας μου, με το κινητό πάλι μαζί σε διάσπαση, βοήθησε κι η άρτεμη τραγούδησε, τραγούδησα. Κάτι έγινε. Έστω κι έτσι..', '2024-11-06 00:00:00'),
(24, '21:00:00', 'pdf loanapp update ΔΕΝ ΕΓΙΝΕ', '2024-11-06 00:00:00'),
(25, '21:26:00', 'να κάνω μία πρώτη main poetanote για το poetabook, εδώ χρειάζονται, Αριστερά τα ποιήματα σε google drive', '2024-11-06 00:00:00'),
(26, '22:37:00', 'βγήκε γρήγορα το draft main με 5 cubos', '2024-11-06 00:00:00'),
(27, '22:47:00', 'νομίζω πως τα public θα έβγαιναν πολύ γρήγορα αν ξεμπέρδευα με αρκετά συστημικά πράγματα, οπότε ας κάνω τα Public και λίγα λίγα θα φτιάξω και τ’ άλλα.', '2024-11-06 00:00:00'),
(28, '23:29:00', 'Πρόβλημα στο kronos apy', '2024-11-06 00:00:00'),
(29, '01:05:00', 'το πρόβλημα παραμένει ελιγμός είναι ο ύπνος νομίζω τώρα. Το κρονος δεν τρέχει… να πάρει, to pedia cubo με', '2024-11-06 00:00:00'),
(30, '01:23:00', 'το hugging face μπαίνει στο nodejs … .αλλά μάλλον καλλυτερος ελιγμός είναι να κοιμηθώ, η ώρα παιρνάει γρήγορα και δεν είμαι παραγωιγκός.', '2024-11-06 00:00:00'),
(31, '03:25:00', 'GEN20 φτιάχτηκε το diary, στο μέτρο αυτού του ωρολογίου προγράμματος.', '2024-11-06 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `c_diary`
--
ALTER TABLE `c_diary`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `c_diary`
--
ALTER TABLE `c_diary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
