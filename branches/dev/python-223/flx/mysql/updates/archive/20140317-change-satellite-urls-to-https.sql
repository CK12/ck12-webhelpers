BEGIN;
UPDATE `MathImage` SET `resourceUrl` = REPLACE(`resourceUrl`, 'http://', 'https://') WHERE `resourceUrl` LIKE 'http://%' AND `resourceUrl` NOT LIKE '%:8080%';
UPDATE `Resources` SET `satelliteUrl` = REPLACE(`satelliteUrl`, 'http://', 'https://') WHERE `satelliteUrl` LIKE 'http://%' AND `satelliteUrl` NOT LIKE '%:8080%';
COMMIT;
