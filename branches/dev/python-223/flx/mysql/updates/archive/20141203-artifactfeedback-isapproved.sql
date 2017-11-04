BEGIN;
ALTER TABLE ArtifactFeedbacks ADD COLUMN `isApproved` tinyint(1) COMMENT 'Artifact feedback is approved or not' NOT NULL DEFAULT 0 AFTER `comments`;
COMMIT;
