--
-- Table structure for table `TeacherStudentRelations`
--

DROP TABLE IF EXISTS `TeacherStudentRelations`;
CREATE TABLE `TeacherStudentRelations` (
    `studentID` int(11) NOT NULL COMMENT 'The id of the student.',
    `teacherID` int(11) NOT NULL COMMENT 'The id of the teacher.',
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time of the entry.',
    PRIMARY KEY (`studentID`, `teacherID`),
    KEY (`creationTime`),
    CONSTRAINT `TeacherStudentRelations_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `TeacherStudentRelations_ibfk_2` FOREIGN KEY (`teacherID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Information about students created by teachers.';
