DROP TABLE IF EXISTS `LMSProviderAssignmentScores`;
DROP TABLE IF EXISTS `LMSProviderAssignments`;
DROP TABLE IF EXISTS `LMSProviderGroupMembers`;
DROP TABLE IF EXISTS `LMSProviderGroups`;
DROP TABLE IF EXISTS `LMSProviderApps`;
DROP TABLE IF EXISTS `LMSProviders`;

--
-- Table structure for table `LMSProviders`
--

CREATE TABLE `LMSProviders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto-generated provider ID.',
  `name` varchar(255) NOT NULL COMMENT 'The provider name.',
  `description` varchar(2047) DEFAULT NULL COMMENT 'The provider description.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `LMSProviders_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviders may or may not conform to LTI (Learning Tools Interoperability) Spec.';

--
-- Table structure for table `LMSProviderApps`
--

CREATE TABLE `LMSProviderApps` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `appID` varchar(8191) DEFAULT NULL COMMENT 'The app ID.',
  `appName` varchar(255) DEFAULT NULL COMMENT 'The CK-12 defined unique app name.',
  `policy` varchar(65535) DEFAULT NULL COMMENT 'The json policy spec for this provider.',
  PRIMARY KEY (`providerID`, `appID`(255)),
  UNIQUE KEY `LMSProviderApps_name` (`appName`),
  CONSTRAINT `LMSProviderApps_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderApps.';

--
-- Table structure for table `LMSProviderGroups`
--

CREATE TABLE `LMSProviderGroups` (
  `appName` varchar(255) DEFAULT NULL COMMENT 'The CK-12 defined unique app name.',
  `providerGroupID` varchar(63) NOT NULL COMMENT 'The provider group ID.',
  `groupID` int(11) DEFAULT NULL COMMENT 'The CK-12 group ID.',
  `title` varchar(255) NOT NULL COMMENT 'The group title.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`appName`, `providerGroupID`),
  KEY `LMSProviderGroups_title` (`title`),
  CONSTRAINT `LMSProviderGroups_ibfk_1` FOREIGN KEY (`appName`) REFERENCES `LMSProviderApps` (`appName`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `LMSProviderGroups_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderGroups.';

--
-- Table structure for table `LMSProviderGroupMembers`
--

CREATE TABLE `LMSProviderGroupMembers` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `providerGroupID` varchar(63) NOT NULL COMMENT 'The provider group ID.',
  `providerMemberID` varchar(63) NOT NULL COMMENT 'The provider member ID.',
  `memberID` int(11) DEFAULT NULL COMMENT 'The CK-12 member ID.',
  PRIMARY KEY (`providerID`, `providerGroupID`, `providerMemberID`),
  CONSTRAINT `LMSProviderGroupMembers_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `LMSProviderGroupMembers_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderGroupMembers.';

--
-- Table structure for table `LMSProviderAssignments`
--

CREATE TABLE `LMSProviderAssignments` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `providerAssignmentID` varchar(63) NOT NULL COMMENT 'The provider assignment ID.',
  `assignmentID` int(11) NOT NULL COMMENT 'The CK-12 assignment ID.',
  PRIMARY KEY (`providerID`, `providerAssignmentID`),
  CONSTRAINT `LMSProviderAssignments_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `LMSProviderAssignments_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `Assignments` (`assignmentID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderAssignments.';

--
-- Table structure for table `LMSProviderAssignmentScores`
--

CREATE TABLE `LMSProviderAssignmentScores` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `providerGroupID` varchar(63) NOT NULL COMMENT 'The provider group ID.',
  `providerMemberID` varchar(63) NOT NULL COMMENT 'The provider member ID.',
  `providerAssignmentID` varchar(63) NOT NULL COMMENT 'The provider assignment ID.',
  `testScoreID` varchar(255) NULL COMMENT 'The test score ID.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `status` enum('private', 'reported') DEFAULT 'private' COMMENT 'Has the score been reported or not.',
  PRIMARY KEY (`providerID`, `providerGroupID`, `providerMemberID`, `providerAssignmentID`),
  KEY `LMDProfiderAssignmentScores_status`(`status`),
  CONSTRAINT `LMSProviderAssignmentScores_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderAssignmentScores.';
