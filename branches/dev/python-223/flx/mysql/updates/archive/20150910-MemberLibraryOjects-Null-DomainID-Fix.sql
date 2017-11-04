INSERT IGNORE INTO `BrowseTerms` (`name`, `encodedID`, `termTypeID`, `parentID`, `handle`, `description`) 
    SELECT 'null-pdomain', 'UGC.UBR.000.0000', id, null, 'null-pdomain', 'The null placeholder pseudodomain' FROM `BrowseTermTypes` WHERE `name` = 'pseudodomain';

UPDATE `MemberLibraryObjects` SET `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'UGC.UBR.000.0000') WHERE `domainID` IS NULL; 

ALTER TABLE `MemberLibraryObjects` MODIFY `domainID` int(11) NOT NULL COMMENT 'The domainID of the object in member library';
