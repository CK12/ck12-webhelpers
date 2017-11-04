ALTER TABLE `ArtifactFeedbacks` ADD `notAbuse` BOOL DEFAULT 0 AFTER `isApproved`;
ALTER TABLE `ArtifactFeedbackReviews` ADD `notAbuse` BOOL DEFAULT 0 AFTER `reviewComment`;

INSERT INTO `EventTypes` (`name`, `description`) VALUES ('ARTIFACT_FEEDBACK_COMMENTS_ABUSE',  'Event for email notification for artifact feedback comments marked as abused by user');  

DROP TABLE IF EXISTS `ArtifactFeedbackAbuseReports`;

CREATE TABLE `ArtifactFeedbackAbuseReports` (
    `artifactID` int(11) NOT NULL,
    `memberID` int(11) NOT NULL,
    `reporterMemberID` int(11) NOT NULL,
    `comments` varchar(511) DEFAULT NULL,
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`artifactID`, `memberID`, `reporterMemberID`), 
    CONSTRAINT `ArtifactFeedbackAbuseReports_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactFeedbackAbuseReports_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactFeedbackAbuseReports_ibfk_3` FOREIGN KEY (`reporterMemberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8 ;

DROP TABLE IF EXISTS `ArtifactFeedbackReviewAbuseReport`;

CREATE TABLE `ArtifactFeedbackReviewAbuseReports` (
    `artifactFeedbackReviewID` int(11) NOT NULL,
    `reporterMemberID` int(11) NOT NULL,
    `comments` varchar(511) DEFAULT NULL, 
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`artifactFeedbackReviewID`, `reporterMemberID`),
    CONSTRAINT `ArtifactFeedbackReviewAbuseReports_ibfk_1` FOREIGN KEY (`artifactFeedbackReviewID`) REFERENCES `ArtifactFeedbackReviews` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactFeedbackReviewAbuseReports_ibfk_2` FOREIGN KEY (`reporterMemberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


