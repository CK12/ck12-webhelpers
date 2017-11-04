USE flx2;

CREATE TABLE MemberStudyTrackItemStatusBackup_2_7_2 SELECT M.memberID, M.assignmentID, M.studyTrackItemID, M.status, M.score, M.lastAccess FROM MemberStudyTrackItemStatus M, Assignments A WHERE A.assignmentType = 'assignment' AND M.assignmentID = A.assignmentID;

