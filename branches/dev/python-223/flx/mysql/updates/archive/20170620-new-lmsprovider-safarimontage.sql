USE flx2;

BEGIN;

INSERT INTO `LMSProviders` (`name`,`description`) values ('Safarimontage', 'Safarimontage LOR');

COMMIT;

call update_dbpatch('20170620-new-lmsprovider-safarimontage');
