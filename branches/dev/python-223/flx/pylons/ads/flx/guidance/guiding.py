import logging
from flx.model.meta import Session
from flx.guidance.grading import masteryLevels, studentGradeByConcepts, bookGradeByConcepts

log = logging.getLogger(__name__)

def nextToLearn(studentID):
    """Compute concepts to learn learn next for a student.
    
    Arguments:
    studentID -- student member ID
    
    Returns:
    { subject: [(concept ID, concept name), ...], ...}
    """
    log.debug('student: %s', studentID)

    levels = masteryLevels()
    mastery = studentGradeByConcepts(studentID)
    session = Session()
    result = {}  # by subjects
    for i in mastery:
        if i[1] < levels[1]:
            continue
        rs = session.execute('SELECT b.tag, b.concept, b.conceptID, a1.handle, substring_index(a2.name, "-::of::-", 1), a2.handle'
                             ' FROM D_books b, ArtifactsBrowseTerms ab1, taxonomy.ConceptNodes n1, taxonomy.ConceptNodeNeighbors nn1,'
                             ' taxonomy.ConceptNodes n2, ArtifactsBrowseTerms ab2, flx2.Artifacts a1, flx2.Artifacts a2'
                             ' WHERE b.conceptID=ab1.id AND ab1.encodedID=n1.encodedID AND n1.id=nn1.requiredConceptNodeID'
                             ' AND nn1.conceptNodeID=n2.id AND n2.encodedID=ab2.encodedID'
                             ' AND b.conceptID=a1.id AND ab2.id=a2.id AND b.conceptID=%s' % \
                             i[0]).fetchone()
        if rs:
            subject = result.get(rs[0], [])
            subject.append(rs[1:])
            result[rs[0]] = subject
    
    log.debug('nextToLearn result: %s', result)
    return result

def improvements(studentID):
    """Compute concepts to improve for a student.
    
    Arguments:
    studentID -- student member ID
    
    Returns:
    { subject: [(concept ID, concept name), ...], ...}
    """
    log.debug('student: %s', studentID)

    levels = masteryLevels()
    mastery = studentGradeByConcepts(studentID)
    session = Session()
    result = {}  # by subjects
    for i in mastery:
        if i[1] >= levels[0]:
            continue
        rs = session.execute('SELECT b.tag, b.concept, b.conceptID, a1.handle, substring_index(a2.name, "-::of::-", 1), a2.handle'
                             ' FROM D_books b, ArtifactsBrowseTerms ab1, taxonomy.ConceptNodes n1, taxonomy.ConceptNodeNeighbors nn1,'
                             ' taxonomy.ConceptNodes n2, ArtifactsBrowseTerms ab2, flx2.Artifacts a1, flx2.Artifacts a2'
                             ' WHERE b.conceptID=ab1.id AND ab1.encodedID=n1.encodedID AND n1.id=nn1.requiredConceptNodeID'
                             ' AND nn1.conceptNodeID=n2.id AND n2.encodedID=ab2.encodedID'
                             ' AND b.conceptID=a1.id AND ab2.id=a2.id AND b.conceptID=%s' % \
                             i[0]).fetchone()
        if rs:
            subject = result.get(rs[0], [])
            subject.append(rs[1:])
            result[rs[0]] = subject
    
    log.debug('improvements result: %s', result)
    return result

def nextSteps(studentID, bookID):
    """Compute recommended next steps for all concepts in the book.
    
    Arguments:
    studentID -- student member ID
    bookID    -- book artifact ID
    
    Returns:
    [(concept ID, next step), ...]
    """
    log.debug('student: %s; book: %s', studentID, bookID)

    session = Session()
    levels = masteryLevels()
    
    result = []
    for i in bookGradeByConcepts(studentID, bookID):
        if i[1] >= levels[1]:
            continue
        resources = {}
        for j in session.execute('SELECT rt.name, r.uri, a.handle' \
                                 ' FROM flx2.ArtifactRevisions ar, flx2.ArtifactRevisionHasResources arr,' \
                                 '      flx2.ResourceRevisions rr, flx2.Resources r, flx2.ResourceTypes rt, flx2.Artifacts a' \
                                 ' WHERE ar.artifactID=%s AND ar.id=arr.artifactRevisionID AND arr.resourceRevisionID=rr.id' \
                                 ' AND rr.resourceID=r.id AND r.resourceTypeID=rt.id AND a.id=ar.artifactID' \
                                 ' AND rt.name in ("audio", "interactive", "video", "contents")' % i[0]).fetchall():
            r = resources.get(j[0], [])
            r.append(j[1:])
            resources[j[0]] = r

        video = resources.get('video')
        if video:
            #result.append([i[0], '<a href="%s">Watch this video</a>' % video[0]])
            result.append([i[0], '<a href="/concept/%s/#view_videos">Watch this video</a>' % video[0][1]])
            continue

        audio = resources.get('audio')
        if audio:
            result.append([i[0], '<a href="%s">Listen this audio</a>' % audio[0][0]])
            continue

        ilo = resources.get('interactive')
        if ilo:
            result.append([i[0], '<a href="%s">Try this ILO</a>' % ilo[0][0]])
            continue

        contents = resources.get('contents')
        if contents:
            result.append([i[0], '<a href="/concept/%s/">Read the concept again</a>' % contents[0][1]])

    log.debug('nextSteps result: %s', result)
    return result
