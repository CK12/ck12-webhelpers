import logging
import json
import os
from tempfile import NamedTemporaryFile
from pylons.i18n.translation import _ 
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.unicode_util import UnicodeDictReader
from flx.lib.gdt.downloadcsv import GDTCSVDownloader
from flx.model.mongo import getDB
from flx.model.mongo.standardset import StandardSet
from flx.model.mongo.standard import Standard
from flx.model.mongo.conceptnode import ConceptNode

logger = logging.getLogger(__name__)

DOMAINS = [ "MAT", "MATH", "SCI", "ENG", "TEC" ]
DOMAIN_RENAMES = { "MATH": "MAT" }
COURSES = {
    "MAT": {
        "ALG":       "Algebra",
        "GEO":       "Geometry",
        "CAL":       "Calculus",
        "PSADV":     "Statistics and Probability",
        "PSBSC":     "Statistics and Probability",
        "TRG":       "Trigonometry",
        "MAT":       "Mathematics",
    },
    "SCI": {
        "BIO":       "Biology",
        "CHE":       "Chemistry",
        "ESC":       "Earth Science",
        "LSC":       "Life Science",
        "SCI":       "Science", ## Generic science (used by some states)
    }
}


class StandardsTaskMongo(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'
        self.db = getDB(self.config)

    def checkSymbol(self, sym, dct):
        """
            Check if the symbol exists within the dictionary
        """
        if sym:
            for domain in dct.keys():
                if sym in dct[domain].keys():
                    return domain
        return False

    def processStandardId(self, standardID):
        if not standardID:
            raise Exception(_(u'Empty standardID'))

        standardSetObj = None
        subjectsList = []
        gradesList = []
        course = None
        i = 0
        l = standardID.split('.')

        subject = l[i]
        if not subject or subject not in DOMAINS:
            raise Exception((_(u'Invalid standard domain %(subject)s')  % {"subject":subject}).encode("utf-8"))

        if subject in DOMAIN_RENAMES:
            subject = DOMAIN_RENAMES[subject]

        i += 1
        standardSet = l[i]

        if '_' in standardSet:
            (co, st) = standardSet.split('_', 1)
        else:
            co = 'US'
            st = standardSet
        logger.info("Getting standard set for: %s, %s" % (st, co))
        standardSetObj = StandardSet(self.db).getByName(name=st, country=co)
        if not standardSetObj:
            raise Exception((_(u'Could not find standard Set: %s  %s')  % (co, st)).encode("utf-8"))

        i += 1
        grades = l[i]
        if not grades:
            raise Exception((_(u'Grades not specified')).encode("utf-8"))

        ## Process grades - either separated by - or , or a single number
        if "-" in grades:
            gradeParts = grades.split('-',1)
            gs = int(gradeParts[0])
            ge = int(gradeParts[1])
            gradesList = range(gs, ge+1)
        elif "," in grades:
            gradeParts = grades.split(',')
            for g in gradeParts:
                gradesList.append(int(g))
        else:
            gradesList.append(int(grades))

        gradesList = [str(x) for x in gradesList]

        subjectsList.append(subject)
        subjectName = COURSES[subject][subject].lower()
        subjectsList.append(subjectName)
        '''
        #TODO: Implement sub subjects like algebra calculus, etc
        if checkSymbol(course, COURSES) == subject:
            subSubject = course
        subjectName = COURSES[subject][subSubject].lower()
        subjectsList.append(subjectName)
        '''

        i += 1
        if len(l) > i:
            course = l[i]

        return standardSetObj, subjectsList, gradesList, course


class StandardsLoaderTaskMongo(StandardsTaskMongo):
    """
        CSV Format:
        STANDARD ID, TITLE, DESCRIPTION, CONCEPT EIDS
    """

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        StandardsTaskMongo.run(self, **kwargs)
        f = None
        try:
            if not csvFilePath:
                if not googleDocumentName:
                    raise Exception(_('Missing google document name and csvFilePath. One of them must be present.'))
                googleUserName = self.config.get('gdt_user_login')
                googleUserPass = self.config.get('gdt_user_password')

                file = NamedTemporaryFile(suffix='.csv', dir=self.config.get('cache_share_dir'), delete=False)
                converter = GDTCSVDownloader()
                converter.gss_get(file, googleDocumentName, googleWorksheetName, googleUserName, googleUserPass)
                if not file.closed:
                    file.close()
                csvFilePath = file.name
                logger.info("Created csvFilePath: %s" % csvFilePath)
                source = '%s|%s' % (googleDocumentName, googleWorksheetName)
            else:
                source = os.path.basename(csvFilePath)

            logger.info("Loading state standards from csv: %s" % csvFilePath)
            f = open(csvFilePath, 'rb')
            csvReader = UnicodeDictReader(f, sanitizeFieldNames=True)
            rowCnt = 1
            allMessages = {}
            newCnt = 0
            updateCnt = 0
            errorsCnt = 0

            for row in csvReader:
                try:
                    rowCnt += 1
                    messages = []
                    allMessages[rowCnt] = messages

                    standardID = row['standardid']
                    if not standardID:
                        logger.info("No standard id specified. Skipping row: %d" % rowCnt)
                        messages.append("Row [%d]: Unknown standard id. Skipping ..." % rowCnt)
                        continue
                    standardID = standardID.upper()

                    ## Process standard id
                    standardSetObj, subjectsList, gradesList, course = self.processStandardId(standardID)

                    level = row.get('level')
                    if level:
                        level = int(level)

                    if not level:
                        s = 'Row [%d]: ERROR: Error getting level' % (rowCnt)
                        logger.error(s)
                        messages.append(s)

                    sourceLevel = row.get('sourcelevel')
                    if sourceLevel:
                        sourceLevel = sourceLevel.strip().lstrip('>')

                    conceptEids = []
                    eids = row.get('concepteids')
                    if eids:
                        eids = [ x.strip() for x in eids.strip(',').split(',') ]
                        for eid in eids:
                            if eid and eid not in conceptEids:
                                concept = ConceptNode(self.db).getByEncodedID(eid)
                                if not concept:
                                    s = 'Row [%d]: ERROR: Error getting browseTerm by encodedID: %s' % (rowCnt, eid)
                                    logger.error(s)
                                    messages.append(s)
                                    continue

                                conceptEids.append(eid)
                    
                    info = {
                        'standardSet': {
                            'name': standardSetObj['name'],
                            'country': standardSetObj['country']
                        },
                        'level': level,
                        'subjects': subjectsList,
                        'grades': gradesList,
                        'label': row['label'],
                        'description': row['description'],
                        'url': row['url'],
                        'sequence': rowCnt - 1,
                        'sourceLevel': sourceLevel,
                        'depth': 1,
                    }

                    if conceptEids:
                        info['conceptEids'] = conceptEids

                    parentSID = standardID[:standardID.rindex('.')]

                    stdDB = Standard(self.db)

                    parent = stdDB.getBySID(parentSID)
                    if parent:
                        ancestorSIDs = []
                        if 'ancestorSIDs' in parent:
                            ancestorSIDs = parent['ancestorSIDs'][:]
                        ancestorSIDs.append(parentSID)
                        info['ancestorSIDs'] = ancestorSIDs
                        info['depth'] = len(ancestorSIDs) + 1

                    standard = stdDB.getBySID(standardID)
                    if standard:
                        if standard.get('conceptEids') and not conceptEids:
                            info['conceptEids'] = []

                        stdDB.updateBySID(
                            standardID,
                            **info
                        )
                        updateCnt += 1
                    else:
                        info['sid'] = standardID
                        stdDB.create(**info)
                        newCnt += 1

                except Exception, e:
                    logger.error("Row [%d]: Error saving row. %s" % (rowCnt, str(e)), exc_info=e)
                    errorsCnt += 1
                    messages.append('Row [%d]: ERROR: Error saving row. [%s]' % (rowCnt, str(e)))

            ret = {
                'source': source,
                'messages': allMessages,
                'rowsCount': rowCnt - 1,
                'errorsCount': errorsCnt,
                'newCount': newCnt,
                'updateCount': updateCnt,
            }
            self.userdata = json.dumps(ret)
            return ret
        except Exception, ee:
            logger.error('load browseTerms data from CSV Exception[%s]' % str(ee), exc_info=ee)
            raise ee
        finally:
            if f:
                f.close()
            if os.path.exists(csvFilePath):
                os.remove(csvFilePath)


class QuickStandardsLoaderTaskMongo(StandardsLoaderTaskMongo):
    
    recordToDB = False
