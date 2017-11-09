INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) values ('CKT', 'root', 4, NULL);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT','Mathematics',4, id from `BrowseTerms` where `encodedID` = 'CKT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.ARI','Arithmetic',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA','Measurement',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.ALG','Algebra',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.CAL','Calculus',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.GEO','Geometry',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.PRB','Probability',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.STA','Statistics',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.TRG','Trigonometry',4, id from `BrowseTerms` where `encodedID` = 'MAT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI','Science',4, id from `BrowseTerms` where `encodedID` = 'CKT' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.CHE','Chemistry',4, id from `BrowseTerms` where `encodedID` = 'SCI' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.PHY','Physics',4, id from `BrowseTerms` where `encodedID` = 'SCI' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.BIO','Biology',4, id from `BrowseTerms` where `encodedID` = 'SCI' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'SCI.ESC','Earth Science',4, id from `BrowseTerms` where `encodedID` = 'SCI' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.100','Units of Measurement',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.110','Metric System',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.100' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.120','Standard Units',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.100' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.130','Nonstandard Units',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.100' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.140','Reading Maps, Legends/Scale',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.100' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.200','Linear Measure',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.210','Distance',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.200' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.220','Perimeter',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.200' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.230','Circumference',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.200' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.300','Area',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.310','Area of Polygons',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.300' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.320','Area of Circles',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.300' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.330','Surface Area',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.300' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.340','Area of Nonstandard Shapes',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.300' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.400','Volume',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.500','Weight and Mass',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.600','Temperature',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.610','Fahrenheit',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.600' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.620','Celsius',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.600' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.700','Time',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.710','Digital Clock',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.700' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.720','Clock with Hands',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA.700' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.800','Speed',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);
INSERT  INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select 'MAT.MEA.900','Money',4, id from `BrowseTerms` where `encodedID` = 'MAT.MEA' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);


DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.110');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.100';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.110';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.120');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.110';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.120';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.130');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.120';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.130';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.140');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.130';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.140';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.200');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.140';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.200';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.210');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.200';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.210';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.220');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.210';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.220';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.230');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.220';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.230';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.300');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.230';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.300';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.310');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.300';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.310';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.320');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.310';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.320';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.330');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.320';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.330';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.340');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.330';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.340';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.400');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.340';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.400';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.500');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.400';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.500';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.600');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.500';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.600';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.610');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.600';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.610';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.620');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.610';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.620';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.700');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.620';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.700';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.710');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.700';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.710';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.720');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.710';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.720';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.800');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.720';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.800';
DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.900');
SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = 'MAT.MEA.800';
INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = 'MAT.MEA.900';
