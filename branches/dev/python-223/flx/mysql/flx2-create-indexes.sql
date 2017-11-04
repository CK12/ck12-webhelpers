DROP INDEX Idx_MemberLibraryObjects_1 on MemberLibraryObjects;
CREATE INDEX Idx_MemberLibraryObjects_1 on MemberLibraryObjects (objectType, parentID);

DROP INDEX Idx_Contents_1 ON Contents;
CREATE INDEX Idx_Contents_1 ON Contents (resourceURI, ownerID);
