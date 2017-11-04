USE flx2;

BEGIN;

UPDATE Resources SET `uri` = REPLACE(`uri`, 'http://', 'https://') WHERE `uri` LIKE 'http://%.ytimg.com/%';
UPDATE Resources SET `uri` = REPLACE(`uri`, 'http://', 'https://') WHERE `uri` LIKE 'http://interactives.ck12.org/%';
UPDATE EmbeddedObjects SET `thumbnail` = REPLACE(`thumbnail`, 'http://', 'https://') WHERE `thumbnail` LIKE 'http://%ytimg.com%';
UPDATE EmbeddedObjects SET `thumbnail` = REPLACE(`thumbnail`, 'http://', 'https://') WHERE `thumbnail` LIKE 'http://interactives.ck12.org/%';
UPDATE EmbeddedObjects SET `uri` = REPLACE(`uri`, 'http://', 'https://') WHERE `uri` LIKE 'http://%ytimg.com%';
UPDATE EmbeddedObjects SET `uri` = REPLACE(`uri`, 'http://', 'https://') WHERE `uri` LIKE 'http://interactives.ck12.org/%';

update Resources set uri = replace(uri, 'http://simtest.ck12.org', 'https://simtest.ck12.org'), handle = replace(handle, 'http://simtest.ck12.org', 'https://simtest.ck12.org'), name = replace(name, 'http://simtest.ck12.org', 'https://simtest.ck12.org') where resourceTypeID in (2, 4) and isExternal = 1 and uri like 'http://simtest.ck12.org/%';
UPDATE EmbeddedObjects SET `thumbnail` = REPLACE(`thumbnail`, 'http://', 'https://') WHERE `thumbnail` LIKE 'http://simtest.ck12.org/%';
UPDATE EmbeddedObjects SET `uri` = REPLACE(`uri`, 'http://', 'https://') WHERE `uri` LIKE 'http://simtest.ck12.org/%';
UPDATE EmbeddedObjects SET `code` = REPLACE(`code`, 'http://simtest.ck12.org/', 'https://simtest.ck12.org/') WHERE `code` LIKE '%http://simtest.ck12.org/%';

COMMIT;

call update_dbpatch('20170519-update-youtube-images-to-https.sql');
