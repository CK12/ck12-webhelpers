LOCK TABLES `MemberAuthTypes` WRITE;
/*!40000 ALTER TABLE `MemberAuthTypes` DISABLE KEYS */;
INSERT IGNORE INTO `MemberAuthTypes` (`id`, `name`, `description`) VALUES
(7, 'oAuthClient', 'CK-12 OAuth authentication.');
/*!40000 ALTER TABLE `MemberAuthTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OAuthClients`
--

DROP TABLE IF EXISTS `OAuthClients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OAuthClients` (
    `id` varchar(63) NOT NULL COMMENT 'The client app id.',
    `memberID` int(11) NOT NULL COMMENT 'The member id who creates this client app.',
    `name` varchar(255) NOT NULL COMMENT 'The name of this client app.',
    `description` varchar(2047) COMMENT 'Object description',
    `url` varchar(2084) DEFAULT NULL COMMENT 'The url of this client app.',
    `callback` varchar(2084) DEFAULT NULL COMMENT 'The redirect url of this app.',
    `secret` varchar(63) NOT NULL COMMENT 'The client secret code.',
    `trusted` bool DEFAULT 0 COMMENT '1 => trusted; 0 => not yet.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`),
    UNIQUE KEY (`secret`),
    CONSTRAINT `OAuthClients_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `OAuthClients` WRITE;
/*!40000 ALTER TABLE `OAuthClients` DISABLE KEYS */;
INSERT INTO `OAuthClients` (`id`, `memberID`, `name`, `description`, `url`, `callback`, `secret`, `trusted`) VALUES
('kwPHrnz9sEu6LtAuRshpBm66nqzdxB', 1, 'BrainGenie', 'Brain Genie Site', 'http://braingenie.ck12.org/', 'https://romer.ck12.org/auth/verify/member/oauth', 'PyC5XvKRX904irXua9QR6GPTr0sJTZ8GdxDDuuXljHUadaRRDe', True);
/*!40000 ALTER TABLE `OAuthClients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OAuthTokens`
--

DROP TABLE IF EXISTS `OAuthTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OAuthTokens` (
    `token` varchar(63) NOT NULL COMMENT 'The token.',
    `clientID` varchar(63) NOT NULL COMMENT 'The client id of the app.',
    `memberID` int(11) COMMENT 'The member id whose resource the app wants.',
    `timestamp` int(11) NOT NULL COMMENT 'Number of seconds since 1970/01/01 00:00:00.',
    `nonce` varchar(63) NOT NULL COMMENT 'The nonce for uniquiness.',
    `callback` varchar(2084) DEFAULT NULL COMMENT 'The redirect url of this app.',
    `secret` varchar(63) COMMENT 'The token secret code.',
    `type` ENUM('request', 'access') NOT NULL DEFAULT 'request',
    PRIMARY KEY (`token`),
    KEY (`timestamp`),
    KEY (`nonce`),
    CONSTRAINT `OAuthTokens_ibfk_1` FOREIGN KEY (`clientID`) REFERENCES `OAuthClients` (`id`),
    CONSTRAINT `OAuthTokens_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `OAuthClients` WRITE;
/*!40000 ALTER TABLE `OAuthClients` DISABLE KEYS */;
INSERT INTO `OAuthClients` (`id`, `memberID`, `name`, `description`, `url`, `callback`, `secret`, `trusted`) VALUES
('kwPHrnz9sEu6LtAuRshpBm66nqzdxB', 1, 'BrainGenie', 'Brain Genie Site', 'http://braingenie.ck12.org/', 'https://www.ck12.org/auth/verify/member/oauth', 'PyC5XvKRX904irXua9QR6GPTr0sJTZ8GdxDDuuXljHUadaRRDe', True);
/*!40000 ALTER TABLE `OAuthClients` ENABLE KEYS */;
UNLOCK TABLES;
