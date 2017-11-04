CREATE TABLE IF NOT EXISTS `Vocabularies` (
`id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
`term` varchar(255) NOT NULL COMMENT 'The term name.',
`definition` mediumtext NOT NULL COMMENT 'The definition for the term.',
`languageID` smallint(6) DEFAULT NULL COMMENT 'The language of this vocabulary.',
`sequence` int(11) NOT NULL COMMENT 'The sequence number for this vocabulary',
PRIMARY KEY (`id`),
CONSTRAINT `Vocabularies_ibfk_1` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The available Vocabularies.';


CREATE TABLE IF NOT EXISTS `ArtifactHasVocabularies` (
`artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
`vocabularyID` int(11) NOT NULL DEFAULT '0' COMMENT 'The vocabulary this artifact has.',
PRIMARY KEY (`artifactID`,`vocabularyID`),
CONSTRAINT `ArtifactHasVocabularies_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
CONSTRAINT `ArtifactHasVocabularies_ibfk_1` FOREIGN KEY (`vocabularyID`) REFERENCES `Vocabularies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The vocabularies each artifact has.';


drop view if exists ArtifactsAndVocabularies;
create view ArtifactsAndVocabularies as select a.id, a.artifactTypeID, a.encodedID, v.id as vocabularyID, v.term, v.definition, v.sequence, l.code as languageCode, l.name as languageName from Artifacts a, Vocabularies v, ArtifactHasVocabularies av, Languages l where a.id = av.artifactID and v.id = av.vocabularyID and l.id = v.languageID;


INSERT INTO `Languages` (`code`, `name`) VALUES ('es', 'Spanish');
