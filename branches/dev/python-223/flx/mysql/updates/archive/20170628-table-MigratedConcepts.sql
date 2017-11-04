USE flx2;
--
-- Table structure for table `MigratedConcepts`
--

CREATE TABLE IF NOT EXISTS `MigratedConcepts` (
    `originalEID` varchar(100) not null, 
    `newEID` varchar(100) not null, 
    PRIMARY KEY (`originalEID`, `newEID`), 
    UNIQUE KEY `originalEID` (`originalEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='EID Mappings for concept migration';

call update_dbpatch('20170628-table-MigratedConcepts.sql');
