BEGIN;
ALTER TABLE GroupActivities CHANGE activityType activityType ENUM('create', 'join', 'share', 'leave', 'assign', 'unassign', 'assignment-delete', 'change-due-date', 'assignment-edit', 'ph-question', 'ph-comment', 'ph-answer');
ALTER TABLE GroupActivities CHANGE objectType objectType ENUM('artifact','artifactRevision','resource','resourceRevision','notification','member','group','peerhelp_post');
COMMIT;
