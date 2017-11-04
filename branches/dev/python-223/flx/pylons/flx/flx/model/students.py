from pylons import tmpl_context as c
from pylons.i18n.translation import _
from flx.controllers.errorCodes import ErrorCodes
from flx.model import api


def validateGroupAndGrade(session, code, grade):
     group = api._getGroupByCode(session, code)
     if not group:
         c.errorCode = ErrorCodes.NO_SUCH_GROUP
         raise Exception((_(u'Invalid group code, %s.' % code)).encode("utf-8"))

     gradeLevel = api._getGradeByName(session, grade)
     if not gradeLevel:
         c.errorCode = ErrorCodes.NO_SUCH_GRADE
         raise Exception((_(u'Invalid grade, %s.' % grade)).encode("utf-8"))

     return group.creatorID

def uploadStudents(session, students, code, grade):
    if type(students) == str or type(students) == unicode:
        from ast import literal_eval

        students = literal_eval(students)

    group = api._getGroupByCode(session, code)
    gradeLevel = api._getGradeByName(session, grade)
    for m in students:
        member = api._createMember(session, **m)
        session.flush()

        api._addOrUpdateMemberGrades(session, memberID=member.id, gradeIDs=[gradeLevel.id])
        api._createTeacherStudentRelation(session, studentID=member.id, teacherID=group.creatorID)
