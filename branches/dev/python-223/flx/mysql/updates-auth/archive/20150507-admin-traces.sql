--
-- Table structure for table `AdminTraces`
--

DROP TABLE IF EXISTS `AdminTraces`;

CREATE TABLE `AdminTraces` (
    `memberID` int(11) NOT NULL COMMENT 'The id of the member becoming admin.',
    `adminID` int(11) NOT NULL COMMENT 'The id of the assigning admin.',
    `state` enum('on', 'off') DEFAULT NULL COMMENT 'The admin state of this member',
    `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The modified time.',
    INDEX `AdminTraces_updateTime` (`updateTime`),
    CONSTRAINT `AdminTraces_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `AdminTraces_ibfk_2` FOREIGN KEY (`adminID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Traces the history of users becoming admin.';
