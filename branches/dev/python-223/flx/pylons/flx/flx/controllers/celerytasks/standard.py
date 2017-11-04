from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.common import ArtifactCache
from pylons.i18n.translation import _ 
from flx.model import api
import flx.lib.helpers as h
from flx.lib.unicode_util import UnicodeDictReader
from flx.lib.gdt.downloadcsv import GDTCSVDownloader

from tempfile import NamedTemporaryFile
import logging
import os
import json

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

bookType = 'book'

logger = logging.getLogger(__name__)

class StandardsTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def getConceptRevisionID(self, lesson):
        if lesson.type.name == 'lesson' and lesson.revisions[0].children and lesson.revisions[0].children[0].child:
            child = lesson.revisions[0].children[0].child
            return child.id, child.artifact.id, child.artifact
        return None, None, None

    def checkSymbol(self, bookSym, dict):
        """
            Check if the symbol exists within the dictionary
        """
        if bookSym:
            for domain in dict.keys():
                if bookSym in dict[domain].keys():
                    return domain
        return False

    def processStandardId(self, standard):
        """
            Split and process standard id 
        """
        gradeDict = api.getGradesDict()
        subjectsDict = api.getSubjectsDict()
        (sdomain, stdSym, grades, courseSym, sectionNum) = standard.split('.', 4)
        if not sdomain or sdomain not in DOMAINS:
            raise Exception((_(u'Invalid standard domain %(sdomain)s')  % {"sdomain":sdomain}).encode("utf-8"))

        if DOMAIN_RENAMES.has_key(sdomain):
            sdomain = DOMAIN_RENAMES[sdomain]

        if not stdSym:
            raise Exception((_(u'Invalid standard board name: %(stdSym)s')  % {"stdSym":stdSym}).encode("utf-8"))

        if '_' in stdSym:
            (co, st) = stdSym.split('_', 1)
        else:
            co = None
            st = stdSym
        logger.info("Getting standard board for: %s, %s" % (st, co))
        standardBoard = api.getStandardBoardByName(name=st, country=co)
        if not standardBoard:
            raise Exception((_(u'Could not find standard board by symbol: %(stdSym)s')  % {"stdSym":stdSym}).encode("utf-8"))

        if not grades:
            raise Exception((_(u'Grades not specified')).encode("utf-8"))

        ## Process grades - either separated by - or , or a single number
        gradeList = []
        if "-" in grades:
            gradeParts = grades.split('-',1)
            gs = int(gradeParts[0])
            ge = int(gradeParts[1])
            gradeList = range(gs, ge+1)
        elif "," in grades:
            gradeParts = grades.split(',')
            for g in gradeParts:
                gradeList.append(int(g))
        else:
            gradeList.append(int(grades))

        gradeObjs = []
        for grade in gradeList:
            if not gradeDict.has_key(str(grade)):
                logger.error('Invalid grade name: %s' % str(grade))
            else:
                gradeObjs.append(gradeDict[str(grade)])

        if not gradeObjs:
            raise Exception((_(u'Invalid grade list. Could not find any grades matching: %(grades)s')  % {"grades":grades}).encode("utf-8"))

        if not courseSym:
            raise Exception((_(u'Invalid course symbol')).encode("utf-8"))

        if self.checkSymbol(courseSym, COURSES) != sdomain:
            ## This is not a course symbol - but part of the sectionNum
            sectionNum = '%s.%s' % (courseSym, sectionNum)
            courseSym = sdomain

        ## Figure out subject based on courseSym
        subject = None
        term = None
        cs = COURSES[sdomain][courseSym].lower()
        if subjectsDict.has_key(cs):
            subject = subjectsDict[cs]
        else:
            ## Try browseTerm
            term = api.getBrowseTermByName(name=cs)
            if term:
                ancestors = api.getBrowseTermAncestors(id=term.id)
                if ancestors:
                    for ancestor in ancestors:
                        if subjectsDict.has_key(ancestor.name.lower()):
                            subject = subjectsDict[ancestor.name.lower()]
                            logger.warn("Could not find subject by name: %s so approximating to %s" % (cs, subject.name))
                            break

        if not subject:
            raise Exception((_(u'Could not find a valid subject from course symbol: %(courseSym)s')  % {"courseSym":courseSym}).encode("utf-8"))

        if not sectionNum:
            raise Exception((_(u'Could not find section number')).encode("utf-8"))
        if grades:
            sectionNum = sectionNum + '_' + grades.replace(',', '_')

        return standardBoard, subject, gradeObjs, sectionNum, term

class StandardsCorrelationLoaderTask(StandardsTask):

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        StandardsTask.run(self, **kwargs)
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

            logger.info("Loading standards correlations from csv: %s" % csvFilePath)
            f = open(csvFilePath, 'rb')
            csvReader = UnicodeDictReader(f, sanitizeFieldNames=True)
            rowCnt = 0
            allMessages = {}

            ## List of changed artifact ids
            changedArtifacts = {}

            for row in csvReader:
                try:
                    rowCnt += 1
                    allMessages[rowCnt] = []
                    messages = allMessages[rowCnt]
                    lesson = row.get('lessonid', '').strip()
                    if not lesson:
                        raise Exception((_(u'Invalid lesson id')).encode("utf-8"))
                    lesson = lesson.upper()
                    lesson = lesson.strip('.')

                    standard = row.get('standardid')
                    if not standard:
                        standard = row.get('standardids')
                    if not standard:
                        raise Exception((_(u'Invalid standard id')).encode("utf-8"))
                    standard = standard.upper()
                    standards = [ x.strip() for x in standard.split(';') ]

                    lessonID = None
                    bookEID = None
                    artifact = None
                    ## Process lesson id
                    lessonParts = lesson.split('.')
                    if lessonParts[0] and lessonParts[0] not in DOMAINS:
                        ## Must be a book
                        bookEID = '.'.join(lessonParts[0:6])
                        chapterNum = lessonParts[-2]
                        lessonNum = lessonParts[-1]
                        if not chapterNum or not lessonNum:
                            raise Exception((_(u'Unknown chapter or lesson number for book: %(bookEID)s, lessonID: [%(lesson)s]')  % {"bookEID":bookEID,"lesson": lesson}).encode("utf-8"))

                    if bookEID:
                        ## If book EID was found
                        book = api.getArtifactByEncodedID(encodedID=bookEID, typeName=bookType)
                        if book:
                            logger.info("Found book [id: %d] with EID %s" % (book.id, bookEID))
                            chapters = api.getArtifactChildren(artifactID=book.getId())
                            if chapters:
                                for chapter in chapters:
                                    if str(chapter['sequence']) == chapterNum:
                                        ## Found the chapter number in the book
                                        lessons = api.getArtifactChildren(artifactID=chapter['childID'])
                                        if lessons:
                                            for lsn in lessons:
                                                if str(lsn['sequence']) == lessonNum:
                                                    ## Found the lesson number
                                                    lessonID = lsn['childID']
                                                    break
                                    if lessonID:
                                        break
                        else:
                            raise Exception((_(u'Cannot find book by encodedID: %(bookEID)s')  % {"bookEID":bookEID}).encode("utf-8"))
                    else:
                        ## This is a lesson or concept - the entire field is the encodedID
                        artifact = api.getArtifactByEncodedID(encodedID=lesson)
                        if artifact:
                            lessonID = lesson.id
                        else:
                            raise Exception((_(u'Cannot find lesson by encodedID: %(lesson)s')  % {"lesson":lesson}).encode("utf-8"))
                    
                    if not lessonID:
                        raise Exception((_(u'Cannot find artifact by chapterNum and lessonNum: [%(chapterNum)s, %(lessonNum)s]')  % {"chapterNum":chapterNum,"lessonNum": lessonNum}).encode("utf-8"))

                    logger.info("Found lessonID: %d" % lessonID)

                    if not artifact:
                        artifact = api.getArtifactByID(id=lessonID)
                        if not artifact:
                            raise Exception((_(u'No artifact found for lessonID: %(lessonID)d')  % {"lessonID":lessonID}).encode("utf-8"))

                    ## Process standard id(s)
                    for standard in standards:
                        standardBoard, subject, gradeObjs, sectionNum, term = self.processStandardId(standard)
                        standardObj = api.getStandard(standardBoardID=standardBoard.id, subjectID=subject.id, section=sectionNum)
                        if not standardObj:
                            standardObj = api.createStandard(section=sectionNum, standardBoardID=standardBoard.id, subjectID=subject.id, grades=gradeObjs, appendGrades=True)
                            logger.info("Created new standard for standardID: %s" % standard)

                        ## Now associte this standard with the artifact's revisions
                        exists = False
                        if artifact.revisions[0].standards:
                            for std in artifact.revisions[0].standards:
                                if std.id == standardObj.id:
                                    exists = True
                                    break

                        if not exists:
                            api.createArtifactHasStandard(artifactRevisionID=artifact.revisions[0].id, standardID=standardObj.id)
                            if term and term.id not in artifact.getBrowseTerms(idOnly=True):
                                api.createArtifactHasBrowseTerm(artifactID=artifact.id, browseTermID=term.id)
                            ## Get concept - associate the same standard with the concept
                            conceptRevID, conceptID, concept = self.getConceptRevisionID(artifact)
                            if conceptRevID:
                                if not api.getArtifactRevisionHasStandard(artifactRevisionID=conceptRevID, standardID=standardObj.id):
                                    api.createArtifactHasStandard(artifactRevisionID=conceptRevID, standardID=standardObj.id)
                                    changedArtifacts[conceptID] = conceptID
                                    if term and not api.getArtifactHasBrowseTerm(artifactID=conceptID, browseTermID=term.id):
                                        api.createArtifactHasBrowseTerm(artifactID=conceptID, browseTermID=term.id)
                                    api.invalidateArtifact(ArtifactCache(), concept)
                            messages.append("Row %d: Created association for artifact [%s] %s with standard %s" % (rowCnt, artifact.type.name, artifact.id, standard))
                            api.invalidateArtifact(ArtifactCache(), artifact)
                            changedArtifacts[artifact.id] = artifact.id
                        else:
                            messages.append("Row %d: standard %s already exists for artifact %s" % (rowCnt, standard, artifact.id))

                except Exception, e:
                    logger.error("Row [%d]: Error saving row. [%s]" % (rowCnt, str(e)), exc_info=e)
                    if len(messages) < rowCnt:
                        messages.append('Row [%d]: ERROR: Error saving row. [%s]' % (rowCnt, str(e)))
            ret = {'messages': allMessages, 'source': source, 'changedArtifacts': ",".join([str(x) for x in changedArtifacts.keys()]) }
            self.userdata = json.dumps(ret)
            logger.info("Changed artifacts: %s" % changedArtifacts.keys())
            if changedArtifacts and kwargs.get('reindex'):
                logger.info("Reindexing changedArtifacts: %s" % changedArtifacts.keys())
                h.reindexArtifacts(artifactIds=changedArtifacts.keys(), user=self.user)
            return ret
        except Exception, ee:
            logger.error('load browseTerms data from CSV Exception[%s]' % str(ee), exc_info=ee)
            raise ee
        finally:
            if f:
                f.close()
            if os.path.exists(csvFilePath):
                os.remove(csvFilePath)

class QuickStandardsCorrelationLoaderTask(StandardsCorrelationLoaderTask):
    recordToDB = False

class StandardsLoaderTask(StandardsTask):
    """
        CSV Format:
        STANDARD ID, TITLE, DESCRIPTION, CONCEPT EIDS
    """

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        StandardsTask.run(self, **kwargs)
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
            newStds = updStds = newAssoc = skipAssoc = errors = 0

            for row in csvReader:
                try:
                    rowCnt += 1
                    allMessages[rowCnt] = []
                    messages = allMessages[rowCnt]
                    standardID = row['standardid']
                    if not standardID:
                        logger.info("No standard id specified. Skipping row: %d" % rowCnt)
                        messages.append("Row [%d]: Unknown standard id. Skipping ..." % rowCnt)
                        continue
                    standardID = standardID.upper()

                    title = row.get('title', '')
                    title = title.strip()

                    desc = row['description'].strip()

                    ## Process standard id
                    standardBoard, subject, gradeObjs, sectionNum, term = self.processStandardId(standardID)

                    if not title or not title.strip():
                        ## If title is empty, just use the sectionNum
                        title = sectionNum

                    standard = api.getStandard(standardBoardID=standardBoard.id, subjectID=subject.id, section=sectionNum)
                    if not standard:
                        ## Create standard
                        standard = api.createStandard(section=sectionNum, description=desc, title=title,
                                standardBoardID=standardBoard.id, subjectID=subject.id, grades=gradeObjs)
                        newStds += 1
                        messages.append('Row [%d]: Successfully created standard with id %s' % (rowCnt, standard.id))
                    else:
                        kwargs = {
                                'standardID': standard.id, 'section': sectionNum, 'grades': gradeObjs, 'appendGrades': True,
                                'standardBoardID': standard.standardBoard.id, 'subjectID': standard.subject.id
                                }
                        if desc:
                            kwargs['description'] = desc
                        if title:
                            kwargs['title'] = title
                        ## Update standard
                        standard = api.updateStandard(**kwargs)
                        updStds += 1
                        messages.append('Row [%d]: Standard already exists with id %s. Updated.' % (rowCnt, standard.id))

                    eids = row.get('concepteids')
                    if eids:
                        associatedEids = []
                        eids = [ x.strip() for x in eids.strip(',').split(',') ]
                        for eid in eids:
                            if eid:
                                bt = api.getBrowseTermByEncodedID(encodedID=eid)
                                if not bt:
                                    s = 'Row [%d]: ERROR: Error getting browseTerm by encodedID: %s' % (rowCnt, eid)
                                    logger.error(s)
                                    messages.append(s)
                                    continue
                                associatedEids.append(bt.id)
                        if associatedEids:
                            for bid in associatedEids:
                                if not api.getDomainHasStandard(domainID=bid, standardID=standard.id):
                                    api.createDomainHasStandard(domainID=bid, standardID=standard.id)
                                    newAssoc += 1
                                else:
                                    skipAssoc += 1
                            s = 'Row [%d]: Associated %d domain terms with standard %s.' % (rowCnt, len(associatedEids), standard.id)
                            messages.append(s)
                            logger.info(s)
                    else:
                        logger.info('No concept eids specified for association')
                except Exception, e:
                    logger.error("Row [%d]: Error saving row. %s" % (rowCnt, str(e)), exc_info=e)
                    errors += 1
                    if len(messages) < rowCnt-1:
                        messages.append('Row [%d]: ERROR: Error saving row. [%s]' % (rowCnt, str(e)))

            ret = {'messages': allMessages, 'rows': rowCnt-1, 'errors': errors, 'newStandards': newStds, 'updatedStandards': updStds, 'newDomainAssociations': newAssoc, 'skippedDomainAssociations': skipAssoc, 'source': source}
            self.userdata = json.dumps(ret)
            return ret
        except Exception, ee:
            logger.error('load browseTerms data from CSV Exception[%s]' % str(ee), exc_info=ee)
            raise ee
        finally:
            if f:
                f.close()
            if csvFilePath and os.path.exists(csvFilePath):
                os.remove(csvFilePath)

class QuickStandardsLoaderTask(StandardsLoaderTask):
    
    recordToDB = False
