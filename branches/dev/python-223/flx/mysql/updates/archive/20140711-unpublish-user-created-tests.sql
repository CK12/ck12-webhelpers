update ArtifactRevisions set publishTime = null where artifactID in (select id from Artifacts where artifactTypeID in (51, 52, 53) and creatorID != 3) and publishTime is not null;
