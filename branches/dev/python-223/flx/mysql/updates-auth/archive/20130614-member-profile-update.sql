BEGIN;
ALTER TABLE Members ADD COLUMN `isProfileUpdated` tinyint(1) COMMENT 'if user has updated profile' NOT NULL DEFAULT 0;
COMMIT;
