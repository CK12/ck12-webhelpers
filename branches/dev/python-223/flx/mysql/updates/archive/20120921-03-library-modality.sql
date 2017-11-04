/*!40000 ALTER TABLE `ArtifactTypes` DISABLE KEYS */;
ALTER TABLE `MemberLibraryObjects` ADD `domainID` int(11) DEFAULT NULL COMMENT 'The domainID of the object in member library';
ALTER TABLE `MemberLibraryObjects` CHANGE `objectType` `objectType` enum('artifactRevision', 'resourceRevision', 'domain') NOT NULL COMMENT 'The type of the object';
ALTER TABLE `MemberLibraryObjects` DROP KEY `objectID`;
ALTER TABLE `MemberLibraryObjects` DROP KEY `objectType`;
ALTER TABLE `MemberLibraryObjects` ADD UNIQUE KEY `objectID` (`objectID`, `objectType`, `memberID`, `domainID`);
ALTER TABLE `MemberLibraryObjects` ADD UNIQUE KEY `objectType` (`objectType`, `memberID`, `parentID`, `domainID`);
ALTER TABLE `MemberLibraryObjects` ADD CONSTRAINT `MemberLibraryObjects_ibfk_2` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
/*!40000 ALTER TABLE `ArtifactTypes` ENABLE KEYS */;
