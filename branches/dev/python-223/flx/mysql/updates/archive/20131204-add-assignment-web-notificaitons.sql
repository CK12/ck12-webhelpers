BEGIN;
INSERT INTO `EventTypes` (`name`, `description`) VALUES
    ('ASSIGNMENT_ASSIGNED_WEB', 'An assignment has been assigned to a group. (WEB)'),
    ('ASSIGNMENT_DELETED_WEB', 'An assignment has been deleted. (WEB)');

INSERT INTO Notifications (eventTypeID, type, frequency, groupID)
    SELECT t1.eventTypeID, 'web', 'ondemand', t2.groupID 
    FROM (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'ASSIGNMENT_ASSIGNED_WEB') AS t1, (SELECT id as groupID FROM Groups WHERE id != 1) AS t2;
INSERT INTO Notifications (eventTypeID, type, frequency, groupID)
    SELECT t1.eventTypeID, 'web', 'ondemand', t2.groupID 
    FROM (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'ASSIGNMENT_DELETED_WEB') AS t1, (SELECT id as groupID FROM Groups WHERE id != 1) AS t2;
COMMIT;
