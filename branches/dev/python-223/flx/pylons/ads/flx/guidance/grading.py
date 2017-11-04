import logging, decimal
from MySQLdb.converters import conversions, escape
from flx.model.meta import Session
from flx.engine.query import process

log = logging.getLogger(__name__)

def _getExerciseEID(encodedID):
    """Convert an encodedID to exercise encodedID."""
    parts = encodedID.split('.')
    parts[-2] = 'X'
    return '.'.join(parts)

def _getQuestionsAttempted(studentID, conceptID=None):
    """Query # of questions a student had attempted."""
    
    params = {
        'eg': 'exercise',
        'ml': 'ts:count',
        'al': 'question_id',
        'ft': 'users:%s artifacts:.' % studentID,
        'gb': 'question_id'
    }
    
    filter = 'users:%s' % studentID
    if conceptID:
        filter += "artifacts:artifactID = '%s'" % conceptID
    
    params['ft'] = filter
    attempted = len(process(**params)[0])

    log.debug('# attempted: %s' % (attempted))
    return attempted
        
def masteryLevels():
    return [60, 80]

def masteryThreshold():
    """Minimum number of attempted questions for the mastery % calculation to be effective."""
    return 0

def masteryColor(level):
    colors = ['red', 'yellow', 'green']
    mastery = masteryLevels()
    return colors[0] if level < mastery[0] else colors[1] if level < mastery[1] else colors[2] 

def conceptGrade(studentID, conceptID):
    """Compute a student's grade for a concept.
    
    Arguments:
    studentID -- student member ID
    conceptID -- concept artifact ID
    
    Returns:
    [A decimal number between 0.0 and 100.0, color]
    """
    log.debug('student: %s; concept: %s' % (studentID, conceptID))
    
    session = Session()
    encodedID = session.execute('SELECT encodedID FROM flx2.Artifacts WHERE id=%s' % conceptID).fetchone()[0]
    if not encodedID:
        return []
    exerciseEID = _getExerciseEID(encodedID)
    
    questions = session.execute('SELECT COUNT(*)'
                                ' FROM homeworkpedia.ExerciseBundle e, homeworkpedia.BundleHasQuestions b'
                                ' WHERE e.id=b.bundleID AND e.encodedID="%s"' % escape(exerciseEID, conversions)).fetchone()[0]
    log.debug('encodedID: %s; exercise encodedID: %s; #questions: %s' % (encodedID, exerciseEID, questions))

    attempted = _getQuestionsAttempted(studentID, conceptID=conceptID)
    if not attempted:
        return []
    
    # Query: unique correct attempts
    params = {
        'eg': 'exercise',
        'ml': 'correct:count',
        'ft': 'users:%s artifacts:%s' % (studentID, conceptID),
        'gb': 'question_id'
    }
    correct = len(process(**params)[0]) if attempted >= masteryThreshold() else 0

    mastery = decimal.Decimal('%s' % round(100.0 * min(correct, questions) / questions, 1) if questions else 0)

    log.debug('mastery: %s' % (mastery))
    return [mastery, masteryColor(mastery)]

def studentGradeByConcepts(studentID):
    """Compute a student's grades for all concepts.
    
    Arguments:
    studentID -- student member ID
    
    Returns:
    [[concept ID, A decimal number between 0.0 and 100.0, color], ...]
    """
    log.debug('student: %s' % (studentID))
    result = []
    
    # Query: concepts that this student had attempted
    params = {
        'eg': 'exercise',
        'ml': 'ts:count',
        'dl': 'artifacts:artifact',
        'ft': 'users:%s artifacts:.' % studentID,
        'gb': 'artifacts:artifact'
    }
    for row in process(**params)[0]:  # [[count, concept name, concept ID], ...]
        conceptID = row[2]
        mastery = conceptGrade(studentID, conceptID)
        if mastery:
            result.append([conceptID, mastery[0], mastery[1]])

    log.debug('result: %s' % (result))
    return result
    
def bookGrade(studentID, bookID):
    """Compute a student's grade for a book.
    
    Arguments:
    studentID -- student member ID
    bookID    -- book artifact ID
    
    Returns:
    [A decimal number between 0.0 and 100.0, color]
    """
    log.debug('student: %s; book: %s' % (studentID, bookID))
    
    session = Session()
    exerciseEIDs = []
    for i in session.execute('SELECT DISTINCT a.encodedID'
                             ' FROM flx2.Artifacts a, D_books b'
                             ' WHERE b.bookID=%s AND a.id=b.conceptID' % bookID).fetchall():
        if i[0]:
            exerciseEIDs.append(_getExerciseEID(i[0]))
    
    query = 'SELECT COUNT(*)' \
            ' FROM homeworkpedia.ExerciseBundle e, homeworkpedia.BundleHasQuestions b' \
            ' WHERE e.id=b.bundleID AND e.encodedID in (%s)' % \
            ','.join([escape(str(i), conversions) for i in exerciseEIDs])
    questions = session.execute(query).fetchone()[0]

    # Query: concepts that this student had attempted
    params = {
        'ml': 'm_b_time_spent:count,m_b_correct:count,m_b_wrong:count,m_b_skipped:count',
        'ft': "artifacts:. users:%s books:bookID = '%s'" % (studentID, bookID),
        'gb': 'artifacts:artifact'
    }

    correct, attempted = 0, 0
    for row in process(**params)[0]:  # [[count1, count2, count3, count4, concept name, concept ID], ...]
        conceptID = row[5]
        
        # Query: unique questions this student had attempted for this concept
        params = {
            'eg': 'exercise',
            'ml': 'ts:count',
            'al': 'question_id',
            'ft': "users:%s artifacts:artifactID = '%s'" % (studentID, conceptID),
            'gb': 'question_id'
        }
        attempted += len(process(**params)[0])
        
        # Query: unique correct attempts 
        params = {
            'eg': 'exercise',
            'ml': 'correct:count',
            'al': 'queston_id',
            'ft': "users:%s artifacts:artifactID = '%s'" % (studentID, row[2]),
            'gb': 'question_id'
        }
        correct += len(process(**params)[0])

    if attempted < masteryThreshold():
        correct = 0
        
    mastery = decimal.Decimal('%s' % round(100.0 * min(correct, questions) / questions, 1) if questions else 0)
    result = [mastery, masteryColor(mastery)]
    
    log.debug('result: %s' % (result))
    return result

def bookGradeByConcepts(studentID, bookID):
    """Compute a student's grade for a book.
    
    Arguments:
    studentID -- student member ID
    bookID    -- book artifact ID
    
    Returns:
    [[concept ID, a decimal number between 0.0 and 100.0, color], ...]
    """
    log.debug('student: %s; book: %s' % (studentID, bookID))
    result = []

    # Query: concepts in this book that this student had attempted    
    params = {
        'ml': 'm_b_time_spent:count,m_b_correct:count,m_b_wrong:count,m_b_skipped:count',
        'dl': 'books:concept',
        'ft': "users:%s books:bookID = '%s'" % (studentID, bookID),
        'gb': 'books:concept'
    }
    for row in process(**params)[0]:  # [[count1, count2, count3, count4, concept name, concept ID], ...]
        conceptID= row[5]
        mastery = conceptGrade(studentID, conceptID)
        if mastery:
            result.append([conceptID, mastery[0], mastery[1]])

    log.debug('result: %s' % (result))
    return result

def subjectGradeByConcepts(studentID, subjectName):
    """Compute a student's grade for a subject.
    
    Arguments:
    studentID   -- student member ID
    subjectName -- subject name
    
    Returns:
    [[concept ID, a decimal number between 0.0 and 100.0, color], ...]
    """
    log.debug('student: %s; subject: %s' % (studentID, subjectName))
    result = []

    # Query: concepts in this subject that this student had attempted
    params = {
        'eg': 'exercise',
        'ml': 'ts:count',
        'dl': 'artifacts:artifact',
        'ft': "users:%s artifacts:tag = '%s'" % (studentID, subjectName),
        'gb': 'artifacts:artifact'
    }
    
    for row in process(**params)[0]:  # [[count, concept name, concept ID], ...]
        conceptID = row[2]
        mastery = conceptGrade(studentID, conceptID=conceptID)
        if mastery:
            result.append([conceptID, mastery[0], mastery[1]])
        
    log.debug('result: %s' % (result))
    return result

def subjectGradeByBooks(studentID, subjectName):
    """Compute a student's grade for a subject.
    
    Arguments:
    studentID   -- student member ID
    subjectName -- subject name
    
    Returns:
    { bookID: [[concept ID, a decimal number between 0.0 and 100.0, color], ...], ...}
    """
    log.debug('student: %s; subject: %s' % (studentID, subjectName))
    result = {}

    # Query: books in this subject that this student had attempted
    params = {
        'ml': 'm_b_time_spent:sum,m_b_correct:sum,m_b_wrong:sum,m_b_skipped:sum',
        'dl': 'books:book',
        'ft': "books:tag = '%s' users:%s" % (subjectName, studentID),
        'gb': 'books:book'
    }
    
    for row in process(**params)[0]:  # [[time spent, correct, wrong, skipped, book name, book ID], ...]
        bookID = row[5]
        result[bookID] = bookGradeByConcepts(studentID, bookID=bookID)
        
    log.debug('result: %s' % (result))
    return result
