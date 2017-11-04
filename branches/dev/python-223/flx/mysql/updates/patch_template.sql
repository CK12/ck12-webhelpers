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



/*
 * Update the following with the right file name of the patch
 */
call update_dbpatch('patch_file_name');
