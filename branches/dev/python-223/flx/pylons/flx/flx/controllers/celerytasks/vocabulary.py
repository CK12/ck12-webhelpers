from flx.lib.xmlwritercompat import encode_entity
from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.common import ArtifactCache
from flx.lib.gdt.downloadcsv import GDTCSVDownloader
from flx.lib.unicode_util import UnicodeDictReader
from flx.model import api, exceptions as ex
from pylons.i18n.translation import _
from tempfile import NamedTemporaryFile
from urllib import quote
import flx.controllers.user as u
import json
import logging
import os
import re

logger = logging.getLogger(__name__)

WIKI_MATH_TYPES_INFO = {
                        'math' :  { 'type':'inline', 'class':'x-ck12-math' },
                        'blockmath' :  { 'type':'block', 'class':'x-ck12-block-math' },
                        'hwpmath' :  { 'type':'alignat', 'class':'x-ck12-hwpmath' },
                  }

MATH_HTML_TEMPLATE = '<img src="__url__" class="__class__" alt="__alt__" />'

MATH_RPC = '/flx/math/'

class VocabularyLoaderTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        """
            Load the vocabularies from CSV
            CSV Structure: 
            | id | encodedids | term (<LanguageName>) | definition (<LanguageName>) | term (<LanguageName>) | definition (<LanguageName>) | ignore | action
            NOTE: 
               1) The doc accepts only the languages which are specified in core server db.  
               2) We can extend as many columns as possible for multiple language vocabularies with proper column headers along with the language name.
               3) No matter in order of columns. You can rearrage as you wise. But, the column headers are important.  
        """
        GenericTask.run(self, **kwargs)
        logger.info("Loading vocabularies from csv file: %s" % csvFilePath)
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
                if not file.closed:
                    file.close()
                csvFilePath = file.name
                logger.info("Created csvFilePath: %s" % csvFilePath)
                source = '%s|%s' % (googleDocumentName, googleWorksheetName)
            else:
                source = os.path.basename(csvFilePath)

            inf = open(csvFilePath, 'rb')
            ## Sanitize the field names to make them single word, no special chars, lower case entries like Google feed.
            csvReader = UnicodeDictReader(inf, sanitizeFieldNames=True)
            rowCnt = 1
            fields = csvReader.sanitizedFieldNames.values()
            vocabLanguages = [] 
            languages = api.getLanguages()
            languages = languages.results
            for language in languages:
                try:
                    termHeader = 'term'+language.name.lower()
                    definitionHeader = 'definition'+language.name.lower()
                    if fields.index(termHeader) >=0 and fields.index(definitionHeader) >=0:
                        vocabLanguages.append(language)
                except:
                    pass
            logger.info('Languages contained in doc %s ' % str(vocabLanguages) )
            artifactType = api.getArtifactTypeByName('lesson')
            for row in csvReader:
                rowCnt += 1
                messages = []
                try:
                    logger.info('Processing row[%d] %s' % (rowCnt, str(row)))
                    eids = row.get('encodedids').strip()
                    eids = eids.replace('\n', ',')
                    eids = eids.replace(' ', ',')
                    eids = eids.split(',')
                    logger.info(eids)
                    results = []
                    artifacts=[]
                    deletelist = []

                    ignore = row.get('ignore', '').lower()
                    if ignore == 'x': 
                        logger.info("Row: %d. Ignoring row.." % (rowCnt))
                        messages.append("Row: %d. Ignoring row.." % (rowCnt))
                        continue 

                    for eid in eids:
                        if not eid.strip():
                            continue
                        if ".L." in eid:
                            artifact = api.getArtifactByEncodedID(encodedID=eid.strip())
                            if artifact:
                                artifacts.append(artifact)
                            else:
                                logger.error("Row: %d. No artifact found for eid: %s" % (rowCnt, eid))
                                errors += 1
                                messages.append('ERROR No artifact found for eid: %s' % (eid))
                        elif len(re.findall("(\.[a-z]\.)", eid, re.I)) == 0:
                            domain = api.getBrowseTermByEncodedID(encodedID=eid)
                            if domain:
                                readModalities = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], typeIDs=[artifactType.id], ownedBy='ck12')
                                for modality in readModalities:
                                    artifact = api.getArtifactByID(id=modality.id)
                                    artifacts.append(artifact)
                            else:
                                logger.error("Row: %d. No domain concept found for eid: %s" % (rowCnt, eid))
                                errors += 1
                                messages.append('ERROR No domain concept found for eid: %s' % (eid))

                    if artifacts: 
                        for language in vocabLanguages:
                            term = row.get('term'+language.name.lower())
                            definition = row.get('definition'+language.name.lower())
                            action = row.get('action', '').lower()
                            logger.info(term)
                            logger.info(definition)   
                            if term and definition:
                                term = self.wikiToHtml(term)
                                definition = self.wikiToHtml(definition)
                                vocabulary = api.getVocabularies(term=term, definition=definition, languageID=language.id)
                                if vocabulary and len(vocabulary) > 0: 
                                    if action != 'delete': 
                                        logger.info("Vocabulary already exist. term:[%s] language:[%s]" % (term.strip(), language.name))
                                        messages.append("Vocabulary already exist. term:[%s] language:[%s]" % (term.strip(), language.name))
                                        results.append(vocabulary[0])
                                    else:
                                        deletelist.append(vocabulary[0])
                                elif action != 'delete':
                                    vocabDict = {}
                                    vocabDict['term'] = term.strip()  
                                    vocabDict['definition'] = definition.strip()
                                    vocabDict['languageID'] = language.id
                                    vocabulary = api.createVocabulary(**vocabDict) 
                                    logger.info("Vocabulary successfully created. term:[%s] language:[%s]" % (term.strip(), language.name))
                                    messages.append("Vocabulary successfully created. term:[%s] language:[%s]" % (term.strip(), language.name))
                                    results.append(vocabulary)
                            else:
                                logger.error("Row: %d. Either term or definition missing for term:[%s], definiton:[%s]" % (rowCnt, str(term), str(definition) ))
                                errors += 1
                                messages.append("ERROR: Row: %d. Either term or definition missing for term:[%s], definiton:[%s]" % (rowCnt, str(term), str(definition) ))
                    else:
                        errors += 1
                        messages.append("ERROR No artifacts found for the given EIDs: %s. Skipping ..." % str(eids))
                        logger.error("Row: %d. No artifacts found for the given EIDs: %s. Skipping ..." %(rowCnt, str(eids)))

            
                    # This will ensure that updating the vocab definition in gdoc also gets updated in db also.
                    # TODO: But, We should find a way to delete the vocab object which has no associations in the ArtifactHasVocabulary.                           
                    for artifact in artifacts:
                        need2Invalidate = False
                        for each in results:
                            createAVassociation = True
                            sequence = None 
                            artifactHasVocabulary = api.getArtifactHasVocabularies(artifactID=artifact.id, languageID=each.languageID, term=each.term)
                            if artifactHasVocabulary:
                                for av in artifactHasVocabulary:
                                    if av.vocabularyID == each.id: 
                                        # Vocabulary Already associated with the artifact.  
                                        createAVassociation = False
                                    else:
                                        # Delete the artifact-vocab association 
                                        # Where same artifactID,languageID,term present but definition different (ie: new vocab created).  
                                        sequence = av.sequence
                                        api.deleteArtifactHasVocabularies(vocabulary=av)

                            if createAVassociation:
                                kwargs={}
                                kwargs['vocabularyID'] = each.id 
                                kwargs['artifactID'] = artifact.id
                                if sequence:
                                    kwargs['sequence'] = sequence
                                api.createArtifactHasVocabulary(**kwargs)
                                need2Invalidate = True

                        for vocab in deletelist:
                            artifactHasVocabulary = api.getArtifactHasVocabularies(artifactID=artifact.id, vocabularyID=vocab.id) 
                            if artifactHasVocabulary and artifactHasVocabulary > 0: 
                                api.deleteArtifactHasVocabularies(vocabulary=artifactHasVocabulary[0])
                                need2Invalidate = True
                        if need2Invalidate:
                            api.invalidateArtifact(ArtifactCache(), artifact)

                    for vocab in deletelist:
                        try:
                            api.deleteVocabulary(id=vocab.id) 
                            logger.info("Vocabulary successfully deleted. id:[%s] term:[%s]" % (vocab.id, vocab.term))
                            messages.append("Vocabulary successfully deleted. id:[%s] term:[%s]" % (vocab.id, vocab.term))
                        except Exception, e:
                            logger.error("Row: %d. Could not delete the vocabulary: id:[%d], error:[%s]" % (rowCnt, vocab.id, str(e)), exc_info=e)
                            errors += 1
                            messages.append("ERROR: Row: %d. Could not delete the vocabulary: id:[%d], error:[%s]" % (rowCnt, vocab.id, str(e)))

                    logger.info(results)
                except Exception, e:
                    logger.error("Error processing row: [%d] %s" % (rowCnt, str(e)), exc_info=e)
                    errors += 1
                    messages.append('ERROR processing row: %s' % (str(e)))

                if messages:  
                    allMessages[rowCnt] = messages
            
            ## Out of for loop
            ret = {'errors': errors, 'rows': rowCnt, 'messages': allMessages, 'source': source}
            self.userdata = json.dumps(ret) 
            return {'errors': errors, 'rows': rowCnt, 'source': source}
        except Exception, e:
            logger.error('load vocabularies data from CSV Exception[%s]' % str(e), exc_info=e)
            raise e
        finally:
            if inf:
                inf.close()
            if os.path.exists(csvFilePath):
                os.remove(csvFilePath)

    def wikiToHtml(self, content):
        content = self.applyMathTags(content)
        return content

    def applyMathTags(self, content):
        wiki_math_pattern = re.compile(r'<\s*(?P<tag>(math|blockmath))\s*[^>]*>(.*?)</?(?P=tag)[^>]*>', re.DOTALL)
        content = wiki_math_pattern.sub(self.wikiMathToXhtmlImg, content)
        return content

    def wikiMathToXhtmlImg(self, match_object):
         wiki_img_type = match_object.group(1);
         latex_expr = match_object.group(3)
         img = WIKI_MATH_TYPES_INFO[wiki_img_type]
         url = MATH_RPC+img['type']+'/'+quote(latex_expr.encode('utf-8'))
         alt = encode_entity(latex_expr)
         img =  MATH_HTML_TEMPLATE.replace('__url__', url).replace('__class__', img["class"]).replace('__alt__', alt)
         logger.info(img)
         return img


class QuickVocabularyLoaderTask(VocabularyLoaderTask):
    """
        QuickVocabularyLoaderTask - to load vocabulary data "in-process"
        without having to schedule a task and wait for it to finish.
        Must be called with "apply()" method (see VocabularyController for an example)
    """

    recordToDB = False
