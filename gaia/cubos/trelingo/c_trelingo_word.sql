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
-- Table structure for table `c_trelingo_word`
--

CREATE TABLE `c_trelingo_word` (
  `id` int(11) NOT NULL,
  `type` enum('verb','noun','adjective','phrase') NOT NULL,
  `word` text DEFAULT NULL COMMENT 'loc-default',
  `word_it` text DEFAULT NULL COMMENT 'loc-default',
  `word_sp` text DEFAULT NULL COMMENT 'loc-default',
  `updated` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `c_trelingo_word`
--

INSERT INTO `c_trelingo_word` (`id`, `type`, `word`, `word_it`, `word_sp`, `updated`) VALUES
(1, 'verb', 'know', 'sapere', 'saber', '2024-12-09 14:38:45'),
(2, 'verb', 'think', 'pensare', 'pensar', '2024-12-09 14:38:45'),
(3, 'verb', 'take', 'prendere', 'tomar', '2024-12-09 14:38:45'),
(4, 'verb', 'see', 'vedere', 'ver', '2024-12-09 14:38:45'),
(5, 'verb', 'come', 'venire', 'venir', '2024-12-09 14:38:45'),
(6, 'verb', 'want', 'volere', 'querer', '2024-12-09 14:38:45'),
(7, 'verb', 'use', 'usare', 'usar', '2024-12-09 14:38:45'),
(8, 'verb', 'find', 'trovare', 'encontrar', '2024-12-09 14:38:45'),
(9, 'verb', 'give', 'dare', 'dar', '2024-12-09 14:38:45'),
(10, 'verb', 'tell', 'raccontare', 'contar', '2024-12-09 14:38:45'),
(11, 'verb', 'work', 'lavorare', 'trabajar', '2024-12-09 14:38:45'),
(12, 'verb', 'call', 'chiamare', 'llamar', '2024-12-09 14:38:45'),
(13, 'verb', 'try', 'provare', 'intentar', '2024-12-09 14:38:45'),
(14, 'verb', 'ask', 'chiedere', 'preguntar', '2024-12-09 14:38:45'),
(15, 'verb', 'need', 'avere bisogno di', 'necesitar', '2024-12-09 14:38:45'),
(16, 'verb', 'feel', 'sentire', 'sentir', '2024-12-09 14:38:45'),
(17, 'verb', 'leave', 'lasciare', 'salir', '2024-12-09 14:38:45'),
(18, 'verb', 'put', 'mettere', 'poner', '2024-12-09 14:38:45'),
(19, 'verb', 'mean', 'significare', 'significar', '2024-12-09 14:38:45'),
(20, 'verb', 'keep', 'tenere', 'mantener', '2024-12-09 14:38:45'),
(21, 'verb', 'let', 'lasciare', 'permitir', '2024-12-09 14:38:45'),
(22, 'verb', 'begin', 'iniziare', 'empezar', '2024-12-09 14:38:45'),
(23, 'verb', 'help', 'aiutare', 'ayudar', '2024-12-09 14:38:45'),
(24, 'verb', 'talk', 'parlare', 'hablar', '2024-12-09 14:38:45'),
(25, 'verb', 'turn', 'girare', 'girar', '2024-12-09 14:38:45'),
(26, 'verb', 'start', 'cominciare', 'comenzar', '2024-12-09 14:38:45'),
(27, 'verb', 'show', 'mostrare', 'mostrar', '2024-12-09 14:38:45'),
(28, 'verb', 'hear', 'sentire', 'oír', '2024-12-09 14:38:45'),
(29, 'verb', 'play', 'giocare', 'jugar', '2024-12-09 14:38:45'),
(30, 'verb', 'run', 'correre', 'correr', '2024-12-09 14:38:45'),
(31, 'verb', 'move', 'muovere', 'mover', '2024-12-09 14:38:45'),
(32, 'verb', 'like', 'piacere', 'gustar', '2024-12-09 14:38:45'),
(33, 'verb', 'live', 'vivere', 'vivir', '2024-12-09 14:38:45'),
(34, 'verb', 'believe', 'credere', 'creer', '2024-12-09 14:38:45'),
(35, 'verb', 'hold', 'tenere', 'sostener', '2024-12-09 14:38:45'),
(36, 'verb', 'write', 'scrivere', 'escribir', '2024-12-09 14:38:45'),
(37, 'verb', 'stand', 'stare in piedi', 'estar de pie', '2024-12-09 14:38:45'),
(38, 'verb', 'sit', 'sedersi', 'sentarse', '2024-12-09 14:38:45'),
(39, 'verb', 'lose', 'perdere', 'perder', '2024-12-09 14:38:45'),
(40, 'verb', 'pay', 'pagare', 'pagar', '2024-12-09 14:38:45'),
(41, 'verb', 'meet', 'incontrare', 'encontrar', '2024-12-09 14:38:45'),
(42, 'verb', 'include', 'includere', 'incluir', '2024-12-09 14:38:45'),
(43, 'verb', 'continue', 'continuare', 'continuar', '2024-12-09 14:38:45'),
(44, 'verb', 'set', 'impostare', 'establecer', '2024-12-09 14:38:45'),
(45, 'verb', 'learn', 'imparare', 'aprender', '2024-12-09 14:38:45'),
(46, 'verb', 'change', 'cambiare', 'cambiar', '2024-12-09 14:38:45'),
(47, 'verb', 'watch', 'guardare', 'mirar', '2024-12-09 14:38:45'),
(48, 'verb', 'follow', 'seguire', 'seguir', '2024-12-09 14:38:45'),
(49, 'verb', 'stop', 'fermare', 'detener', '2024-12-09 14:38:45'),
(50, 'verb', 'create', 'creare', 'crear', '2024-12-09 14:38:45'),
(51, 'verb', 'speak', 'parlare', 'hablar', '2024-12-09 14:38:45'),
(52, 'verb', 'read', 'leggere', 'leer', '2024-12-09 14:38:45'),
(53, 'verb', 'grow', 'crescere', 'crecer', '2024-12-09 14:38:45'),
(54, 'verb', 'open', 'aprire', 'abrir', '2024-12-09 14:38:45'),
(55, 'verb', 'walk', 'camminare', 'caminar', '2024-12-09 14:38:45'),
(56, 'verb', 'win', 'vincere', 'ganar', '2024-12-09 14:38:45'),
(57, 'verb', 'offer', 'offrire', 'ofrecer', '2024-12-09 14:38:45'),
(58, 'verb', 'remember', 'ricordare', 'recordar', '2024-12-09 14:38:45'),
(59, 'verb', 'love', 'amare', 'amar', '2024-12-09 14:38:45'),
(60, 'verb', 'wait', 'aspettare', 'esperar', '2024-12-09 14:38:45'),
(61, 'verb', 'die', 'morire', 'morir', '2024-12-09 14:38:45'),
(62, 'verb', 'send', 'inviare', 'enviar', '2024-12-09 14:38:45'),
(63, 'verb', 'build', 'costruire', 'construir', '2024-12-09 14:38:45'),
(64, 'verb', 'stay', 'restare', 'quedarse', '2024-12-09 14:38:45'),
(65, 'verb', 'cut', 'tagliare', 'cortar', '2024-12-09 14:38:45'),
(66, 'verb', 'return', 'ritornare', 'volver', '2024-12-09 14:38:45'),
(67, 'verb', 'explain', 'spiegare', 'explicar', '2024-12-09 14:38:45'),
(68, 'verb', 'hope', 'sperare', 'esperar', '2024-12-09 14:38:45'),
(69, 'verb', 'decide', 'decidere', 'decidir', '2024-12-09 14:38:45'),
(70, 'verb', 'develop', 'sviluppare', 'desarrollar', '2024-12-09 14:38:45'),
(71, 'verb', 'sell', 'vendere', 'vender', '2024-12-09 14:38:45'),
(72, 'verb', 'break', 'rompere', 'romper', '2024-12-09 14:38:45'),
(73, 'verb', 'thank', 'ringraziare', 'agradecer', '2024-12-09 14:38:45'),
(74, 'verb', 'apply', 'applicare', 'aplicar', '2024-12-09 14:38:45'),
(75, 'verb', 'close', 'chiudere', 'cerrar', '2024-12-09 14:38:45'),
(76, 'verb', 'agree', 'essere d\'accordo', 'estar de acuerdo', '2024-12-09 14:38:45'),
(77, 'verb', 'support', 'supportare', 'apoyar', '2024-12-09 14:38:45'),
(78, 'verb', 'raise', 'sollevare', 'levantar', '2024-12-09 14:38:45'),
(79, 'verb', 'pass', 'passare', 'pasar', '2024-12-09 14:38:45'),
(80, 'verb', 'spend', 'spendere', 'gastar', '2024-12-09 14:38:45'),
(81, 'verb', 'save', 'salvare', 'ahorrar', '2024-12-09 14:38:45'),
(82, 'verb', 'fight', 'combattere', 'luchar', '2024-12-09 14:38:45'),
(83, 'verb', 'send', 'spedire', 'mandar', '2024-12-09 14:38:45'),
(84, 'verb', 'forgive', 'perdonare', 'perdonar', '2024-12-09 14:38:45'),
(85, 'verb', 'choose', 'scegliere', 'elegir', '2024-12-09 14:38:45'),
(86, 'verb', 'prepare', 'preparare', 'preparar', '2024-12-09 14:38:45'),
(87, 'verb', 'enjoy', 'divertirsi', 'disfrutar', '2024-12-09 14:38:45'),
(88, 'verb', 'finish', 'finire', 'terminar', '2024-12-09 14:38:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `c_trelingo_word`
--
ALTER TABLE `c_trelingo_word`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `c_trelingo_word`
--
ALTER TABLE `c_trelingo_word`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
