--
-- Table structure for table `CampaignMembers`
--

DROP TABLE IF EXISTS `CampaignMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CampaignMembers` (
`campaignID` varchar(255) NOT NULL COMMENT 'The campaign identifier.',
`memberID` int(11) NOT NULL COMMENT 'The identifier of the member in this campaign.',
PRIMARY KEY (`campaignID`, `memberID`),
CONSTRAINT `CampaignMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members in campaigns.';
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT IGNORE INTO `EventTypes` (`id`, `name`, `description`) VALUES 
(28, 'PASSWORD_RESET_FOR_ACTIVATION', 'An user requested to reset password on account activation'),
(29, 'GROUP_MEMBER_JOINED', 'Event when an user joins a group'),
(30, 'GROUP_MEMBER_ACTIVATED', 'Event when a group member is activated'),
(31, 'GROUP_MEMBER_DECLINED', 'Event when a group member is declined'),
(32, 'INVITE_MEMBER', 'Invite member to use CK-12.');
