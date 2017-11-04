--
-- Table structure for table `MemberHasGrades`
--
DROP TABLE IF EXISTS `MemberHasGrades`;

CREATE TABLE `MemberHasGrades` (
  `memberID` int(11) NOT NULL COMMENT 'Member id',
  `gradeID` smallint(11) NOT NULL COMMENT 'Grades id',
  KEY `MemberHasGrades_ibfk_1` (`memberID`),
  KEY `MemberHasGrades_ibfk_2` (`gradeID`),
  CONSTRAINT `MemberHasGrades_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberHasGrades_ibfk_2` FOREIGN KEY (`gradeID`) REFERENCES `Grades` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members Grades';
