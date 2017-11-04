--
-- Table structure for table `BlockedMembers`
--

DROP TABLE IF EXISTS `BlockedMembers`;
CREATE TABLE `BlockedMembers` (
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `objectType` enum('group', 'artifact') NOT NULL,
  `subObjectType` enum('public-forum', 'study', 'class', 'book', 'concept') DEFAULT NULL,
  `objectID` varchar(52) DEFAULT NULL COMMENT 'The reference object id',
  `blockedBy` int(11) NOT NULL COMMENT 'The member id.',
  `reason` varchar(16383) DEFAULT NULL COMMENT 'Reason why user is resricted of specific activity.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time.',
   CONSTRAINT `BlockedMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   CONSTRAINT `BlockedMembers_ibfk_2` FOREIGN KEY (`blockedBy`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   UNIQUE KEY `memberID` (`memberID`,`objectType`,`subObjectType`, `objectID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Blocked Members list.';
