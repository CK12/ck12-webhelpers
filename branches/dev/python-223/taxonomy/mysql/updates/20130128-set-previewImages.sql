DROP TRIGGER IF EXISTS taxonomy.T_BrowseTerms_update;

update flx2.DomainUrls  d INNER JOIN flx2.BrowseTerms b on d.domainID = b.id INNER JOIN ConceptNodes c on b.encodedID = c.encodedID set c.previewImageUrl = d.url;

update flx2.DomainUrls d INNER JOIN flx2.BrowseTerms b on d.domainID = b.id INNER JOIN Subjects s on b.encodedID = s.shortname set s.previewImageUrl = d.url;

update flx2.DomainUrls d INNER JOIN flx2.BrowseTerms b on d.domainID = b.id INNER JOIN Branches r on b.encodedID like CONCAT('%.', r.shortname) set r.previewImageUrl = d.url;

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

