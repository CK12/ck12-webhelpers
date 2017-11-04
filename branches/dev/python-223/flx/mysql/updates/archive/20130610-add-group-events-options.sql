BEGIN;
INSERT INTO EventTypes (name, description) VALUES ('GROUP_CREATE', 'A group was created');
ALTER TABLE Events CHANGE objectType objectType ENUM('artifact','artifactRevision','resource','resourceRevision','notification','member', 'group');
COMMIT;
