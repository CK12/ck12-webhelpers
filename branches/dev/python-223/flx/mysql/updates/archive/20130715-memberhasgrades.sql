BEGIN;
DELETE FROM MemberHasGrades WHERE memberID IN (SELECT temp.memberID FROM (SELECT memberID FROM MemberHasGrades GROUP BY memberID, gradeID HAVING (count(*) > 1)) AS temp);
ALTER TABLE MemberHasGrades ADD UNIQUE INDEX unq_member_grade (memberID, gradeID);
COMMIT;
