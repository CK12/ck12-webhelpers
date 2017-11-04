--
-- Table structure for table `MemberHasSubjects`
--
DROP TABLE IF EXISTS `MemberHasSubjects`;

CREATE TABLE `MemberHasSubjects` (
  `memberID` int(11) NOT NULL COMMENT 'Member id',
  `subjectID` smallint(11) NOT NULL COMMENT 'Subjects id',
  KEY `MemberHasSubjects_ibfk_1` (`memberID`),
  KEY `MemberHasSubjects_ibfk_2` (`subjectID`),
  UNIQUE KEY `unq_member_subject` (`memberID`,`subjectID`),
  CONSTRAINT `MemberHasSubjects_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberHasSubjects_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `Subjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members Subjects';

