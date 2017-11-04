BEGIN;
insert INTO ResourceTypes (name, description, versionable, streamable) VALUES('group system image',  'The system provided image for groups', 0, 0);
insert INTO ResourceTypes (name, description, versionable, streamable) VALUES('group user image',  'The user uploaded image for groups', 0, 0);
COMMIT;
