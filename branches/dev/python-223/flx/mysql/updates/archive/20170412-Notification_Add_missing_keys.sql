SET autocommit=0;
CREATE TABLE `Notifications_tmp` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `eventTypeID` smallint(6) NOT NULL COMMENT 'The event type for this notification',
      `objectID` varchar(52) DEFAULT NULL COMMENT 'The objectID for the event',
      `objectType` varchar(255) DEFAULT NULL COMMENT 'The objectType for the event',
      `type` enum('email','text','web') NOT NULL DEFAULT 'email' COMMENT 'The type of notification',
      `ruleID` smallint(6) DEFAULT NULL COMMENT 'The Notification Rule',
      `address` varchar(255) DEFAULT NULL COMMENT 'The address where the notification should be sent',
      `subscriberID` int(11) DEFAULT NULL COMMENT 'The owner for the notification',
      `groupID` int(11) DEFAULT NULL COMMENT 'The GroupID for which the notification belongs to',
      `frequency` enum('instant','once','6hours','12hours','daily','weekly','ondemand','off') NOT NULL DEFAULT 'once' COMMENT 'How often the notification should be send',
      `copyTo` varchar(1024) DEFAULT NULL COMMENT 'Cc email addresses - comma-separated',
      `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The request update time.',
      `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of creating the row.',
      `lastSent` timestamp NULL DEFAULT NULL COMMENT 'The time when this notification was last sent',
      PRIMARY KEY (`id`),
      UNIQUE KEY `Idx_Notifications2_1` (`eventTypeID`,`subscriberID`,`objectID`,`objectType`,`type`,`ruleID`,`groupID`,`frequency`,`address`),
      KEY `Idx_Notifications_1` (`eventTypeID`,`lastSent`,`frequency`,`type`),
      KEY `Idx_Notifications_2` (`eventTypeID`,`lastSent`,`frequency`,`objectID`,`objectType`,`type`),
      CONSTRAINT `Notifications2_ibfk_1` FOREIGN KEY (`eventTypeID`) REFERENCES `EventTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT `Notifications2_ibfk_2` FOREIGN KEY (`subscriberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT `Notifications2_ibfk_3` FOREIGN KEY (`ruleID`) REFERENCES `NotificationRules` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT `Notifications2_ibfk_4` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Notifications';

INSERT IGNORE INTO Notifications_tmp (id, eventTypeID, objectID, objectType, `type`, ruleID, address, subscriberID, groupID, frequency, copyTo, updated, created, lastSent) SELECT id, eventTypeID, objectID, objectType, `type`, ruleID, address, subscriberID, groupID, frequency, copyTo, updated, created, lastSent  FROM Notifications;

RENAME TABLE Notifications TO Notifications_del;

RENAME TABLE Notifications_tmp TO Notifications;
COMMIT;
SET autocommit=1;

-- DROP TABLE Notifications_del;
