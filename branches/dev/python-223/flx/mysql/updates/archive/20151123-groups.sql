BEGIN;
ALTER TABLE Groups CHANGE groupType groupType ENUM('study','class', 'public-forum') NOT NULL DEFAULT 'study';
COMMIT;
