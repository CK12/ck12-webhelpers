ALTER TABLE `Members` DROP INDEX `login`;
ALTER TABLE `Members` DROP INDEX `email`;
ALTER TABLE `Members` DROP INDEX `Members_givenName`;
ALTER TABLE `Members` DROP INDEX `Members_surname`;
ALTER TABLE `Members` MODIFY COLUMN `login` varchar(512),
                      MODIFY COLUMN `email` varchar(512),
                      MODIFY COLUMN `givenName` varchar(256),
                      MODIFY COLUMN `surname` varchar(256);
