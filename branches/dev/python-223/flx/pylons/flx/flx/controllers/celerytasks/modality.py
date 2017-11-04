from flx.controllers.celerytasks.generictask import GenericTask
from pylons.i18n.translation import _ 
from flx.model import api, model, exceptions as ex
import flx.lib.helpers as h
from flx.lib.unicode_util import UnicodeDictReader
import flx.controllers.user as u
import flx.controllers.eohelper as eohelper
import flx.lib.artifact_utils as au
from flx.controllers.common import ArtifactCache
from flx.lib.gdt.downloadcsv import GDTCSVDownloader

from tempfile import NamedTemporaryFile
from datetime import datetime
import logging
import os
import json
import urllib, urllib2

logger = logging.getLogger(__name__)

class ModalityLoaderTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        """
            Load the modalities from CSV
            CSV Structure:
            | wikiurl | concepteids | resourcelocation | filename | resourcename | type | authors | description | level | ranking | embedcode | thumbnail | contributedby | keywords | action | production | modalityid | resourceid
        """
        GenericTask.run(self, **kwargs)
        logger.info("Loading modalities from csv file: %s" % csvFilePath)
        allMessages = {}
        errors = 0
        updateArtifactIDs = {}
        inf = None
        try:
            member = api.getMemberByID(id=self.user)
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

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

            autoPublish = kwargs.get('autoPublish', False)
            logger.info("Publish Modalities : %s" % autoPublish)
            inf = open(csvFilePath, 'rb')
            ## Sanitize the field names to make them single word, no special chars, lower case entries like Google feed.
            csvReader = UnicodeDictReader(inf, sanitizeFieldNames=True)
            rowCnt = 1
            artifactTypes = api.getArtifactTypesDict()
            logger.info("Supported artifact types: %s" % artifactTypes.keys())
            resourceTypes = api.getResourceTypesObjDict()
            browseTermTypes = api.getBrowseTermTypesDict()
            levelTerms = {}
            for term in api.getBrowseTerms(termType=browseTermTypes['level']):
                levelTerms[term.name.lower()] = term
            contributorTerms = {}
            for term in api.getBrowseTerms(termType=browseTermTypes['contributor']):
                contributorTerms[term.name.lower()] = term
            ck12editor = api.getMemberByLogin(login='ck12editor')
            for row in csvReader:
                rowCnt += 1
                allMessages[rowCnt] = []
                messages = allMessages[rowCnt]
                try:
                    logger.info('Processing row[%d] %s' % (rowCnt, str(row)))
                    type = row.get('type').lower()
                    if artifactTypes.has_key(type): # and type not in ['rwa']:
                        production = row.get('production', '').strip().lower() != 'no'
                        env = self.config.get('deployment_target')
                        if env == 'production' and not production:
                            raise Exception(_('Skipping row %d since it is not for production environment.' % rowCnt))
                        artifactType = artifactTypes[type]
                        artifactID = row.get('modalityid').strip()
                        if artifactID:
                            artifactID = int(artifactID)
                        else:
                            artifactID = None
                        name = row.get('resourcename').strip()
                        artifactHandle = model.title2Handle(name)
                        owner = None
                        ownerID = row.get('ownerid')
                        if ownerID:
                            try:
                                owner = api.getMemberByID(id=int(ownerID))
                            except:
                                pass
                        if not owner:
                            owner = ck12editor
                        artifact = None
                        ## Check if artifact exists
                        if artifactID:
                            artifact = api.getArtifactByID(id=artifactID, typeName=artifactType.name, creatorID=owner.id)
                        else:
                            artifact = api.getArtifactByHandle(handle=artifactHandle, typeID=artifactType.id, creatorID=owner.id)
                        resourceType = resourceTypes[model.ARTIFACT_TYPES_MAP[type]]
                        logger.info("resourceType mapped to: %s" % resourceType)
                        if not resourceType:
                            raise Exception(_('Error getting resource type for: %s' % type))
                        eids = row.get('concepteids')
                        if eids:
                            eids = [ x.strip() for x in eids.strip().split(',') ]
                        if not eids:
                            raise Exception('Skipping row %d due to missing EIDs.' % rowCnt)
                        eidTerms = []
                        subjectTerms = []
                        for eid in eids:
                            if eid:
                                #relatedArtifact = api.getArtifactByEncodedID(encodedID=eid)
                                ## Map the new artifact with given eids
                                parts = eid.split('.')
                                #sequence = 1
                                if len(parts) > 4:
                                    eid = '.'.join(parts[:-2])
                                    #sequence = int(parts[-1])
                                term = api.getBrowseTermByEncodedID(encodedID=eid)
                                eidTerms.append(term.encodedID)
                                subjectTerms.extend(api.getSubjectsForDomainID(domainID=term.id))
                                logger.info("Subject terms: %s" % subjectTerms)
 
                        location = row.get('resourcelocation').strip()
                        if not location:
                            raise Exception(_('No location specified.'))
                        authors = row.get('authors')
                        if authors:
                            authors = [ x.strip() for x in authors.split(';') ]
                        description = row.get('description', '').strip()
                        level = row.get('level', 'basic').strip().lower()
                        if level and level not in levelTerms.keys():
                            raise Exception(_('Invalid value for level: %s' % level))

                        embedCode = row.get('embedcode', '').strip()
                        thumbnail = row.get('thumbnail', '').strip()
                        action = row.get('action', '').strip().lower()
                        license = row.get('license', 'CC BY-NC')
                        contributor = row.get('contributedby', '').strip().lower()
                        if contributor and contributor not in model.BROWSE_TERM_TYPE_CONTRIBUTOR_VALUES:
                            raise Exception(_('Invalid value for contributor: %s' % contributor))
                        keywords = row.get('keywords')
                        if keywords:
                            keywords = [ x.strip() for x in keywords.split(';') ]
                        internalTags = row.get('internaltags')
                        if internalTags:
                            internalTags = [ x.strip() for x in internalTags.split(';') ]

                        resourceID = None
                        if row.get("resourceid"):
                            resourceID = int(row.get("resourceid").strip())
                        ## Create or update artifact/resource
                        resource_info = {}
                        resource_info['resourceID'] = resourceID
                        resource_info['location'] = location
                        resource_info['resourceType'] = resourceType
                        resource_info['name'] = name
                        resource_info['owner'] = owner
                        resource_info['description'] = description
                        resource_info['authors'] = authors
                        resource_info['embedCode'] = embedCode
                        resource_info['thumbnail'] = thumbnail
                        resource_info['license'] = license
                        resourceRevision = self.createResourceRevision(resource_info, action, messages)
                        resourceRevisionList = [resourceRevision]
                        if resourceType.name:
                            #additional_types = model.RESOURCE_DEPENDENCY_MAP[resourceType.name]
                            additional_types = {'answer key':'Answer Key','answer demo':'Answer Demo'}
                            for each_type in additional_types.keys():
                                if not resourceTypes.has_key(each_type):
                                    continue
                                resourceType = resourceTypes[each_type]
                                resource_info = {}
                                location = row.get(each_type.replace(' ',''),'')
                                if not location:
                                    continue
                                resource_info['location'] = location
                                resource_info['resourceType'] = resourceType
                                resource_info['name'] = '%s %s'% (name, additional_types[each_type])
                                resource_info['owner'] = owner
                                resource_info['description'] = description
                                resource_info['authors'] = authors
                                resource_info['embedCode'] = ''
                                resource_info['thumbnail'] = ''
                                resource_info['license'] = license
                                resourceRevision = self.createResourceRevision(resource_info, action, messages)
                                resourceRevisionList.append(resourceRevision)

                        artifactRevisionID = None
                        if action != 'delete':
                            artifactID, artifactRevisionID, newArtifact = au.saveArtifact(userID=owner.id, title=name, artifactHandle=artifactHandle, xhtml=None,
                                    typeName=artifactType.name, resourceRevisions=resourceRevisionList, description=description, updateExisting=True,
                                    domainEIDs=eidTerms, level=level, contributedBy=contributor, tags=keywords, internalTags=internalTags, artifactID=artifactID)
                            if newArtifact:
                                logger.info("Created artifact %d with type: %s" % (artifactID, artifactType.name))
                                messages.append("Created artifact %d with type: %s" % (artifactID, artifactType.name))
                            else:
                                logger.info("Updated existing artifact %d with type: %s" % (artifactID, artifactType.name))
                                messages.append("Updated existing artifact %d with type: %s" % (artifactID, artifactType.name))
                            updateArtifactIDs[artifactID] = True
                            artifactRevision = api.getArtifactRevisionByID(id=artifactRevisionID)
                            if autoPublish and owner.id == ck12editor.id:
                                ## Publish only for ck12editor's content
                                api.publishArtifactRevision(artifactRevision=artifactRevision, memberID=owner.id, recursive=True)
                            api.invalidateArtifact(ArtifactCache(), artifactRevision.artifact)
                        else:
                            if artifact:
                                artifactRevisionID = artifact.revisions[0].id
                                artifactID = artifact.id
                                api.invalidateArtifact(ArtifactCache(), artifact)
                                domainIDs = api.getDomainIDsWithNoModalitiesForArtifactIDs([artifactID])
                                api.deleteRelatedArtifactsForArtifact(artifactID=artifactID)
                                api.deleteArtifact(artifact=artifact)
                                updateArtifactIDs[artifactID] = True
                                for domainID in domainIDs:
                                    updateArtifactIDs[-domainID] = True
                                logger.info("Deleted existing artifact %d with type: %s" % (artifactID, artifactType.name))
                                messages.append("Deleted existing artifact %d with type: %s" % (artifactID, artifactType.name))
                            else:
                                logger.info("Row: %d. Skip deleting of artifact because it does not exist." % (rowCnt))

                        if action != 'delete':
                            ## Delete and recreate all relatedArtifact entries
                            artifact = api.getArtifactByID(id=artifactID)
                            for st in subjectTerms:
                                if not api.getArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=st.id):
                                    api.createArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=st.id)
                    else:
                        logger.error("Unsupported artifact type [%s] specified for row %d" % (type, rowCnt))
                        errors += 1
                        messages.append("ERROR Unsupported artifact type specified: %s. Skipping ..." % (type))
                except Exception, e:
                    logger.error("Error processing row: %d %s" % (rowCnt, str(e)), exc_info=e)
                    errors += 1
                    messages.append('ERROR processing row: %s' % (str(e)))

            ## Out of for loop
            if kwargs.has_key('toReindex'):
                toReindex = kwargs['toReindex']
            else:
                toReindex = True
            if toReindex:
                logger.info("Reindexing artifacts: %s" % updateArtifactIDs.keys())
                h.reindexArtifacts(artifactIds=updateArtifactIDs.keys(), user=self.user)
            ret = {'errors': errors, 'rows': rowCnt, 'messages': allMessages, 'source': source}
            self.userdata = json.dumps(ret) 
            return {'errors': errors, 'rows': rowCnt, 'source': source}
        except Exception, e:
            logger.error('load modalities data from CSV Exception[%s]' % str(e), exc_info=e)
            raise e
        finally:
            if inf:
                inf.close()
            if csvFilePath and os.path.exists(csvFilePath):
                os.remove(csvFilePath)

    def createResourceRevision(self, resource_info, action, messages):

        resourceID = resource_info.pop('resourceID', None)
        resourceUri = resource_info['location']
        if 's3.amazonaws.' in resource_info['location']:
            resourceUri = os.path.basename(resource_info['location'])
            tmpFile = os.path.join('/tmp', resourceUri)
            logger.info("Downloading [%s] to [%s]." % (resource_info['location'], tmpFile))
            urllib.urlretrieve(resource_info['location'], tmpFile)
            if not os.path.exists(tmpFile):
                raise Exception(_('Failed to download from s3: %s' % resource_info['location']))
            resource_info['location'] = tmpFile

        resourceTypes = api.getResourceTypesObjDict()
        if resource_info['resourceType'].name in ['video', 'audio', 'interactive'] and not resource_info['embedCode']:
            resource_info['resourceType'] = resourceTypes['web']
        logger.info("Resource uri: %s, location: %s" % (resourceUri, resource_info['location']))
        handle = model.title2Handle(resource_info['name'])
        if resourceID:
            resource = api.getResourceByID(id=resourceID)
            if resource.ownerID != resource_info['owner'].id or resource.resourceTypeID != resource_info['resourceType'].id:
                logger.warn("Resource ID given but the owner and type do not match.")
                resource = None
        if not resource and resourceUri:
            resource = api.getResourceByUri(uri=resourceUri, ownerID=resource_info['owner'].id)
        if not resource and handle:
            resource = api.getResourceByHandle(handle=handle, typeID=resource_info['resourceType'].id, ownerID=resource_info['owner'].id)
        if not resource:
            ## Create resource
            if action != 'delete':
                resourceRevision = self.createResource(resource_info['location'], resource_info['name'], handle, resource_info['owner'].id, resource_info['resourceType'].name, resource_info['description'], resource_info['authors'], resource_info['license'])
                logger.info("Created resource %d with type: %s" % (resourceRevision.resource.id, resource_info['resourceType'].name))
                messages.append('Created resource %d with type: %s' % (resourceRevision.resource.id, resource_info['resourceType'].name))
            else:
                messages.append('Skipping resource.')
                logger.info("Skip creation of resource. Action: %s" % action)
                resourceRevision = None
        else:
            resourceRevision = resource.revisions[0]
            ## exists
            if action != 'delete':
                ## Update
                resourceRevision = self.updateResource(resourceRevision, resource_info['location'], resource_info['name'], resourceUri, resource_info['owner'].id, resource_info['resourceType'].name, resource_info['description'], resource_info['authors'], resource_info['license'])
                logger.info("Updated existing resource %d with type: %s" % (resourceRevision.resource.id, resource_info['resourceType'].name))
                messages.append("Updated existing resource %d with type: %s" % (resourceRevision.resource.id, resource_info['resourceType'].name))
            else:
                ## delete
                resourceID = resource.id
                api.deleteResource(resource=resource, deleteAssociations=True)
                logger.info("Deleted existing resource %d with type: %s" % (resourceID, resource_info['resourceType'].name))
                messages.append("Deleted existing resource %d with type: %s" % (resourceID, resource_info['resourceType'].name))
        if action != 'delete' and resource_info['embedCode']:
            ## Delete existing embedded object
            eo = resourceRevision.resource.getEmbeddedObject()
            if eo:
                logger.info("Deleting existing embedded object: %s" % eo.id)
                api.deleteEmbeddedObject(id=eo.id)
            ## Create/Update embedded object
            embedInfo = {'embeddable': resource_info['embedCode'], 'resourceID': resourceRevision.resource.id}
            if resource_info.get('thumbnail'):
                embedInfo['thumbnail'] = resource_info['thumbnail']
            eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(embedInfo=embedInfo, ownerID=resource_info['owner'].id)
            eo = eowrapper.createEmbeddedObject()
            logger.info("Embedded object: %s [resourceID: %d]" % (eo.id, eo.resourceID))
        return resourceRevision
    
    def createResource(self, resourcePath, name, handle, user_id, resourceType, desc, authors, license=None):
        """
            Create a new resource
        """
        try:
            logger.info("Resource Type: %s" % resourceType)
            resourceDict = {}
            if resourcePath.startswith('http'):
                resourceDict['uri'] = resourcePath
                resourceDict['uriOnly'] = True
                resourceDict['isExternal'] = True
            else:
                resourceDict['uri'] = open(resourcePath, "rb")
                resourceDict['uriOnly'] = False
                resourceDict['isExternal'] = False
            resourceDict['isAttachment'] = True
            resourceDict['isPublic'] = True
            resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceType)
            resourceDict['name'] = name
            if handle:
                resourceDict['handle'] = handle
            resourceDict['description'] = desc
            language = api.getLanguageByName(name='English')
            resourceDict['languageID'] = language.id
            resourceDict['ownerID'] = user_id   
            resourceDict['creationTime'] = datetime.now()
            resourceDict['authors'] = ', '.join(authors)
            resourceDict['license'] = license
            
            resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
            return resourceRevision
        finally:
            if not resourcePath.startswith('http') and os.path.exists(resourcePath):
                os.remove(resourcePath)

    def updateResource(self, resourceRevision, resourcePath, name, uri, ownerID, resourceTypeName, description, authors, license):
        """
            Update an existing resource
        """
        try:
            resource = resourceRevision.resource
            if resource:
                member = api.getMemberByID(id=ownerID)
                resourceDict = {}
                resourceDict['id'] = resource.id
                resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceTypeName)
                if resource.name != name:
                    resourceDict['handle'] = model.resourceName2Handle(resource.name)
                resourceDict['resourceName'] = name
                resourceDict['resourceDesc'] = description
                resourceDict['authors'] = ', '.join(authors)
                resourceDict['license'] = license
                resourceDict['ownerID'] = ownerID
                if uri.startswith('http'):
                    resourceDict['isExternal'] = True
                    resourceDict['uriOnly'] = True
                    resourceDict['uri'] = uri
                else:
                    resourceDict['isExternal'] = False
                    resourceDict['uriOnly'] = False
                    resourceDict['uri'] = open(resourcePath, 'rb')
                resourceDict['isAttachment'] = True
                resourceDict['isPublic'] = True
                resourceDict['resourceRevision'] = resourceRevision
                resourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member, commit=True)
                try:
                    ## Invalidate the resource cache
                    perma = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                    if perma:
                        logger.info("Trying to clear cache for: %s" % perma)
                        r = urllib2.urlopen(perma + '?nocache=true', timeout=10)
                except Exception, e:
                    logger.error("Error clearing resource cache on update: %s" % str(e), exc_info=e)
                return resourceRevision
            else:
                raise Exception('No resource to update!')
        finally:
            if not resourcePath.startswith('http') and os.path.exists(resourcePath):
                os.remove(resourcePath)

class QuickModalityLoaderTask(ModalityLoaderTask):
    """
        QuickModalityLoaderTask - to load modality data "in-process"
        without having to schedule a task and wait for it to finish.
        Must be called with "apply()" method (see ModalityController for an example)
    """

    recordToDB = False


