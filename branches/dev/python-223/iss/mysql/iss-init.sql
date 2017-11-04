RENAME `Members` TO `Members_flx2`;

INSERT INTO `Members` (`id`, `defaultLogin`, `login`, `email`, `givenName`, `surname`, `timezone`, `stateID`) VALUES
(1, '', 'admin', 'admin@ck12.org', 'CK12', 'Administrator', 'US/Pacific', 2),
(2, '', 'guest', 'guest@ck12.org', 'Guest', '', 'US/Pacific', 2),
(3, '', 'ck12editor', 'editor@ck12.org', 'CK12', 'Editor', 'US/Pacific', 2),
(4, '', 'ck12eflex', 'eflex@ck12.org', 'CK12', 'eFlex', 'US/Pacific', 2);
