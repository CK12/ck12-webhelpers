DROP VIEW IF EXISTS ConceptNodeSearchables;
CREATE VIEW ConceptNodeSearchables AS SELECT a.id, a.encodedID, a.name, a.handle, a.parentID, a.subjectID, a.branchID, a.description, a.previewImageUrl, a.status, a.created, a.updated, b.id as keywordID, b.name as keyword 
FROM ConceptNodes AS a LEFT OUTER JOIN ConceptNodeHasKeywords AS c ON a.id = c.conceptNodeID LEFT OUTER JOIN ConceptKeywords AS b ON c.keywordID = b.id;
