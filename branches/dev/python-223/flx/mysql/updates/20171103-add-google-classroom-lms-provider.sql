USE flx2;

BEGIN;
  INSERT INTO LMSProviders (`name`,`description`) values ("GoogleClassroom", "Google Classroom");
  INSERT INTO LMSProviderApps (`providerID`, `appID`, `appName`, `policy`) values (LAST_INSERT_ID(), 'GOOGLE_CLASSROOM', 'googleClassroom', '{}');
COMMIT;

call update_dbpatch("20171103-add-google-classroom-lms-provider.sql");
