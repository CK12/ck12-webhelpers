ALTER TABLE `GroupActivities` CHANGE `activityType` `activityType` ENUM( 'create', 'join', 'share' ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'The type of activity';
ALTER TABLE `GroupActivities` CHANGE `objectType` `objectType` ENUM( 'artifact', 'artifactRevision', 'resource', 'resourceRevision', 'notification', 'member', 'group' ) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;