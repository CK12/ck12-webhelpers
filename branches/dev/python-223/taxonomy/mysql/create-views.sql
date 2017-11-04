drop view if exists ConceptNodesAndKeywords;
create view ConceptNodesAndKeywords as select a.id, a.encodedID, a.name, a.handle, a.parentID, a.subjectID, a.branchID, a.description, a.previewImageUrl, a.status, a.created, a.updated, b.id as keywordID, b.name as keyword from ConceptNodes a, ConceptKeywords b, ConceptNodeHasKeywords c WHERE a.id = c.conceptNodeID and b.id = c.keywordID;

drop view if exists ConceptNodeAdjacents;
create view ConceptNodeAdjacents as select id, encodedID, name, handle, subjectID, branchID, parentID, previewImageUrl, RPAD(REPLACE(encodedID, '.', ''), 50, '0') as orderedEncodedID from ConceptNodes;

drop view if exists ConceptNodeDependees;
create view ConceptNodeDependees as select id, encodedID, name, handle, subjectID, branchID, previewImageUrl, requiredConceptNodeID from ConceptNodes LEFT JOIN ConceptNodeNeighbors ON  id = conceptNodeID;

drop view if exists EncodedIDNeighbors;
create view EncodedIDNeighbors as select c1.id conceptNodeID, c1.encodedID, c2.id as requiredConceptNodeID, c2.encodedID as requiredEncodedID FROM ConceptNodes c1, ConceptNodes c2, ConceptNodeNeighbors cn WHERE cn.conceptNodeID=c1.id AND cn.requiredConceptNodeID=c2.id;

DROP VIEW IF EXISTS ConceptNodeSearchables;
CREATE VIEW ConceptNodeSearchables AS SELECT a.id, a.encodedID, a.name, a.handle, a.parentID, a.subjectID, a.branchID, a.description, a.previewImageUrl, a.status, a.created, a.updated, b.id as keywordID, b.name as keyword 
FROM ConceptNodes AS a LEFT OUTER JOIN ConceptNodeHasKeywords AS c ON a.id = c.conceptNodeID LEFT OUTER JOIN ConceptKeywords AS b ON c.keywordID = b.id;
