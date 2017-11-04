BEGIN;
    CREATE TABLE TagTerms (
        id int(11) NOT NULL auto_increment,
        name VARCHAR(255) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE (name)
    ) DEFAULT CHARSET=utf8;

    CREATE TABLE `ArtifactHasTagTerms` (
        `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
        `tagTermID` int(11) NOT NULL DEFAULT '0' COMMENT 'The tag term this artifact has.',
        PRIMARY KEY (`artifactID`,`tagTermID`),
        KEY `ArtifactHasTagTerms_ibfk_1` (`tagTermID`),
        CONSTRAINT `ArtifactHasTagTerms_ibfk_1` FOREIGN KEY (`tagTermID`) REFERENCES `TagTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT `ArtifactHasTagTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The tag terms each artifact has.';

    CREATE VIEW ArtifactsAndTagTerms AS
        SELECT
            a.id AS id, a.artifactTypeID AS artifactTypeID, a.creatorID AS creatorID,
            t.id AS tagTermID, t.name AS name
        FROM ((Artifacts a join TagTerms t) join ArtifactHasTagTerms at)
        WHERE ((a.id = at.artifactID) AND (t.id = at.tagTermID));
COMMIT;
