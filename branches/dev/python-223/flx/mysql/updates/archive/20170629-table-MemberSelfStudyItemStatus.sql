USE flx2;

CREATE TABLE `MemberSelfStudyItemStatus` (
  `domainID` int(11) NOT NULL COMMENT 'The domain id',
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `conceptCollectionHandle` varchar(255) NOT NULL DEFAULT '' COMMENT 'The conceptCollectionHandle for the EID.',
  `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The CK-12 member id who owns the collection.',
  `status` enum('completed', 'skipped', 'incomplete') DEFAULT 'incomplete' COMMENT 'The status of this item.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `lastAccess` timestamp NULL DEFAULT 0 COMMENT 'The most recent access time. The value NULL means not yet access.',
  `contextUrl` varchar(1024) DEFAULT NULL COMMENT 'The context url for the domain item.',
  PRIMARY KEY (`domainID`, `memberID`, `conceptCollectionHandle`, `collectionCreatorID`),
  KEY `MemberSelfStudyItemStatus_status` (`status`),
  KEY `MemberSelfStudyItemStatus_score` (`score`),
  KEY `MemberSelfStudyItemStatus_lastAccess` (`lastAccess`),
  CONSTRAINT `MemberSelfStudyItemStatus_domain_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberSelfStudyItemStatus_member_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberStudyTrackItemStatus_collectionCreator_ibfk_2` FOREIGN KEY (`collectionCreatorID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

call update_dbpatch('20170629-table-MemberSelfStudyItemStatus.sql');

