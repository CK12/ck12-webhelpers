DROP TABLE IF EXISTS `MemberStudyTrackItemStatus`;
DROP TABLE IF EXISTS `Assignments`;

--
-- Table structure for table `Assignments`
--

DROP TABLE IF EXISTS `Assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assignments` (
  `assignmentID` int(11) NOT NULL COMMENT 'The artifact id of this assignment.',
  `groupID` int(11) DEFAULT NULL COMMENT 'The id of the group getting this assignment.',
  `assignmentType` enum('assignment', 'self-assignment', 'self-study') NOT NULL DEFAULT 'assignment' COMMENT 'The type of this study track. The self-study type is created automatically when the student just randomly practicing without an assignment.',
  `due` timestamp NULL DEFAULT 0 COMMENT 'The study track due time.',
  PRIMARY KEY (`assignmentID`),
  KEY `Assignments_type` (`assignmentType`),
  KEY `Assignments_due` (`due`),
  CONSTRAINT `Assignments_assignment_ibfk_1` FOREIGN KEY (`assignmentID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Assignments_group_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberStudyTrackItemStatus`
--

DROP TABLE IF EXISTS `MemberStudyTrackItemStatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberStudyTrackItemStatus` (
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `assignmentID` int(11) NOT NULL COMMENT 'The artifact id of the assignment for member identified by memberID.',
  `studyTrackItemID` int(11) NOT NULL COMMENT 'The id of the study track item for member identified by memberID.',
  `status` enum('completed', 'skipped', 'incomplete') DEFAULT 'incomplete' COMMENT 'The status of this item.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `lastAccess` timestamp NULL DEFAULT 0 COMMENT 'The most recent access time. The value NULL means not yet access.',
  PRIMARY KEY (`memberID`, `assignmentID`, `studyTrackItemID`),
  KEY `MemberStudyTrackItemStatus_status` (`status`),
  KEY `MemberStudyTrackItemStatus_score` (`score`),
  KEY `MemberStudyTrackItemStatus_lastAccess` (`lastAccess`),
  CONSTRAINT `MemberStudyTrackItemStatus_member_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberStudyTrackItemStatus_assignment_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberStudyTrackItemStatus_item_ibfk_3` FOREIGN KEY (`studyTrackItemID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
