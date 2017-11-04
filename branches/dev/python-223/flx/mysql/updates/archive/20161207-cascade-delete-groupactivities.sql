ALTER TABLE `MemberViewedGroupActivities` DROP FOREIGN KEY `MemberViewedGroupActivities_ibfk_1`;
ALTER TABLE `MemberViewedGroupActivities` ADD CONSTRAINT `MemberViewedGroupActivities_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `MemberViewedGroupActivities` DROP FOREIGN KEY `MemberViewedGroupActivities_ibfk_2`;
ALTER TABLE `MemberViewedGroupActivities` ADD CONSTRAINT `MemberViewedGroupActivities_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `MemberViewedGroupActivities` DROP FOREIGN KEY `MemberViewedGroupActivities_ibfk_3`;
ALTER TABLE `MemberViewedGroupActivities` ADD CONSTRAINT `MemberViewedGroupActivities_ibfk_3` FOREIGN KEY (`activityID`) REFERENCES `GroupActivities` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

