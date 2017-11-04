BEGIN;
INSERT INTO `EventTypes` (`name`, `description`) VALUES ('GROUP_PH_POST', 'Event to send email to all in group when a post was added.');
INSERT INTO Notifications (eventTypeID, type, frequency, subscriberID, groupID) SELECT t1.id AS eventTypeID, t2.email AS type, t2.instant AS frequency, t2.memberID AS subscriberID, t2.groupID FROM (SELECT id FROM EventTypes WHERE name = 'GROUP_PH_POST') AS t1, (SELECT groupID, memberID, 'email', 'instant' FROM GroupHasMembers WHERE groupID != 1) AS t2;
COMMIT;
