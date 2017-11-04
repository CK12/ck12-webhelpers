import sys, urlparse, os, time
from datetime import date
from flx.model.meta import Session
from flx.model.model import Measure, EventGroup
from flx.engine.repository import registerDimension, addHierarchy, addLevel, \
    setDimensionLoadScript, loadDimension, registerMetric, registerEventGroup, \
    registerEvent, createAggregate, aggregate
from flx.engine.query import process
from flx.engine.aggregate import _sort, _multisort, Aggregate
from flx.engine.event import captureEvent
from flx.tests import NUM_STUDENTS, NUM_GROUPS, NUM_QUIZES

def _debug(msg):
    print >>sys.stderr, '[DEBUG]:', str(msg)

def setup():
    session = Session()
    session.execute('DELETE FROM Events WHERE name like "t\_%"')
    session.execute('DELETE FROM Measures WHERE name like "t\_%"')
    session.execute('DELETE FROM Dimensions WHERE name like "t\_%"')
    
def test_dimension():
    # Students dimension
    registerDimension('t_students', False)
    addHierarchy(name='t_h1', dimension_name='t_students')
    addLevel('t_student', 't_students', 't_h1')
    setDimensionLoadScript('t_students',
                           'select m.id, m.name from ads_test.tMembers m, ads_test.tMemberRoles mr'
                           ' where m.roleID=mr.id and mr.name="Student"')
    loadDimension('t_students')
    session = Session()
    rs = session.execute('SELECT COUNT(*) FROM D_t_students')
    assert rs.fetchone()[0] == NUM_STUDENTS

    # Teachers dimension
    registerDimension('t_teachers', False)
    addHierarchy(name='t_h1', dimension_name='t_teachers')
    addLevel('t_group', 't_teachers', 't_h1')
    addLevel('t_teacher', 't_teachers', 't_h1')
    setDimensionLoadScript('t_teachers',
                           'select m.id, m.name, g.id, g.name'
                           ' from ads_test.tMembers m, ads_test.tMemberRoles mr, ads_test.tMembers_tGroups gm, ads_test.tGroups g'
                           ' where m.roleID=mr.id and mr.name="Teacher" and m.id=gm.memberID and gm.t_groupID=g.id')
    loadDimension('t_teachers')
    session = Session()
    rs = session.execute('SELECT COUNT(*) FROM D_t_teachers')
    assert rs.fetchone()[0] == NUM_GROUPS
    
    # Subjects dimension
    registerDimension('t_subjects', False)
    addHierarchy(name='t_h1', dimension_name='t_subjects')
    addLevel('t_component', 't_subjects', 't_h1')
    addLevel('t_lesson', 't_subjects', 't_h1')
    addLevel('t_unit', 't_subjects', 't_h1')
    addLevel('t_subject', 't_subjects', 't_h1')
    setDimensionLoadScript('t_subjects',
                           'select s.id, s.name, u.id, u.name, l.id, l.name, c.id, c.name'
                           ' from ads_test.tQuizes q, ads_test.tComponents c, ads_test.tLessons l, ads_test.tUnits u, ads_test.tSubjects s'
                           ' where q.componentID=c.id and c.lessonID=l.id and l.unitID=u.id and u.subjectID=s.id')
    loadDimension('t_subjects')
    session = Session()
    rs = session.execute('SELECT COUNT(*) FROM D_t_subjects')
    assert rs.fetchone()[0] == NUM_QUIZES
    
def test_metrics():
    registerMetric('t_right',
                   Measure.LATENCY_RT,
                   ['t_students:memberID', 't_teachers:memberID@ads_test.tMembers_tGroups', 't_subjects:quizID'],
                   'right', 'tQuizScores', 'ads_test', 'localhost', 'dbadmin', 'D-coD#43')
    registerMetric('t_wrong',
                   Measure.LATENCY_RT,
                   ['t_students:memberID', 't_teachers:memberID@ads_test.tMembers_tGroups', 't_subjects:quizID'],
                   'wrong', 'tQuizScores', 'ads_test', 'localhost', 'dbadmin', 'D-coD#43')
    registerMetric('t_points',
                   Measure.LATENCY_RT,
                   ['t_students:memberID', 't_teachers:memberID@ads_test.tMembers_tGroups', 't_subjects:quizID'],
                   'points', 'tQuizScores', 'ads_test', 'localhost', 'dbadmin', 'D-coD#43')
    
def test_events():
    registerEventGroup('t_effort', Measure.LATENCY_RT, ['t_students', 't_subjects'], ['browser', 'os'])
    registerEvent('t_time_spent', 't_effort')
    registerEvent('ts', 't_effort')  # promote `ts` to be an event
    
    # Degenerated event group -- no dimension, attributes only
    registerEventGroup('t_nodim', Measure.LATENCY_RT, [], ['page', 'loc'])
    registerEvent('t_mouseover', 't_nodim')
    captureEvent('t_nodim', ['t_mouseover'], [14.0], [], [1,2])
    rs, q, l = process(**_parse_qs('eg=t_nodim&ml=t_mouseover:sum&al=page,loc'))
    assert len(rs) == 1 and rs[0] == [14.0, '1', '2']
    
    # Metric over event
    registerMetric('t_m_time_spent',
                   Measure.LATENCY_RT,
                   ['t_students', 't_subjects'],
                   't_time_spent', 'F_t_effort', 'ads', 'localhost', 'dbadmin', 'D-coD#43')
    captureEvent('t_effort', ['t_time_spent'], [11.0], ['1', '1'], ['firefox', 'ubuntu'])
    time.sleep(1)
    captureEvent('t_effort', ['t_time_spent'], [11.0], ['1', '50'], ['firefox', 'ubuntu'])
    time.sleep(1)
    captureEvent('t_effort', ['t_time_spent'], [11.0], ['1', '80'], ['firefox', 'ubuntu'])
    rs, q, l = process(**_parse_qs('ml=t_m_time_spent:sum'))
    assert len(rs) == 1 and rs[0] == [33.0]

def test_preaggregation():
    registerEventGroup('t_dayaggr', Measure.LATENCY_RT, ['t_students', 't_subjects'], ['t_dayaggr_a1', 't_dayaggr_a2'])
    registerEvent('t_dayaggr_e1', 't_dayaggr')
    session = Session()
    session.begin()
    eg = session.query(EventGroup).filter(EventGroup.name == 't_dayaggr').one()
    eg.aggregate = 'd'
    session.commit()
    captureEvent('t_dayaggr', ['t_dayaggr_e1'], [10.0], ['1', '1'], ['a1', 'a2'])
    captureEvent('t_dayaggr', ['t_dayaggr_e1'], [20.0], ['1', '1'], ['a3', 'a4'])
    createAggregate(eg, session, force_create=True)
    aggregate(eg, session, date.today(), date.today())
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:sum'))
    assert len(rs) == 1 and rs[0] == [30.0]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:count'))
    assert len(rs) == 1 and rs[0] == [2]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:avg'))
    assert len(rs) == 1 and rs[0] == [15.0]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:min'))
    assert len(rs) == 1 and rs[0] == [10.0]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:max'))
    assert len(rs) == 1 and rs[0] == [20.0]
    captureEvent('t_dayaggr', ['t_dayaggr_e1'], [30.0], ['2', '2'], ['a5', 'a6'])
    aggregate(eg, session, date.today(), date.today())
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:sum&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_subject&so=t_students:t_student asc'))
    assert len(rs) == 2 and rs[0] == [30.0] and rs[1] == [30.0]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:count&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_subject&so=t_students:t_student asc'))
    assert len(rs) == 2 and rs[0] == [2] and rs[1] == [1]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:avg&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_subject&so=t_students:t_student asc'))
    assert len(rs) == 2 and rs[0] == [15.0] and rs[1] == [30.0]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:min&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_subject&so=t_students:t_student asc'))
    assert len(rs) == 2 and rs[0] == [10.0] and rs[1] == [30.0]
    rs, q, l = process(**_parse_qs('eg=t_dayaggr&ml=t_dayaggr_e1:max&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_subject&so=t_students:t_student asc'))
    assert len(rs) == 2 and rs[0] == [20.0] and rs[1] == [30.0]

def _parse_qs(qs):
    return dict(urlparse.parse_qsl(qs))
   
_query_outputs = None

def _process(qs, compare_output=True):
    rs, q, l = process(**_parse_qs(qs))
    if compare_output:
        _query_outputs.write('qs: %s\nrs: %s\n' % (qs, rs))
    return rs
         
def test_query():
    global _query_outputs
    _query_outputs = open(os.path.join(os.path.dirname(__file__), 'test_query_outputs'), 'w')

    _process('eg=t_effort&ml=t_time_spent:sum&al=browser,os&dl=t_students:t_student&ft=t_students:3&gb=browser,os')
    _process('eg=t_effort&ml=t_time_spent:avg&al=browser,os&dl=t_students:t_student&ft=t_students:3&gb=browser,os')
    _process('eg=t_effort&ml=t_time_spent:count&al=browser,os&dl=t_students:t_student&ft=t_students:3&gb=browser,os')
    _process("eg=t_effort&ml=t_time_spent:sum&al=browser,os&dl=t_students:t_student&ft=t_students:3 browser = 'Firefox'&gb=browser,os")
    _process("eg=t_effort&ml=t_time_spent:sum&al=browser,os&dl=t_students:t_student&ft=t_students:3 browser = 'Chrome'&gb=browser,os")
    _process("eg=t_effort&ml=t_time_spent:sum&al=browser,os&dl=t_students:t_student&ft=t_students:t_student ~= ('Student 1','Student 2')&gb=browser,os")
    _process("eg=t_effort&ml=t_time_spent:sum&al=browser,os&dl=t_students:t_student&ft=t_students:t_studentID ~= ('3','4','7')&gb=browser,os")

    _process('ml=t_right:sum&ft=t_students:1')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:3')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_subjects:1 t_students:3' '')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_subjects:1.1 t_students:3') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_subjects:1.1.1 t_students:3') 
    _process("ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_subjects:t_lessonID = '1' and t_students:3") 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_subjects:1.1.1.6 t_students:3') 
    _process("ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_subjects:t_subject.t_unit.t_lesson.t_component = '6' and t_students:3") 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:4')
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&ft=t_students:3')
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&ft=t_subjects:1 t_students:3') 
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&ft=t_subjects:1.1 t_students:3') 
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&ft=t_subjects:1.1.1 t_students:3') 
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&ft=t_subjects:1.1.1.6 t_students:3') 
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&ft=t_students:4')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:3 t_subjects:.') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_subject&ft=t_students:3 t_subjects:.') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_unit&ft=t_students:3 t_subjects:1&gb=t_subjects:t_unit') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1&gb=t_subjects:t_lesson') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1.1&gb=t_subjects:t_component')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1&gb=t_subjects:t_lesson&rp')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_students:t_student&ft=t_students:. t_subjects:. t_teachers:6&gb=t_students:t_student&rp') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_subjects:t_lesson&ft=t_students:. t_subjects:. t_teachers:6&gb=t_subjects:t_lesson&rp')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_students:t_student&ft=t_students:. t_subjects:. t_teachers:6.10&gb=t_students:t_student&rp') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_students:t_student&ft=t_students:. t_subjects:1 t_teachers:6.10&gb=t_students:t_student&rp') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_students:t_student&ft=t_students:. t_subjects:1.1 t_teachers:6.10&gb=t_students:t_student&rp') 
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_students:t_student&ft=t_students:. t_subjects:1.7 t_teachers:6.10&gb=t_students:t_student&rp')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&dl=t_students:t_student&ft=t_students:. t_subjects:1.7 t_teachers:6.10&gb=t_students:t_student&rp')
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&dl=t_students:t_student&ft=t_students:. t_subjects:1.7 t_teachers:6.10&gb=t_students:t_student&rp')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:. t_subjects:1.7 t_teachers:6')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:.')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:3')
    _process('ml=t_right:sum,t_wrong:sum,t_points:sum&ft=t_students:3&en=t_students:1')
    _process('eg=t_effort&ml=t_time_spent:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1.1&gb=t_subjects:t_lesson') 
    _process('eg=t_effort&ml=t_time_spent:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1.1&gb=t_subjects:t_lesson&rp') 
    _process('eg=t_effort&ml=t_time_spent:sum&dl=t_subjects:t_lesson&ft=t_students:3 t_subjects:1.1.1&rp=1')

    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&dl=t_students:t_student&ft=t_students:. t_subjects:1.7 t_teachers:6.10&gb=t_students:t_student&so=t_students:t_student asc,t_subjects:t_subject desc')
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&dl=t_students:t_student,t_subjects:t_component&ft=t_students:. t_subjects:. t_teachers:.&gb=t_students:t_student,t_subjects:t_component&so=t_students:t_student asc,t_subjects:t_component desc')
    _process('ml=t_right:count,t_wrong:count,t_points:count&dl=t_students:t_student,t_subjects:t_component&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_component&so=t_students:t_student asc,t_subjects:t_component desc')
    _process('ml=t_right:count,t_wrong:count,t_points:count&dl=t_students:t_student,t_subjects:t_component&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_component&so=t_students:t_student desc,t_subjects:t_component desc')

    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&dl=t_students:t_student&ft=t_students:. t_subjects:1.7 t_teachers:6.10&gb=t_students:t_student&so=t_students:t_student asc,t_subjects:t_subject desc,1 asc')
    _process('ml=t_right:avg,t_wrong:avg,t_points:avg&dl=t_students:t_student,t_subjects:t_component&ft=t_students:. t_subjects:. t_teachers:.&gb=t_students:t_student,t_subjects:t_component&so=t_students:t_student asc,t_subjects:t_component desc,2 desc')
    _process('ml=t_right:count,t_wrong:count,t_points:count&dl=t_students:t_student,t_subjects:t_component&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_component&so=t_students:t_student asc,t_subjects:t_component desc,1 desc, 3 asc')
    _process('ml=t_right:count,t_wrong:count,t_points:count&dl=t_students:t_student,t_subjects:t_component&ft=t_students:. t_subjects:.&gb=t_students:t_student,t_subjects:t_component&so=t_students:t_student desc,t_subjects:t_component desc,1 asc,2 desc, 3 asc')

    _process("eg=t_effort&ml=t_time_spent:count&al=browser,os&dl=t_students:t_student&ft=t_students:3&gb=browser,os&so=browser asc")
    _process("eg=t_effort&ml=t_time_spent:count&al=browser,os&dl=t_students:t_student&ft=t_students:3&gb=browser,os&so=browser desc")
    
    # Test promoted `ts` event
    rs = _process("eg=t_effort&ml=ts:max&dl=t_subjects:t_subject&ft=t_students:1 t_subjects:.&gb=t_subjects:t_subject&so=1 desc", compare_output=False)
    assert len(rs) == 3 and rs[0][1] == 'Subject 3' and rs[1][1] == 'Subject 2' and rs[2][1] == 'Subject 1' 
    
    _query_outputs.close()
    outputs = open(os.path.join(os.path.dirname(__file__), 'test_query_outputs'), 'r').read()
    expected = open(os.path.join(os.path.dirname(__file__), 'expected_query_outputs'), 'r').read()
    assert outputs == expected

def test_aggregate():
    data = [[2,2,1,6], [3,3,3,5], [3,3,3,4], [2,2,1,5], [3,3,3,5], [1,3,7,1], [8,2,4,1]]
    _sort(data, [1,2,3])
    assert data == [[2, 2, 1, 5], [2, 2, 1, 6], [8, 2, 4, 1], [3, 3, 3, 4], [3, 3, 3, 5], [3, 3, 3, 5], [1, 3, 7, 1]]

    data = [[4,2,1,6], [3,3,3,5], [5,3,3,4], [2,2,1,5], [9,3,3,5], [1,3,7,1], [8,2,4,1]]
    assert _multisort(data, [(0, 'asc')]) == [[1, 3, 7, 1], [2, 2, 1, 5], [3, 3, 3, 5], [4, 2, 1, 6], [5, 3, 3, 4], [8, 2, 4, 1], [9, 3, 3, 5]]

    data = [[4,2,1,6], [3,3,3,5], [5,3,3,4], [2,2,1,5], [9,3,3,5], [1,3,7,1], [8,2,4,1]]
    assert _multisort(data, [(0, 'desc')]) == [[9, 3, 3, 5], [8, 2, 4, 1], [5, 3, 3, 4], [4, 2, 1, 6], [3, 3, 3, 5], [2, 2, 1, 5], [1, 3, 7, 1]]

    data = [[4,2,1,6], [3,3,3,5], [5,3,3,4], [2,2,1,5], [9,3,3,5], [1,3,7,1], [8,2,4,1], [9,1,2,1]]
    assert _multisort(data, [(0, 'desc'),(3, 'asc')]) == [[9, 1, 2, 1], [9, 3, 3, 5], [8, 2, 4, 1], [5, 3, 3, 4], [4, 2, 1, 6], [3, 3, 3, 5], [2, 2, 1, 5], [1, 3, 7, 1]]
    
    data = [[4,2,1,6], [3,3,3,5], [5,3,3,4], [2,2,1,5], [9,3,3,5], [1,3,7,1], [8,2,4,1], [9,1,2,1]]
    assert _multisort(data, [(0, 'desc'),(3, 'desc')]) == [[9, 3, 3, 5], [9, 1, 2, 1], [8, 2, 4, 1], [5, 3, 3, 4], [4, 2, 1, 6], [3, 3, 3, 5], [2, 2, 1, 5], [1, 3, 7, 1]]
    
    data = [[3,3,1,3,5,2,2,1,6], [1,2,3,4,4,3,3,3,5], [2,9,1,3,0,3,3,3,4], [9,1,3,0,7,2,2,1,5], [8,4,0,2,3,3,3,3,5], [0,2,1,8,9,1,3,7,1], [8,1,7,1,2,5,8,2,4]]
    aggr = Aggregate(grouping=[6,7,8], aggregates=[(Aggregate.SUM, 0), (Aggregate.AVG, 1), (Aggregate.COUNT, 2), (Aggregate.MIN, 3), (Aggregate.MAX, 4)])
    assert aggr.run(data) == [[9, 1, 1, 0, 7, 2, 2, 1, 5], [3, 3, 1, 3, 5, 2, 2, 1, 6], [2, 9, 1, 3, 0, 3, 3, 3, 4], [9, 3, 2, 2, 4, 3, 3, 3, 5], [0, 2, 1, 8, 9, 1, 3, 7, 1], [8, 1, 1, 1, 2, 5, 8, 2, 4]]

    #
    # Test NULL values
    #
    data = [[1,5,6], [None,5,6], [2,3,4], [4,3,4]]
    aggr = Aggregate(grouping=[1,2], aggregates=[(Aggregate.SUM, 0)])
    assert aggr.run(data) == [[6,3,4],[1,5,6]]

    data = [[1,5,6], [None,5,6], [2,3,4], [4,3,4]]
    aggr = Aggregate(grouping=[1,2], aggregates=[(Aggregate.AVG, 0)])
    assert aggr.run(data) == [[3,3,4],[1,5,6]]

    data = [[1,5,6], [None,5,6], [2,3,4], [4,3,4]]
    aggr = Aggregate(grouping=[1,2], aggregates=[(Aggregate.COUNT, 0)])
    assert aggr.run(data) == [[2,3,4],[1,5,6]]

    data = [[1,5,6], [None,5,6], [2,3,4], [4,3,4]]
    aggr = Aggregate(grouping=[1,2], aggregates=[(Aggregate.MIN, 0)])
    assert aggr.run(data) == [[2,3,4],[1,5,6]]

    data = [[1,5,6], [None,5,6], [2,3,4], [4,3,4]]
    aggr = Aggregate(grouping=[1,2], aggregates=[(Aggregate.MAX, 0)])
    assert aggr.run(data) == [[4,3,4],[1,5,6]]

    data = [[1,2,5,6], [None,4,5,6], [2,6,3,4], [4,None,3,4]]
    aggr = Aggregate(grouping=[2,3], aggregates=[(Aggregate.SUM, 0), (Aggregate.COUNT, 1)])
    assert aggr.run(data) == [[6,1,3,4],[1,2,5,6]]

    data = [[1,2,3,4,5,6], [None,4,None,5,5,6], [2,6,None,7,3,4], [4,None,8,None,3,4]]
    aggr = Aggregate(grouping=[4,5], aggregates=[(Aggregate.SUM, 0), (Aggregate.COUNT, 1), (Aggregate.MIN, 2), (Aggregate.MAX, 3)])
    assert aggr.run(data) == [[6,1,8,7,3,4],[1,2,3,5,5,6]]
    
    # Non-OLAP
    rs, q, l = process(**_parse_qs('ml=t_right:avg,t_right:count&dl=t_students:t_student&ft=t_students:. t_subjects:1.1.1&gb=t_students:t_student'))
    for i in rs:
        assert i[0] == i[3]  # right == studentID
        assert (i[3] == 1 and i[1] == 2) or (i[1] == 3)

    # OLAP
    rs, q, l = process(**_parse_qs('ml=t_right:avg,t_right:count&dl=t_students:t_student&ft=t_students:. t_subjects:1.1.1&gb=t_students:t_student&olap=1'))
    for i in rs:
        assert i[1] == 1  # count
        assert (i[3] == 1 and i[0] == 2) or (i[0] == 3 * i[3])

    # OLAP with rollup
    rs, q, l = process(**_parse_qs('ml=t_right:avg,t_right:count&dl=t_students:t_student&ft=t_students:. t_subjects:1.1.1&gb=t_students:t_student&olap=1&rp=1'))
    sum, count = 0, 0
    for i in rs[0:-1]:
        assert i[1] == 1  # count
        assert (i[3] == 1 and i[0] == 2) or (i[0] == 3 * i[3])
        sum += i[0]
        count += 1
    assert count == rs[-1][1] and sum/count == rs[-1][0]
        
        
    
    