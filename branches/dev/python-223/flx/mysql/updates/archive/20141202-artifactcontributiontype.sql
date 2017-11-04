DROP TABLE IF EXISTS `ArtifactContributionType`;
CREATE TABLE `ArtifactContributionType`(
`artifactID` INT NOT NULL COMMENT 'The artifact id.' ,
`typeName` ENUM('original', 'derived', 'modified') COMMENT 'contributionType' ,
CONSTRAINT `ArtifactContributionType_ibfk_1` FOREIGN KEY (`artifactID` ) REFERENCES `Artifacts` (`id` ) ON DELETE NO ACTION ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Artifacts Contribution Type.';