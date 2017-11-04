BEGIN;
INSERT INTO `EventTypes` (`name`, `description`) VALUES ('ARTIFACT_NEW_REVISION_AVAILABLE', 'Event to send email when artifact new revision is available from admin or book author');
INSERT INTO `EventTypes` (`name`, `description`) VALUES ('ARTIFACT_NEW_REVISION_AVAILABLE_WEB', 'Event for web notfication when artifact new revision is available from admin or book author');
COMMIT;
