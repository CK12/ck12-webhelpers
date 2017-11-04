ALTER TABLE `Members` MODIFY login VARCHAR(255);
ALTER TABLE `Members` MODIFY email VARCHAR(255);
ALTER TABLE `Members` ADD `defaultLogin` varchar(255) NOT NULL;
