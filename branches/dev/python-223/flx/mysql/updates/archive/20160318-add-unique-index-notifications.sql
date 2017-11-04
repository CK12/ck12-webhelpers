BEGIN;
ALTER TABLE Notifications MODIFY COLUMN address VARCHAR(255) DEFAULT NULL COMMENT 'The address where the notification should be sent';
ALTER IGNORE TABLE Notifications ADD UNIQUE INDEX Idx_Notifications_3 (eventTypeID, subscriberID, objectID, objectType, `type`, ruleID, groupID, frequency, address);
COMMIT;
