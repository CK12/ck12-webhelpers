ALTER TABLE `BrowseTerms` ADD COLUMN `aliasID` INT(11) DEFAULT NULL AFTER `parentID`;
ALTER TABLE `BrowseTerms` ADD CONSTRAINT `BrowseTerms_ibfk_3` FOREIGN KEY (`aliasID`) REFERENCES `BrowseTerms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
