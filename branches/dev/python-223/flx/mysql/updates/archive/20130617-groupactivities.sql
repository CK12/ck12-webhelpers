BEGIN;
ALTER TABLE GroupActivities CHANGE activityType activityType ENUM('create','join','share','leave');
COMMIT;
