SET autocommit=0;
CREATE TABLE Notifications_tmp LIKE Notifications;
ALTER TABLE Notifications_tmp ADD COLUMN `copyTo` VARCHAR(1024) DEFAULT NULL;
INSERT INTO Notifications_tmp SELECT *, null FROM Notifications;
RENAME TABLE Notifications TO Notifications_old;
RENAME TABLE Notifications_tmp TO Notifications;
COMMIT;
SET autocommit=1;
