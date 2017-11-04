--
-- Table structure for table `MemberViewedGroupActivities`
--

CREATE TABLE `MemberViewedGroupActivities` (
  `memberID` int(11) NOT NULL,
  `groupID` int(11) NOT NULL,
  `activityID` int(11) NOT NULL,
  `viewedTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `IdxPerUsrPerActivity` (`memberID`,`activityID`),
  KEY `IdxPerUsrPerGroupActivity` (`memberID`, `groupID`, `activityID`),
  CONSTRAINT `MemberViewedGroupActivities_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`),
  CONSTRAINT `MemberViewedGroupActivities_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`),
  CONSTRAINT `MemberViewedGroupActivities_ibfk_3` FOREIGN KEY (`activityID`) REFERENCES `GroupActivities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
