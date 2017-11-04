BEGIN;
ALTER TABLE Groups change `type` groupScope enum('open','closed','protected') NOT NULL DEFAULT 'closed';
ALTER TABLE Groups ADD COLUMN groupType enum('study','class') NOT NULL DEFAULT 'study';
COMMIT;
