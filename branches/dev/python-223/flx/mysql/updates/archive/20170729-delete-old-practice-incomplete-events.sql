USE flx2;

BEGIN;

    DELETE FROM Events WHERE eventTypeID = (SELECT id FROM EventTypes WHERE name = 'CONCEPT_PRACTICE_INCOMPLETE_WEB') AND created < '2017-07-30 00:00:00';

COMMIT;

call update_dbpatch('20170729-delete-old-practice-incomplete-events.sql');
