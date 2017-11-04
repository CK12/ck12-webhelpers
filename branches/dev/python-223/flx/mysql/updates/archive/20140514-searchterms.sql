BEGIN;
    CREATE TABLE SearchTerms (
        id int(11) NOT NULL auto_increment,
        name VARCHAR(255) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE (name)
    ) DEFAULT CHARSET=utf8;

    CREATE TABLE `ArtifactHasSearchTerms` (
        `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
        `searchTermID` int(11) NOT NULL DEFAULT '0' COMMENT 'The search term this artifact has.',
        PRIMARY KEY (`artifactID`,`searchTermID`),
        KEY `ArtifactHasSearchTerms_ibfk_1` (`searchTermID`),
        CONSTRAINT `ArtifactHasSearchTerms_ibfk_1` FOREIGN KEY (`searchTermID`) REFERENCES `SearchTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT `ArtifactHasSearchTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The search terms each artifact has.';

    CREATE VIEW ArtifactsAndSearchTerms AS
        SELECT
            a.id AS id, a.artifactTypeID AS artifactTypeID, a.creatorID AS creatorID,
            t.id AS searchTermID, t.name AS name
        FROM ((Artifacts a join SearchTerms t) join ArtifactHasSearchTerms at)
        WHERE ((a.id = at.artifactID) AND (t.id = at.searchTermID));
COMMIT;
