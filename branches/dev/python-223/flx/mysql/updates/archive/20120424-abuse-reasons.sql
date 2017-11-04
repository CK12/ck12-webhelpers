DROP TABLE IF EXISTS `AbuseReasons`;
CREATE TABLE `AbuseReasons` (
    `id` smallint(6) AUTO_INCREMENT NOT NULL,
    `name` varchar(255) NOT NULL COMMENT 'The abuse reason type name',
    `description` varchar(2047) COMMENT 'The abuse reason type description',
    PRIMARY KEY(`id`),
    UNIQUE KEY(`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='AbuseReasons';

INSERT INTO `AbuseReasons` (`id`, `name`, `description`) VALUES
(1, 'Copyrighted', 'The content or image is copyrighted'),
(2, 'Inappropriate', 'The content or image is inappropriate'),
(3, 'Malicious', 'It has malicious content'),
(4, 'Disable', 'No reason was specified');

ALTER TABLE AbuseReports ADD reasonID smallint(6);
ALTER TABLE AbuseReports ADD FOREIGN KEY AbuseReports_ibfk_4 (reasonID) REFERENCES AbuseReasons(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
