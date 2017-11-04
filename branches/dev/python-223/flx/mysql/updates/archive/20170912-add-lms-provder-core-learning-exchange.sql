USE flx2;

BEGIN;

INSERT INTO `LMSProviders` (`name`,`description`) values ('CoreLearningExchange', 'Core Learning Exchange');

COMMIT;

call update_dbpatch('20170912-add-lms-provder-core-learning-exchange.sql');
