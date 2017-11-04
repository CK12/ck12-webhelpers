USE flx2;

BEGIN;

/*
 * Statements in this section runs in a transaction.
 * Put data changes here
 */


COMMIT;

/*
 * Statements below will run in AUTOCOMMIT mode. 
 * Put structural changes in this section, e.g. any ALTER TABLE, CREATE TABLE, CREATE INDEX.
 */
ALTER TABLE `Members`
    ADD COLUMN `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this entry.' AFTER `defaultLogin`,
    ADD COLUMN `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.' AFTER `creationTime`;


/*
 * Update the following with the right patch file name
 */
call update_dbpatch('2.6.9');
