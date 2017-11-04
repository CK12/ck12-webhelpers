BEGIN;
UPDATE DomainUrls SET url = NULL WHERE url = 'None';
COMMIT;
