--
-- Table structure for table `GroupHasGrades`
--
DROP TABLE IF EXISTS `GroupHasGrades`;

CREATE TABLE `GroupHasGrades` (
  `groupID` int(11) NOT NULL COMMENT 'Group id',
  `gradeID` smallint(11) NOT NULL COMMENT 'Grade id',
  KEY `GroupHasGrades_ibfk_1` (`groupID`),
  KEY `GroupHasGrades_ibfk_2` (`gradeID`),
  UNIQUE KEY `unq_group_grade` (`groupID`,`gradeID`),
  CONSTRAINT `GroupHasGrades_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `GroupHasGrades_ibfk_2` FOREIGN KEY (`gradeID`) REFERENCES `Grades` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Group Grades';
