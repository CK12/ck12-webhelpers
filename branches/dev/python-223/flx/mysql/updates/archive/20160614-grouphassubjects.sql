--
-- Table structure for table `GroupHasSubjects`
--
DROP TABLE IF EXISTS `GroupHasSubjects`;

CREATE TABLE `GroupHasSubjects` (
  `groupID` int(11) NOT NULL COMMENT 'Group id',
  `subjectID` smallint(11) NOT NULL COMMENT 'Subjects id',
  KEY `GroupHasSubjects_ibfk_1` (`groupID`),
  KEY `GroupHasSubjects_ibfk_2` (`subjectID`),
  UNIQUE KEY `unq_group_subject` (`groupID`,`subjectID`),
  CONSTRAINT `GroupHasSubjects_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `GroupHasSubjects_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `Subjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Groups Subjects';

