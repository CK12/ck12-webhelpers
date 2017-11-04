BEGIN;

    SELECT `id` INTO @idtodel FROM `BrowseTerms` WHERE `termTypeID` = 4 AND `encodedID` = 'ELA.SPL.511.1';
    SELECT `id` INTO @idnext FROM `BrowseTerms` WHERE `termTypeID` = 4 AND `encodedID` = 'ELA.SPL.512';
    SELECT `id` INTO @idprev FROM `BrowseTerms` WHERE `termTypeID` = 4 AND `encodedID` = 'ELA.SPL.511';

    -- Delete relations
    DELETE FROM `RelatedArtifacts` WHERE `domainID`=@idtodel;
    DELETE FROM `ArtifactHasBrowseTerms` WHERE `browseTermID`=@idtodel;
    UPDATE `DomainNeighbors` SET `requiredDomainID` = @idprev WHERE `domainID` = @idnext;
    DELETE FROM `DomainNeighbors` WHERE `domainID` = @idtodel;

    -- Remove Actual domain
    DELETE FROM `BrowseTerms` WHERE `id` = @idtodel;

COMMIT;
