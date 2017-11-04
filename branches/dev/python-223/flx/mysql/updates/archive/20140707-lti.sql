INSERT INTO `LMSProviders` (`id`, `name`, `description`) VALUES (2, 'Canvas', 'Canvas'),
    (3, 'Schoology', 'Schoology')
    ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name=VALUES(name), description=VALUES(description);

/* Create a new column appID in LMSProviderGroups */
ALTER TABLE `LMSProviderGroups` ADD COLUMN `appID` VARCHAR(255) NOT NULL COMMENT 'The app ID.' AFTER `appName`;

/* Insert appID values into LMSProviderGroups based on appName value /*
UPDATE `LMSProviderGroups` lpg SET `appID` = (SELECT `appID` FROM `LMSProviderApps` lpa WHERE lpg.appName = lpa.appName limit 1);

/*Current appID column size is 8191, which not allows to create unique and foreign key constraints, changed size to 255 */
ALTER TABLE `LMSProviderApps` CHANGE `appID` `appID` VARCHAR(255) NOT NULL COMMENT 'The app ID.';

/*ADD UNIQUE KEY constratin on LMSProviderApps table appID column */
ALTER TABLE `LMSProviderApps` ADD CONSTRAINT `LMSProviderApps_appID` UNIQUE (`appID`(255));

/*Remove Foreign key for appName on LMSProviderGroups */
ALTER TABLE `LMSProviderGroups` DROP FOREIGN KEY `LMSProviderGroups_ibfk_1`;

ALTER TABLE `LMSProviderApps` DROP INDEX `LMSProviderApps_name`;

UPDATE `LMSProviderGroups` SET `appID` = '2109d83b62c97630049219d0020f014365fb2107' WHERE `appName` = 'edmPracticeScience';
UPDATE `LMSProviderGroups` SET `appID` = '65f2ee41c12c04866cb5cf184b7edeb5f630e938' WHERE `appName` = 'edmPracticeMath';

/*Remove existing primary key (`appName`, 'providerGroupID') and change to (`appID`, providerGroupID) */
ALTER TABLE `LMSProviderGroups` DROP PRIMARY KEY, ADD PRIMARY KEY(`appID`(255), `providerGroupID`);

/* Add foreign key constraint for appID into LMSProviderGroups */
ALTER TABLE `LMSProviderGroups` ADD CONSTRAINT `LMSProviderGroups_ibfk_3` FOREIGN KEY (`appID`) REFERENCES `LMSProviderApps`(`appID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/* Drop appName column from LMSProviderGroups */
ALTER TABLE `LMSProviderGroups` DROP COLUMN `appName`;

INSERT INTO `LMSProviderApps` (`providerID`, `appID`, `appName`, `policy`) VALUES
    (2, 'canvas-ck12:ltiApp', 'ltiApp', '{}'),
    (2, 'canvas-ccsd:ltiApp', 'ltiApp', '{}'),
    (2, 'canvas:ltiApp', 'ltiApp', '{}'),
    (3, 'schoology:ltiApp', 'ltiApp', '{}');
