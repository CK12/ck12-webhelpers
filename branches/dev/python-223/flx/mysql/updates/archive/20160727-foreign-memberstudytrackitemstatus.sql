CREATE TABLE `MemberStudyTrackItemStatusNew` LIKE `MemberStudyTrackItemStatus`;
ALTER TABLE `MemberStudyTrackItemStatusNew` ADD CONSTRAINT `MemberStudyTrackItemStatus_item_index_1` FOREIGN KEY (`studyTrackItemID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `MemberStudyTrackItemStatusNew` ADD CONSTRAINT `MemberStudyTrackItemStatus_assignment_index_2` FOREIGN KEY (`assignmentID`) REFERENCES `Assignments` (`assignmentID`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `MemberStudyTrackItemStatusNew` ADD CONSTRAINT `MemberStudyTrackItemStatus_member_index_3` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
INSERT `MemberStudyTrackItemStatusNew` SELECT * FROM `MemberStudyTrackItemStatus`;
