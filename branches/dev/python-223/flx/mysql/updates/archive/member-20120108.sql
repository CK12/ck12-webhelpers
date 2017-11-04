--
-- Table structure for table `MemberLocations`
--

DROP TABLE IF EXISTS `MemberLocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLocations` (
`memberID` int(11) NOT NULL COMMENT 'The id of the member.',
`countryID` int(11) NOT NULL COMMENT 'The country this standard board belongs to.',
`addressID` int(11) NOT NULL COMMENT 'The address id, from different address tables depending on country.',
PRIMARY KEY (`memberID`),
UNIQUE KEY (`memberID`, `countryID`, `addressID`),
CONSTRAINT `MemberLocations_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
CONSTRAINT `MemberLocations_ibfk_2` FOREIGN KEY (`countryID`) REFERENCES `Countries` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WorldAddresses`
--

DROP TABLE IF EXISTS `WorldAddresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WorldAddresses` (
`id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated address id.',
`streetNumber` varchar(15) DEFAULT NULL COMMENT 'The street number.',
`street1` varchar(127) DEFAULT NULL COMMENT 'The line 1 of street.',
`street2` varchar(127) DEFAULT NULL COMMENT 'The line 2 of street.',
`city` varchar(63) DEFAULT NULL COMMENT 'The city name.',
`province` varchar(63) DEFAULT NULL COMMENT 'The province name',
`postalCode` varchar(10) DEFAULT NULL COMMENT 'The postal code',
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

ALTER TABLE `USAddresses` MODIFY `streetNumber` varchar(15) DEFAULT NULL;
ALTER TABLE `USAddresses` MODIFY `street1` varchar(127) DEFAULT NULL;

ALTER TABLE `Members` ADD `phone` varchar(31) DEFAULT NULL;
ALTER TABLE `Members` ADD `fax` varchar(31) DEFAULT NULL;
ALTER TABLE `Members` ADD `website` varchar(2084) DEFAULT NULL;
