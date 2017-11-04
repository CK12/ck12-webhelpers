BEGIN;
SELECT `id` INTO @parentID FROM `BrowseTerms` WHERE termTypeID = 4 and encodedID='ELA.SPL';
UPDATE `BrowseTerms` SET parentID=@parentID WHERE termTypeID = 4 and encodedID = 'ELA.SPL.710';
UPDATE `BrowseTerms` SET parentID=@parentID WHERE termTypeID = 4 and encodedID = 'ELA.SPL.740';
UPDATE `BrowseTerms` SET parentID=@parentID WHERE termTypeID = 4 and encodedID = 'ELA.SPL.750';
UPDATE `BrowseTerms` SET parentID=@parentID WHERE termTypeID = 4 and encodedID = 'ELA.SPL.780';

UPDATE `DomainNeighbors` SET requiredDomainID = (SELECT id FROM BrowseTerms WHERE termTypeID = 4 AND encodedID = 'ELA.SPL.614') WHERE domainID = (SELECT id FROM BrowseTerms WHERE termTypeID = 4 and encodedID = 'ELA.SPL.710');

SELECT `id` INTO @parentID FROM `BrowseTerms` WHERE termTypeID = 4 AND encodedID = 'ELA.SPL.750';
UPDATE `BrowseTerms` SET parentID=@parentID WHERE termTypeID = 4 and encodedID = 'ELA.SPL.770';

SELECT `id` INTO @id FROM `BrowseTerms` WHERE termTypeID = 4 AND encodedID = 'ELA.SPL.700';
SELECT @id;
DELETE FROM `ArtifactHasBrowseTerms` WHERE browseTermID = @id;
DELETE FROM `RelatedArtifacts` WHERE domainID = @id;
DELETE FROM `DomainNeighbors` WHERE `domainID` = @id;
DELETE FROM `BrowseTerms` WHERE `id` = @id;

SELECT `id` INTO @parentID FROM `BrowseTerms` WHERE termTypeID = 4 AND encodedID = 'ELA.SPL.400';
UPDATE `BrowseTerms` SET parentID=@parentID WHERE termTypeID = 4 and encodedID = 'ELA.SPL.431';

UPDATE `BrowseTerms` SET name = REPLACE(name, '< ', '<') WHERE encodedID like 'ELA.SPL.%';
UPDATE `BrowseTerms` SET name = REPLACE(name, ' >', '>') WHERE encodedID like 'ELA.SPL.%';

COMMIT;
