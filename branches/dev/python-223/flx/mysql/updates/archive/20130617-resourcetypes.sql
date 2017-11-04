BEGIN;
insert IGNORE INTO ResourceTypes (name, description, versionable, streamable) VALUES('quiz answer key',  'Answer sheet key for Quiz', 0, 0);
insert IGNORE INTO ResourceTypes (name, description, versionable, streamable) VALUES('quiz answer demo',  'Answer demo for Quiz', 0, 0);
COMMIT;
