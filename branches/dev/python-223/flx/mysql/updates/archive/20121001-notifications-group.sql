ALTER TABLE `Notifications` ADD COLUMN `groupID` int(11) COMMENT 'The GroupID for which the notification belongs to' AFTER subscriberID;
ALTER TABLE `Notifications` ADD CONSTRAINT `Notifications_ibfk_4` FOREIGN KEY (`groupID`) REFERENCES `Groups`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO `EventTypes` (`id`, `name`, `description`) VALUES (27, 'GROUP_SHARE', 'Event when something is shared within a group');
