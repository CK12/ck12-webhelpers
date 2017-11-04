ALTER TABLE `Resources` ADD `checksum` varchar(255) DEFAULT NULL COMMENT 'The checksum for this resource.';
ALTER TABLE `Resources` ADD `satelliteUrl` varchar(1024) DEFAULT NULL COMMENT 'The satellite location of this resource.';

CREATE INDEX `Resources_checksum` ON `Resources` (`checksum`);
CREATE INDEX `Resources_checksum_ownerID` ON `Resources` (`checksum`, `ownerID`);

UPDATE `Resources` SET `checksum` = (SELECT `checksum` FROM `ResourceSatelliteUrls` WHERE `resourceID` = `Resources`.`id`);
UPDATE `Resources` SET `satelliteUrl` = (SELECT `url` FROM `ResourceSatelliteUrls` WHERE `resourceID` = `Resources`.`id`);

DROP TABLE IF EXISTS `ResourceSatelliteUrls`;
