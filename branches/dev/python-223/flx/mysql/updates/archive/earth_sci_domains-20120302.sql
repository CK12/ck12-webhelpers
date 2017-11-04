INSERT  IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.ESC.712','Relative Ages of Rocks',4, id from `BrowseTerms` where `encodedID` = 'SCI.ESC.710';
INSERT  IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.ESC.712.1','Principles of Relative Dating',4, id from `BrowseTerms` where `encodedID` = 'SCI.ESC.712';
INSERT  IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.ESC.712.2','Determining Relative Ages',4, id from `BrowseTerms` where `encodedID` = 'SCI.ESC.712';
SELECT `id` INTO @parentID FROM `BrowseTerms` WHERE `encodedID` = 'SCI.ESC.712';
UPDATE `BrowseTerms` set `parentID` = @parentID where `encodedID` = 'SCI.ESC.712.3';
UPDATE `BrowseTerms` set `parentID` = @parentID where `encodedID` = 'SCI.ESC.712.4';

SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'SCI.ESC.711.3';
INSERT IGNORE INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'SCI.ESC.712';
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'SCI.ESC.712';
INSERT IGNORE INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'SCI.ESC.712.1';
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'SCI.ESC.712.1';
INSERT IGNORE INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'SCI.ESC.712.2';
SELECT `id` INTO @domainID FROM `BrowseTerms` WHERE `encodedID` = 'SCI.ESC.712.3';
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'SCI.ESC.712.2';
UPDATE `DomainNeighbors` set `requiredDomainID` = @reqID where `domainID` = @domainID;
