-- MySQL dump 10.13  Distrib 5.1.58, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: ads
-- ------------------------------------------------------
-- Server version	5.1.58-1ubuntu1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Attributes`
--

DROP TABLE IF EXISTS `Attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eventgroup_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eventgroup_id` (`eventgroup_id`),
  CONSTRAINT `Attributes_ibfk_1` FOREIGN KEY (`eventgroup_id`) REFERENCES `EventGroups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Dimensions`
--

DROP TABLE IF EXISTS `Dimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Dimensions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `is_builtin` tinyint(1) DEFAULT NULL,
  `load_script` text,
  `update_script` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EventGroups`
--

DROP TABLE IF EXISTS `EventGroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EventGroups` (
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `EventGroups_ibfk_1` FOREIGN KEY (`id`) REFERENCES `Measures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `min_value` int(11) DEFAULT NULL,
  `max_value` int(11) DEFAULT NULL,
  `eventgroup_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eventgroup_id` (`eventgroup_id`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`eventgroup_id`) REFERENCES `EventGroups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hierarchies`
--

DROP TABLE IF EXISTS `Hierarchies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hierarchies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `dimension_id` int(11) DEFAULT NULL,
  `ragged` tinyint(1) DEFAULT NULL,
  `pk_column` varchar(50) DEFAULT NULL,
  `parent_pk_column` varchar(50) DEFAULT NULL,
  `lookup_table` varchar(50) DEFAULT NULL,
  `db_host` varchar(50) DEFAULT NULL,
  `db_user` varchar(50) DEFAULT NULL,
  `db_password` varchar(50) DEFAULT NULL,
  `db_db` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dimension_id` (`dimension_id`),
  CONSTRAINT `Hierarchies_ibfk_1` FOREIGN KEY (`dimension_id`) REFERENCES `Dimensions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Levels`
--

DROP TABLE IF EXISTS `Levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `hierarchy_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hierarchy_id` (`hierarchy_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `Levels_ibfk_1` FOREIGN KEY (`hierarchy_id`) REFERENCES `Hierarchies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Levels_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `Levels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Measures`
--

DROP TABLE IF EXISTS `Measures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Measures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `latency` int(11) DEFAULT NULL,
  `creation_date` datetime DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Measures_Dimensions`
--

DROP TABLE IF EXISTS `Measures_Dimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Measures_Dimensions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `measure_id` int(11) NOT NULL,
  `dimension_id` int(11) NOT NULL,
  `fk_column` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`,`measure_id`,`dimension_id`),
  KEY `measure_id` (`measure_id`),
  KEY `dimension_id` (`dimension_id`),
  CONSTRAINT `Measures_Dimensions_ibfk_1` FOREIGN KEY (`measure_id`) REFERENCES `Measures` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Measures_Dimensions_ibfk_2` FOREIGN KEY (`dimension_id`) REFERENCES `Dimensions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Metrics`
--

DROP TABLE IF EXISTS `Metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Metrics` (
  `id` int(11) NOT NULL,
  `source_column` varchar(50) DEFAULT NULL,
  `source_table` varchar(50) DEFAULT NULL,
  `source_db_host` varchar(50) DEFAULT NULL,
  `source_db_user` varchar(50) DEFAULT NULL,
  `source_db_password` varchar(50) DEFAULT NULL,
  `source_db_db` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `Metrics_ibfk_1` FOREIGN KEY (`id`) REFERENCES `Measures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-01-03 15:23:49

--
-- Time dimension
--
DROP TABLE IF EXISTS `D_dates`;
CREATE TABLE `D_dates` (
    `id` INT(11) NOT NULL, -- surrogate key
    `date` DATE NOT NULL,
    `week` SMALLINT(6) NOT NULL,    -- 1 to 53, week starts on Monday
    `weekday` SMALLINT(6) NOT NULL, -- 1 (Monday) to 7 (Sunday)
    `month` SMALLINT(6) NOT NULL,   -- 1 to 12
    `year` SMALLINT(6) NOT NULL,
    KEY (`date`),
    KEY (`week`),
    KEY (`weekday`),
    KEY (`month`),
    KEY (`year`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

DROP PROCEDURE IF EXISTS load_date_dim;
DELIMITER //
CREATE PROCEDURE load_date_dim()
BEGIN
        DELETE FROM D_dates;
        SELECT '2012-01-01' INTO @ds;
        SELECT '2022-01-01' INTO @de;
        WHILE @ds <= @de DO
                INSERT INTO D_dates (id, `date`, week, weekday, month, year)
                        SELECT TO_DAYS(@ds), @ds, WEEK(@ds, 7), WEEKDAY(@ds)+1, MONTH(@ds), YEAR(@ds);
                SET @ds = DATE_ADD(@ds, INTERVAL 1 DAY);
        END WHILE;
END
//
DELIMITER ;

CALL load_date_dim();

DROP PROCEDURE IF EXISTS load_time_dim;
DELIMITER //
CREATE PROCEDURE load_time_dim()
BEGIN
        DELETE FROM D_time;
        SELECT '2012-01-01' INTO @ds;
        SELECT '2022-01-01' INTO @de;
        WHILE @ds <= @de DO
                INSERT INTO D_time (`date`, dateID, week, weekID, month, monthID, year, yearID)
                        SELECT @ds, TO_DAYS(@ds), WEEK(@ds, 7), WEEK(@ds, 7), MONTH(@ds), MONTH(@ds), YEAR(@ds), YEAR(@ds);
                SET @ds = DATE_ADD(@ds, INTERVAL 1 DAY);
        END WHILE;
END
//
DELIMITER ;

--
-- Table structure for table `Revision`
--

DROP TABLE IF EXISTS `Revision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Revision` (
  `rev` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `Revision` VALUE (0);

-- source /opt/2.0/flx/pylons/ads/mysql/updates/aggregate-20120203.sql;
alter table `Measures`
    add column `aggregate` enum('d','w','m','y') DEFAULT NULL;

-- source /opt/2.0/flx/pylons/ads/mysql/updates/dimtag-20120228.sql;
alter table `Dimensions`
    add column `tag` tinyint(1) DEFAULT NULL;
    