CREATE TABLE IF NOT EXISTS `StudyTrackItemContexts` (
  `studyTrackID` int(11) NOT NULL COMMENT 'The study track id.',
  `studyTrackItemID` int(11) NOT NULL COMMENT 'The id of the study track item.',
  `contextUrl` varchar(1024) NOT NULL COMMENT 'The context url for study track item.',
  PRIMARY KEY (`studyTrackID`, `studyTrackItemID`),
  CONSTRAINT `StudyTrackItemContexts_ibfk_1` FOREIGN KEY (`studyTrackID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `StudyTrackItemContexts_ibfk_2` FOREIGN KEY (`studyTrackItemID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
