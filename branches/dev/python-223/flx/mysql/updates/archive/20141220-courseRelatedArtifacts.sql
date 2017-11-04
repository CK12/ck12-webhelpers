ALTER TABLE `RelatedArtifacts` 
DROP PRIMARY KEY,
ADD COLUMN `courseHandle` varchar(50) NOT NULL,
ADD PRIMARY KEY(`domainID`,`sequence`,`artifactID`, `courseHandle`);/*,
ADD CONSTRAINT `RelatedArtifacts_ibfk_3` FOREIGN KEY (`courseHandle`) REFERENCES `Courses` (`handle`) ON DELETE NO ACTION ON UPDATE NO ACTION; */
