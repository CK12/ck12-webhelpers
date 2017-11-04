ALTER TABLE `MemberStudyTrackItemStatus` DROP FOREIGN KEY `MemberStudyTrackItemStatus_assignment_ibfk_2`;
ALTER TABLE `MemberStudyTrackItemStatus` DROP KEY `MemberStudyTrackItemStatus_assignment_ibfk_2`;
ALTER TABLE `MemberStudyTrackItemStatus` ADD CONSTRAINT `MemberStudyTrackItemStatus_assignment_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `Assignments` (`assignmentID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
