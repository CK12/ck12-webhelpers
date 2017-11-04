import logging
from datetime import datetime
from sqlalchemy import func, text
from flx.model import model, api
from flx.controllers.common import ArtifactCache
import flx.lib.helpers as h

memberID = 1
TABLE_NAMES = {
    'tag': 'Tag',
    'search': 'Search',
}

LOG_FILENAME = "/tmp/split_browseterms_type.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def getDuplicateBrowseTerms(termTypeID):
    tx = api.transaction('getDuplicateBrowseTerms')
    with tx as session:
        query = session.query(model.BrowseTerm)
        query = query.filter_by(termTypeID=termTypeID)
        query = query.group_by(model.BrowseTerm.name)
        query = query.having(func.count(model.BrowseTerm.name) > 1)
        return query.all()

def getBrowseTermsByName(name, termTypeID):
    tx = api.transaction('getBrowseTermsByName')
    with tx as session:
        query = session.query(model.BrowseTerm)
        query = query.filter_by(name=name)
        query = query.filter_by(termTypeID=termTypeID)
        query = query.order_by(model.BrowseTerm.id)
        return query.all()

def _updateArtifactHasBrowseTerms(session, dup_term_ids, term_id):
    result = session.execute(
        text("UPDATE ArtifactHasBrowseTerms SET browseTermID = :term_id WHERE browseTermID IN (:dup_term_ids)"),
        {"term_id": term_id, "dup_term_ids": ','.join([str(x) for x in dup_term_ids])}
    )
    return result
    
def handleDuplicateBrowseTermsOfType(termTypeName):
    termType = api.getBrowseTermTypeByName(name=termTypeName)

    dup_terms = getDuplicateBrowseTerms(termType.id)
    dup_term_names = []
    for dup_term in dup_terms:
        dup_term_names.append(dup_term.name)

    for dup_term_name in dup_term_names:
        terms = getBrowseTermsByName(dup_term_name, termType.id)
        if terms:
            term_id = terms[0].id

        dup_term_ids = [t.id for t in terms[1:]]

        tx = api.transaction('handleDuplicateBrowseTermsOfType')
        with tx as session:
            logNPrint(str(_updateArtifactHasBrowseTerms(session, dup_term_ids, term_id)))
            for t in terms[1:]:
                session.delete(t)

    logNPrint('DONE: handleDuplicateBrowseTerms')

def getBrowseTermsWithAssociationCount(termTypeID, greaterThanCount, limit=None):
    logNPrint('getBrowseTermsWithAssociationCount count %d' % greaterThanCount)
    browseTerms = []
    slimit = ''
    if limit:
        slimit = ' LIMIT ' + str(limit)
        
    tx = api.transaction('getBrowseTermsWithAssociationCount')
    with tx as session:
        browseTerms = session.execute(
            text('SELECT browseTermID, COUNT(browseTermID) AS count FROM ArtifactHasBrowseTerms WHERE browseTermID IN (SELECT id FROM BrowseTerms WHERE termTypeID = :termTypeID) GROUP BY browseTermID HAVING COUNT(browseTermID) > :greaterThanCount ORDER BY COUNT(browseTermID) DESC %s;' % slimit),
            {'termTypeID': termTypeID, 'greaterThanCount': greaterThanCount}
        ).fetchall()
    return browseTerms

def copyTermsAssociation(session, termTypeName, termID=None):
    logNPrint('copyTermsAssociation')
    where = ''
    if termID:
        where = ' WHERE '
        if type(termID).__name__ == 'list':
            where = where + 'bt.id IN (' + ','.join([str(x) for x in termID]) + ')'
            pass
        elif type(termID).__name__ == 'int':
            where = where + 'bt.id = ' + str(termID)

    session.execute(
        text("INSERT IGNORE INTO ArtifactHas%sTerms (artifactID, %sTermID) SELECT abt.artifactID, t.tID FROM ArtifactHasBrowseTerms abt JOIN (SELECT bt.id AS bID, tt.id AS tID FROM BrowseTerms bt JOIN %sTerms tt ON bt.name = tt.name AND bt.termTypeID = (SELECT id FROM BrowseTermTypes WHERE name = '%s') %s) AS t ON abt.browseTermID = t.bID;" % (TABLE_NAMES[termTypeName], termTypeName, TABLE_NAMES[termTypeName], termTypeName, where))
    )
    session.flush()
    logNPrint('Done copyTermsAssociation')

def getTypeTermAssociationCountForBrowseTerm(session, termTypeName, termID):
    logNPrint('getTypeTermAssociationCountForBrowseTerm')
    where = ' WHERE '
    if type(termID).__name__ == 'list':
        where = where + 'bt.id IN (' + ','.join([str(x) for x in termID]) + ')'
        pass
    elif type(termID).__name__ == 'int':
        where = where + 'bt.id = ' + str(termID)

    return session.execute(
        text("SELECT COUNT(*) FROM ArtifactHas%sTerms WHERE %sTermID in (SELECT t.id FROM %sTerms AS t JOIN BrowseTerms bt ON t.name = bt.name %s)" % (TABLE_NAMES[termTypeName], termTypeName, TABLE_NAMES[termTypeName], where)),
    ).fetchone()

def deleteBrowseTerm(session, bID):
    where = ' WHERE '
    if type(bID).__name__ == 'list':
        where = where + '%s IN (' + ','.join([str(x) for x in bID]) + ')'
        pass
    elif type(bID).__name__ == 'int':
        where = where + '%s = ' + str(bID)

    session.execute(
        text("DELETE FROM ArtifactHasBrowseTerms %s" % (where % 'browseTermID')),
    )
    session.flush()
    logNPrint('Delete ArtifactHasBrowseTerms')

    session.execute(
        text("DELETE FROM BrowseTerms %s" % (where % 'id')),
    )
    session.flush()
    logNPrint('Delete BrowseTerms')
    
def processTerms(termTypeName, browseTermIDs, count):
    logNPrint('> %s' % datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    logNPrint('Browse terms mapping count %d browseTermIDs %s' % (count, str(browseTermIDs)))
    tx = api.transaction('splitBrowseTermsOfType')
    with tx as session:
        copyTermsAssociation(session, termTypeName, browseTermIDs)
        cnt = getTypeTermAssociationCountForBrowseTerm(session, termTypeName, browseTermIDs)
        logNPrint('%d %d' % (cnt[0], count))
        if cnt[0] >= count:
            deleteBrowseTerm(session, browseTermIDs)
            logNPrint('Delete %s' % str(browseTermIDs))
        else:
            logNPrint('\033[93m Count mismatch for browseTermIDs %s \033[0m' % str(browseTermIDs))
    logNPrint('< %s' % str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))

def recacheArtifacts(termTypeName):
    logNPrint('recacheArtifacts')
    tx = api.transaction('recacheArtifacts')
    with tx as session:
        artifactIDs = session.execute(text("SELECT DISTINCT(artifactID) FROM ArtifactHas%sTerms" % TABLE_NAMES[termTypeName])).fetchall()

    if artifactIDs:
        artifactIDs = [t[0] for t in artifactIDs]

        for artifactID in artifactIDs:
            artifact = api.getArtifactByID(id=artifactID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=memberID)
            ArtifactCache().load(id=artifactID)

        taskId = h.reindexArtifacts(artifactIDs, memberID)

def deleteUnusedTypeFromBrowseTerms(termTypeName):
    tx = api.transaction('deleteUnusedTypeFromBrowseTerms')
    with tx as session:
        session.execute(
            text("DELETE FROM BrowseTerms WHERE termTypeID = (SELECT id FROM BrowseTermTypes WHERE name = :termTypeName) AND id NOT IN (SELECT browseTermID FROM ArtifactHasBrowseTerms)"),
            {'termTypeName': termTypeName}
        )

def splitBrowseTermsOfType(termTypeName):
    termType = api.getBrowseTermTypeByName(name=termTypeName)

    tx = api.transaction('splitBrowseTermsOfType')
    with tx as session:
        session.execute(
            text("INSERT IGNORE INTO %sTerms (name) SELECT name FROM BrowseTerms WHERE termTypeID = :termTypeID" % TABLE_NAMES[termTypeName]),
            {"termTypeID": termType.id}
        )
    logNPrint('Inserted into %sTerms' % TABLE_NAMES[termTypeName])

    totalCount = 0
    count_limit = 100000
    browseTerms = getBrowseTermsWithAssociationCount(termType.id, count_limit)
    logNPrint(str(browseTerms))
    for bt in browseTerms:
        processTerms(termTypeName, int(bt[0]), bt[1])

    while True:
        if count_limit <= 0:
            break
        count_limit = count_limit / 10
        if count_limit < 1000:
            count_limit = 0
        while True:
            browseTerms = getBrowseTermsWithAssociationCount(termType.id, count_limit, 50)
            if not browseTerms:
                break
            browseTermIDs = []
            count = 0
            for bt in browseTerms:
                browseTermIDs.append(int(bt[0]))
                count = count + bt[1]

            processTerms(termTypeName, browseTermIDs, count)

    logNPrint('DONE: splitBrowseTermsOfType')

def logNPrint(msg):
    print msg
    log.info(msg)

def run(termTypeName):
    if termTypeName not in ['tag', 'search']:
        logNPrint('Only tag and search term types are currently supported')
        exit(1)

    handleDuplicateBrowseTermsOfType(termTypeName)
    splitBrowseTermsOfType(termTypeName)
    deleteUnusedTypeFromBrowseTerms(termTypeName)
    recacheArtifacts(termTypeName)
