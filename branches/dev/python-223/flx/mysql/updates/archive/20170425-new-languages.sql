USE flx2;

BEGIN;

INSERT IGNORE INTO `Languages` (`code`, `name`) VALUES ('pt','Portuguese');
INSERT IGNORE INTO `Languages` (`code`, `name`) VALUES ('ko','Korean');
INSERT IGNORE INTO `Languages` (`code`, `name`) VALUES ('fr','French');
INSERT IGNORE INTO `Languages` (`code`, `name`) VALUES ('de','German');
INSERT IGNORE INTO `Languages` (`code`, `name`) VALUES ('hi','Hindi');

COMMIT;

call update_dbpatch('20170425-new-languages');
