BEGIN;
INSERT INTO AbuseReasons (id, name, description) VALUES (5, 'Incorrect Content', 'The content described is incorrect.');

ALTER TABLE `AbuseReports` ADD `artifactID` int(11) DEFAULT NULL COMMENT 'The id of the artifact for which the abuse is reported';
ALTER TABLE `AbuseReports` ADD `imageUrl` varchar(2047) DEFAULT NULL COMMENT 'The image url depicting the issue - a screenshot';
ALTER TABLE `AbuseReports` ADD FOREIGN KEY AbuseReports_ibfk_5 (artifactID) REFERENCES `Artifacts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;
