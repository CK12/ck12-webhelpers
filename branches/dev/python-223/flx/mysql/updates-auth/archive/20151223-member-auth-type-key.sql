--
-- Table structure for table `MemberAuthTypeKey`
--

DROP TABLE IF EXISTS `MemberAuthTypeKey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberAuthTypeKey` (
    `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'auto incerementing Primary key.',
    `memberAuthTypeID` smallint(6) NOT NULL COMMENT 'MemberAuthTypes.id.',
    `publicKey` varbinary(2048) NOT NULL COMMENT 'The public key for this auth type.',
	`privateKey` varbinary(2048) COMMENT 'The private key if any for this auth type.',
	`passPhrase` varbinary(256) COMMENT 'The pass phrase (if any) used for the key generation.',
	`created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
	`updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time of this entry.',
    PRIMARY KEY (`id`),
    CONSTRAINT `MemberAuthTypeKey_fk_authType` FOREIGN KEY (`memberAuthTypeID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `MemberAuthTypeKey_uk_authType` (`memberAuthTypeID`),
	INDEX `MemberAuthTypeKey_publicKey` (`publicKey`),
	INDEX `MemberAuthTypeKey_privateKey` (`privateKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;