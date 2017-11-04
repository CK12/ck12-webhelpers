-- Host: localhost    Database: auth
-- ------------------------------------------------------

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
-- Table structure for table `Applications`
--

DROP TABLE IF EXISTS `Applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Applications` (
    `providerID` int(11) NOT NULL COMMENT 'The provider id.',
    `siteID` int(11) NOT NULL COMMENT 'The site id.',
    `appName` varchar(63) NOT NULL COMMENT 'The application name.',
    `key` varchar(4096) CHARSET ascii NOT NULL COMMENT 'The application key.',
    `secret` varchar(4096) CHARSET ascii NOT NULL COMMENT 'The application secret.',
    `description` varchar(511) DEFAULT NULL COMMENT 'The description of this application.',
    PRIMARY KEY (`providerID`, `siteID`, `appName`),
    UNIQUE KEY (`key`(767)),
    UNIQUE KEY (`secret`(767))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Addresses`
--

DROP TABLE IF EXISTS `Addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Addresses` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated address id.',
    `memberID` int(11) NOT NULL COMMENT 'The member id.',
    `countryID` int(11) DEFAULT NULL COMMENT 'The country id.',
    `addressID` int(11) DEFAULT NULL COMMENT 'The address id, from different address tables depending on country.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`memberID`, `countryID`, `addressID`),
    CONSTRAINT `Addresses_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `Addresses_ibfk_2` FOREIGN KEY (`countryID`) REFERENCES `Countries` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Countries`
--

DROP TABLE IF EXISTS `Countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Countries` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
    `name` varchar(63) NOT NULL COMMENT 'The ISO country name.',
    `code2Letter` varchar(2) DEFAULT NULL COMMENT 'The 2-letter code.',
    `code3Letter` varchar(3) DEFAULT NULL COMMENT 'The 3-letter code.',
    `codeNumeric` smallint(6) DEFAULT NULL COMMENT 'The numeric code.',
    `image` varchar(255) DEFAULT NULL COMMENT 'The URL of the image that represents the country.',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`),
    UNIQUE KEY (`code2Letter`),
    UNIQUE KEY (`code3Letter`),
    UNIQUE KEY (`codeNumeric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Country information.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberRoles`
--

DROP TABLE IF EXISTS `MemberRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberRoles` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member type id.',
    `name` varchar(63) NOT NULL COMMENT 'The member role name.',
    `description` varchar(511) DEFAULT NULL COMMENT 'The description of this member role.',
    `is_admin_role` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'role has admin permissions or not',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberStates`
--

DROP TABLE IF EXISTS `MemberStates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberStates` (
    `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member state id.',
    `name` varchar(63) NOT NULL COMMENT 'The member state name.',
    `description` varchar(511) DEFAULT NULL COMMENT 'The description of this member state.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberHasRoles`
--

DROP TABLE IF EXISTS `MemberHasRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberHasRoles` (
    `roleID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated role id.',
    `memberID` int(11) NOT NULL DEFAULT 1 COMMENT 'The role of this member.',
    PRIMARY KEY (`memberID`, `roleID`),
    CONSTRAINT `MemberHasRoles_ibfk_1` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`),
    CONSTRAINT `MemberHasRoles_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Members`
--

DROP TABLE IF EXISTS `Members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Members` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member id.',
    `stateID` smallint(6) NOT NULL COMMENT 'The state of this member.',
    `gender` enum('male', 'female') DEFAULT NULL COMMENT 'The gender of this member',
    `login` varchar(255) NOT NULL COMMENT 'The login name of this member.',
    `defaultLogin` varchar(255) NOT NULL COMMENT 'The auto-generated login name.',
    `email` varchar(255) NOT NULL COMMENT 'The email address of this member.',
    `givenName` varchar(255) NOT NULL COMMENT 'The given (first) name of this member.',
    `surname` varchar(255) DEFAULT NULL COMMENT 'The surname (last name) of this member.',
    `suffix` varchar(7) DEFAULT NULL COMMENT 'The suffix of this member.',
    `title` varchar(7) DEFAULT NULL COMMENT 'The title of this member.',
    `birthday` date DEFAULT NULL COMMENT 'The birthday of this member.',
    `phone` varchar(31) DEFAULT NULL COMMENT 'The primary phone number of this member.',
    `fax` varchar(31) DEFAULT NULL COMMENT 'The fax number of this member.',
    `website` varchar(2084) DEFAULT NULL COMMENT 'The website of this member.',
    `imageURL` varchar(2048) NULL COMMENT 'URI to profile image.',
    `emailVerified` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'If the email address has been verified',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The last modified time.',
    `loginTime` timestamp NULL COMMENT 'The last login time.',
    `isProfileUpdated` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Flag for profile update to open profile builder',
    `licenseAcceptedTime` timestamp NULL DEFAULT NULL COMMENT 'CK-12 license accepted time.',
    `timezone` varchar(52) DEFAULT 'US/Pacific',
    `encrypted` smallint(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    CONSTRAINT `Members_ibfk_1` FOREIGN KEY (`stateID`) REFERENCES `MemberStates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    UNIQUE KEY (`login`),
    UNIQUE KEY (`defaultLogin`),
    UNIQUE KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberLocations`
--

DROP TABLE IF EXISTS `MemberLocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLocations` (
    `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
    `countryID` int(11) NOT NULL COMMENT 'The country this member belongs to.',
    `addressID` int(11) NOT NULL COMMENT 'The address id, from different address tables depending on country.',
    PRIMARY KEY (`memberID`, `countryID`, `addressID`),
    CONSTRAINT `MemberLocations_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `MemberLocations_ibfk_2` FOREIGN KEY (`countryID`) REFERENCES `Countries` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberAuthTypes`
--

DROP TABLE IF EXISTS `MemberAuthTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberAuthTypes` (
    `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member authentication type id.',
    `name` varchar(63) NOT NULL COMMENT 'The member authentication type name.',
    `description` varchar(511) DEFAULT NULL COMMENT 'The description of this member authentication type.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberExtData`
--

DROP TABLE IF EXISTS `MemberExtData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberExtData` (
    `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
    `authTypeID` smallint(6) NOT NULL COMMENT 'The id of the authentication type.',
    `token` varchar(255) DEFAULT NULL COMMENT 'The authentication token.',
    `externalID` varchar(255) DEFAULT NULL COMMENT 'The external ID.',
    `verified` bool NOT NULL DEFAULT 1 COMMENT 'Has this entry been verified?',
    `reset` bool NOT NULL DEFAULT 0 COMMENT 'Need to reset.',
    `loginCount` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of times login through this auth type.',
    `updateTime` timestamp NULL DEFAULT NULL COMMENT 'The last modified time.',
	`sharePermissionGrantedTime` timestamp NULL DEFAULT NULL COMMENT 'time at which permisson is granted to CK-12 by the member to share information with the partner.',
    PRIMARY KEY (`memberID`, `authTypeID`),
    INDEX `MemberExtData_token` (`token`),
    CONSTRAINT `MemberExtData_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `MemberExtData_ibfk_2` FOREIGN KEY (`authTypeID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='External data for members through authenticating from other sites.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CampaignMembers`
--

DROP TABLE IF EXISTS `CampaignMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CampaignMembers` (
    `campaignID` varchar(255) NOT NULL COMMENT 'The campaign identifier.',
    `memberID` int(11) NOT NULL COMMENT 'The identifier of the member in this campaign.',
    PRIMARY KEY (`campaignID`, `memberID`),
    CONSTRAINT `CampaignMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members in campaigns.';
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

--
-- Table structure for table `USAddresses`
--

DROP TABLE IF EXISTS `USAddresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `USAddresses` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated address id.',
    `streetNumber` varchar(15) DEFAULT NULL COMMENT 'The street number.',
    `street1` varchar(127) DEFAULT NULL COMMENT 'The line 1 of street.',
    `street2` varchar(127) DEFAULT NULL COMMENT 'The line 2 of street.',
    `city` varchar(31) DEFAULT NULL COMMENT 'The city name.',
    `state` varchar(2) DEFAULT NULL COMMENT 'The state abbreviation',
    `zip` varchar(9) DEFAULT NULL COMMENT 'The zip code',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `USStates`
--

DROP TABLE IF EXISTS `USStates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `USStates` (
    `abbreviation` varchar(2) NOT NULL DEFAULT '' COMMENT 'The US States abbreviation.',
    `name` varchar(63) DEFAULT NULL COMMENT 'The US States name.',
    PRIMARY KEY (`abbreviation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ZipCodes`
--

DROP TABLE IF EXISTS `USZipCodes`;
DROP TABLE IF EXISTS ZipCodes;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ZipCodes` (
    `zipCode` varchar(9) NOT NULL COMMENT 'The US zip code.',
    `city` varchar(35) NOT NULL COMMENT 'The US city name.',
    `state` char(2) NOT NULL COMMENT 'The US States abbreviation.',
    latitude decimal(12, 4) DEFAULT NULL COMMENT 'The latitude',
    longitude decimal(12, 4) DEFAULT NULL COMMENT 'The longitude',
    classification varchar(1) DEFAULT NULL COMMENT 'The classification code',
    population int DEFAULT 0 COMMENT 'The population',
    KEY ZipCodes_zipCode (`zipCode`),
    KEY ZipCodes_city (`city`),
    KEY ZipCodes_state (`state`),
    KEY ZipCodes_latitude (`latitude`),
    KEY ZipCodes_longitude (`longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='U.S. Zip Code Database. Free (from www.zip-codes.com)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OAuthClients`
--

DROP TABLE IF EXISTS `OAuthClients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OAuthClients` (
    `id` varchar(63) NOT NULL COMMENT 'The client app id.',
    `memberID` int(11) NOT NULL COMMENT 'The member id who creates this client app.',
    `name` varchar(255) NOT NULL COMMENT 'The name of this client app.',
    `description` varchar(2047) COMMENT 'Object description',
    `url` varchar(2084) DEFAULT NULL COMMENT 'The url of this client app.',
    `callback` varchar(2084) DEFAULT NULL COMMENT 'The redirect url of this app.',
    `secret` varchar(63) NOT NULL COMMENT 'The client secret code.',
    `trusted` bool DEFAULT 0 COMMENT '1 => trusted; 0 => not yet.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`),
    UNIQUE KEY (`secret`),
    CONSTRAINT `OAuthClients_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OAuthTokens`
--

DROP TABLE IF EXISTS `OAuthTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OAuthTokens` (
    `token` varchar(63) NOT NULL COMMENT 'The token.',
    `clientID` varchar(63) NOT NULL COMMENT 'The client id of the app.',
    `memberID` int(11) COMMENT 'The member id whose resource the app wants.',
    `timestamp` int(11) NOT NULL COMMENT 'Number of seconds since 1970/01/01 00:00:00.',
    `nonce` varchar(63) NOT NULL COMMENT 'The nonce for uniquiness.',
    `callback` varchar(2084) DEFAULT NULL COMMENT 'The redirect url of this app.',
    `secret` varchar(63) COMMENT 'The token secret code.',
    `type` ENUM('request', 'access') NOT NULL DEFAULT 'request',
    PRIMARY KEY (`token`),
    KEY (`timestamp`),
    KEY (`nonce`),
    CONSTRAINT `OAuthTokens_ibfk_1` FOREIGN KEY (`clientID`) REFERENCES `OAuthClients` (`id`),
    CONSTRAINT `OAuthTokens_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UnderageEmailTokens`
--

DROP TABLE IF EXISTS `UnderageEmailTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UnderageEmailTokens` (
    `parentEmail` varchar(255) NOT NULL COMMENT 'The email address of parent for underage student.',
    `token` varchar(255) NOT NULL COMMENT 'The varification token.',
    `studentID` int(11) DEFAULT NULL COMMENT 'The student ID, to be filled when created.',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    PRIMARY KEY (`parentEmail`, `token`),
    CONSTRAINT `UnderageEmailTokens_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Underage token.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UnderageMemberParents`
--

DROP TABLE IF EXISTS `UnderageMemberParents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UnderageMemberParents` (
    `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
    `parentEmail` varchar(255) NOT NULL COMMENT 'The email address of parent for underage member.',
    `token` varchar(1024) DEFAULT NULL COMMENT 'The varification token.',
    `approvalRequestCount` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of times approval request sent to parent.',
    `approvedTime` timestamp NULL DEFAULT NULL COMMENT 'The time when parent approved the request for underage account activation.',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The last modified time.',
    PRIMARY KEY (`memberID`,`parentEmail`),
    CONSTRAINT `UnderageMemberParents_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Information about underage varification.';
/*!40101 SET character_set_client = @saved_cs_client */;

CREATE TABLE USSchoolsMaster (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(128),
    nces_id varchar(24) DEFAULT NULL,
    address varchar(128) DEFAULT NULL,
    city varchar(64) DEFAULT NULL,
    state varchar(2) DEFAULT NULL,
    zipcode varchar(5) DEFAULT NULL,
    county varchar(56) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX (name, nces_id, address, city, state, zipcode, county)
) DEFAULT charset=utf8;

CREATE TABLE `OtherSchools` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(256) DEFAULT NULL,
        PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE MemberSchools (
    memberID int(11) NOT NULL,
    schoolID int(11) NOT NULL,
    schoolType enum('usmaster', 'other', 'home')  NOT NULL DEFAULT 'usmaster',
    PRIMARY KEY (memberID),
    CONSTRAINT MemberSchools_ibfk_1 FOREIGN KEY (memberID) REFERENCES Members (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS `SchoolDistricts`;
CREATE TABLE `SchoolDistricts` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated school district id.',
    `name` varchar(255) NOT NULL COMMENT 'The district name.',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `DistrictHasSchools`;
CREATE TABLE `DistrictHasSchools` (
    `districtID` int(11) NOT NULL COMMENT 'The school district id.',
    `schoolID` int(11) NOT NULL COMMENT 'The school id.',
    PRIMARY KEY (`districtID`, `schoolID`),
    CONSTRAINT `DistrictHasSchools_ibfk_1` FOREIGN KEY (`districtID`) REFERENCES `SchoolDistricts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `DistrictHasSchools_ibfk_2` FOREIGN KEY (`schoolID`) REFERENCES `USSchoolsMaster` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `PartnerSchoolHasMembers`;
CREATE TABLE `PartnerSchoolHasMembers` (
    `memberID` int(11) NOT NULL COMMENT 'The member id.',
    `roleID` int(11) NOT NULL COMMENT 'The role id of this member.',
    `siteID` smallint(6) NOT NULL COMMENT 'The auth type id.',
    `partnerSysID` varchar(63) NULL COMMENT 'The systemwide id used by partners.',
    `partnerMemberID` varchar(63) NOT NULL COMMENT 'The member id used by partners.',
    `partnerSchoolID` varchar(63) NOT NULL COMMENT 'The school id used by partners.',
    PRIMARY KEY (`memberID`, `roleID`, `siteID`, `partnerSchoolID`),
    CONSTRAINT `PartnerSchoolHasMembers_memberID_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchoolHasMembers_roleID_ibfk_2` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchoolHasMembers_siteID_ibfk_3` FOREIGN KEY (`siteID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `PartnerSchoolDistricts`;
CREATE TABLE `PartnerSchoolDistricts` (
    `siteID` smallint(6) NOT NULL COMMENT 'The auth type id.',
    `partnerDistrictID` varchar(63) NOT NULL COMMENT 'The district id used by partners.',
    `tokenID` varchar(63) NULL COMMENT 'The district OAuth Token.',
    `districtID` int(11) NULL COMMENT 'The district id.',
    PRIMARY KEY (`siteID`, `partnerDistrictID`),
    CONSTRAINT `PartnerSchoolDistricts_siteID_ibfk_1` FOREIGN KEY (`siteID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchoolDistricts_ibfk_2` FOREIGN KEY (`districtID`) REFERENCES `SchoolDistricts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `PartnerSchools`;
CREATE TABLE `PartnerSchools` (
    `siteID` smallint(6) NOT NULL COMMENT 'The auth type id.',
    `partnerSchoolID` varchar(63) NOT NULL COMMENT 'The school id used by partners.',
    `partnerDistrictID` varchar(63) NOT NULL COMMENT 'The district id used by partners.',
    `schoolID` int(11) NULL COMMENT 'The school id.',
    PRIMARY KEY (`siteID`, `partnerSchoolID`),
    CONSTRAINT `PartnerSchools_siteID_ibfk_1` FOREIGN KEY (`siteID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchools_ibfk_2` FOREIGN KEY (`schoolID`) REFERENCES `USSchoolsMaster` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `AdminTraces`
--

DROP TABLE IF EXISTS `AdminTraces`;
CREATE TABLE `AdminTraces` (
    `memberID` int(11) NOT NULL COMMENT 'The id of the member becoming admin.',
    `adminID` int(11) NOT NULL COMMENT 'The id of the assigning admin.',
    `state` enum('on', 'off') DEFAULT NULL COMMENT 'The admin state of this member',
    `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The modified time.',
    INDEX `AdminTraces_updateTime` (`updateTime`),
    CONSTRAINT `AdminTraces_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `AdminTraces_ibfk_2` FOREIGN KEY (`adminID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Traces the history of users becoming admin.';

--
-- Table structure for table `migrate_version`
--

DROP TABLE IF EXISTS `migrate_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrate_version` (
    `repository_id` varchar(255) NOT NULL,
    `repository_path` text,
    `version` int(11) DEFAULT NULL,
    PRIMARY KEY (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrate_version`
--

LOCK TABLES `migrate_version` WRITE;
/*!40000 ALTER TABLE `migrate_version` DISABLE KEYS */;
INSERT INTO `migrate_version` (`repository_id`, `repository_path`, `version`) VALUES
('auth', '/opt/db/auth', 0);
/*!40000 ALTER TABLE `migrate_version` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

--
-- Table structure for table `Tasks`
--

DROP TABLE IF EXISTS `Tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The category id',
  `name` varchar(255) NOT NULL COMMENT 'The name of the task',
  `taskID` varchar(255) NOT NULL COMMENT 'RabbitMQ task id',
  `status` varchar(255) NOT NULL COMMENT 'Task status',
  `ownerID` int(11) DEFAULT NULL COMMENT 'The owner of this task',
  `message` text,
  `userdata` mediumtext,
  `hostname` varchar(100) DEFAULT NULL COMMENT 'Host name where the task is running',
  `started` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of enqueuing the task.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The task end time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `taskID` (`taskID`),
  KEY `Tasks_ibfk_1` (`ownerID`),
  CONSTRAINT `Tasks_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Tasks.';
/*!40101 SET character_set_client = @saved_cs_client */;




--
-- Table structure for table `MemberAuthTypeKey`
--

DROP TABLE IF EXISTS `MemberAuthTypeKey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberAuthTypeKey` (
    `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'auto incerementing Primary key.',
    `memberAuthTypeID` smallint(6) NOT NULL COMMENT 'MemberAuthTypes.id.',
    `publicKey` varbinary(2048) NOT NULL COMMENT 'The public key for this auth type.',
	`privateKey` varbinary(2048) COMMENT 'The private key if any for this auth type.',
	`passPhrase` varbinary(256) COMMENT 'The pass phrase (if any) used for the key generation.',
	`created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
	`updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time of this entry.',
    PRIMARY KEY (`id`),
    CONSTRAINT `MemberAuthTypeKey_fk_authType` FOREIGN KEY (`memberAuthTypeID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `MemberAuthTypeKey_uk_authType` (`memberAuthTypeID`),
	INDEX `MemberAuthTypeKey_publicKey` (`publicKey`),
	INDEX `MemberAuthTypeKey_privateKey` (`privateKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
