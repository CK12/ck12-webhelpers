DROP TABLE IF EXISTS `ConceptMapFeedbacks`;
CREATE TABLE `ConceptMapFeedbacks` (
    `memberID` int(11) NOT NULL COMMENT 'Member making the suggestion.',
    `reviewer` int(11) DEFAULT NULL COMMENT 'Member who reviewed the suggestion.',
    `encodedID` varchar(255) NOT NULL COMMENT 'The base node',
    `suggestion` varchar(255) NOT NULL COMMENT 'Suggested addition or disconnect. Prefix + for addition, - for disconnect.',
    `visitorID` varchar(31) NOT NULL COMMENT 'visitor ID.',
    `status` enum('reviewing', 'accepted', 'rejected') NOT NULL DEFAULT 'reviewing' COMMENT 'Status of this suggestion.',
    `comments` varchar(4095) DEFAULT NULL COMMENT 'Comments from the user.',
    `notes` varchar(4095) DEFAULT NULL COMMENT 'Notes from the reviewer.',
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time.',
    `updateTime` timestamp COMMENT 'Update time.',
    PRIMARY KEY(`memberID`, `encodedID`, `suggestion`, `visitorID`), 
    KEY `ConceptMapFeedbacks_1` (`memberID`),
    KEY `ConceptMapFeedbacks_2` (`reviewer`),
    KEY `ConceptMapFeedbacks_3` (`encodedID`),
    KEY `ConceptMapFeedbacks_4` (`suggestion`),
    KEY `ConceptMapFeedbacks_5` (`status`),
    CONSTRAINT `ConceptMapFeedbacks_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ConceptMapFeedbacks_ibfk_2` FOREIGN KEY (`reviewer`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ConceptMapFeedbacks_ibfk_3` FOREIGN KEY (`encodedID`) REFERENCES `BrowseTerms` (`encodedID`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
