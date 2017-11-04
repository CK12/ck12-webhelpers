import logging
from datetime import datetime
from pylons.i18n.translation import _

from pylons import request, tmpl_context as c, config
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, BrowseTermCache
from flx.model import model
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u
from flx.controllers.celerytasks import standard as standardTasks
from flx.controllers.celerytasks.mongo import standard as standardTasksMongo

from flx.controllers.errorCodes import ErrorCodes

BRANCHES_DICT = {'MAT': {'first': {'longname': u'CCSS', 'countryID': 1L, 'id': 61, 'name': u'CCSS'}},
                 'SCI': {'first': {'longname': u'NSES', 'countryID': 1L, 'id': 62, 'name': u'NSES'}}
                }

MESSAGE_DICT = {'MAT': " Correlations of these CK-12 math titles are provided in support of implementation \
                                of the Common Core standards in %s.",
                'SCI': " We have not yet aligned our content with the Standards adopted by %s. \
                            However, we have aligned our books with the National Science Education Standards.",
                'OTHERS': " We have not aligned our books with the standards with %s."
                }

MESSAGE_DICT_NO_CCSS = {'MAT': " Correlations of CK-12 math titles for %s standards, in lieu of Common Core, \
                                    will be posted soon.",
                       'SCI': " We have not yet aligned our content with the Standards adopted by %s. \
                            However, we have aligned our books with the National Science Education Standards.",
                       'OTHERS': " We have not aligned our books with the standards with %s."
                }

STANDARDS_NO_CCSS = ['alaska', 'minnesota', 'virginia', 'nebraska']

log = logging.getLogger(__name__)

bookType = 'book'

DOMAINS = [ "MAT", "SCI", "ENG", "TEC" ]
COURSES = {
        "MAT": {
            "ALG":       "Algebra",
            "GEO":       "Geometry",
            "CAL":       "Calculus",
            "PSADV":     "Statistics and Probability",
            "PSBSC":     "Statistics and Probability",
            "STA":       "Statistics",
            "PRO":       "Probability",
            "TRG":       "Trigonometry",
            "MAT":       "Mathematics",
            "ARI":       "Arithmetic"
        },
        "SCI": {
            "BIO":       "Biology",
            "CHE":       "Chemistry",
            "ESC":       "Earth Science",
            "LSC":       "Life Science",
            "SCI":       "Science", ## Generic science (used by some states)
            "PHY":       "Physics",
            "PSC":       "Physical Science"
        }
    }

class StandardController(BaseController):
    """
        Standard related APIs.
    """

    #
    #  Get related APIs.
    #
    @d.jsonify()
    @d.trace(log, ['id'])
    def getInfo(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            standard = api.getUnique(what=model.Standard, term='id', value=id)
            if standard is None:
                raise Exception((_(u'No standard of %(id)s')  % {"id":id}).encode("utf-8"))
            board = standard.standardBoard
            result['response']['id'] = standard.id
            result['response']['standardBoard'] = {}
            result['response']['standardBoard']['id'] = board.id
            result['response']['standardBoard']['name'] = board.name
            result['response']['standardBoard']['country'] = board.country.name
            result['response']['title'] = standard.title
            result['response']['section'] = standard.section
            result['response']['description'] = standard.description
            result['response']['subject'] = standard.subject.name
            return result
        except Exception, e:
            log.error('get standardInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['state', 'subject', 'section'])
    def getStandardInfo(self, state, subject, section):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            standard = None
            co, st = state.split('.')
            country = api.getCountry(code2Letter=co.upper())
            if country:
                standardBoard = api.getStandardBoardByName(name=st.upper(), country=country)
                if not standardBoard:
                    raise Exception((_(u'No standards board found for %(state)s')  % {"state":state}).encode("utf-8"))
                subjectObj = api.getSubjectByName(name=subject)
                if not subjectObj:
                    raise Exception((_(u'No subject found for %(subject)s')  % {"subject":subject}).encode("utf-8"))
                standard = api.getStandard(standardBoardID=standardBoard.id, subjectID=subjectObj.id, section=section)
            if standard is None:
                raise Exception((_(u'No standard of %(id)s')  % {"id":id}).encode("utf-8"))
            board = standard.standardBoard
            result['response']['id'] = standard.id
            result['response']['standardBoard'] = {}
            result['response']['standardBoard']['id'] = board.id
            result['response']['standardBoard']['name'] = board.name
            result['response']['standardBoard']['country'] = board.country.name
            result['response']['title'] = standard.title
            result['response']['section'] = standard.section
            result['response']['description'] = standard.description
            result['response']['subject'] = standard.subject.name
            return result
        except Exception, e:
            log.error('get standardInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('daily')
    def __browseStandards(self, title, boards, subjects, grades, pageNum, pageSize):
        standardIDs = api.browseStandards(title=title, standardBoardIDs=boards, subjects=subjects, grades=grades, 
                pageNum=pageNum, pageSize=pageSize)
        idList = [ s[0] for s in standardIDs ]
        log.debug("idList: %s" % str(idList))
        standards = api.getStandardsByIDs(ids=idList)

        result = {}
        result['standards'] = [ s.asDict(includeDescription=True, includeBoard=True) for s in standards ]
        result['total'] = standardIDs.getTotal()
        result['limit'] = len(idList)
        result['offset'] = (pageNum - 1)*pageSize
        return result

    @d.jsonify()
    @d.trace(log, [])
    @d.setPage(request, [])
    def browseStandards(self, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            sbIDDict, sbNameDict = g.getStandardBoards()
            gradesDict = g.getGrades()
            subjectsDict = g.getSubjects()

            subjects = request.params.get('subjects')
            if subjects:
                subjectList = []
                for s in subjects.split(','):
                    s = s.strip()
                    if subjectsDict.has_key(s.lower()):
                        subjectList.append(subjectsDict[s.lower()]['name'])
                    else:
                        raise Exception('Unknown subject: %s' % s)
                subjects = subjectList
            else:
                subjects = None

            grades = request.params.get('grades')
            if grades:
                gList = []
                for grd in grades.split(','):
                    grd = grd.strip()
                    if gradesDict.has_key(grd.lower()):
                        gList.append(gradesDict[grd.lower()]['name'])
                    else:
                        raise Exception('Unknown grade: %s' % grd)
                grades = gList
            else:
                grades = None
            log.debug("Grades: %s" % grades)

            boards = request.params.get('standardBoardIDs')
            if boards:
                boardsList = []
                for b in boards.split(','):
                    b = int(b.strip())
                    if sbIDDict.has_key(b):
                        boardsList.append(sbIDDict[b]['id'])
                    else:
                        raise Exception('Unknown standardBoard: %s' % b)
                boards = boardsList
            else:
                boards = None

            title = request.params.get('title')
            result['response'] = self.__browseStandards(title, boards, subjects, grades, pageNum, pageSize)
            return result
        except Exception, e:
            log.error('browseStandards Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['type', 'state', 'id'])
    @d.setPage(request, ['type', 'state', 'id'])
    def getArtifactInfo(self, type, state, id, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            standards = api.getStandards(section=id, standardBoard=state)
            if type is not None and type.lower() == 'artifact':
                type = None
            page = api.getArtifactRevisionsByStandards(standards=standards, artifactType=type, pageNum=pageNum, pageSize=pageSize)
            artifactRevisions = page.results
            artifactList = []
            for artifactRevision in artifactRevisions:
                artifactList.append(artifactRevision.asDict())
            if type is None:
                type = 'artifact'
            result['response'][type] = artifactList
            result['response']['total'] = page.total
            result['response']['pages'] = page.pages
            result['response']['items'] = len(page)
            return result
        except Exception, e:
            log.error('get standardArtifactInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['type', 'state', 'id'])
    @d.setPage(request, ['type', 'state', 'id'])
    def getArtifactDetail(self, type, state, id, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            standards = api.getStandards(section=id, standardBoard=state)
            if type is not None and type.lower() == 'artifact':
                type = None
            page = api.getArtifactRevisionsByStandards(standards=standards, artifactType=type, pageNum=pageNum, pageSize=pageSize)
            artifactRevisions = page.results
            artifactList = []
            for artifactRevision in artifactRevisions:
                content = artifactRevision.asContentDict()
                artifactList.append(content)
            if type is None:
                type = 'artifact'
            result['response'][type] = artifactList
            result['response']['total'] = page.total
            result['response']['pages'] = page.pages
            result['response']['items'] = len(page)
            return result
        except Exception, e:
            log.error('get standardArtifactDetail Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Create related APIs.
    #
    def __createStandard(self):
        def grade_compare(a, b):
            if a == 'k' or a == 'K':
                a = '0'
            if b == 'k' or b == 'K':
                b = '0'
            return int(a) - int(b)

        grades = api.getGrades()
        c.gradeDict = {}
        for grade in grades:
            c.gradeDict[str(grade.id)] = grade.name
        c.gradeKeys = sorted(c.gradeDict.keys(), cmp=grade_compare)
        subjects = api.getSubjects()
        c.subjectDict = {}
        for subject in subjects:
            c.subjectDict[str(subject.id)] = subject.name
        c.subjectKeys = sorted(c.subjectDict.keys(), cmp=h.num_compare)
        standardBoards = api.getStandardBoards()
        c.standardBoardDict = {}
        for standardBoard in standardBoards:
            c.standardBoardDict[str(standardBoard.id)] = standardBoard.name
        c.standardBoardKeys = sorted(c.standardBoardDict.keys(), cmp=h.num_compare)
        c.standardDict = {
            'section': '',
            'title': '',
            'description': '',
        }
        c.keys = sorted(c.standardDict.keys())
        c.prefix = self.prefix
        return render('/flx/standard/createForm.html')

    def createForm(self):
        return self.__createStandard()

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def create(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        standardBoardID = request.params['standardBoardID']
        subjectID = request.params['subjectID']
        section = request.params['section']
        try:
            gradeIDs = request.params.getall('grades')
            title = request.params['title']
            description = request.params['description']
            grades = api.getGrades(idList=gradeIDs)
            standard = api.createStandard(section=section,
                                          title=title,
                                          description=description,
                                          grades=grades,
                                          subjectID=subjectID,
                                          standardBoardID=standardBoardID)
            result['response']['id'] = standard.id
            result['response']['title'] = standard.title
            return result
        except Exception, e:
            log.error('create standard Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_STANDARD
        try:
            standard = api.getStandard(standardBoardID, subjectID, section)
            if standard is not None:
                infoDict = {
                    'id': standard.id,
                    }
        except Exception:
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createAssociationForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/standard/createAssociationForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createAssociation(self, member):
        """
            Create a new standards association with either a domain or artifactRevision
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            term = None
            artifactRevision = None
            domainID = request.params.get('domainID')
            if domainID:
                term = api.getBrowseTermByID(id=domainID, typeName='domain')
                if not term:
                    term = api.getBrowseTermByEncodedID(encodedID=domainID)
            elif request.params.get('artifactRevision'):
                artifactRevisionID = request.params['artifactRevision']
                artifactRevision = api.getArtifactRevisionByID(id=artifactRevisionID)
            else:
                raise Exception('No artifactRevision or domainID specified.')
            standardID = request.params['standard']
            standard = api.getStandardByID(id=standardID)
            if not standard:
                raise Exception('No such standard by id: %s' % standardID)
            if term:
                if api.getDomainHasStandard(domainID=term.id, standardID=standard.id):
                    raise Exception('The association already exists.')
                domainHasStandard = api.createDomainHasStandard(domainID=term.id, standardID=standard.id)
                result['response']['domainID'] = domainHasStandard.domainID
                result['response']['standardID'] = domainHasStandard.standardID
                api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=term.id, memberID=member.id)
            elif artifactRevision:
                if api.getArtifactRevisionHasStandard(artifactRevisionID=artifactRevision.id, standardID=standard.id):
                    raise Exception('The association already exists.')
                artifactHasStandards = api.createArtifactHasStandard(
                                        artifactRevisionID=artifactRevision.id,
                                        standardID=standard.id)
                result['response']['artifactRevisionID'] = artifactHasStandards.artifactRevisionID
                result['response']['standardID'] = artifactHasStandards.standardID
                api.invalidateArtifact(ArtifactCache(), artifactRevision.artifact, memberID=member.id)
            else:
                raise Exception('Could not find domain or artifact for association.')
            return result
        except Exception, e:
            log.error('create standard association Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_STANDARD_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def deleteAssociationForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/standard/deleteAssociationForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteAssociation(self, member):
        """
            Delete an existing standards association with either a domain or artifactRevision
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            term = None
            artifactRevision = None
            domainID = request.params.get('domainID')
            if domainID:
                term = api.getBrowseTermByID(id=domainID, typeName='domain')
                if not term:
                    term = api.getBrowseTermByEncodedID(encodedID=domainID)
            elif request.params.get('artifactRevision'):
                artifactRevisionID = request.params['artifactRevision']
                artifactRevision = api.getArtifactRevisionByID(id=artifactRevisionID)
            else:
                raise Exception('No artifactRevision or domainID specified.')
            standardID = request.params['standard']
            standard = api.getStandardByID(id=standardID)
            if not standard:
                raise Exception('No such standard by id: %s' % standardID)
            if term:
                log.info("Deleting domainID: %d, standardID: %d" % (term.id, standard.id))
                api.deleteDomainHasStandard(domainID=term.id, standardID=standard.id)
                result['response']['domainID'] = term.id
                result['response']['standardID'] = standard.id
                api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=term.id, memberID=member.id)
            elif artifactRevision:
                log.info("Deleting artifactRevisionID: %d, standardID: %d" % (artifactRevision.id, standard.id))
                api.deleteArtifactRevisionHasStandard(
                                        artifactRevisionID=artifactRevision.id,
                                        standardID=standard.id)
                result['response']['artifactRevisionID'] = artifactRevision.id
                result['response']['standardID'] = standard.id
                api.invalidateArtifact(ArtifactCache(), artifactRevision.artifact, memberID=member.id)
            else:
                raise Exception('Could not find domain or artifact for association.')
            return result
        except Exception, e:
            log.error('delete standard association Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_STANDARD_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def loadStateStandardsForm(self, member):
        if not u.isMemberAdmin(member):
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API'), datetime.now())
        c.prefix = self.prefix
        return render('/flx/standard/uploadStateStandardsForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def loadStateStandardsDataFromCSV(self, member):
        """
            Loads state standards from a CSV file or Google Spreadsheet of the format specified below.

            Parameters:
                googleDocumentName: Name of the google spreadsheet.
                googleWorksheetName: Name of the worksheet in the google spreadsheet (Optional - picks the first one by default)
                    OR
                file: Uploaded CSV file

            Spreadsheet format (columns)
                * STANDARD ID
                    DOMAIN.STANDARDSYM.GRADES.COURSESYM.SECTION#
                        Where:
                            DOMAIN could be MATH, SCI, ENG, TECH
                            STANDARDSYM is the short name of the standard - CA
                            GRADES is sigle grade number (9) or a range of grades (9-12), or a list of grades (9,10,12)
                            COURSESYM is a short name of the course
                            SECTION# is a number of the section within that standard (could be a . separated hierarchy)
                * TITLE
                    Title of the standard section (could be empty)
                * DESCRIPTION
                    Description of the standard section (could be empty, although not recommended)
                * CONCEPT EIDS (Optional)
                    Comma-separated list of concept eids to which this standard should be associated.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            googleDocumentName = googleWorksheetName = savedFilePath = None
            ## Check if Google spreadsheet is specified.
            if request.params.get('googleDocumentName'):
                googleDocumentName = request.params.get('googleDocumentName')
                if not googleDocumentName:
                    raise Exception(_('Google Spreadsheet name is required.'))
                googleWorksheetName = request.params.get('googleWorksheetName')
                if not googleWorksheetName:
                    log.info("No worksheet specified. Using the first one.")
                    googleWorksheetName = None
            else:
                ## save the file to temp location
                savedFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))

            useMongo = request.params.get('useMongo')

            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            log.info("Wait for task? %s" % str(waitFor))
            if waitFor:
                ## Run in-process
                if useMongo:
                    standardLoader = standardTasksMongo.QuickStandardsLoaderTaskMongo()
                else:
                    standardLoader = standardTasks.QuickStandardsLoaderTask()

                ret = standardLoader.apply(kwargs={'csvFilePath': savedFilePath, 'googleDocumentName': googleDocumentName, 
                    'googleWorksheetName': googleWorksheetName, 'user': member.id, 'loglevel': 'INFO'})
                result['response'] = ret.result
            else:
                if useMongo:
                    standardLoader = standardTasksMongo.StandardsLoaderTaskMongo()
                else:
                    standardLoader = standardTasks.StandardsLoaderTask()

                task = standardLoader.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName,
                        googleWorksheetName=googleWorksheetName, loglevel='INFO', user=member.id)
                result['response']['taskID'] = task.task_id
            return result
        except Exception, e:
            log.error('load state standard data from CVS Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def loadStandardsCorrelationForm(self):
        c.prefix = self.prefix
        return render('/flx/standard/uploadStandardsCorrelationForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def loadStandardsCorrelations(self, member):
        """
            Load standards correlation data from CSV file using the following format:
                Column 1: "LESSON ID"
                    BOOKEID.CHAPTER#.LESSON#
                    LESSONEID
                        Where:
                            BOOKEID: Encoded ID for the book
                            CHAPTER# is the number of the chapter within that book.
                            LESSON# is the number of lesson within that book
                Column 2: "STANDARD ID" or "STANDARD IDS"
                    DOMAIN.STANDARDSYM.GRADES.COURSESYM.SECTION#; ...
                        Where:
                            DOMAIN could be MATH, SCI, ENG, TECH
                            STANDARDSYM is the short name of the standard - CA
                            GRADES is sigle grade number (9) or a range of grades (9-12), or a list of grades (9,10,12)
                            COURSESYM is a short name of the course
                            SECTION# is a number of the section within that standard (could be a . separated hierarchy
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("Request: %s" % request.params)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            googleDocumentName = googleWorksheetName = savedFilePath = None
            ## Check if Google spreadsheet is specified.
            if request.params.get('googleDocumentName'):
                googleDocumentName = request.params.get('googleDocumentName')
                if not googleDocumentName:
                    raise Exception(_('Google Spreadsheet name is required.'))
                googleWorksheetName = request.params.get('googleWorksheetName')
                if not googleWorksheetName:
                    log.info("No worksheet specified. Using the first one.")
                    googleWorksheetName = None
            else:
                ## save the file to temp location
                savedFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))
            reindex = str(request.params.get('reindex')).lower() == 'true'
            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            log.info("Wait for task? %s" % str(waitFor))
            if waitFor:
                ## Run in-process
                standardLoader = standardTasks.QuickStandardsCorrelationLoaderTask()
                ret = standardLoader.apply(kwargs={'csvFilePath': savedFilePath, 'googleDocumentName': googleDocumentName,
                    'googleWorksheetName': googleWorksheetName, 'user': member.id, 'loglevel': 'INFO', 'reindex': reindex})
                result['response'] = ret.result
            else:
                standardLoader = standardTasks.StandardsCorrelationLoaderTask()
                task = standardLoader.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName,
                        googleWorksheetName=googleWorksheetName, loglevel='INFO', user=member.id, reindex=reindex)
                result['response']['taskID'] = task.task_id
            return result
        except Exception, e:
            log.error('load standard correlation data from CVS Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_STANDARD_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('weekly')
    def _getSubjectsWithCorrelations(self, standardBoardID=None, gradeID=None):
        subjects = api.getSubjectsWithCorrelations(standardBoardID=standardBoardID, gradeID=gradeID)
        subjects.extend(api.getSubjectsWithCorrelationsForDomain(standardBoardID=standardBoardID, gradeID=gradeID))
        subjectsDict = dict([(x['name'].lower(), x) for x in subjects ])
        return [ subjectsDict.get(x) for x in sorted(subjectsDict.keys()) ]

    @d.jsonify()
    @d.trace(log,['standardBoardID','gradeID'])
    def getSubjectsWithCorrelations(self,standardBoardID=None, gradeID=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['grades'] = []
        result['response']['message'] = ''
        try:
            subjects = self._getSubjectsWithCorrelations(standardBoardID=standardBoardID,gradeID=gradeID)
            result['response']['subjects'] = subjects
            return result
        except Exception, e:
            log.error('get subject with correlations Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_SUBJECT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('weekly')
    def _getGradesWithCorrelations(self, subject=None, standardBoardID=None):
        if standardBoardID:
            if (standardBoardID.__str__().isdigit()):
                standardBoardID = int(standardBoardID)
                standardBoard = api.getStandardBoardByID(standardBoardID)
            else:
                board = standardBoardID.split('.')
                country = api.getCountry(board[0])
                standardBoard = api.getStandardBoardByName(name=board[1], country=country)
                standardBoardID = standardBoard.id

        grades = api.getGradesWithCorrelations(subject=subject, standardBoardID=standardBoardID)
        grades.extend(api.getGradesWithCorrelationsForDomain(subject=subject, standardBoardID=standardBoardID))
        gradesDict = dict([(x['id'], x) for x in grades])
        log.info("gradesDict: %s" % str(gradesDict))
        return [ gradesDict.get(x) for x in sorted(gradesDict.keys()) ]

    @d.jsonify()
    @d.trace(log, ['subject', 'standardBoardID'])
    def getGradesWithCorrelations(self, subject=None, standardBoardID=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            grades = self._getGradesWithCorrelations(subject, standardBoardID)
            result['response']['grades'] = grades
            return result
        except Exception, e:
            log.error('get grades with correlations Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_GRADE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['subject', 'standardBoardID'])
    def getAlternateGradesWithCorrelations(self, subject=None, standardBoardID=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['grades'] = []
        result['response']['message'] = ''
        result['response']['standardboard'] = None
        result['response']['standardboardID'] = None
        result['response']['standardboardLongname'] = None

        try:
            @d.ck12_cache_region('monthly')
            def __getAlternateGradesWithCorrelations(subject, standardBoardID, result):
                country_code2Letter = ''
                grades = []
                if standardBoardID:
                    if (standardBoardID.__str__().isdigit()):
                        standardBoardID = int(standardBoardID)          #This is standardBoardID which has no grades.
                        standardBoardWithNoGr = api.getStandardBoardByID(standardBoardID)
                    else:
                        board = standardBoardID.split('.')
                        country = api.getCountry(board[0])
                        standardBoardWithNoGr = api.getStandardBoardByName(name=board[1], country=country)

                boardsWithCo = api.getStandardBoardsWithCorrelations(subject=subject)
                boardsWithCo.extend(api.getStandardBoardsWithCorrelationsForDomain(subject=subject))

                math_dict = BRANCHES_DICT['MAT']['first']
                if (math_dict.has_key('countryName')):
                    math_dict.pop('countryName')
                if (math_dict.has_key('countryCode')):
                    math_dict.pop('countryCode')
                sci_dict = BRANCHES_DICT['SCI']['first']
                if (sci_dict.has_key('countryName')):
                    sci_dict.pop('countryName')
                if (sci_dict.has_key('countryCode')):
                    sci_dict.pop('countryCode')

                if subject.__str__().title() in COURSES['MAT'].values():
                    if standardBoardWithNoGr.longname.lower() in STANDARDS_NO_CCSS:
                        result['response']['message'] = MESSAGE_DICT_NO_CCSS['MAT'] %(standardBoardWithNoGr.longname)
                        result['response']['grades'] = []
                        return result

                if subject.__str__().title() in COURSES['MAT'].values():
                    standardBoardID = BRANCHES_DICT['MAT']['first']['id']
                    grades = api.getGradesWithCorrelations(subject=subject, standardBoardID=standardBoardID)
                    grades.extend(api.getGradesWithCorrelationsForDomain(subject=subject, standardBoardID=standardBoardID))
                    if math_dict in boardsWithCo:
                        result['response']['message'] = MESSAGE_DICT['MAT'] % standardBoardWithNoGr.longname
                    else:
                        result['response']['message'] = MESSAGE_DICT['OTHERS'] % standardBoardWithNoGr.longname
                elif subject.__str__().title() in COURSES['SCI'].values():
                    standardBoardID = BRANCHES_DICT['SCI']['first']['id']
                    grades = api.getGradesWithCorrelations(subject=subject, standardBoardID=standardBoardID)
                    grades.extend(api.getGradesWithCorrelationsForDomain(subject=subject, standardBoardID=standardBoardID))
                    if sci_dict in boardsWithCo:
                        result['response']['message'] = MESSAGE_DICT['SCI'] % standardBoardWithNoGr.longname
                    else:
                        result['response']['message'] = MESSAGE_DICT['OTHERS'] % standardBoardWithNoGr.longname
                else:
                    result['response']['message'] = MESSAGE_DICT['OTHERS'] % standardBoardWithNoGr.longname

                result['response']['standardboardID'] = standardBoardID
                standardboardObject = api.getStandardBoardByID(standardBoardID)
                if not standardboardObject:
                    raise Exception((_(u'No such standardBoard: %(standardBoardID)s')  % {"standardBoardID":standardBoardID}).encode("utf-8"))

                country = api.getCountryByID(standardboardObject.countryID)
                if country:
                    country_code2Letter = country.code2Letter
                result['response']['standardboard'] = country_code2Letter+'.'+standardboardObject.name
                result['response']['standardboardName'] = standardboardObject.name
                result['response']['standardboardLongname'] = standardboardObject.longname

                gradesDict = dict([(x['id'], x) for x in grades])
                log.info("gradesDict: %s" % str(gradesDict))
                grades = [ gradesDict.get(x) for x in sorted(gradesDict.keys()) ]
                result['response']['grades'] = grades
                return result

            result = __getAlternateGradesWithCorrelations(subject, standardBoardID, result)
            return result
        except Exception, e:
            log.error('get grades with correlations Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_GRADE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['subject', 'grade'])
    def getStandardBoardsWithCorrelations(self, subject=None, grade=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            countries = api.getCountries()
            cDict = {}
            for c in countries:
                cDict[c.id] = c

            dictionary = {}

            math_dict = BRANCHES_DICT['MAT']['first']
            if (math_dict.has_key('countryName')):
                math_dict.pop('countryName')
            if (math_dict.has_key('countryCode')):
                math_dict.pop('countryCode')
            sci_dict = BRANCHES_DICT['SCI']['first']
            if (sci_dict.has_key('countryName')):
                sci_dict.pop('countryName')
            if (sci_dict.has_key('countryCode')):
                sci_dict.pop('countryCode')

            if subject.__str__().title() in COURSES['MAT'].values():
                dictionary = math_dict
            elif subject.__str__().title() in COURSES['SCI'].values():
                dictionary = sci_dict
            else:
                pass

            @d.ck12_cache_region('weekly')
            def __getStandardBoardsWithCorrelations(subject, grade, dictionary):
                boardsWithCo = api.getStandardBoardsWithCorrelationsForDomain(subject=subject, includeSequence=True)
                boardsWithCo.extend(api.getStandardBoardsWithCorrelations(subject=subject, includeSequence=True))
                #Remove duplicate standards if any
                boardsWithCo = [dict(_board) for _board in set(tuple(board.items()) for board in boardsWithCo)]
                boardsWithCo.sort(key=lambda board: (board['sequence'], board['longname']))
                if dictionary in boardsWithCo:
                    boardsWithCo.remove(dictionary)
                    boardsWithCo.insert(0, dictionary)

                for board in boardsWithCo:
                    c = cDict.get(board['countryID'])
                    del board['sequence']
                    if c:
                        board['countryCode'] = c.code2Letter
                        board['countryName'] = c.name
                return boardsWithCo

            #boards = api.getStandardBoards(pageNum=0, pageSize=100, BoardsList=True)
            boards = __getStandardBoardsWithCorrelations(subject, grade, dictionary)

            result['response']['standardBoards'] = boards
            return result
        except Exception, e:
            log.error('get standard boards with correlation Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD_BOARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageSize', 'pageNum'])
    def getStandardBoards(self, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            boards = api.getStandardBoards(pageNum=pageNum, pageSize=pageSize)
            start = (pageNum-1) * pageSize
            boardsList = [ x.asDict() for x in boards ]
            result['response']['standardBoards'] = boardsList
            result['response']['total'] = boards.getTotal()
            result['response']['limit'] = len(boards)
            result['response']['offset'] = start
            return result
        except Exception, e:
            log.error('get standard boards Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD_BOARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getStandardBoardData(self):
        """
        Provide a Standardboard id or Standardboard name ex:(US.AK), and it will return the
        Standardboard data.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        standardBoard = request.params.get('standardboard')
        boardData = {}

        try:
            if standardBoard:
                if (standardBoard.__str__().isdigit()):
                    standardBoard = int(standardBoard)
                    boardData = api.getStandardBoardByID(standardBoard).asDict()
                else:
                    board = standardBoard.split('.')
                    country = api.getCountry(board[0])
                    boardData = api.getStandardBoardByName(name=board[1], country=country).asDict()

            result['response']['boardData'] = boardData
            return result
        except Exception, e:
            log.error('get standard board data Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD_BOARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('weekly')
    def _getCorrelations(self, standardBoardID, artifactID, artifactRevisionID=0):
        standardBoardID = int(standardBoardID)
        standardBoard = api.getStandardBoardByID(id=standardBoardID)
        if not standardBoard:
            raise Exception((_(u'No such standardBoard: %(standardBoardID)d')  % {"standardBoardID":standardBoardID}).encode("utf-8"))

        artifactDict, artifact = ArtifactCache().load(artifactID, artifactRevisionID)
        if not artifact:
            raise Exception((_(u'No such artifact: %(artifactID)s')  % {"artifactID":artifactID}).encode("utf-8"))
        if artifactRevisionID:
            artifactRevisionID = int(artifactRevisionID)
            for r in artifact.revisions:
                if r.id == artifactRevisionID:
                    artifactRevision = r
                    break
        else:
            artifactRevision = artifact.revisions[0]
        if not artifactRevision:
            raise Exception((_(u'Could not find artifactRevision for id: %(artifactRevisionID)s')  % {"artifactRevisionID":artifactRevisionID}).encode("utf-8"))
        artifactRevision = api.getArtifactRevisionByID(id=artifactRevision.id)
        seq = [ -1, 0, 0, 0 ]
        level = 0
        artifactRevisionDict = {}
        artifactIDs = {}
        ret = self.__getChildSequence(artifactRevision, seq, level, artifactRevisionDict)
        artifactRevisions = api.getArtifactRevisionsByIDs(idList=artifactRevisionDict.keys())
        log.debug("artifactRevisions: %s" % artifactRevisions[0])
        for ar in artifactRevisions:
            artifactRevisionDict[ar.artifactRevisionID]['title'] = model.stripChapterName(ar.name)
            artifactRevisionDict[ar.artifactRevisionID]['perma'] = model.getArtifactPerma(ar.login, ar.handle, ar.typeName)
            artifactRevisionDict[ar.artifactRevisionID]['typeName'] = ar.typeName
            artifactRevisionDict[ar.artifactRevisionID]['id'] = ar.id
            artifactRevisionDict[ar.artifactRevisionID]['artifactRevisionID'] = ar.artifactRevisionID
            artifactIDs[ar.id] = artifactRevisionDict[ar.artifactRevisionID]
        standardDict = {}
        standards = api.getCorrelatedStandards(artifactRevisionIDs=artifactRevisionDict.keys(), standardBoardID=standardBoard.id)
        domainStds = api.getCorrelatedStandardForDomain(artifactIDs=artifactIDs.keys(), standardBoardID=standardBoard.id)
        standards.extend(domainStds)
        for std in standards:
            if not standardDict.has_key(std.standardID):
                standardDict[std.standardID] = std.standard.asDict(includeDescription=True)
            artifactRevision = artifactIDs.get(std.artifactID)
            arID = artifactRevision['artifactRevisionID']
            if not artifactRevisionDict[arID].has_key('standards'):
                artifactRevisionDict[arID]['standards'] = []
            artifactRevisionDict[arID]['standards'].append(std.standardID)
        return ret, standardDict

    @d.jsonify()
    @d.trace(log, ['standardBoardID', 'artifactID', 'artifactRevisionID'])
    def getCorrelations(self, standardBoardID, artifactID, artifactRevisionID=0):
        """
            Get correlations for an artifact and all its descendants for a given standardBoardID
            This API call may be expensive depending on the number of descendants for an artifact.
            The response is cached for a day.
            Optionally, artifactRevisionID can be specified since standard correlations are
            specific to a revision.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, standardDict = self._getCorrelations(standardBoardID, artifactID, artifactRevisionID)
            result['response']['artifacts'] = ret
            result['response']['standards'] = standardDict
            return result
        except Exception as e:
            log.error("Error getting standard correlations Exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_STANDARD_CORRELATION, str(e))

    def __getChildSequence(self, artifactRevision, seq, level, artifactRevisionDict={}):
        seq[level] += 1
        ret = {
                'sequence': '.'.join([ str(x) for x in seq[1:] ]),
                'artifactRevisionID': artifactRevision.id,
              }
        artifactRevisionDict[artifactRevision.id] = ret
        if artifactRevision.children:
            ret['children'] = []
            level += 1
            for c in artifactRevision.children:
                ret['children'].append(self.__getChildSequence(c.child, seq, level, artifactRevisionDict))
            seq[level] = 0
        return ret

    @d.ck12_cache_region('weekly')
    def _getCorrelatedStandardBoardsForArtifact(self, artifactID, artifactRevisionID=0):
        artifactDict, artifact = ArtifactCache().load(artifactID, artifactRevisionID)
        if not artifact:
            raise Exception((_(u'No such artifact: %(artifactID)s')  % {"artifactID":artifactID}).encode("utf-8"))
        if artifactRevisionID:
            artifactRevisionID = int(artifactRevisionID)
            for r in artifact.revisions:
                if r.id == artifactRevisionID:
                    artifactRevision = r
                    break
        else:
            artifactRevision = artifact.revisions[0]
        if not artifactRevision:
            raise Exception((_(u'Could not find artifactRevision for id: %(artifactRevisionID)s')  % {"artifactRevisionID":artifactRevisionID}).encode("utf-8"))

        artifactRevisionDesc = api.getArtifactDescendantRevisionIDs(artifactRevisionID=artifactRevision.id)
        artifactRevisionDesc.append(artifactRevision.id)
        standardBoards = api.getCorrelatedStandardBoardsForArtifactRevisions(artifactRevisionIDs=artifactRevisionDesc)
        artifactDesc = api.getArtifactDescendants(artifactID=artifact.id)
        artifactDesc.append(artifact.id)
        standardBoards.extend(api.getCorrelatedStandardBoardsForArtifacts(artifactIDs=artifactDesc))
        sbDict = dict([(s.id, s) for s in standardBoards])
        standardBoardsDict = [ sbDict.get(s).asDict() for s in sorted(sbDict.keys(), cmp=lambda x,y: model.StandardBoard.compare(sbDict.get(x), sbDict.get(y))) ]
        return standardBoardsDict

    @d.jsonify()
    @d.trace(log, ['artifactID', 'artifactRevisionID'])
    def getCorrelatedStandardBoardsForArtifact(self, artifactID, artifactRevisionID=0):
        """
            Get all distinct standard boards to which the given artifactID or its descendants
            are mapped.
            Use the standard board id in the response of this API to call the
            getCorrelations() API above
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response']['standardBoards'] = self._getCorrelatedStandardBoardsForArtifact(artifactID, artifactRevisionID)
            return result
        except Exception as e:
            log.error("Error getting correlated standard boards Exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_STANDARD_BOARD, str(e))

    @d.jsonify()
    @d.trace(log, [])
    def getStandardSubjects(self):
        """
            Get all subjects in standards database
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            @d.ck12_cache_region('weekly')
            def _getStandardSubjects():
                return api.getStandardSubjects()
            result['response']['subjects'] = _getStandardSubjects()
            return result
        except Exception, e:
            log.error("Error getting standard subjects: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SUBJECT, str(e))

    @d.jsonify()
    @d.trace(log, ['subjects', 'grades'])
    def getStandardStandardBoards(self, subjects=None, grades=None):
        """
            Get all standardBoards in standards database
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subjects = [ x.lower() for x in subjects.split(',') ] if subjects else None
            grades = [ x.lower() for x in grades.split(',') ] if grades else None

            @d.ck12_cache_region('weekly')
            def _getStandardStandardBoards(subjects, grades):
                countries = api.getCountries()
                cDict = {}
                for c in countries:
                    cDict[c.id] = c

                boards = api.getStandardBoardsForSubjectsGrades(subjects=subjects, grades=grades)
                if boards:
                    for b in boards:
                        b['countryCode'] = cDict.get(b['countryID']).code2Letter
                        b['countryName'] = cDict.get(b['countryID']).name
                return boards

            result['response']['standardBoards'] = _getStandardStandardBoards(subjects, grades)
            return result
        except Exception, e:
            log.error("Error getting standard standardBoards: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_STANDARD_BOARD, str(e))

    @d.jsonify()
    @d.trace(log, ['subjects', 'standardBoardIDs'])
    def getStandardGrades(self, subjects=None, standardBoardIDs=None):
        """
            Get all grades in standards database
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subjects = [ x.lower() for x in subjects.split(',') ] if subjects else None
            standardBoardIDs = [ int(x) for x in standardBoardIDs.split(',') ] if standardBoardIDs else None

            @d.ck12_cache_region('weekly')
            def _getStandardGrades(subjects, standardBoardIDs):
                grades = api.getStandardGradesForSubjectsBoards(subjects=subjects, standardBoardIDs=standardBoardIDs)
                gradesDict = dict([(x['id'], x) for x in grades])
                log.info("gradesDict: %s" % str(gradesDict))
                return [ gradesDict.get(x) for x in sorted(gradesDict.keys()) ]

            result['response']['grades'] = _getStandardGrades(subjects, standardBoardIDs)
            return result
        except Exception, e:
            log.error("Error getting standard grades: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_GRADE, str(e))

    @d.jsonify()
    @d.trace(log, ['standardBoardID'])
    def getCorrelatedStandardsForDomain(self, standardBoardID=None):
        """
            Get correlated standards for a domain and a standard board
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if standardBoardID:
                if (standardBoardID.__str__().isdigit()):
                    standardBoardID = int(standardBoardID)
                    standardBoard = api.getStandardBoardByID(standardBoardID)
                else:
                    board = standardBoardID.split('.')
                    country = api.getCountry(board[0])
                    standardBoard = api.getStandardBoardByName(name=board[1], country=country)
            else: 
                raise Exception((_(u"standardBoardID is a required parameter")))

            standardBoardID = standardBoard.id

            domainEID = request.params.get("eid")
            if domainEID:
                browseTerm = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(domainEID))
                if not browseTerm:
                    browseTerm = api.getBrowseTermByHandle(handle=domainEID)
                if not browseTerm:
                    raise Exception((_(u'No browse term of %(id)s')  % {"id":id}).encode("utf-8"))
            else:
                raise Exception((_(u'eid is a required parameter')))

            standardIDs = api.getCorrelatedStandardIDsForDomain(standardBoardID=standardBoardID, domainEID=browseTerm.encodedID)
            sids = [ x.standardID for x in standardIDs ]
            standards = api.getStandardsByIDs(ids=sids)
            sDicts = [ s.asDict(includeDescription=True) for s in standards ]
            result['response']['standards'] = sDicts
            return result
        except Exception as e:
            log.error("Error getting correlated standards for a domain: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_STANDARD_CORRELATION, str(e))

