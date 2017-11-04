CREATE TABLE `MemberAccessTimes` (
  `memberID` int(11) NOT NULL,
  `objectType` enum('group') NOT NULL DEFAULT 'group',
  `objectID` int(11) NOT NULL,
  `accessTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `IdxPerUsrPerObj` (`memberID`,`objectType`,`objectID`),
  KEY `IdxPerUsrObjTyp` (`memberID`,`objectType`),
  CONSTRAINT `MemberAccessTimes_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
);
