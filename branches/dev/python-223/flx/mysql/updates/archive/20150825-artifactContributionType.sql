ALTER TABLE `ArtifactContributionType` DROP FOREIGN KEY `ArtifactContributionType_ibfk_1`;
ALTER TABLE `ArtifactContributionType` ADD CONSTRAINT `ArtifactContributionType_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
