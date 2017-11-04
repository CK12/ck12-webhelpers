USE flx2;

CREATE TABLE MemberStudyTrackItemStatusCopy SELECT M.memberID, M.assignmentID, M.studyTrackItemID, M.status, M.score, M.lastAccess FROM MemberStudyTrackItemStatus M, Assignments A WHERE A.assignmentType = 'assignment' AND M.assignmentID = A.assignmentID;

call update_dbpatch('20170707-MemberStudyTrackItemStatusCopy.sql');

