CREATE TABLE `PseudoDomainHandleSequencer` (
`handle` varchar(255) DEFAULT NULL COMMENT 'The term handle.',
`sequence` int(11) DEFAULT NULL COMMENT 'Current sequence generator.',
PRIMARY KEY (`handle`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Used to generate a unique handle for pesudo-domains.';
