USE flx2;

BEGIN;

DROP VIEW IF EXISTS MemberLibraryArtifactRevisionHasLabels;                                                                                                                                                    
CREATE VIEW MemberLibraryArtifactRevisionHasLabels AS
    SELECT
        mlo.labelID, mar.memberID, ml.label as labelName, ml.systemLabel, ml.memberID as labelOwnerID, mar.id as libraryObjectID, mar.artifactRevisionID, mar.objectType, mar.domainID, mar.added, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, a.handle, ar.revision, m.login
    FROM
        MemberLibraryArtifactRevisions AS mar
    LEFT OUTER JOIN MemberLibraryObjectHasLabels AS mlo ON mar.id = mlo.libraryObjectID
    LEFT OUTER JOIN MemberLabels AS ml ON mlo.labelID = ml.id
    LEFT JOIN ArtifactRevisions AS ar ON ar.id = mar.artifactRevisionID
    LEFT JOIN Artifacts AS a ON a.id = ar.artifactID
    LEFT JOIN Members AS m ON m.id = a.creatorID
    WHERE mar.objectType IN ('artifactRevision', 'domain');

DROP VIEW IF EXISTS MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms;
CREATE VIEW MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms AS
    SELECT
        mlo.labelID, mar.memberID, ml.label as labelName, ml.systemLabel, ml.memberID as labelOwnerID, mlo.libraryObjectID, mar.artifactRevisionID, mar.objectType, mar.domainID, mar.added, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, a.handle, ar.revision, m.login,
        b.browseTermID, b.name as term, b.termTypeID, b.parentID, b.encodedID
    FROM
        MemberLibraryArtifactRevisions AS mar
    LEFT OUTER JOIN MemberLibraryObjectHasLabels AS mlo on mar.id = mlo.libraryObjectID
    LEFT OUTER JOIN MemberLabels AS ml on mlo.labelID = ml.id
    LEFT JOIN ArtifactRevisions AS ar ON ar.id = mar.artifactRevisionID
    LEFT JOIN Artifacts AS a ON a.id = ar.artifactID
    LEFT JOIN Members AS m ON m.id = a.creatorID
    LEFT JOIN ArtifactsAndBrowseTerms AS b ON b.id = a.id
    WHERE mar.objectType = 'artifactRevision';

COMMIT;

call update_dbpatch('20170627-member-library-views.sql');
