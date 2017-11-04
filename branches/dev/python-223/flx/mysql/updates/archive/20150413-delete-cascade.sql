SELECT 'ArtifactRevisionHasResources' as 'Processing table';
ALTER TABLE `ArtifactRevisionHasResources` DROP FOREIGN KEY `ArtifactRevisionHasResources_ibfk_1`;
ALTER TABLE `ArtifactRevisionHasResources` ADD CONSTRAINT `ArtifactRevisionHasResources_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `ArtifactRevisionHasResources` DROP FOREIGN KEY `ArtifactRevisionHasResources_ibfk_2`;
ALTER TABLE `ArtifactRevisionHasResources` ADD CONSTRAINT `ArtifactRevisionHasResources_ibfk_2` FOREIGN KEY (`resourceRevisionID`) REFERENCES `ResourceRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactRevisionRelations' as 'Processing table';
ALTER TABLE `ArtifactRevisionRelations` DROP FOREIGN KEY `ArtifactRevisionRelations_ibfk_1`;
ALTER TABLE `ArtifactRevisionRelations` ADD CONSTRAINT `ArtifactRevisionRelations_ibfk_1` FOREIGN KEY (`hasArtifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `ArtifactRevisionRelations` DROP FOREIGN KEY `ArtifactRevisionRelations_ibfk_2`;
ALTER TABLE `ArtifactRevisionRelations` ADD CONSTRAINT `ArtifactRevisionRelations_ibfk_2` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactHasBrowseTerms' as 'Processing table';
ALTER TABLE `ArtifactHasBrowseTerms` DROP FOREIGN KEY `ArtifactHasBrowseTerms_ibfk_2`;
ALTER TABLE `ArtifactHasBrowseTerms` ADD CONSTRAINT `ArtifactHasBrowseTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactHasTagTerms' as 'Processing table';
ALTER TABLE `ArtifactHasTagTerms` DROP FOREIGN KEY `ArtifactHasTagTerms_ibfk_2`;
ALTER TABLE `ArtifactHasTagTerms` ADD CONSTRAINT `ArtifactHasTagTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactHasSearchTerms' as 'Processing table';
ALTER TABLE `ArtifactHasSearchTerms` DROP FOREIGN KEY `ArtifactHasSearchTerms_ibfk_2`;
ALTER TABLE `ArtifactHasSearchTerms` ADD CONSTRAINT `ArtifactHasSearchTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactHasVocabularies' as 'Processing table';
ALTER TABLE `ArtifactHasVocabularies` DROP FOREIGN KEY `ArtifactHasVocabularies_ibfk_2`;
ALTER TABLE `ArtifactHasVocabularies` ADD CONSTRAINT `ArtifactHasVocabularies_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactHandles' as 'Processing table';
ALTER TABLE `ArtifactHandles` DROP FOREIGN KEY `ArtifactHandles_ibfk_1`;
ALTER TABLE `ArtifactHandles` ADD CONSTRAINT `ArtifactHandles_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;


SELECT 'ArtifactRevisionHasStandards' as 'Processing table';
ALTER TABLE `ArtifactRevisionHasStandards` DROP FOREIGN KEY `ArtifactRevisionHasStandards_ibfk_1`;
ALTER TABLE `ArtifactRevisionHasStandards` ADD CONSTRAINT `ArtifactRevisionHasStandards_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
