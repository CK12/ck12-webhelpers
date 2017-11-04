from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.common import ArtifactCache, BrowseTermCache
from pylons.i18n.translation import _ 
from flx.model import api
import flx.lib.helpers as h
from flx.lib.unicode_util import UnicodeDictReader, UnicodeWriter
import flx.controllers.user as u

import logging
import os
from tempfile import NamedTemporaryFile
import re
import json

logger = logging.getLogger(__name__)

class BrowseTermTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

class BrowseTermLoaderTask(BrowseTermTask):
    """ Load the browseTerm association data from a CSV file. The file format is as follows:
        | artifactID | browseTerm | browseTermType (opt) | browseTermParent (opt) | encodedID (opt) | action (opt)
          |            |            |                      |                        |                     - 'add|remove' (Assume 'add' if not specified)
          |            |            |                      |                         - Encoded ID for foundation grid term (used to break ties if "browseTerm" returns more than one browseTerms)
          |            |            |                       - Needed only when adding a new browseTerm
          |            |             - Needed only when adding a new browseTerm or to uniquely identify one 
          |             - The browseTerm to associte with artifact (this could be the encodedID for foundation grid terms (type='domain')
           - artifact id
    """

    def run(self, csvFilePath, **kwargs):
        """
            Upload the browse term mapping from CSV
        """
        BrowseTermTask.run(self, **kwargs)
        logger.info("Loading artifact-browse term association from csv file: %s" % csvFilePath)
        messages = []
        errors = 0
        updateArtifactIDs = {}
        inf = None
        try:
            inf = open(csvFilePath, 'rb')
            csvReader = UnicodeDictReader(inf)
            rowCnt = 0
            browseTermTypes = api.getBrowseTermTypesDict()
            for row in csvReader:
                try:
                    rowCnt += 1
                    logger.info('%s' % str(row))
                    if row['artifactID']:
                        artifactID = row['artifactID'].strip()
                        artifact = api.getArtifactByID(id=artifactID)
                        if not artifact:
                            ## Try eid
                            artifact = api.getArtifactByEncodedID(encodedID=artifactID)
                        member = api.getMemberByID(id=self.user)
                        u.checkOwner(member, artifact.creatorID, artifact, noweb=True)
                        browseTerm = row['browseTerm'].strip()
                        term = None
                        terms = None
                        if row['browseTermType'] == 'tag':
                            term = api.getTagTermByIDOrName(idOrName=browseTerm)
                        elif row['browseTermType'] == 'search':
                            term = api.getSearchTermByIDOrName(idOrName=browseTerm)
                        else:
                            ## First see if the term is an encodedID
                            term = api.getBrowseTermByEncodedID(encodedID=browseTerm)
                            if not term:
                                ## Otherwise, go look for terms by name
                                terms = api.getBrowseTermsByName(name=browseTerm)
                            if terms: 
                                ## BrowseTerm exists - but there are more than one that match
                                ## First try with the encodedID (this is in the last column of the CSV and is optional)

                                if row['encodedID']:
                                    for aterm in terms:
                                        if aterm.encodedID == row['encodedID'].strip():
                                            term = aterm
                                            break
                                ## Now try the term type
                                if not term:
                                    if row['browseTermType'] and browseTermTypes.has_key(row['browseTermType']):
                                        ## Choose the one that matches the term type
                                        termType = browseTermTypes[row['browseTermType']]
                                        for aterm in terms:
                                            if aterm.termTypeID == termType.id:
                                                logger.info("Found existing term id: %d, name: %s, type: %d" % (aterm.id, aterm.name, aterm.termTypeID)) 
                                                term = aterm
                                                break
                        if not term:
                            ## If action is remove, we skip rest of processing
                            if row.get('action') == 'remove':
                                messages.append('Row %d: No such browse term %s to remove' % (rowCnt, browseTerm))
                                continue
                            ## BrowseTerm does not exist - must be created
                            if row['browseTermType'] == 'tag':
                                if not term:
                                    term = api.createTagTerm(name=browseTerm)
                            elif row['browseTermType'] == 'search':
                                if not term:
                                    term = api.createSearchTerm(name=browseTerm)
                            else:
                                encodedID = None
                                if row['encodedID']:
                                    encodedID = row['encodedID'].strip()
                                if encodedID and row['browseTermType'] == 'domain':
                                    ## Should not create new domain term
                                    logger.warn("Domain type browseTerm %s does not exist. Will not create a new one" % (browseTerm))
                                    messages.append('Row: %d: Cannot create new domain type browse term %s' % (rowCnt, browseTerm))
                                    continue

                                if browseTermTypes.has_key(row['browseTermType']):
                                    termType = browseTermTypes[row['browseTermType']]
                                    if row['browseTermParent']:
                                        parentTerm = api.getBrowseTermByName(name=row['browseTermParent'])
                                        if parentTerm:
                                            term = api.createBrowseTerm(name=browseTerm, browseTermType=termType, parentID=parentTerm.id, encodedID=encodedID)
                                        else:
                                            logger.error("No such browse term parent: %s" % row['browseTermParent'])
                                    if not term:
                                        term = api.createBrowseTerm(name=browseTerm, browseTermType=termType, encodedID=encodedID)
                                else:
                                    logger.error("BrowseTermType does not exist for %s" % row['browseTermType'])
                                    errors += 1
                                    messages.append("Row %d: ERROR: BrowseTermType does not exist for %s" % (rowCnt, row['browseTermType']))

                        ## browseTerm now exists - it was either already there or we have inserted a row
                        ## Check if association already exists
                        removed = False
                        alreadyExists = False
                        if row['browseTermType'] == 'tag':
                            artifactHasBrowseTerm = api.getArtifactHasTagTerm(artifactID=artifact.id, tagTermID=term.id)
                        elif row['browseTermType'] == 'search':
                            artifactHasBrowseTerm = api.getArtifactHasSearchTerm(artifactID=artifact.id, searchTermID=term.id)
                        else:
                            artifactHasBrowseTerm = api.getArtifactHasBrowseTerm(artifactID=artifact.id, browseTermID=term.id)
                        if artifactHasBrowseTerm:
                            if row.get('action') == 'remove':
                                if row['browseTermType'] == 'tag':
                                    api.deleteArtifactHasTagTerm(artifactID=artifact.id, tagTermID=term.id)
                                elif row['browseTermType'] == 'search':
                                    api.deleteArtifactHasSearchTerm(artifactID=artifact.id, searchTermID=term.id)
                                else:
                                    api.deleteArtifactHasBrowseTerm(artifactID=artifact.id, browseTermID=term.id)
                                api.invalidateArtifact(ArtifactCache(), artifact)
                                if row['browseTermType'] not in ['tag', 'search']:
                                    api.invalidateBrowseTerm(BrowseTermCache(), term.id, artifact.creatorID)
                                updateArtifactIDs[artifact.id] = artifact.id
                                messages.append('Row %d: Removed association for artifact %s with term %s' % (rowCnt, artifact.id, term.name))
                                removed = True
                            else:
                                ## Skip - because the term exists and has no type or the term's type matches with row
                                logger.info("Already exists: %s %s" % (artifact.id, term.name))
                                alreadyExists = True

                        ## If action is remove and we could not remove it so far, it wasn't present
                        ## Skip the rest of the loop
                        if row.get('action') == 'remove':
                            if not removed:
                                messages.append('Row %d: Association for artifact %s with term %s does not exist' % (rowCnt, artifact.id, term.name))
                            continue

                        ## Add if the action is not 'remove'
                        if not alreadyExists:
                            ## Create the association
                            if row['browseTermType'] == 'tag':
                                artifactHasTagTerms = api.createArtifactHasTagTerm(artifactID=artifact.id, tagTermID=term.id)
                            elif row['browseTermType'] == 'search':
                                artifactHasSearchTerms = api.createArtifactHasSearchTerm(artifactID=artifact.id, searchTermID=term.id)
                            else:
                                artifactHasBrowseTerms = api.createArtifactHasBrowseTerm(artifactID=artifact.id, browseTermID=term.id)
                            api.invalidateArtifact(ArtifactCache(), artifact)
                            if row['browseTermType'] not in ['tag', 'search']:
                                api.invalidateBrowseTerm(BrowseTermCache(), term.id, artifact.creatorID)
                            messages.append("Row %d: Created association for artifact %s with term %s" % (rowCnt, artifact.id, term.name))
                            updateArtifactIDs[artifact.id] = artifact.id
                        else:
                            messages.append("Row %d: BrowseTerm %s already exists for artifact %s" % (rowCnt, term.name, artifact.id))
                    else:
                        logger.error("No artifactID specified for row %d" % rowCnt)
                        errors += 1
                        messages.append("Row %d: ERROR No artifactID specified. Skipping ..." % rowCnt)
                except Exception, e:
                    logger.error("Error processing row: %d %s" % (rowCnt, str(e)), exc_info=e)
                    errors += 1
                    messages.append('Row %d: ERROR processing row: %s' % (rowCnt, str(e)))

            ## Out of for loop
            if kwargs.has_key('toReindex'):
                toReindex = kwargs['toReindex']
            else:
                toReindex = True
            if toReindex:
                logger.info("Reindexing artifacts: %s" % updateArtifactIDs.keys())
                h.reindexArtifacts(artifactIds=updateArtifactIDs.keys(), user=self.user)
            ret = {'errors': errors, 'rows': rowCnt, 'messages': messages}
            self.userdata = json.dumps(ret) 
            return ret
        except Exception, e:
            logger.error('load browseTerms data from CSV Exception[%s]' % str(e), exc_info=e)
            raise e
        finally:
            if inf:
                inf.close()
            if os.path.exists(csvFilePath):
                os.remove(csvFilePath)

class QuickBrowseTermLoaderTask(BrowseTermLoaderTask):
    """
        QuickBrowseTermLoaderTask - to load browse term data "in-process"
        without having to schedule a task and wait for it to finish.
        Must be called with "apply()" method (see BrowsetermController for an example)
    """

    recordToDB = False


class BrowseTermMapper(BrowseTermTask):
    """
        Takes a book id and extracted encoded concept csv file as input and assigns concept nodes to 
        concepts and lessons.
    """

    externalEncodes = {}

    def run(self, bookID, inputCsv, **kwargs):
        """
            Create browse term association for all concepts that belong to a give bookID
            The second parameter is a CSV file that maps the concept titles to the 
            domain term encoded ids.
        """
        BrowseTermTask.run(self, **kwargs)
        logger.info("Creating a mapper for artifact-browse term association from extracted encodes CSV file: %s" % inputCsv)
        outputFile = None
        uploadFile = None

        try:
            bookID = int(bookID)
            book = api.getArtifactByID(id=bookID, typeName='book')
            if not book:
                raise Exception((_(u"No such book by id: %(bookID)s")  % {"bookID":bookID}).encode("utf-8"))

            if not os.path.exists(inputCsv):
                raise Exception((_(u"No such CSV file: %(inputCsv)s")  % {"inputCsv":inputCsv}).encode("utf-8"))

            self.loadExternalCategories(inputCsv)

            concepts = []
            artifacts = [book]
            while True:
                if not artifacts:
                    break
                artifact = artifacts.pop(0)
                for child in artifact.revisions[0].children:
                    if child.child.artifact.type.name == 'chapter':
                        artifacts.append(child.child.artifact)
                    elif child.child.artifact.type.name == 'lesson':
                        artifacts.append(child.child.artifact)
                        concepts.append(child.child.artifact)
                    elif child.child.artifact.type.name == 'concept':
                        concepts.append(child.child.artifact)

            outputFile = NamedTemporaryFile(suffix='.csv', delete=False)
            writer = UnicodeWriter(outputFile)
            writer.writerow(["artifactID","browseTerm","browseTermType","browseTermParent","encodedID"])
            rowCnt = 0

            for concept in concepts:
                try:
                    logger.info("Processing concept: %s" % concept.getTitle())
                    parent = self.getParentChapter(concept)
                    if not parent:
                        raise Exception((_(u"Could not get the parent chapter for: %(concept.getId())s")  % {"concept.getId()":concept.getId()}).encode("utf-8"))
                    chapterTitle = parent.getTitle()
                    logger.info("Chapter: %s Concept title: %s and type: %s" % (chapterTitle, concept.getTitle(), concept.type.name))
                    encode = self.getExternalCategories(concept.getTitle(), chapterTitle)
                    logger.info("Encode: %s" % encode)
                    if encode:
                        writer.writerow([concept.getId(), encode, 'domain', '', ''])
                        rowCnt += 1
                        if not concept.getEncodedId():
                            concept = api.assignNextEncode(artifactID=concept.id, encodedID=encode)
                            logger.info("Updated artifact encodedID: %s" % concept.getEncodedId())
                        logger.info("Artifact encodedID: %s" % concept.getEncodedId())
                        term = api.getBrowseTermByEncodedID(encodedID=encode)
                        if term:
                            descendants = api.getBrowseTermDescendants(id=term.id)
                            xhtml = concept.getXhtml(excludeChildContent=False)
                            for desc in descendants:
                                sectionRegex = re.compile(r'<h[0-9]\s[^<>]*>\s*%s\s*</h[0-9]>' % desc.name.strip())
                                m = sectionRegex.search(xhtml)
                                if m:
                                    writer.writerow([concept.getId(), desc.encodedID, 'domain', '', ''])
                except Exception, e:
                    logger.error("Error processing concept: %s" % str(e), exc_info=e)

            uploadFile = outputFile.name
            outputFile.close()
            logger.info("Wrote CSV file: %s" % uploadFile)
            outputFile = None

            ## Upload the terms
            loader = BrowseTermLoaderTask()
            task = loader.delay(csvFilePath=uploadFile, loglevel='INFO', user=self.user)
            ret = task.wait()
            logger.info("Return from BrowseTermLoaderTask: %s" % ret)
            return "Uploaded %d terms successfully" % rowCnt

        except Exception, e:
            logger.error("Exception processing external encodes: %s" % str(e), exc_info=e)
            raise e

        finally:
            if outputFile:
                outputFile.close()
            if os.path.exists(uploadFile):
                os.remove(uploadFile)

    def getParentChapter(self, aConcept):
        """
            Get the parent chapter for a concept or lesson - finds parent until a 'chapter' type parent is found.
        """
        typeName = ''
        parent = None
        if aConcept:
            concept = aConcept
            while typeName != 'chapter':
                if concept.revisions and concept.revisions[0] and concept.revisions[0].parents:
                    logger.debug("Type of parent: %s" % type(concept.revisions[0].parents).__name__)
                    if concept.revisions[0].parents[0] and concept.revisions[0].parents[0].parent:
                        parent = concept.revisions[0].parents[0].parent.artifact
                        if parent:
                            concept = parent
                            typeName = parent.type.name
                        else:
                            logger.error("Could not get parent for: %s" % concept.getTitle())
                            break
                    else:
                        break
                else:
                    break
        return parent

    def loadExternalCategories(self, csvFilePath):
        """
            Get domain terms from external CSV file - the expected structure of the file is:
                subject | branch | book | chapter | Encode ID | Level 1 | Level 2 | Level 3 
            The book column contains the book title, the chapter column has the chapter title,
            and the level columns have titles for lessons or concepts
        """
        logger.info("Looking for external categories from CSV File: %s" % csvFilePath)
        if csvFilePath:
            logger.info("Processing external encodes from :%s" % csvFilePath)
            csvIn = UnicodeDictReader(open(csvFilePath, mode='rb'))
            for row in csvIn:
                for l in range(1, 5):
                    level = 'Level %d' % l
                    concept = row.get(level)
                    if concept:
                        chapter = row.get('chapter')
                        key = u'%s|%s' % (chapter, concept)
                        self.externalEncodes[key] = row.get('Encode ID')
                        break
            #logger.info("The external encode dict: %s" % str(self.externalEncodes))
        else:
            logger.error('No csv file for the book. Could not load external domain terms.')

    def getExternalCategories(self, lesson_title, chapter_title):
        """
            Look up the external encoding for this lesson or concept and chapter
        """
        key = u'%s|%s' % (chapter_title, lesson_title)
        cat = self.externalEncodes.get(key)
        if cat:
            return cat.upper()
        else:
            if lesson_title.endswith(' - %s' % chapter_title):
                key = key[:-1*len(' - %s' % chapter_title)]
                cat = self.externalEncodes.get(key)
                if cat:
                    return cat.upper()
        logger.warn("Could not find external category for [%s]" % key)
        return None
    
