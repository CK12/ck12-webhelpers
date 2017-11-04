--
-- Table structure for table `ForumMetadata`
--

DROP TABLE IF EXISTS `ForumMetadata`;
CREATE TABLE `ForumMetadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupID` int(11) NOT NULL COMMENT 'The group id.',
  `taggedWithRoleID` int(11) DEFAULT NULL COMMENT 'Member roles for which forum is tagged with',
  `tagLine` varchar(1024) DEFAULT NULL COMMENT 'Tagline for forum.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time.',
   CONSTRAINT `ForumMetadata_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   CONSTRAINT `ForumMetadata_ibfk_2` FOREIGN KEY (`taggedWithRoleID`) REFERENCES `MemberRoles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   PRIMARY KEY (`id`),
   UNIQUE KEY `ForumMetadata_uk_groupID-roleID` (`groupID`,`taggedWithRoleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Forum related additional meta.';
