insert into ArtifactRevisions (artifactID, revision, creationTime) select id, 1, creationTime from Artifacts where id not in (select distinct(artifactID) from ArtifactRevisions);
