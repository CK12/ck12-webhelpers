ALTER table `ArtifactFeedbacks` CHANGE `type` `type` ENUM('rating','vote','relevance','creativity','clarity','impactful') NOT NULL DEFAULT 'rating' COMMENT 'The type of the feedback';
