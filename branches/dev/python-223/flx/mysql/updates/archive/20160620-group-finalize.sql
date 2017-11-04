DROP TABLE IF EXISTS `BookFinalizationLocks`;
DROP TABLE IF EXISTS `BookFinalizations`;

CREATE TABLE `BookFinalizations` (
    `bookID` INT(11) NOT NULL COMMENT 'The artifact id of the finalizing book.',
    `taskID` varchar(255) NULL DEFAULT NULL COMMENT 'The task id',
    `total` SMALLINT(6) NOT NULL COMMENT 'The total number of finalizing artifacts within this book.',
    `completed` SMALLINT(6) NOT NULL DEFAULT 0 COMMENT 'The number of completed artifacts.',
    `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    `updateTime` TIMESTAMP NULL DEFAULT NULL COMMENT 'The update time.',
    PRIMARY KEY(`bookID`),
    UNIQUE KEY `BookFinalizations_key_1` (`taskID`),
    CONSTRAINT `BookFinalizations_ibfk_1` FOREIGN KEY (`bookID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookFinalizations_ibfk_2` FOREIGN KEY (`taskID`) REFERENCES `Tasks` (`taskID`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookFinalizations';

CREATE TABLE `BookFinalizationLocks` (
    `artifactID` INT(11) NOT NULL COMMENT 'The assigned artifact ID.',
    `bookID` INT(11) NOT NULL COMMENT 'The artifact id of the finalizing book.',
    `message` VARCHAR(4096) COMMENT 'The message during finalization for this artifact.',
    PRIMARY KEY(`artifactID`),
    KEY `BookFinalizationLocks_key_1` (`bookID`),
    CONSTRAINT `BookFinalizationLocks_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookFinalizationLocks_ibfk_2` FOREIGN KEY (`bookID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookFinalizationLocks';
