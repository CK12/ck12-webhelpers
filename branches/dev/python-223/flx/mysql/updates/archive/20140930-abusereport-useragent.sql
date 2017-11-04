BEGIN;
ALTER TABLE `AbuseReports` ADD `userAgent` varchar(511) DEFAULT NULL COMMENT 'The clients user-agent information.' AFTER imageUrl;
COMMIT;
