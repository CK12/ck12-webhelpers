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


DROP TABLE IF EXISTS `Resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Resources` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
    `resourceTypeID` int(11) NOT NULL COMMENT 'The type of this resource.',
    `name` varchar(255) NOT NULL COMMENT 'The name or title of this resource.',
    `handle` varchar(255) NOT NULL COMMENT 'The handle of the resource. Used for perma URL',
    `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this resource.',
    `authors` varchar(1024) DEFAULT NULL COMMENT 'The original author for Image and Embedded Objects resource.',
    `license` varchar(1024) DEFAULT NULL COMMENT 'License for Image and Embedded Objects resource',
    `uri` varchar(255) NOT NULL COMMENT 'The location of this resource.',
    `refHash` varchar(64) NOT NULL COMMENT 'The unique reference hash for this resource. Referred in Image Repository ids.',
    `checksum` varchar(255) DEFAULT NULL COMMENT 'The checksum for this resource.',
    `satelliteUrl` varchar(1024) DEFAULT NULL COMMENT 'The satellite location of this resource.',
    `ownerID` int(11) NOT NULL COMMENT 'The owner of this revision.',
    `languageID` smallint(6) DEFAULT NULL COMMENT 'The language of this resource.',
    `isExternal` tinyint(1) DEFAULT 0 COMMENT '1 if it is external resource; 0 otherwise.',
    `isAttachment` tinyint(1) DEFAULT 0 COMMENT '1 if it is attachment resource; 0 otherwise.',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this resource.',
    PRIMARY KEY (`id`),
    UNIQUE KEY `Idx_uri` (`uri`, `ownerID`, `checksum`),
    UNIQUE KEY `Idx_refHash` (`refHash`),
    UNIQUE INDEX `Idx_handle` (`handle`, `ownerID`, `resourceTypeID`, `checksum`),
    INDEX `Resources_checksum` (`checksum`),
    INDEX `Resources_checksum_ownerID` (`checksum`, `ownerID`),
    CONSTRAINT `Resources_ibfk_3` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `Resources_ibfk_2` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `Resources_ibfk_1` FOREIGN KEY (`resourceTypeID`) REFERENCES `ResourceTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The metadata of resources.';
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


