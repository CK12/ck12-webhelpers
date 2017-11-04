DROP TABLE IF EXISTS `BookEditingAssignments`;
CREATE TABLE `BookEditingAssignments` (
    `artifactID` INT(11) NOT NULL COMMENT 'The assigned artifact ID.',
    `bookID` INT(11) NOT NULL COMMENT 'The artifact ID of the book.',
    `assigneeID` INT(11) NOT NULL COMMENT 'The member ID of the assignee.',
    `groupID` INT(11) NOT NULL COMMENT 'The corresponding group ID.',
    `artifactTypeID` SMALLINT(6) NOT NULL COMMENT 'The assigned artifact type ID.',
    `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    PRIMARY KEY(`artifactID`),
    KEY `BookEditingAssignments_key_1` (`bookID`),
    KEY `BookEditingAssignments_key_2` (`assigneeID`),
    KEY `BookEditingAssignments_key_3` (`groupID`),
    KEY `BookEditingAssignments_key_4` (`artifactTypeID`),
    CONSTRAINT `BookEditingAssignments_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_2` FOREIGN KEY (`bookID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_3` FOREIGN KEY (`assigneeID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_4` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_5` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookEditingAssignments';

DROP TABLE IF EXISTS `BookEditingDrafts`;
CREATE TABLE `BookEditingDrafts` (
    `artifactRevisionID` INT(11) NOT NULL COMMENT 'The editing artifact revision ID.',
    `assigneeID` INT(11) NOT NULL COMMENT 'The member ID of the assignee.',
    `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    PRIMARY KEY(`artifactRevisionID`),
    KEY `BookEditingDrafts_key_1` (`assigneeID`),
    CONSTRAINT `BookEditingDrafts_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingDrafts_ibfk_2` FOREIGN KEY (`assigneeID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookEditingDrafts';
