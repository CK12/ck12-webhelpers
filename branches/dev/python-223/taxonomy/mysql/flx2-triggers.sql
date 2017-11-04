DROP TRIGGER IF EXISTS taxonomy.T_BrowseTerms_create;
DELIMITER | 
CREATE TRIGGER taxonomy.T_BrowseTerms_create AFTER INSERT ON taxonomy.ConceptNodes
FOR EACH ROW BEGIN
    IF NEW.parentID IS NOT NULL THEN
        INSERT INTO flx2.BrowseTerms (name, handle, encodedID, termTypeID, parentID, description)
            SELECT NEW.name, NEW.handle, NEW.encodedID, 4, b.id, NEW.description
            FROM taxonomy.ConceptNodes c, flx2.BrowseTerms b
            WHERE c.id = NEW.parentID AND c.encodedID = b.encodedID
            ON DUPLICATE KEY UPDATE name=VALUES(name), handle=VALUES(handle), parentID=VALUES(parentID), description=VALUES(description);
    ELSE
        SELECT s.name, s.shortname, s.description INTO @parentName, @parentEID, @parentDesc FROM taxonomy.Subjects s, taxonomy.ConceptNodes c WHERE s.id=c.subjectID AND c.encodedID=NEW.encodedID;
        INSERT IGNORE INTO flx2.BrowseTerms (name, handle, encodedID, termTypeID, parentID, description) VALUES (@parentName, REPLACE(@parentName, ' ', '-'), @parentEID, 4, null, @parentDesc);
        SELECT id INTO @parentID FROM flx2.BrowseTerms WHERE encodedID=@parentEID;
        SELECT b.name, b.shortname, b.description INTO @parentName, @parentEID2, @parentDesc FROM taxonomy.Branches b, taxonomy.ConceptNodes c WHERE b.id=c.branchID AND c.encodedID=NEW.encodedID;
        INSERT IGNORE INTO flx2.BrowseTerms (name, handle, encodedID, termTypeID, parentID, description) VALUES (@parentName, REPLACE(@parentName, ' ', '-'), CONCAT(@parentEID, '.', @parentEID2), 4, @parentID, @parentDesc);
        SELECT b.id INTO @parentID FROM flx2.BrowseTerms b WHERE b.encodedID=SUBSTRING_INDEX(NEW.encodedID, '.', 2);
        INSERT INTO flx2.BrowseTerms (name, handle, encodedID, termTypeID, parentID, description) VALUES (NEW.name, NEW.handle, NEW.encodedID, 4, @parentID, NEW.description)
            ON DUPLICATE KEY UPDATE name=VALUES(name), handle=VALUES(handle), parentID=VALUES(parentID), description=VALUES(description);
    END IF;

    DELETE FROM flx2.DomainUrls WHERE domainID = (SELECT id FROM flx2.BrowseTerms where encodedID=NEW.encodedID);
    IF NEW.previewImageUrl IS NOT NULL THEN
        INSERT INTO flx2.DomainUrls (domainID, url) SELECT id, NEW.previewImageUrl FROM flx2.BrowseTerms where encodedID=NEW.encodedID;
    END IF;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS taxonomy.T_BrowseTerms_update;
DELIMITER |
CREATE TRIGGER taxonomy.T_BrowseTerms_update AFTER UPDATE ON taxonomy.ConceptNodes
FOR EACH ROW BEGIN
    IF NEW.parentID IS NOT NULL THEN
        SELECT b.id INTO @parentID FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c WHERE c.id = NEW.parentID AND c.encodedID = b.encodedID;
        UPDATE flx2.BrowseTerms SET name=NEW.name, handle=NEW.handle, encodedID=NEW.encodedID, parentID=@parentID, description=NEW.description
        WHERE encodedID=OLD.encodedID;
    ELSE
        SELECT b.id INTO @parentID FROM flx2.BrowseTerms b WHERE b.encodedID=SUBSTRING_INDEX(NEW.encodedID, '.', 2);
        UPDATE flx2.BrowseTerms SET name=NEW.name, handle=NEW.handle, encodedID=NEW.encodedID, parentID=@parentID, description=NEW.description
        WHERE encodedID=OLD.encodedID;
    END IF;

    DELETE FROM flx2.DomainUrls WHERE domainID = (SELECT id FROM flx2.BrowseTerms where encodedID=NEW.encodedID);
    IF NEW.previewImageUrl IS NOT NULL THEN
        INSERT INTO flx2.DomainUrls (domainID, url) SELECT id, NEW.previewImageUrl FROM flx2.BrowseTerms where encodedID=NEW.encodedID;
    END IF;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS taxonomy.T_BrowseTerms_delete;
DELIMITER |
CREATE TRIGGER taxonomy.T_BrowseTerms_delete AFTER DELETE ON taxonomy.ConceptNodes
FOR EACH ROW BEGIN
    DELETE FROM flx2.ArtifactHasBrowseTerms WHERE browseTermID = (SELECT id FROM flx2.BrowseTerms WHERE encodedID=OLD.encodedID);
    DELETE FROM flx2.DomainHasStandards WHERE domainID = (SELECT id FROM flx2.BrowseTerms WHERE encodedID=OLD.encodedID);
    DELETE FROM flx2.BrowseTerms WHERE encodedID=OLD.encodedID;

    DELETE FROM flx2.DomainUrls WHERE domainID = (SELECT id FROM flx2.BrowseTerms where encodedID=OLD.encodedID);
END
|

DELIMITER ;
 
DROP TRIGGER IF EXISTS taxonomy.T_DomainNeighbors_create;
DELIMITER |
CREATE TRIGGER taxonomy.T_DomainNeighbors_create AFTER INSERT ON taxonomy.ConceptNodeNeighbors
FOR EACH ROW BEGIN
    SELECT b.id INTO @reqID FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c WHERE c.id=NEW.requiredConceptNodeID AND b.encodedID=c.encodedID;
    INSERT IGNORE INTO flx2.DomainNeighbors (domainID, requiredDomainID)
        SELECT b.id, @reqID FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c 
        WHERE c.id=NEW.conceptNodeID AND b.encodedID=c.encodedID;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS taxonomy.T_DomainNeighbors_update;
DELIMITER |
CREATE TRIGGER taxonomy.T_DomainNeighbors_update AFTER UPDATE ON taxonomy.ConceptNodeNeighbors
FOR EACH ROW BEGIN
    SELECT b.id INTO @reqID FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c WHERE c.id=OLD.requiredConceptNodeID AND b.encodedID=c.encodedID;
    DELETE FROM flx2.DomainNeighbors 
    WHERE domainID=(SELECT b.id FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c WHERE c.id=OLD.conceptNodeID AND b.encodedID=c.encodedID)
        AND requiredDomainID=@reqID;
    SELECT b.id INTO @reqID FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c WHERE c.id=NEW.requiredConceptNodeID AND b.encodedID=c.encodedID;
    INSERT IGNORE INTO flx2.DomainNeighbors (domainID, requiredDomainID)
        SELECT b.id, @reqID FROM flx2.BrowseTerms b, taxonomy.ConceptNodes c 
        WHERE c.id=NEW.conceptNodeID AND b.encodedID=c.encodedID;
END
|

DELIMITER ;
