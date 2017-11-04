DROP TABLE IF EXISTS `ArtifactAttributers`;
CREATE TABLE `ArtifactAttributers` (
`artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
`roleID` int(11) NOT NULL DEFAULT 3 COMMENT 'The author/contributor role',
`memberID` int(11) DEFAULT NULL COMMENT 'The optional member id.',
`givenName` varchar(63) NOT NULL COMMENT 'The given (first) name of this attributer.',
`middleName` varchar(10) DEFAULT NULL COMMENT 'The middle name of this attributer.',
`surname` varchar(63) DEFAULT NULL COMMENT 'The surname (last name) of this attributer.',
`prefix` varchar(10) DEFAULT NULL COMMENT 'The title of this attributer.',
`suffix` varchar(10) DEFAULT NULL COMMENT 'The suffix of this attributer.',
`email` varchar(255) DEFAULT NULL COMMENT 'The email address of this attributer.',
`url` varchar(2047) DEFAULT NULL COMMENT 'The url of this attributer.',
`institution` varchar(127) DEFAULT NULL COMMENT 'The institution of this attributer.',
PRIMARY KEY (`artifactID`, `roleID`, `givenName`, `middleName`, `surname`, `institution`),
CONSTRAINT `ArtifactAttributers_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
CONSTRAINT `ArtifactAttributers_ibfk_2` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
CONSTRAINT `ArtifactAttributers_ibfk_3` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for attributers.';
