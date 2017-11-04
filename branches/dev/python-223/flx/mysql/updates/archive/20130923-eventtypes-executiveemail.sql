INSERT INTO `EventTypes` (`id`, `name`, `description`) VALUES (44, 'EXECUTIVE_EMAIL', 'Daily Executive Email');
INSERT INTO `Notifications` (`eventTypeID`, `objectID`, `objectType`, `type`, `ruleID`, `address`, `subscriberID`, `frequency`, `lastSent`, `created`, `updated`) VALUES (44,NULL,NULL,'email',NULL,'thejaswi@ck12.org',NULL,'instant',NULL,now(), now());
