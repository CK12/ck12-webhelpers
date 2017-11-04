ALTER TABLE `Artifacts` DROP FOREIGN KEY `Artifacts_ibfk_3`;
ALTER TABLE `Artifacts` ADD CONSTRAINT `Artifacts_ibfk_3` FOREIGN KEY (`ancestorID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
