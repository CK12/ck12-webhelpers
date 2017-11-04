ALTER TABLE `Vocabularies`
      DROP COLUMN `sequence`;

ALTER TABLE `ArtifactHasVocabularies`
      ADD `sequence` int(11) NOT NULL COMMENT 'The sequence number for this vocabulary';

drop view if exists ArtifactsAndVocabularies;
create view ArtifactsAndVocabularies as select a.id, a.artifactTypeID, a.encodedID, v.id as vocabularyID, v.term, v.definition, av.sequence, l.code as languageCode, l.name as languageName from Artifacts a, Vocabularies v, ArtifactHasVocabularies av, Languages l where a.id = av.artifactID and v.id = av.vocabularyID and l.id = v.languageID;
