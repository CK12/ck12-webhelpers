DROP TABLE IF EXISTS `From1xChapters`;
DROP TABLE IF EXISTS `From1xBooks`;
DROP TABLE IF EXISTS `From1xBookMembers`;

CREATE TABLE `From1xBookMembers` (
    `memberID` int(11) NOT NULL COMMENT 'The id of the member who owns 1.x books.',
    `memberID1x` int(11) NOT NULL COMMENT 'The 1.x member id.',
    `taskID` varchar(255) NULL COMMENT 'The id of the async task.',
    `started` timestamp NULL COMMENT 'The migration starting time.',
    `migrated` timestamp NULL COMMENT 'The migration completion time.',
    `declined` bool DEFAULT FALSE COMMENT 'If true, the member declined to import.',
    PRIMARY KEY (`memberID`),
    UNIQUE KEY(`memberID1x`),
    CONSTRAINT `From1xBookMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `From1xBookMembers_ibfk_2` FOREIGN KEY (`taskID`) REFERENCES `Tasks`(`taskID`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='From1xBookMembers';

CREATE TABLE `From1xBooks` (
    `fid` int(11) NOT NULL COMMENT 'The 1.x flexbook id.',
    `memberID` int(11) NOT NULL COMMENT 'The id of the member who owns this book.',
    `artifactID` int(11) NULL COMMENT 'The corresponding 2.0 artifact id.',
    PRIMARY KEY (`fid`),
    CONSTRAINT `From1xBooks_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `From1xBookMembers`(`memberID`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `From1xBooks_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='From1xBooks';

CREATE TABLE `From1xChapters` (
    `cid` int(11) NOT NULL COMMENT 'The 1.x flexbook chapter id.',
    `artifactID` int(11) NULL COMMENT 'The corresponding 2.0 artifact id.',
    PRIMARY KEY (`cid`),
    CONSTRAINT `From1xChapters_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='From1xChapters';
