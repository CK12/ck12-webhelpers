use ads_test;

update tMembers set name='Alex Hardy' where name='Student 1';
update tMembers set name='Daniel James' where name='Student 2';
update tMembers set name='David Shepard' where name='Student 3';
update tMembers set name='Jean Duncan' where name='Student 4';
update tMembers set name='Joseph Nunn' where name='Student 5';
update tMembers set name='Rebecca Henderson' where name='Student 6';
update tMembers set name='Sean Shill' where name='Student 7';

update tMembers set name='Maria Draper' where name='Teacher 1';
update tMembers set name='Tiara Gaines' where name='Teacher 2';
update tMembers set name='Jenna Gilmore' where name='Teacher 3';

update tSubjects set name='Algebra' where name='Subject 1';
update tSubjects set name='Math' where name='Subject 2';
update tSubjects set name='Science' where name='Subject 3';

use ads;

truncate table D_t_students;
insert into D_t_students (t_studentID, t_student)
 select m.id, m.name from ads_test.tMembers m, ads_test.tMemberRoles mr where m.roleID=mr.id and mr.name='Student';

truncate table D_t_teachers;
insert into D_t_teachers (t_teacherID, t_teacher, t_groupID, t_group)
 select m.id, m.name, g.id, g.name
 from ads_test.tMembers m, ads_test.tMemberRoles mr, ads_test.tMembers_tGroups gm, ads_test.tGroups g
 where m.roleID=mr.id and mr.name='Teacher' and m.id=gm.memberID and gm.t_groupID=g.id;

truncate table D_t_subjects;
insert into D_t_subjects (t_subjectID, t_subject, t_unitID, t_unit, t_lessonID, t_lesson, t_componentID, t_component)
 select s.id, s.name, u.id, u.name, l.id, l.name, c.id, c.name
 from ads_test.tQuizes q, ads_test.tComponents c, ads_test.tLessons l, ads_test.tUnits u, ads_test.tSubjects s
 where q.componentID=c.id and c.lessonID=l.id and l.unitID=u.id and u.subjectID=s.id;



