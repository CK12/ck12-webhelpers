ALTER TABLE ArtifactFeedbacks  DROP PRIMARY KEY, ADD PRIMARY KEY(`artifactID`, `memberID`, `type`);
