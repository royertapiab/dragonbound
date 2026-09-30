/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dragonbound
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_sessions`
--

DROP TABLE IF EXISTS `account_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_sessions` (
  `session_id` varchar(120) NOT NULL,
  `expires_time` varchar(80) DEFAULT NULL,
  `data_acc` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_sessions`
--

LOCK TABLES `account_sessions` WRITE;
/*!40000 ALTER TABLE `account_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(120) DEFAULT NULL,
  `Name` varchar(120) DEFAULT NULL,
  `Password` varchar(45) DEFAULT NULL,
  `PinUser` int(5) NOT NULL,
  `Salt` varchar(10) DEFAULT NULL,
  `Session` varchar(45) DEFAULT NULL,
  `views` int(10) DEFAULT 0,
  `IsOnline` int(11) DEFAULT NULL,
  `Birthday` timestamp NULL DEFAULT NULL,
  `facebook_id` varchar(70) DEFAULT '0',
  `Username` varchar(50) DEFAULT NULL,
  `IP` varchar(45) NOT NULL DEFAULT '0.0.0.0',
  `no_win_bonus` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Username_UNIQUE` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES
(1,'','Destroyer','Abcd#1234',724,':','734527d8971d3b8d5c554019b17bbd81',5,0,'2026-09-28 23:21:25','0','Destroyer','127.0.0.1','{}'),
(2,'','1nsane','Abcd#1234',1234,':','734527d8971d3b8d5c554019b17bbd81',0,0,'2026-09-29 02:04:25','0','1nsane','127.0.0.1','{}');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_audit_log`
--

DROP TABLE IF EXISTS `admin_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_user_id` int(11) NOT NULL,
  `admin_game_id` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `target_game_id` varchar(50) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_log`
--

LOCK TABLES `admin_audit_log` WRITE;
/*!40000 ALTER TABLE `admin_audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_permissions`
--

DROP TABLE IF EXISTS `admin_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permission_key` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_key` (`permission_key`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
INSERT INTO `admin_permissions` VALUES
(1,'dashboard.view','Ver Dashboard','Permite visualizar estadísticas globales del servidor'),
(2,'players.view','Ver Jugadores','Permite listar y ver perfiles de jugadores'),
(3,'players.edit','Editar Jugadores','Permite editar información de jugadores'),
(4,'players.change_rank','Cambiar Rango','Permite alterar el nivel o rango de un jugador'),
(5,'players.manage_staff','Gestionar Staff','Permite otorgar o revocar privilegios'),
(6,'economy.view','Ver Economía','Permite consultar balances económicos'),
(7,'economy.add_gold','Añadir Oro','Permite recargar oro a jugadores'),
(8,'economy.remove_gold','Quitar Oro','Permite restar oro a jugadores'),
(9,'economy.add_cash','Añadir Cash','Permite recargar cash a jugadores'),
(10,'economy.remove_cash','Quitar Cash','Permite restar cash a jugadores'),
(11,'economy.add_gp','Añadir GP','Permite sumar GP a jugadores'),
(12,'economy.remove_gp','Quitar GP','Permite restar GP a jugadores'),
(13,'inventory.view','Ver Inventario','Permite ver avatares de jugadores'),
(14,'inventory.add','Añadir Avatar','Permite otorgar avatares a jugadores'),
(15,'inventory.remove','Quitar Avatar','Permite eliminar avatares de jugadores'),
(16,'inventory.equip','Equipar Avatar','Permite forzar equipamiento de avatares'),
(17,'moderation.view','Ver Moderación','Permite ver lista de baneos y sanciones'),
(18,'moderation.ban','Banear Jugador','Permite aplicar baneos a cuentas'),
(19,'moderation.unban','Desbanear Jugador','Permite levantar baneos a cuentas'),
(20,'moderation.ban_ip','Banear IP','Permite bloquear direcciones IP'),
(21,'moderation.kick','Expulsar Jugador','Permite desconectar jugadores del servidor'),
(22,'moderation.mute','Silenciar Jugador','Permite mutear chat a jugadores'),
(23,'guilds.view','Ver Clanes','Permite ver información de clanes'),
(24,'guilds.edit','Editar Clanes','Permite modificar clanes'),
(25,'games.view','Ver Partidas','Permite ver historial de partidas'),
(26,'server.view','Ver Estado del Servidor','Permite monitorizar servicios y recursos'),
(27,'server.restart_game','Reiniciar Game Server','Permite reiniciar el proceso del servidor de juego'),
(28,'server.restart_web','Reiniciar Web Server','Permite reiniciar el servidor web'),
(29,'logs.view','Ver Logs','Permite ver logs del sistema de forma segura'),
(30,'staff.view','Ver Staff','Permite listar el personal administrativo'),
(31,'staff.create','Crear Staff','Permite nombrar administradores'),
(32,'staff.edit','Editar Staff','Permite modificar roles de administradores'),
(33,'staff.remove','Eliminar Staff','Permite remover acceso al panel'),
(34,'audit.view','Ver Auditoría','Permite consultar el log de auditoría');
/*!40000 ALTER TABLE `admin_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_role_permissions`
--

DROP TABLE IF EXISTS `admin_role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_arp_perm` (`permission_id`),
  CONSTRAINT `fk_arp_perm` FOREIGN KEY (`permission_id`) REFERENCES `admin_permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_arp_role` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_role_permissions`
--

LOCK TABLES `admin_role_permissions` WRITE;
/*!40000 ALTER TABLE `admin_role_permissions` DISABLE KEYS */;
INSERT INTO `admin_role_permissions` VALUES
(1,1),
(1,2),
(1,3),
(1,4),
(1,5),
(1,6),
(1,7),
(1,8),
(1,9),
(1,10),
(1,11),
(1,12),
(1,13),
(1,14),
(1,15),
(1,16),
(1,17),
(1,18),
(1,19),
(1,20),
(1,21),
(1,22),
(1,23),
(1,24),
(1,25),
(1,26),
(1,27),
(1,28),
(1,29),
(1,30),
(1,31),
(1,32),
(1,33),
(1,34),
(2,1),
(2,2),
(2,3),
(2,4),
(2,5),
(2,6),
(2,7),
(2,8),
(2,9),
(2,10),
(2,11),
(2,12),
(2,13),
(2,14),
(2,15),
(2,16),
(2,17),
(2,18),
(2,19),
(2,20),
(2,21),
(2,22),
(2,23),
(2,24),
(2,25),
(2,26),
(2,29),
(2,30),
(2,32),
(2,34),
(3,1),
(3,2),
(3,3),
(3,6),
(3,7),
(3,9),
(3,11),
(3,13),
(3,14),
(3,15),
(3,16),
(3,17),
(3,18),
(3,19),
(3,21),
(3,22),
(3,23),
(3,25),
(4,1),
(4,2),
(4,17),
(4,18),
(4,19),
(4,21),
(4,22),
(4,23),
(4,25),
(5,1),
(5,2),
(5,23),
(5,25);
/*!40000 ALTER TABLE `admin_role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_roles`
--

DROP TABLE IF EXISTS `admin_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_roles`
--

LOCK TABLES `admin_roles` WRITE;
/*!40000 ALTER TABLE `admin_roles` DISABLE KEYS */;
INSERT INTO `admin_roles` VALUES
(1,'OWNER','Propietario del servidor con acceso absoluto e irrestricto',1,'2026-09-29 00:22:37'),
(2,'ADMIN','Administrador general del servidor',1,'2026-09-29 00:22:37'),
(3,'GM','Game Master con capacidades de juego, inventario y moderación',1,'2026-09-29 00:22:37'),
(4,'MODERATOR','Moderador de comunidad y sanciones',1,'2026-09-29 00:22:37'),
(5,'SUPPORT','Soporte y atención a usuarios',1,'2026-09-29 00:22:37');
/*!40000 ALTER TABLE `admin_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_sessions`
--

DROP TABLE IF EXISTS `admin_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_sessions`
--

LOCK TABLES `admin_sessions` WRITE;
/*!40000 ALTER TABLE `admin_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_au_role` (`role_id`),
  CONSTRAINT `fk_au_role` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES
(1,1,1,1,1,'2026-09-29 15:45:21','2026-09-29 15:45:21'),
(2,2,2,1,1,'2026-09-29 15:45:21','2026-09-29 15:45:21');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banned`
--

DROP TABLE IF EXISTS `banned`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `banned` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `razon` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `date` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `gm` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `gm_id` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banned`
--

LOCK TABLES `banned` WRITE;
/*!40000 ALTER TABLE `banned` DISABLE KEYS */;
/*!40000 ALTER TABLE `banned` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_reseller`
--

DROP TABLE IF EXISTS `chat_reseller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_reseller` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `reseller_sms` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `date_sms` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_reseller`
--

LOCK TABLES `chat_reseller` WRITE;
/*!40000 ALTER TABLE `chat_reseller` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_reseller` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commands`
--

DROP TABLE IF EXISTS `commands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commands` (
  `Id` int(10) NOT NULL AUTO_INCREMENT,
  `comando` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `gift` int(10) NOT NULL,
  `cash` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `text` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `gm` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `user` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `user_id` int(30) NOT NULL,
  `time` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commands`
--

LOCK TABLES `commands` WRITE;
/*!40000 ALTER TABLE `commands` DISABLE KEYS */;
/*!40000 ALTER TABLE `commands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_post`
--

DROP TABLE IF EXISTS `comment_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_post` (
  `comment_id` int(10) NOT NULL AUTO_INCREMENT,
  `comment_user_de` int(10) NOT NULL,
  `comment_user_para` int(10) NOT NULL,
  `message_for` varchar(900) NOT NULL,
  `time_comment` varchar(50) NOT NULL,
  PRIMARY KEY (`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_post`
--

LOCK TABLES `comment_post` WRITE;
/*!40000 ALTER TABLE `comment_post` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_game`
--

DROP TABLE IF EXISTS `event_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_game` (
  `Server_Id` int(10) NOT NULL AUTO_INCREMENT,
  `historychat` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `date` bigint(100) NOT NULL,
  `time` int(50) NOT NULL,
  `tipo` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `server_tournament_state` int(5) NOT NULL,
  `holiday` int(10) NOT NULL,
  `server_check` int(10) NOT NULL,
  `first_important_ranks` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Server_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_game`
--

LOCK TABLES `event_game` WRITE;
/*!40000 ALTER TABLE `event_game` DISABLE KEYS */;
INSERT INTO `event_game` VALUES
(1,'Eber',1634091140373,60,'Casamiento',1,230,1,'[1604229,756466,366647]');
/*!40000 ALTER TABLE `event_game` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_log`
--

DROP TABLE IF EXISTS `event_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_log` (
  `Id` int(11) NOT NULL,
  `Event1` bigint(50) DEFAULT 0,
  `Event2` bigint(50) DEFAULT 0,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_log`
--

LOCK TABLES `event_log` WRITE;
/*!40000 ALTER TABLE `event_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_yo` int(11) NOT NULL,
  `id_amigo` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `id` int(6) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(12) NOT NULL,
  `gp` int(4) NOT NULL,
  `win` int(1) NOT NULL,
  `freg` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES
(1,'1',122,1,'1790698722533'),
(2,'1',59,1,'1790698832949'),
(3,'1',0,0,'1790699480833'),
(4,'1',8,1,'1790699626714'),
(5,'1',8,1,'1790699715800'),
(6,'1',1,0,'1790700636146'),
(7,'1',8,1,'1790703068983');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guests`
--

DROP TABLE IF EXISTS `guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_id` int(11) NOT NULL,
  `to_id` int(11) NOT NULL,
  `check_ip` varchar(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guests`
--

LOCK TABLES `guests` WRITE;
/*!40000 ALTER TABLE `guests` DISABLE KEYS */;
/*!40000 ALTER TABLE `guests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild`
--

DROP TABLE IF EXISTS `guild`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `points` int(10) NOT NULL,
  `members` int(100) NOT NULL,
  `rank` int(10) NOT NULL,
  `img` varchar(200) NOT NULL DEFAULT '/static/images/your-logo-here.png',
  `fondo` varchar(200) NOT NULL DEFAULT '/static/images/aqua_bg.jpg',
  `about` varchar(460) NOT NULL,
  `website` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild`
--

LOCK TABLES `guild` WRITE;
/*!40000 ALTER TABLE `guild` DISABLE KEYS */;
INSERT INTO `guild` VALUES
(1,'GM',0,208,26,'/static/images/your-logo-here.png','/static/images/aqua_bg.jpg','Bienvenidos','');
/*!40000 ALTER TABLE `guild` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild_coins`
--

DROP TABLE IF EXISTS `guild_coins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild_coins` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `guild_id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `time_coin` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `date_coin` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `coin_img` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '/static/images/guild_coin22.png',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild_coins`
--

LOCK TABLES `guild_coins` WRITE;
/*!40000 ALTER TABLE `guild_coins` DISABLE KEYS */;
/*!40000 ALTER TABLE `guild_coins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guild_member`
--

DROP TABLE IF EXISTS `guild_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guild_member` (
  `rowsec` int(10) NOT NULL AUTO_INCREMENT,
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Job` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`rowsec`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guild_member`
--

LOCK TABLES `guild_member` WRITE;
/*!40000 ALTER TABLE `guild_member` DISABLE KEYS */;
INSERT INTO `guild_member` VALUES
(1,1,1,1),
(2,1,2,2);
/*!40000 ALTER TABLE `guild_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_tournament`
--

DROP TABLE IF EXISTS `info_tournament`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_tournament` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `tournament_server` int(10) NOT NULL,
  `tournament_start_time` varchar(70) NOT NULL,
  `tournament_end_time` varchar(70) NOT NULL,
  `tournament_gifts_users` int(100) NOT NULL,
  `tournament_state_server` varchar(100) NOT NULL,
  `tournament_check` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_tournament`
--

LOCK TABLES `info_tournament` WRITE;
/*!40000 ALTER TABLE `info_tournament` DISABLE KEYS */;
INSERT INTO `info_tournament` VALUES
(1,5,'1633734000000','1633737600000',0,'0','0');
/*!40000 ALTER TABLE `info_tournament` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ip_user_banned`
--

DROP TABLE IF EXISTS `ip_user_banned`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ip_user_banned` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(20) NOT NULL,
  `razon` varchar(120) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `gm` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `IdGM` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ip_user_banned`
--

LOCK TABLES `ip_user_banned` WRITE;
/*!40000 ALTER TABLE `ip_user_banned` DISABLE KEYS */;
/*!40000 ALTER TABLE `ip_user_banned` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `my_payments`
--

DROP TABLE IF EXISTS `my_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `my_payments` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `Name` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Date` int(30) NOT NULL,
  `cash` int(10) NOT NULL,
  `Info` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Reseller` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `my_payments`
--

LOCK TABLES `my_payments` WRITE;
/*!40000 ALTER TABLE `my_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `my_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pin_code`
--

DROP TABLE IF EXISTS `pin_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pin_code` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pin` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `seller` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `gm` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `gm_id` int(10) NOT NULL,
  `used_by` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `rode` varchar(11) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `state` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `date_time` int(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pin_code`
--

LOCK TABLES `pin_code` WRITE;
/*!40000 ALTER TABLE `pin_code` DISABLE KEYS */;
/*!40000 ALTER TABLE `pin_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rankspecial`
--

DROP TABLE IF EXISTS `rankspecial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rankspecial` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdAcc` int(11) NOT NULL,
  `game_id` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `rank` int(5) NOT NULL,
  `cash` int(11) NOT NULL,
  `time` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rankspecial`
--

LOCK TABLES `rankspecial` WRITE;
/*!40000 ALTER TABLE `rankspecial` DISABLE KEYS */;
/*!40000 ALTER TABLE `rankspecial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relationship`
--

DROP TABLE IF EXISTS `relationship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `relationship` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `relationship_status` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT 's',
  `relationship_with_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relationship`
--

LOCK TABLES `relationship` WRITE;
/*!40000 ALTER TABLE `relationship` DISABLE KEYS */;
/*!40000 ALTER TABLE `relationship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resets_rankings`
--

DROP TABLE IF EXISTS `resets_rankings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resets_rankings` (
  `r` int(10) NOT NULL AUTO_INCREMENT,
  `last_reset_rankings` varchar(100) NOT NULL,
  `next_reset_rankings` varchar(100) NOT NULL,
  `time_reset` varchar(1000) NOT NULL,
  PRIMARY KEY (`r`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resets_rankings`
--

LOCK TABLES `resets_rankings` WRITE;
/*!40000 ALTER TABLE `resets_rankings` DISABLE KEYS */;
INSERT INTO `resets_rankings` VALUES
(1,'1790697798354','1790699598354','30'),
(8,'1790697802776','1634516998296','10080'),
(24,'1790697800182','1633951190506','10080');
/*!40000 ALTER TABLE `resets_rankings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `screenshot_game`
--

DROP TABLE IF EXISTS `screenshot_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `screenshot_game` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `screenshot_letters` varchar(20) NOT NULL,
  `partida_screenshot` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `screenshot_game`
--

LOCK TABLES `screenshot_game` WRITE;
/*!40000 ALTER TABLE `screenshot_game` DISABLE KEYS */;
/*!40000 ALTER TABLE `screenshot_game` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servidores`
--

DROP TABLE IF EXISTS `servidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `servidores` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) DEFAULT NULL,
  `Tipo` int(11) DEFAULT 0,
  `Puerto` int(4) DEFAULT NULL,
  `minUser` int(11) DEFAULT 0,
  `maxUser` int(11) DEFAULT 0,
  `minRank` int(11) DEFAULT 0,
  `maxRank` int(11) DEFAULT 0,
  `timeStart` float DEFAULT NULL,
  `timeEnd` float DEFAULT NULL,
  `Active` int(11) DEFAULT 1,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servidores`
--

LOCK TABLES `servidores` WRITE;
/*!40000 ALTER TABLE `servidores` DISABLE KEYS */;
INSERT INTO `servidores` VALUES
(1,'All',0,9001,0,3000,0,27,0,0,1),
(2,'Bunge',0,9002,0,3000,0,27,0,0,1),
(3,'Battle',0,9003,0,5000,0,27,0,0,1),
(4,'Holiday',0,9004,0,3000,0,27,0,0,1),
(5,'Prix',0,9005,0,2500,0,27,0,0,1),
(6,'Beginners',1,9006,0,3000,0,27,0,0,1),
(7,'Avatar On',0,9007,0,3000,0,27,0,0,1),
(8,'Guilds',0,9008,0,3000,0,27,0,0,1),
(9,'Aduka',1,9009,0,3000,0,27,0,0,1),
(10,'Fast Lobby',0,9010,0,3000,0,27,0,0,1),
(11,'VIP',0,9011,0,3000,0,27,0,0,1),
(12,'Prix Pro',0,9012,0,4000,0,27,0,0,1),
(13,'Avatar On.',1,9013,0,4000,0,0,0,0,0),
(14,'Avatar Off.',1,9014,0,3000,0,0,0,0,0);
/*!40000 ALTER TABLE `servidores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_avatar_equiped`
--

DROP TABLE IF EXISTS `user_avatar_equiped`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_avatar_equiped` (
  `Id` int(11) NOT NULL,
  `head` int(11) DEFAULT NULL,
  `body` int(11) DEFAULT NULL,
  `eyes` int(11) DEFAULT NULL,
  `flag` int(11) DEFAULT NULL,
  `background` int(11) DEFAULT NULL,
  `foreground` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_avatar_equiped`
--

LOCK TABLES `user_avatar_equiped` WRITE;
/*!40000 ALTER TABLE `user_avatar_equiped` DISABLE KEYS */;
INSERT INTO `user_avatar_equiped` VALUES
(1,180,316,3673,1130,0,0),
(2,2196,2,0,0,0,0);
/*!40000 ALTER TABLE `user_avatar_equiped` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_avatars`
--

DROP TABLE IF EXISTS `user_avatars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_avatars` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) DEFAULT NULL,
  `aId` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT 0,
  `expire` datetime DEFAULT NULL,
  `is_cash` int(2) DEFAULT 0,
  `is_gift` int(2) DEFAULT 0,
  `gift_sent_by` int(10) NOT NULL DEFAULT 0,
  `amount` int(11) DEFAULT 0,
  `expire_time` bigint(40) DEFAULT 0,
  `date_ava_time` bigint(50) NOT NULL DEFAULT 0,
  `remove_ava` int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5112 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_avatars`
--

LOCK TABLES `user_avatars` WRITE;
/*!40000 ALTER TABLE `user_avatars` DISABLE KEYS */;
INSERT INTO `user_avatars` VALUES
(1,1,632,0,NULL,1,0,0,0,0,1631464391522,0),
(2,1,22222,1,NULL,1,0,0,0,0,1631464398294,0),
(3,1,1076,3,NULL,1,0,0,0,0,1631464432196,0),
(4,1,812,2,NULL,1,0,0,0,0,1631464456612,0),
(5,1,1073,0,NULL,1,0,0,0,0,1631464514857,0),
(6,1,1074,1,NULL,1,0,0,0,0,1631464521456,0),
(7,1,1075,2,NULL,1,0,0,0,0,1631464528087,0),
(8,1,4983,4,NULL,1,0,0,0,0,1631464550702,0),
(9,2,8413000,0,NULL,1,0,0,0,0,1631467214525,0),
(10,2,8414000,1,NULL,1,0,0,0,0,1631467220806,0),
(11,1,876,0,NULL,1,0,0,0,0,1631467230806,0),
(12,1,878,1,NULL,1,0,0,0,0,1631467233353,0),
(13,1,879,2,NULL,1,0,0,0,0,1631467237447,0),
(14,1,880,3,NULL,1,0,0,0,0,1631467241634,0),
(15,1,385,0,NULL,1,0,0,0,0,1631467245556,0),
(16,1,386,1,NULL,1,0,0,0,0,1631467247463,0),
(17,1,285,0,NULL,1,0,0,0,0,1631467279541,0),
(18,1,8927,1,NULL,1,0,0,0,0,1631467282088,0),
(19,1,405,3,NULL,1,0,0,0,0,1631467286759,0),
(20,2,4983,0,NULL,0,1,2,0,0,1631474801038,0),
(22,2,632,0,NULL,1,0,0,0,0,1631559661748,0),
(23,2,22222,1,NULL,1,0,0,0,0,1631559670420,0),
(26,2,285,0,NULL,1,0,0,0,0,1631561834139,0),
(27,2,8927,1,NULL,1,0,0,0,0,1631561837046,0),
(28,2,812,2,NULL,1,0,0,0,0,1631561856702,0),
(29,2,8177,2,NULL,1,0,0,0,0,1631561871999,0),
(30,2,8922,4,NULL,1,0,0,0,0,1631561980889,0),
(31,2,4196,0,NULL,1,0,0,0,0,1631562275467,0),
(32,2,4197,1,NULL,1,0,0,0,0,1631562278654,0),
(33,1,3092,0,NULL,1,0,0,0,0,1631563235685,0),
(34,1,3093,1,NULL,1,0,0,0,0,1631563238232,0),
(35,1,2767,3,NULL,1,0,0,0,0,1631563263732,0),
(36,1,3691,2,NULL,1,0,0,0,0,1631563273232,0),
(37,2,2767,3,NULL,1,0,0,0,0,1631563590467,0),
(38,2,34337,5,NULL,1,0,0,0,0,1631563606701,0),
(39,2,9078,1,NULL,1,0,0,0,0,1631563615310,0),
(40,2,2901,0,NULL,1,0,0,0,0,1631563618123,0),
(42,2,7899,0,NULL,1,0,0,0,0,1631563642513,0),
(43,2,7830,1,NULL,1,0,0,0,0,1631563646045,0),
(44,2,20,0,NULL,1,0,0,0,0,1631563650826,0),
(45,2,19,1,NULL,1,0,0,0,0,1631563655482,0),
(46,2,8413,0,NULL,1,0,0,0,0,1631563660076,0),
(47,2,8414,1,NULL,1,0,0,0,0,1631563663576,0),
(48,2,3092,0,NULL,1,0,0,0,0,1631563669654,0),
(49,2,3093,1,NULL,1,0,0,0,0,1631563673404,0),
(50,2,2761,0,NULL,1,0,0,0,0,1631563680670,0),
(51,2,2762,1,NULL,1,0,0,0,0,1631563683795,0),
(52,2,119,1,NULL,1,0,0,0,0,1631563687920,0),
(53,2,120,0,NULL,1,0,0,0,0,1631563693092,0),
(54,2,20037,2,NULL,1,0,0,0,0,1631563698326,0),
(55,2,37238,3,NULL,1,0,0,0,0,1631563706685,0),
(56,2,38238,4,NULL,1,0,0,0,0,1631563709638,0),
(57,2,3695,2,NULL,1,0,0,0,0,1631563720857,0),
(58,2,3690001,2,NULL,1,0,0,0,0,1631563731811,0),
(59,2,3405,3,NULL,1,0,0,0,0,1631563796436,0),
(60,2,3406,3,NULL,1,0,0,0,0,1631563800139,0),
(61,2,3407,3,NULL,1,0,0,0,0,1631563803530,0),
(62,2,117,3,NULL,1,0,0,0,0,1631563854530,0),
(63,2,2603,1,NULL,1,0,0,0,0,1631563868248,0),
(64,2,3628,3,NULL,1,0,0,0,0,1631563877670,0),
(65,2,3627,0,NULL,1,0,0,0,0,1631563882498,0),
(66,2,4817,5,NULL,1,0,0,0,0,1631563886498,0),
(67,2,3813,2,NULL,1,0,0,0,0,1631563891638,0),
(68,2,3492,2,NULL,1,0,0,0,0,1631563895873,0),
(69,2,4816,4,NULL,1,0,0,0,0,1631563900717,0),
(70,1,159,0,NULL,1,0,0,0,0,1631563909076,0),
(71,1,298,1,NULL,1,0,0,0,0,1631563911232,0),
(72,2,558,2,NULL,1,0,0,0,0,1631563914560,0),
(73,2,159,0,NULL,1,0,0,0,0,1631563921873,0),
(74,2,298,1,NULL,1,0,0,0,0,1631563925733,0),
(75,1,3667,3,NULL,1,0,0,0,0,1631563926155,0),
(76,2,276200,1,NULL,1,0,0,0,0,1631563975171,0),
(77,2,276100,0,NULL,1,0,0,0,0,1631563979030,0),
(78,2,8224,3,NULL,1,0,0,0,0,1631563987326,0),
(79,2,8225,3,NULL,1,0,0,0,0,1631563991560,0),
(80,2,8226,3,NULL,1,0,0,0,0,1631563996326,0),
(81,2,8261,0,NULL,1,0,0,0,0,1631564004670,0),
(82,2,8257,1,NULL,1,0,0,0,0,1631564009638,0),
(83,2,387,3,NULL,1,0,0,0,0,1631564017920,0),
(84,2,388,3,NULL,1,0,0,0,0,1631564021982,0),
(85,2,7485000,3,NULL,1,0,0,0,0,1631564026685,0),
(86,2,748554,3,NULL,1,0,0,0,0,1631564052279,0),
(87,2,39238,3,NULL,1,0,0,0,0,1631564112936,0),
(88,2,39232,2,NULL,1,0,0,0,0,1631564117592,0),
(89,2,1574,0,NULL,1,0,0,0,0,1631564158671,0),
(90,2,1575,1,NULL,1,0,0,0,0,1631564162389,0),
(97,2,9135,1,NULL,1,0,0,0,0,1631566386198,0),
(98,2,9134,0,NULL,1,0,0,0,0,1631566389745,0),
(99,2,561,3,NULL,1,0,0,0,0,1631566427527,0),
(100,2,2768,3,NULL,1,0,0,0,0,1631566445245,0),
(101,2,3845,1,NULL,1,0,0,0,0,1631566523604,0),
(102,2,3844,0,NULL,1,0,0,0,0,1631566527463,0),
(103,2,386,1,NULL,1,0,0,0,0,1631566602057,0),
(104,2,385,0,NULL,1,0,0,0,0,1631566606385,0),
(105,2,876,0,NULL,1,0,0,0,0,1631566611510,0),
(106,2,878,1,NULL,1,0,0,0,0,1631566618322,0),
(108,2,880,3,NULL,1,0,0,0,0,1631566639400,0),
(109,2,879,2,NULL,1,0,0,0,0,1631566680572,0),
(110,2,4853,5,NULL,1,0,0,0,0,1631566716041,0),
(116,2,2758,1,NULL,1,0,0,0,0,1631580033494,0),
(117,2,3097,0,NULL,1,0,0,0,0,1631580089055,0),
(118,2,2549,2,NULL,1,0,0,0,0,1631580112086,0),
(119,2,3235,3,NULL,1,0,0,0,0,1631580125383,0),
(121,2,405,3,NULL,1,0,0,0,0,1631625853527,0),
(126,2,443,5,NULL,1,0,0,0,0,1631654847265,0),
(127,2,8142,0,NULL,1,0,0,0,0,1631655269234,0),
(128,2,8143,1,NULL,1,0,0,0,0,1631655277203,0),
(129,2,9374,4,NULL,1,0,0,0,0,1631655287234,0),
(130,1,882,0,NULL,1,0,0,0,0,1631664470871,0),
(131,1,883,1,NULL,1,0,0,0,0,1631664477767,0),
(132,1,884,2,NULL,1,0,0,0,0,1631664484813,0),
(337,1,2319,6,NULL,1,0,0,22,0,1631843274785,0),
(373,1,7657,0,NULL,0,1,80294,0,0,1631915276615,0),
(374,1,2319,6,NULL,0,1,80294,0,0,1631915276615,0),
(375,2,8126,1,NULL,1,0,0,0,0,1631982847067,0),
(376,2,8125,0,NULL,1,0,0,0,0,1631982851614,0),
(377,2,8916,1,NULL,1,0,0,0,0,1631982985754,0),
(378,2,8912,0,NULL,1,0,0,0,0,1631982992176,0),
(379,2,8105,1,NULL,1,0,0,0,0,1631983017723,0),
(380,2,8106,0,NULL,1,0,0,0,0,1631983023723,0),
(381,2,8108,0,NULL,1,0,0,0,0,1631983419942,0),
(382,2,8107,1,NULL,1,0,0,0,0,1631983426161,0),
(383,2,8135,1,NULL,1,0,0,0,0,1631983442317,0),
(384,2,8134,0,NULL,1,0,0,0,0,1631983447739,0),
(385,2,4021,5,NULL,1,0,0,0,0,1631983655301,0),
(386,2,7657,2,NULL,1,0,0,0,0,1631984651317,0),
(529,2,92457,0,NULL,1,0,0,0,0,1632356218247,0),
(530,2,89986,1,NULL,1,0,0,0,0,1632356224015,0),
(567,2,2049,3,NULL,1,0,0,0,0,1632361393176,0),
(576,2,20455,0,NULL,0,0,0,0,0,1632364971926,0),
(577,2,28056,1,NULL,0,0,0,0,0,1632364980629,0),
(578,2,548,4,NULL,1,0,0,0,0,1632365473692,0),
(618,2,2041,0,NULL,1,0,0,0,0,1632410940730,0),
(619,2,2042,1,NULL,1,0,0,0,0,1632410944761,0),
(620,2,2031,0,NULL,1,0,0,0,0,1632411065340,0),
(621,2,2032,1,NULL,1,0,0,0,0,1632411075668,0),
(622,2,2033,3,NULL,1,0,0,0,0,1632411081622,0),
(623,2,2034,4,NULL,1,0,0,0,0,1632411094903,0),
(739,1,8912,0,NULL,1,0,0,0,0,1632430194231,0),
(740,1,8916,1,NULL,1,0,0,0,0,1632430196371,0),
(741,1,1279,3,NULL,1,0,0,0,0,1632430237684,0),
(742,1,1178,0,NULL,1,0,0,0,0,1632430247653,0),
(743,1,1193,1,NULL,1,0,0,0,0,1632430251793,0),
(748,2,474,4,NULL,1,0,0,0,0,1632430369324,0),
(776,1,42891,4,NULL,1,0,0,0,0,1632442578261,0),
(777,1,8192,0,NULL,1,0,0,0,0,1632442607605,0),
(778,1,8193,1,NULL,1,0,0,0,0,1632442610339,0),
(826,2,8045,3,NULL,1,0,0,0,0,1632522755008,0),
(827,2,416,4,NULL,1,0,0,0,0,1632522877555,0),
(841,2,4529,2,NULL,1,0,0,0,0,1632537715993,0),
(842,2,4018,3,NULL,1,0,0,0,0,1632538032259,0),
(931,1,1060,6,NULL,1,0,0,1,0,1632699600368,0),
(932,1,1061,6,NULL,1,0,0,1,0,1632699606946,0),
(933,1,1062,6,NULL,1,0,0,1,0,1632699613836,0),
(964,1,906,0,NULL,1,0,0,0,0,1632710787711,0),
(966,1,907,1,NULL,1,0,0,0,0,1632710795960,0),
(1034,2,3691,2,NULL,1,0,0,0,0,1632749871759,1),
(1035,2,4430,0,NULL,1,0,0,0,0,1632749959837,0),
(1036,2,4429,1,NULL,1,0,0,0,0,1632749970462,0),
(1037,2,8301,4,NULL,1,0,0,0,0,1632750013181,0),
(1038,2,4002,3,NULL,1,0,0,0,0,1632750092617,0),
(1284,2,8249,4,NULL,1,0,0,0,0,1632792991697,0),
(1505,1,561,3,NULL,1,0,0,0,0,1632862377474,0),
(1506,1,8005,0,NULL,1,0,0,0,0,1632862381585,0),
(1507,1,8006,1,NULL,1,0,0,0,0,1632862383444,0),
(1508,1,565,3,NULL,1,0,0,0,0,1632862392429,0),
(1509,1,558,2,NULL,1,0,0,0,0,1632862411132,0),
(1510,1,300,0,NULL,1,0,0,0,0,1632862424397,0),
(1511,1,301,1,NULL,1,0,0,0,0,1632862426179,0),
(1638,2,3033,0,NULL,0,1,1,0,0,1632874893535,0),
(1672,2,4002,0,NULL,0,1,1,0,0,1632874893661,0),
(1892,1,2901,0,NULL,1,0,0,0,0,1632950876673,0),
(1893,1,9078,1,NULL,1,0,0,0,0,1632950878486,0),
(2282,1,8076000,4,NULL,1,0,0,0,0,1633104468874,0),
(2371,2,546,3,NULL,1,0,0,0,0,1633119534419,0),
(2451,2,894,6,NULL,1,0,0,22,0,1633138666044,0),
(3139,1,2713,0,NULL,1,0,0,0,0,1633281094662,0),
(3140,1,2714,1,NULL,1,0,0,0,0,1633281097584,0),
(3141,1,2731,3,NULL,1,0,0,0,0,1633281099600,0),
(3142,1,1093,0,NULL,1,0,0,0,0,1633281109084,0),
(3143,1,1094,1,NULL,1,0,0,0,0,1633281111365,0),
(3144,1,8149,0,NULL,1,0,0,0,0,1633281113225,0),
(3145,1,8150,1,NULL,1,0,0,0,0,1633281114865,0),
(3146,1,935,3,NULL,1,0,0,0,0,1633281123115,0),
(3147,1,1097,3,NULL,1,0,0,0,0,1633281124990,0),
(3398,2,860,2,NULL,1,0,0,0,0,1633369157790,0),
(3399,2,1073,0,NULL,1,0,0,0,0,1633369886056,0),
(3400,2,1074,1,NULL,1,0,0,0,0,1633369890649,0),
(3401,2,1075,2,NULL,1,0,0,0,0,1633369896618,0),
(3417,1,120,0,NULL,0,1,80050,0,0,1633386701431,0),
(3418,1,119,0,NULL,0,1,80050,0,0,1633386701431,0),
(3431,2,120,0,NULL,0,1,80141,0,0,1633446043813,1),
(3432,2,119,0,NULL,0,1,80141,0,0,1633446043813,1),
(3433,2,28876,1,NULL,1,0,0,0,0,1633446194938,0),
(3434,2,25485,0,NULL,1,0,0,0,0,1633446199563,0),
(3447,1,4983,0,NULL,0,1,1,0,0,1633533765882,0),
(3581,1,2121,0,NULL,1,0,0,0,0,1633551026520,0),
(3582,1,8104,2,NULL,1,0,0,0,0,1633551068989,0),
(3597,1,2731,0,NULL,0,1,80040,0,0,1633553278052,0),
(3598,1,2319,6,NULL,0,1,80040,1,0,1633553278052,0),
(3640,2,2018,4,NULL,0,0,0,0,0,1633621364637,0),
(3641,2,2713,0,NULL,1,0,0,0,0,1633621397933,0),
(3642,2,2714,1,NULL,1,0,0,0,0,1633621403043,0),
(3643,2,4717,3,NULL,1,0,0,0,0,1633621409262,0),
(3646,2,1093,0,NULL,1,0,0,0,0,1633624276715,0),
(3647,2,1094,1,NULL,1,0,0,0,0,1633624281074,0),
(3793,2,2026,3,NULL,1,0,0,0,0,1633637697715,0),
(3794,2,2054,5,NULL,1,0,0,0,0,1633637702808,0),
(4182,2,3492,0,NULL,0,1,2,0,0,1633670542949,0),
(4333,2,2029,0,NULL,1,0,0,0,0,1633710136949,0),
(4334,2,2030,1,NULL,1,0,0,0,0,1633710141480,0),
(4335,2,2024,5,NULL,1,0,0,0,0,1633710147777,0),
(4355,2,1430,0,NULL,1,0,0,0,0,1633711764121,0),
(4356,2,1429,1,NULL,1,0,0,0,0,1633711768340,0),
(4357,2,8175,3,NULL,1,0,0,0,0,1633711780465,0),
(4376,2,1240,4,NULL,1,0,0,0,0,1633714885479,0),
(4469,2,63183,3,NULL,1,0,0,0,0,1633721587558,0),
(4575,2,834002,2,NULL,1,0,0,0,0,1633731775090,0),
(4578,2,866,3,NULL,1,0,0,0,1634337005574,1633732205574,0),
(4580,2,8104,2,NULL,1,0,0,0,0,1633732386715,0),
(4581,2,617,4,NULL,1,0,0,0,0,1633732485418,0),
(4658,2,2415,0,NULL,1,0,0,0,0,1633751144948,0),
(4659,2,2417,1,NULL,1,0,0,0,0,1633751152183,0),
(4660,2,3217,2,NULL,1,0,0,0,0,1633751166840,0),
(4661,2,3238,3,NULL,1,0,0,0,0,1633751182933,0),
(4662,2,3111,1,NULL,1,0,0,0,0,1633751263604,0),
(4782,2,8017,4,NULL,1,0,0,0,0,1633802554796,0),
(4786,2,875,4,NULL,1,0,0,0,0,1633803136437,0),
(4787,2,8158,4,NULL,1,0,0,0,0,1633803152265,0),
(4843,2,1315,1,NULL,1,0,0,0,0,1633812367343,0),
(4844,2,1325,0,NULL,1,0,0,0,0,1633812403077,0),
(4845,2,774,2,NULL,1,0,0,0,0,1633812441109,0),
(5085,1,0,0,NULL,0,1,1,0,0,1790639636875,0),
(5086,1,175,0,NULL,1,0,0,0,0,1790640572341,0),
(5087,1,6302500,1,NULL,1,0,0,0,0,1790640773092,0),
(5091,1,180,0,NULL,1,0,0,0,0,1790641062640,0),
(5092,1,316,1,NULL,1,0,0,0,0,1790641097064,0),
(5093,1,3673,2,NULL,1,0,0,0,0,1790641109416,0),
(5094,1,1125,3,NULL,1,0,0,0,0,1790641223128,0),
(5095,1,1130,3,NULL,1,0,0,0,0,1790641237415,0),
(5102,1,464,6,NULL,1,0,0,0,1793239014232,1790647014232,0),
(5103,1,894,6,NULL,1,0,0,48,0,1790647106224,0),
(5104,2,8142,0,NULL,0,1,0,0,0,0,0),
(5105,2,8143,0,NULL,0,1,0,0,0,0,0),
(5106,2,748554,0,NULL,0,1,0,0,0,0,0),
(5107,2,689600,0,NULL,1,0,0,0,0,1790647765968,1),
(5108,2,0,0,NULL,0,1,2,0,0,1790648077833,0),
(5109,2,2196,0,NULL,1,0,0,0,0,1790649104215,0),
(5110,2,2,1,NULL,0,0,0,0,0,0,0),
(5111,2,1,0,NULL,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `user_avatars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_post`
--

DROP TABLE IF EXISTS `user_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_post` (
  `post_id` int(10) NOT NULL AUTO_INCREMENT,
  `user_de` varchar(10) NOT NULL,
  `user_para` varchar(10) NOT NULL,
  `texto` varchar(900) NOT NULL,
  `fecha` varchar(100) NOT NULL,
  PRIMARY KEY (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_post`
--

LOCK TABLES `user_post` WRITE;
/*!40000 ALTER TABLE `user_post` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_post_comment`
--

DROP TABLE IF EXISTS `user_post_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_post_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `texto` varchar(150) DEFAULT '',
  `fecha` varchar(900) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_post_comment`
--

LOCK TABLES `user_post_comment` WRITE;
/*!40000 ALTER TABLE `user_post_comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_post_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` varchar(45) DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `previous_rank` int(11) DEFAULT 0,
  `gp` int(11) DEFAULT NULL,
  `gold` int(11) DEFAULT NULL,
  `cash` int(11) DEFAULT NULL,
  `gender` char(2) DEFAULT NULL,
  `unlock2` int(2) DEFAULT NULL,
  `photo_url` varchar(200) DEFAULT 'https://image.prntscr.com/image/sC3pg5sKRny_PCbrJSZgcA.jpg',
  `name_changes` int(11) DEFAULT NULL,
  `power_user` int(11) DEFAULT NULL,
  `plus10gp` int(11) DEFAULT NULL,
  `mobile_fox` int(11) DEFAULT NULL,
  `country` varchar(15) DEFAULT NULL,
  `flowers` int(11) DEFAULT NULL,
  `map_pack` int(11) DEFAULT NULL,
  `megaphones` int(11) DEFAULT NULL,
  `is_muted` varchar(15) DEFAULT '0',
  `win` int(11) DEFAULT 0,
  `loss` int(11) DEFAULT 0,
  `gm` int(2) DEFAULT 0,
  `banned` int(5) NOT NULL,
  `prixw` int(11) NOT NULL,
  `Event1` bigint(50) DEFAULT 0,
  `Event2` bigint(50) DEFAULT 0,
  `probability` int(10) NOT NULL,
  `IdAcc` int(11) NOT NULL,
  `bg_url` varchar(200) DEFAULT 'https://image.prntscr.com/image/b1951ace8fbe48a383165b53955cee02.png',
  `IP` varchar(45) NOT NULL DEFAULT '0.0.0.0',
  `block_friend` int(2) NOT NULL,
  `CashCharger` int(11) NOT NULL,
  `ranking_semanal` int(10) NOT NULL,
  `lucky_egg_sec_left` varchar(500) DEFAULT '',
  `electrico` int(10) DEFAULT NULL,
  `lucky_egg` varchar(30) DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `FKUserAcc_idx` (`IdAcc`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Destroyer',26,26,2129,100044279,109846949,'m',0,'',0,1,0,0,'PE',0,0,50,'0',17,6,1,0,0,1790663410,1790735407,0,1,'https://image.prntscr.com/image/b1951ace8fbe48a383165b53955cee02.png','127.0.0.1',0,0,206,'0',NULL,'0'),
(2,'1nsane',26,26,1116,502450,2147483647,'m',0,'',1,0,0,0,NULL,0,0,0,'0',2,5,1,0,0,0,0,0,2,'https://image.prntscr.com/image/b1951ace8fbe48a383165b53955cee02.png','127.0.0.1',0,0,0,'0',NULL,'0');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `view_replay`
--

DROP TABLE IF EXISTS `view_replay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `view_replay` (
  `replay_id` int(10) NOT NULL AUTO_INCREMENT,
  `view_code` varchar(20) NOT NULL,
  `avatars_ids` varchar(200) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `code_rmd` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`replay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `view_replay`
--

LOCK TABLES `view_replay` WRITE;
/*!40000 ALTER TABLE `view_replay` DISABLE KEYS */;
/*!40000 ALTER TABLE `view_replay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'dragonbound'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-30  0:08:34
