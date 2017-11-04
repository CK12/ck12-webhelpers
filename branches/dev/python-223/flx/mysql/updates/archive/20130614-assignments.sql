CREATE TABLE `Assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The assignment id',
  `groupID` int(11) NOT NULL COMMENT 'The group id.',
  `assigneeID` int(11) DEFAULT NULL COMMENT 'The assignee id. If zero, the assignment is for the entire group.',
  `creatorID` int(11) NOT NULL COMMENT 'The creator ID of the assignment.',
  `artifactID` int(11) DEFAULT NULL COMMENT 'The artifact ID of the assignment.',
  `url` varchar(255) NULL DEFAULT '' COMMENT 'The url of the assignment (external).',
  `assignmentType` enum('scoreable', 'non-scoreable') DEFAULT 'scoreable' COMMENT 'The assignment type.',
  `creationTime` timestamp NOT NULL COMMENT 'The assignment creation time.',
  `startTime` timestamp NOT NULL COMMENT 'The assignment starting time.',
  `endTime` timestamp NOT NULL COMMENT 'The assignment ending time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`groupID`, `assigneeID`,`artifactID`, `url`, `startTime`),
  CONSTRAINT `group_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `assignee_ibfk_2` FOREIGN KEY (`assigneeID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `creator_ibfk_3` FOREIGN KEY (`creatorID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `artifact_ibfk_4` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
