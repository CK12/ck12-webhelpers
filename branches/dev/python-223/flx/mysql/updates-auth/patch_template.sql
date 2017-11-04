USE auth;

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
 * Update the following with the right patch file name
 */
call update_dbpatch('patch_file_name');
