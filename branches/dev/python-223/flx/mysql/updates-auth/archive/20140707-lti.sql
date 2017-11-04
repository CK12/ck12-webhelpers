--
-- Already added during the Clever integration.
--
-- INSERT INTO `MemberAuthTypes` (`id`, `name`, `description`) VALUES
--     (11, 'canvas', 'Canvas Authentication.'),
--     (12, 'canvas-ck12', 'Canvas CK-12 Authentication.'),
--     (13, 'canvas-ccsd', 'Canvas CCSD Authentication.'),
--     (14, 'schoology', 'Schoology Authentication.');

--
-- Redefine table structure for table `Applications`
--

DROP TABLE IF EXISTS `MemberFromApplications`;
DROP TABLE IF EXISTS `Applications`;
CREATE TABLE `Applications` (
    `providerID` int(11) NOT NULL COMMENT 'The provider id.',
    `siteID` int(11) NOT NULL COMMENT 'The site id.',
    `appName` varchar(63) NOT NULL COMMENT 'The application name.',
    `key` varchar(4096) CHARSET ascii NOT NULL COMMENT 'The application key.',
    `secret` varchar(4096) CHARSET ascii NOT NULL COMMENT 'The application secret.',
    `description` varchar(511) DEFAULT NULL COMMENT 'The description of this application.',
    PRIMARY KEY (`providerID`, `siteID`, `appName`),
    UNIQUE KEY (`key`(767)),
    UNIQUE KEY (`secret`(767))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `Applications` (`providerID`, `siteID`, `appName`, `key`, `secret`, `description`) VALUES
    (2, 11, 'ltiApp', 'h78EyM8zuDZlMtEkHR3GKkU7AvSjObVCfkSJoRdzZDYmOtkzIR', 'aHu5VtPghgHfLloAGvKVisn9OBbpHbZxT70pLi7mPms3s4jEY6', 'App for Canvas'),
    (2, 12, 'ltiApp', 'TP8uTRS0A2yNZWokecqcGlbwJICYcopfFct98VnLr0d9ywzDil', 'xyCmoOLB8cCJBIvJ8TsQ3TC59MTAINVSdfcmSt2ko8WMjZWDJE', 'App for CK-12 Canvas'),
    (2, 13, 'ltiApp', 'NHOos72JCgafwbRbooOw3AgPLw9xzD0GbrXdBFDTpk3MEImEZl', '6OHfxTnfGS2kd33XlkyOmzXsWTGAAJA3QO6zZLaYUPykhuCUqq', 'App for CCSD Canvas'),
    (3, 14, 'ltiApp', 'j7L3c6RzMWR6InbkNBqYTVYhVAPWkZ69HhBKcMrEAZlsmZ1Gbc', '7J89rR7M7G7sA5mfshT9MMkWjwoPbPb2fYPrkFwezlf2qkOwgF', 'App for Schoology');
