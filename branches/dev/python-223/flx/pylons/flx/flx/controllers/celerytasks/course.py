from flx.controllers.celerytasks.generictask import GenericTask
from pylons.i18n.translation import _ 
from flx.model import api, exceptions as ex
from flx.lib.unicode_util import UnicodeDictReader
import flx.controllers.user as u
from flx.lib.gdt.downloadcsv import GDTCSVDownloader
from tempfile import NamedTemporaryFile
import logging
import os
import json

logger = logging.getLogger(__name__)

class CourseArtifactLoaderTask(GenericTask):
    
    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact' 

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        """
           Load Artifact to Course Mapping from CSV 
        """    
        GenericTask.run(self, **kwargs)
        logger.info("Loading artifact to course mapping from csv file: %s" % csvFilePath)
        allMessages = {}
        errors = 0
        inf = None
        try:
            member = api.getMemberByID(id=self.user)
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

            if not csvFilePath:
                if not googleDocumentName:
                    raise Exception(_('Missing both google document name and csvFilePath. One of them must be present.'))
                googleUserName = self.config.get('gdt_user_login')
                googleUserPass = self.config.get('gdt_user_password')

                file = NamedTemporaryFile(suffix='.csv', dir=self.config.get('cache_share_dir'), delete=False)
                converter = GDTCSVDownloader()
                converter.gss_get(file, googleDocumentName, googleWorksheetName, googleUserName, googleUserPass)
                logger.info("googleDocument : %s file.name: %s" %(googleDocumentName, file.name))   
                if not file.closed:
                    file.close()
                csvFilePath = file.name
                logger.info("Created csvFilePath: %s" % csvFilePath)
                source = '%s|%s' % (googleDocumentName, googleWorksheetName)
            else:
                source = os.path.basename(csvFilePath)

            inf = open(csvFilePath, 'rb')
            csvReader = UnicodeDictReader(inf, sanitizeFieldNames=True)
            rowCnt = 1
            #fields = csvReader.sanitizedFieldNames.values()
 
            for row in csvReader:
                rowCnt+=1
                messages = []
                try:
                    logger.info('Processing row[%d] %s' % (rowCnt, str(row)))
                    eid = row.get('eid').strip()                                     
                    artifactID = row.get('artifactid').strip()
                    courseShortName = row.get('coursetag').strip()
                    
                    if not eid:
                        logger.info("No concept eid specified. Skipping row: %d" % rowCnt)
                        messages.append("Row [%d]: Unknown concept eid. Skipping ..." % rowCnt)
                        continue
                    
                    if not artifactID:
                        logger.info("No artifact id specified. Skipping row: %d" % rowCnt)
                        messages.append("Row [%d]: Unknown artifact id. Skipping ..." % rowCnt)
                        continue
                    
                    if not courseShortName:
                        logger.info("No course tag specified. Skipping row: %d" % rowCnt)
                        messages.append("Row [%d]: Unknown course tag. Skipping ..." % rowCnt)
                        continue
                    
                    bt = api.getBrowseTermByEncodedID(encodedID=eid)
                    if not bt:
                        s = 'Row [%d]: ERROR: Error getting browseTerm by encodedID: %s' % (rowCnt, eid)
                        logger.error(s)
                        messages.append(s)
                        continue

                    domainID = bt.id
                    kwargs={}
                    kwargs['courseShortName'] = courseShortName
                    kwargs['artifactID'] = artifactID
                    kwargs['domainID'] = domainID 
                    api.createArtifactCourse(**kwargs)
                    s = 'Row [%d]: Associated course tag %s with artifactID %s and eid %s.' %(rowCnt, courseShortName, artifactID, eid)
                    logger.info(s)
                    messages.append(s)
                    ret = {'messages': allMessages, 'rows': rowCnt-1, 'errors': errors, 'source': source}
                    self.userdata = json.dumps(ret)
                    self.updateTask() 

                except Exception, e:
                    logger.error("Row [%d]: Error saving row. %s" % (rowCnt, str(e)), exc_info=e)
                    errors += 1
                    if len(messages) < rowCnt-1:
                        messages.append('Row [%d]: ERROR: Error saving row. [%s]' % (rowCnt, str(e)))
 
                if messages:  
                    allMessages[rowCnt] = messages

            ret = {'messages': allMessages, 'rows': rowCnt-1, 'errors': errors, 'source': source}
            self.userdata = json.dumps(ret)
            return ret

        except Exception, ee:
            logger.error('load artifactID, eid and course tag data from CSV Exception[%s]' % str(ee), exc_info=ee)
            raise ee
        
        finally:
            if inf:
                inf.close()
            if os.path.exists(csvFilePath):
                os.remove(csvFilePath)

             
        
