BEGIN;
ALTER TABLE GroupActivities CHANGE activityType activityType ENUM('create', 'join', 'share', 'leave', 'assign', 'unassign', 'assignment-delete', 'change-due-date');
COMMIT;
