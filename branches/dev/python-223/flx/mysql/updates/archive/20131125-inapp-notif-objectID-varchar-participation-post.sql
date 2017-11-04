BEGIN;
INSERT INTO `EventTypes` (`name`, `description`) VALUES
    ('GROUP_MEMBER_JOINED_WEB', 'Event when an user joins a group (WEB)'),
    ('GROUP_SHARE_WEB', 'Event when something is shared within a group (WEB)'),
    ('GROUP_PH_POST_WEB', 'Event to store inapp notification for group when a post was added.'),
    ('PH_POST', 'Event to send email to thread participants when a post was added.');

ALTER TABLE Notifications MODIFY objectID VARCHAR(52);
ALTER TABLE Events MODIFY objectID VARCHAR(52);

ALTER TABLE Notifications CHANGE type type ENUM('email','text','web');
ALTER TABLE Notifications CHANGE frequency frequency ENUM('instant','once','daily','weekly','ondemand', 'off');
ALTER TABLE Events CHANGE objectType objectType ENUM('artifact','artifactRevision','resource','resourceRevision','notification','member','group','ph_post');
INSERT INTO Notifications (eventTypeID, type, frequency, groupID)
    SELECT t1.eventTypeID, 'web', 'ondemand', t2.groupID 
    FROM (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'GROUP_SHARE_WEB') AS t1, (SELECT id as groupID FROM Groups WHERE id != 1) AS t2;
INSERT INTO Notifications (eventTypeID, type, frequency, groupID)
    SELECT t1.eventTypeID, 'web', 'ondemand', t2.groupID 
    FROM (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'GROUP_PH_POST_WEB') AS t1, (SELECT id as groupID FROM Groups WHERE id != 1) AS t2;

ALTER TABLE Events ADD COLUMN subscriberID INT DEFAULT NULL AFTER ownerID;
ALTER TABLE Events ADD CONSTRAINT `Events_ibfk_3` FOREIGN KEY (`subscriberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE MemberAccessTimes CHANGE objectType objectType ENUM('group','inapp_notifications');
INSERT INTO MemberAccessTimes (memberID, objectType, accessTime) SELECT id, 'inapp_notifications', '0000-00-00 00:00:00' FROM Members WHERE id NOT IN (SELECT memberID FROM MemberAccessTimes WHERE objectType = 'inapp_notifications');
COMMIT;
