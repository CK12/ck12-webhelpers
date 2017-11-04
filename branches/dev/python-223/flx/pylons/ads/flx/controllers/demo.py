import logging
from pylons import tmpl_context as c, request
from pylons.templating import render_jinja2
from flx.lib.base import BaseController
from flx.model.meta import Session

log = logging.getLogger(__name__)

class DemoController(BaseController):
    """Analytical Data Service (ADS) APIs demo controller""" 

    def demo(self):
        session = Session()
        rs = session.execute('SELECT DISTINCT t_studentID, t_student FROM D_t_students ORDER BY 1 ASC')
        c.students = rs.fetchall()
        log.debug('Students: %s', c.students)
        
        rs = session.execute('SELECT DISTINCT t_teacherID, t_teacher FROM D_t_teachers ORDER BY 1 ASC')
        c.teachers = [i.values() for i in rs.fetchall()]
        log.debug('Teachers: %s', c.teachers)
            
        for teacher in c.teachers:
            rs = session.execute('SELECT DISTINCT t_groupID, t_group FROM D_t_teachers WHERE t_teacherID=%s ORDER BY 1 ASC' % teacher[0])
            teacher.append(rs.fetchall())
        log.debug('Teachers: %s', c.teachers)
        
        rs = session.execute('SELECT DISTINCT t_subjectID, t_subject FROM D_t_subjects ORDER BY 1 ASC')
        c.subjects = [i.values() for i in rs.fetchall()]
        for subject in c.subjects:
            rs = session.execute('SELECT DISTINCT t_unitID, t_unit FROM D_t_subjects WHERE t_subjectID=%s ORDER BY 1 ASC' % subject[0])
            units = [i.values() for i in rs.fetchall()]
            for unit in units:
                rs = session.execute('SELECT DISTINCT t_lessonID, t_lesson FROM D_t_subjects WHERE t_subjectID=%s AND t_unitID=%s ORDER BY 1 ASC' % (subject[0], unit[0]))
                lessons = [i.values() for i in rs.fetchall()]
                for lesson in lessons:
                    rs = session.execute('SELECT DISTINCT t_componentID, t_component FROM D_t_subjects WHERE t_subjectID=%s AND t_unitID=%s AND t_lessonID=%s ORDER BY 1 ASC' % (subject[0], unit[0], lesson[0]))
                    components = [i.values() for i in rs.fetchall()]
                    lesson.append(components)
                unit.append(lessons)
            subject.append(units)
        log.debug('Subjects: %s', c.subjects)

        return render_jinja2('demo.html', {'show_query':request.params.get('show_query')})
    