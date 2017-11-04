INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) values ('CKT', 'root', 4, NULL);
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT','Mathematics',4, id from `BrowseTerms` where `encodedID` = 'CKT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.ARI','Arithmetic',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA','Measurement',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.ALG','Algebra',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.CAL','Calculus',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.GEO','Geometry',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.PRB','Probability',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.STA','Statistics',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.TRG','Trigonometry',4, id from `BrowseTerms` where `encodedID` = 'MAT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI','Science',4, id from `BrowseTerms` where `encodedID` = 'CKT';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.CHE','Chemistry',4, id from `BrowseTerms` where `encodedID` = 'SCI';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.PHY','Physics',4, id from `BrowseTerms` where `encodedID` = 'SCI';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.BIO','Biology',4, id from `BrowseTerms` where `encodedID` = 'SCI';
INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.ESC','Earth Science',4, id from `BrowseTerms` where `encodedID` = 'SCI';

