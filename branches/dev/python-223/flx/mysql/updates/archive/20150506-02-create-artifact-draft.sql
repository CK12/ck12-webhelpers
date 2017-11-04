DROP TABLE IF EXISTS `ArtifactDraft`;
CREATE TABLE `ArtifactDraft` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated artifactDraft id.',
  `creatorID` int(11) NOT NULL COMMENT 'The creator of this artifactDraft.',
  `artifactTypeID` smallint(6) NOT NULL COMMENT 'The artifact type id.',
  `handle` varchar(255) NOT NULL COMMENT 'The handle of the artifact. Used for perma URL',
  `artifactRevisionID` int(11) DEFAULT NULL COMMENT 'The artifact revision from which this artifactDraft is derived from.',
  `draft` mediumblob NOT NULL COMMENT 'The draft of the artifact. stored in formats like JSON / XML.',
  `isCompressed` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 => draft is are compressed. anyThingElse ==> they are not',
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time of this entry.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ArtifactDraft_uk_creator-type-handle` (`creatorID`,`handle`,`artifactTypeID`),
  UNIQUE KEY `ArtifactDraft_uk_creator-revision` (`creatorID`,`artifactRevisionID`),
  CONSTRAINT `ArtifactDraft_fk_creator` FOREIGN KEY (`creatorID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArtifactDraft_fk_type` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArtifactDraft_fk_revision` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for artifactdraft.';
