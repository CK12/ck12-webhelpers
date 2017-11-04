ALTER TABLE `GroupHasMembers` ADD INDEX `GroupHasMembers_updateTime` (`updateTime`);
ALTER TABLE `GroupActivities` ADD INDEX `GroupActivities_activityType` (`activityType`);
ALTER TABLE `GroupActivities` ADD INDEX `GroupActivities_creationTime` (`creationTime`);
ALTER TABLE `Artifacts` ADD INDEX `Artifacts_creationTime` (`creationTime`);
ALTER TABLE `ResourceRevisions` ADD INDEX `ResourceRevisions_publishTime` (`publishTime`);
