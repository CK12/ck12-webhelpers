from flx.model import meta, model, api, utils
from flx.model import exceptions
from flx.lib.localtime import Local
from flx.controllers import user
from sqlalchemy import orm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import exc
from urllib import quote, unquote
from sqlalchemy.sql import func, and_
import json
import zlib
import re
#import hashlib
import logging
from datetime import datetime
from flx.lib import helpers
#from pylons import config, request, response, tmpl_context as c
from pylons import config
from flx.model.resourceDataManager import ResourceDataManager
from flx.model.memberDataManager import MemberDataManager
#from flx.model.model import ArtifactType
from flx.model.audit_trail import AuditTrail
import base64
from flx.model.mongo import collectionNode, conceptnode

log = logging.getLogger(__name__)

class ArtifactDataModel(object):

    #Static branchInfosMap
    branchInfos = {
        "EM1": {
          "handle": "Elementary-Math-Grade-1",
          "name": "Elementary Math Grade 1",
          "shortname": "EM1"
        },
        "EM2": {
          "handle": "Elementary-Math-Grade-2",
          "name": "Elementary Math Grade 2",
          "shortname": "EM2"
        },
        "EM3": {
          "handle": "Elementary-Math-Grade-3",
          "name": "Elementary Math Grade 3",
          "shortname": "EM3"
        },
        "EM4": {
          "handle": "Elementary-Math-Grade-4",
          "name": "Elementary Math Grade 4",
          "shortname": "EM4"
        },
        "EM5": {
          "handle": "Elementary-Math-Grade-5",
          "name": "Elementary Math Grade 5",
          "shortname": "EM5"
        },
        "ARI": {
          "handle": "Arithmetic",
          "name": "Arithmetic",
          "shortname": "ARI"
        },
        "MEA": {
          "handle": "Measurement",
          "name": "Measurement",
          "shortname": "MEA"
        },
        "ALG": {
          "handle": "Algebra",
          "name": "Algebra",
          "shortname": "ALG"
        },
        "GEO": {
          "handle": "Geometry",
          "name": "Geometry",
          "shortname": "GEO"
        },
        "PRB": {
          "handle": "Probability",
          "name": "Probability",
          "shortname": "PRB"
        },
        "STA": {
          "handle": "Statistics",
          "name": "Statistics",
          "shortname": "STA"
        },
        "TRG": {
          "handle": "Trigonometry",
          "name": "Trigonometry",
          "shortname": "TRG"
        },
        "ALY": {
          "handle": "Analysis",
          "name": "Analysis",
          "shortname": "ALY"
        },
        "CAL": {
          "handle": "Calculus",
          "name": "Calculus",
          "shortname": "CAL"
        },
        "ESC": {
          "handle": "Earth-Science",
          "name": "Earth Science",
          "shortname": "ESC"
        },
        "LSC": {
          "handle": "Life-Science",
          "name": "Life Science",
          "shortname": "LSC"
        },
        "PSC": {
          "handle": "Physical-Science",
          "name": "Physical Science",
          "shortname": "PSC"
        },
        "BIO": {
          "handle": "Biology",
          "name": "Biology",
          "shortname": "BIO"
        },
        "CHE": {
          "handle": "Chemistry",
          "name": "Chemistry",
          "shortname": "CHE"
        },
        "PHY": {
          "handle": "Physics",
          "name": "Physics",
          "shortname": "PHY"
        },
        "TST": {
          "handle": "Software-Testing",
          "name": "Software Testing",
          "shortname": "TST",
        },
        "SPL": {
          "handle": "Spelling",
          "name": "Spelling",
          "shortname": "SPL"
        },
        "HIS": {
          "handle": "History",
          "name": "History",
          "shortname": "HIS"
        }            
    }

    #Static subjectInfosMap
    subjectInfos = {
        "MAT": {
          "handle": "Mathematics",
          "name": "Mathematics",
          "shortname": "MAT",
        },
        "SCI": {
          "handle": "Science",
          "name": "Science",
          "shortname": "SCI",
        },
        "ENG": {
          "handle": "Engineering",
          "name": "Engineering",
          "shortname": "ENG",
        },
        "TEC": {
          "handle": "Technology",
          "name": "Technology",
          "shortname": "TEC",
        },
        "SOC": {
          "handle": "Social-Science",
          "name": "Social Science",
          "shortname": "SOC",
        },
        "ELA": {
          "handle": "English",
          "name": "English",
          "shortname": "ELA",
        }
    }

    def __init__(self):
        self.requestTimeStamp = datetime.now()
        self.collectionNode = collectionNode.CollectionNode(model.Artifact.getMongoDB())
        self.conceptNode = conceptnode.ConceptNode(model.Artifact.getMongoDB())

    def _convertTitleToHandle(self, title):
        handle = title
        if handle:
            h = handle
            while True:
                handle = unquote(h)
                if handle == h:
                    break
                h = handle
            
            #Remove unsafe characters.
            for ch in [ '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '/', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '`', '{', '|', '}', '~' ]:
                handle = handle.replace(ch, '')
            
            #Change space to '-' and Reduce repeating '-' into a single one.
            handle = handle.replace(' ', '-')
            handle = re.sub(r'(-)\1+', r'\1', handle)
        return handle

    def _appendBookNameToChapterName(self, chapterName, bookName):
        pattern = model.getChapterSeparator()
        chapterName = unquote(chapterName)
        bookName = unquote(bookName)
        names = re.split(pattern, chapterName)
        name = '%s%s%s' % (names[0], pattern, bookName)
        return name

    def _generateDetailedCodeForEmbeddedObject(self, embeddedObjectDO, embeddedObjectResourcePerma):
        if not isinstance(embeddedObjectDO, model.EmbeddedObject) or not embeddedObjectDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid embeddedObjectDO : [{embeddedObjectDO}] received.".format(embeddedObjectDO=embeddedObjectDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(embeddedObjectDO):
            raise exceptions.InvalidArgumentException(u"Given embeddedObjectDO with embeddedObjectID : [{embeddedObjectID}] is not attached to the current session.".format(embeddedObjectID=embeddedObjectDO.id).encode('utf-8'))
        
        if not isinstance(embeddedObjectResourcePerma, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid embeddedObjectResourcePerma : [{embeddedObjectResourcePerma}] received.".format(embeddedObjectResourcePerma=embeddedObjectResourcePerma).encode('utf-8'))

        schemaOrgTag = '<div itemprop="video" itemscope itemtype="http://schema.org/VideoObject">'
        if embeddedObjectDO.description:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="description" content="%s" />' %(quote(embeddedObjectDO.description))
        if embeddedObjectDO.thumbnail:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="image" content="%s" />' %(embeddedObjectDO.thumbnail)
        if embeddedObjectDO.caption:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="name" content="%s" />' %(embeddedObjectDO.caption)
        if embeddedObjectResourcePerma:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="url" content="%s" />' %(embeddedObjectResourcePerma)

        iframeAttributes = ''
        if embeddedObjectDO.id:
            iframeAttributes = iframeAttributes + 'name="%s" ' %(embeddedObjectDO.id)
        if embeddedObjectDO.caption:
            iframeAttributes = iframeAttributes + 'title="%s" ' %(embeddedObjectDO.caption)
        if embeddedObjectDO.description:
            iframeAttributes = iframeAttributes + 'longdesc="%s" ' %(quote(embeddedObjectDO.description))
        embeddedObjectDO.className = 'x-ck12-%s' % embeddedObjectDO.type.replace(' ', '_')
        if embeddedObjectDO.className:
            iframeAttributes = iframeAttributes + 'class="%s" ' %(embeddedObjectDO.className)
        if embeddedObjectDO.width:
            iframeAttributes = iframeAttributes + 'width="%s" ' %(embeddedObjectDO.width)
        if embeddedObjectDO.height:
            iframeAttributes = iframeAttributes + 'height="%s" ' %(embeddedObjectDO.height)
        if embeddedObjectResourcePerma:
            iframeAttributes = iframeAttributes + 'src="%s" ' %(embeddedObjectResourcePerma)
        iframeAttributes = iframeAttributes + 'frameborder="0" '
        iframe = '<iframe ' + iframeAttributes + '> </iframe>'
        iframe = schemaOrgTag + iframe + '</div>'
        return iframe

    def _processRawContentXHTML(self, rawContentXHTML, resourceSatelliteURLsDict):
        if not isinstance(rawContentXHTML, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid rawContentXHTML : [{rawContentXHTML}] received.".format(rawContentXHTML=rawContentXHTML).encode('utf-8'))        

        if not isinstance(resourceSatelliteURLsDict, dict):
            raise exceptions.InvalidArgumentException(u"Invalid resourceSatelliteURLsDict : [{resourceSatelliteURLsDict}] received.".format(resourceSatelliteURLsDict=resourceSatelliteURLsDict).encode('utf-8'))        

        imageTagRegex = re.compile('<img.*?>', re.DOTALL)
        imageTagSourceRegex = re.compile('(src="(.*?)")', re.DOTALL)
        imageTagClassRegex = re.compile('class="(.*?)"', re.DOTALL)
        regularImageRegex = re.compile('.*?flx/show/(.*)', re.DOTALL)
        regularImageOldRegex = re.compile('.*?flx/render/([^"]*)', re.DOTALL)
        mathImageRegex = re.compile('.*?flx/math/(.*)',re.DOTALL)
        mathImageClassRegex = re.compile('x-ck12-.*?math',re.DOTALL)
        mathImageClassMap = {'inline': 'math', 'block': 'block-math', 'alignat': 'hwpmath'}
        
        imageTags = imageTagRegex.findall(rawContentXHTML)
        for imageTag in imageTags:
            newImageTag = imageTag
            imageTagSources = imageTagSourceRegex.findall(imageTag)
            imageTagClasses = imageTagClassRegex.findall(imageTag)

            for index, imageTagSource in enumerate(imageTagSources):
                imageTagSourceTag = imageTagSource[0]
                imageTagActualSource = imageTagSource[1]
                newImageTagActualSource = imageTagActualSource
                if not imageTagActualSource.startswith('data'):
                    #imageTag is not base64 image with data already being in the HTML
                    #might need some processing - only the embeded flxImages, mathImages will be processed here
                    regularImages = regularImageRegex.findall(imageTagActualSource)
                    regularImagesOld = regularImageOldRegex.findall(imageTagActualSource)
                    if regularImagesOld:
                        regularImages.extend(regularImagesOld)

                    if regularImages: 
                        #case of image being a regular flxImage (either old or new)                 
                        for regularImage in regularImages:
                            regularImagePathElements = regularImage.split("/")
                            if len(regularImagePathElements) == 6:
                                regularImageStreamtype = regularImagePathElements[2]
                                regularImageType = regularImagePathElements[3]
                                regularImageRealm = regularImagePathElements[4]
                                regularImageHandle = regularImagePathElements[5]
                            elif len(regularImagePathElements) == 5:
                                regularImageStreamtype = regularImagePathElements[2]
                                regularImageType = regularImagePathElements[3]
                                regularImageHandle = regularImagePathElements[4]
                                regularImageRealm = None
                            elif len(regularImagePathElements) == 4:
                                regularImageStreamtype = regularImagePathElements[0]
                                regularImageType = regularImagePathElements[1]
                                regularImageRealm = regularImagePathElements[2]
                                regularImageHandle = regularImagePathElements[3]
                            elif len(regularImagePathElements) == 3:
                                regularImageHandle = regularImagePathElements[2]
                                if regularImagePathElements[0] in model.STREAM_TYPES:
                                    regularImageStreamtype = regularImagePathElements[0]
                                    regularImageType = regularImagePathElements[1]
                                    regularImageRealm = None
                                else: 
                                    regularImageStreamtype = 'default'
                                    regularImageType = regularImagePathElements[0]
                                    regularImageRealm = regularImagePathElements[1]                        
                            elif len(regularImagePathElements) == 2:
                                regularImageStreamtype = 'default'
                                regularImageType = regularImagePathElements[0]
                                regularImageRealm = None
                                regularImageHandle = regularImagePathElements[1]
                            else:
                                continue #regularImage with invalid format received - just ignore
                            
                            if regularImageRealm is None:
                                regularImageRealm = 'user:ck12editor'
                            regularImageRealm = unquote(regularImageRealm)
                            regularImageHandle = unquote(regularImageHandle)
                            regularImageType = unquote(regularImageType)
                            regularImageHash = regularImageType+"-"+regularImageHandle+"-"+regularImageRealm
                            if resourceSatelliteURLsDict.has_key(regularImageHash):
                                newRegularImage = resourceSatelliteURLsDict[regularImageHash]
                                if regularImageStreamtype and regularImageStreamtype not in ['default', 'DEFAULT']:
                                    for typeName in ['IMAGE', 'COVER_PAGE']: ## Apply the correct stream size for the image
                                        typeNameStream = "%s_%s" % (typeName, regularImageStreamtype)
                                        if typeName in newRegularImage and typeNameStream not in newRegularImage:
                                            newRegularImage = newRegularImage.replace(typeName, typeNameStream)
                                            break
                                newImageTagActualSource = newImageTagActualSource.replace(regularImage, newRegularImage)

                            else:
                                log.debug("Image is not found in the attached resources to this revision: Image: %s" % regularImage)
                                continue #regularImage is not found in the attached resources to this revision - ignore
                    else:
                        #case of the image not being a regular flxImage, check and process if it is a mathImage
                        if len(imageTagClasses) > index and mathImageClassRegex.search(imageTagClasses[index].lower()):
                            mathImages = mathImageRegex.findall(imageTagActualSource)
                            if mathImages:                            
                                mathImage = mathImages[0] #we create the new imageActualSource only from the firstMathImage in the currentActualSource unlike regular flxImages as above.
                            else:
                                continue #no mathImages found - ignore.
                            mathImageElements = mathImage.split('/')
                            if mathImageElements:
                                mathImageTarget = mathImageElements[-1]
                                mathImageType = mathImageElements[0]
                            else:
                                continue #mathImage with invalid format received - ignore.
                            if mathImageTarget.lower() == 'kindle':
                                mathImageLatex = "/".join(mathImageElements[1:-1])
                            else:
                                mathImageTarget = 'web'
                                mathImageLatex = "/".join(mathImageElements[1:])
                            mathImageClass = mathImageClassMap.get(mathImageType, 'math')
                            mathImageSource = '<span class="x-ck12-mathEditor" data-mathmethod="%s" data-contenteditable="false" data-edithtml="" data-tex="%s" data-math-class="x-ck12-%s"></span>' % (mathImageType, mathImageLatex, mathImageClass)
                            
                            if newImageTagActualSource == imageTagActualSource:
                                newImageTagActualSource = mathImageSource
                            else:
                                newImageTagActualSource = newImageTagActualSource+' '+mathImageSource
                else:
                    continue #image is a base64 image with data already being in the HTML

                if newImageTagActualSource != imageTagActualSource:
                    if newImageTagActualSource.startswith('<span'):
                        newImageTag = newImageTagActualSource #case of source already handling the tagInformation..etc(mathImages)
                    else:
                        newRegularImages = regularImageRegex.findall(newImageTagActualSource)
                        if not newRegularImages:
                            newRegularImages = regularImageOldRegex.findall(newImageTagActualSource)
                        
                        newImageTagActualSource = ''
                        for newRegularImage in newRegularImages:
                            newImageTagActualSource = newImageTagActualSource+' '+newRegularImage
                        newImageTagSourceTag = 'data-flx-url="%s" src="%s"'%(imageTagActualSource, newImageTagActualSource)
                        newImageTag = newImageTag.replace(imageTagSourceTag, newImageTagSourceTag)
                        newImageTag = newImageTag.encode("utf-8")

            if newImageTag != imageTag:
                rawContentXHTML = rawContentXHTML.replace(imageTag, newImageTag)

        return rawContentXHTML

    def _generateArtifactResourceSatelliteURLsDict(self, artifactRevisionDO):
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))
                   
        artifactResourceSatelliteURLsDict = {}
        for artifactRevisionResourceRevisionDO in artifactRevisionDO.resourceRevisions:
            artifactResourceTypeName = ''
            artifactResourceHandle = ''
            artifactResourceRealm = ''
            if artifactRevisionResourceRevisionDO.resource and artifactRevisionResourceRevisionDO.resource.satelliteUrl:
                if artifactRevisionResourceRevisionDO.resource.handle:
                    artifactResourceHandle = artifactRevisionResourceRevisionDO.resource.handle

                if artifactRevisionResourceRevisionDO.resource.type and artifactRevisionResourceRevisionDO.resource.type.name:
                    artifactResourceTypeName = artifactRevisionResourceRevisionDO.resource.type.name

                if artifactRevisionResourceRevisionDO.resource.owner and artifactRevisionResourceRevisionDO.resource.owner.login:
                    artifactResourceRealm = 'user:'+artifactRevisionResourceRevisionDO.resource.owner.login
                
                if artifactResourceTypeName or artifactResourceHandle or artifactResourceRealm:
                    artifactResourceHash = artifactResourceTypeName+"-"+artifactResourceHandle+"-"+artifactResourceRealm
                    artifactResourceSatelliteURLsDict[artifactResourceHash] = artifactRevisionResourceRevisionDO.resource.satelliteUrl
        return artifactResourceSatelliteURLsDict

    def _extractArtifactRevisionContentRevisionDO(self, artifactRevisionDO):
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))

        artifactRevisionContentRevisionDO = None
        for artifactRevisionResourceRevisionDO in artifactRevisionDO.resourceRevisions:
            if artifactRevisionResourceRevisionDO.resource and artifactRevisionResourceRevisionDO.resource.type and artifactRevisionResourceRevisionDO.resource.type.name and artifactRevisionResourceRevisionDO.resource.type.name == 'contents':
                if not artifactRevisionContentRevisionDO or artifactRevisionResourceRevisionDO.id > artifactRevisionContentRevisionDO.id:
                    artifactRevisionContentRevisionDO = artifactRevisionResourceRevisionDO
        return artifactRevisionContentRevisionDO

    def generateArtifactDict(self, artifactDO, artifactRevisionDO, includeExtendedArtifacts=False, includeAuthors=False, includeFeedbacks=False, includeFeedbackHelpfuls=False, includeFeedbackAbuseReports=False, includeFeedbackReviews=False, includeFeedbackReviewAbuseReports=True, includeFeedbackAggregateScores=False, includeResources=False, includeAllResources=False, includeResourceAbuseReports=False, includeInlineDocuments=False, includeEmbeddedObjects=False, includeContent=False, includeProcessedContent=False, includeRevisionStandards=False, includeRevisionStandardGrades=False, includeChildren=False, includeGrandChildren=False, includeBrowseTerms=False, includeBrowseTermStandards=False, includeBrowseTermStandardGrades=False, includeTagTerms=False, includeSearchTerms=False, includeVocabularies=False, includeDomainCollectionContexts=False, includeCoverImage=False):
        if not isinstance(artifactDO, model.Artifact) or not artifactDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactDO : [{artifactDO}] received.".format(artifactDO=artifactDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactDO):
            raise exceptions.InvalidArgumentException(u"Given artifactDO with artifactID : [{artifactID}] is not attached to the current session.".format(artifactID=artifactDO.id).encode('utf-8'))
        
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))
            
        if artifactDO.id != artifactRevisionDO.artifactID:
            raise exceptions.InvalidArgumentException(u"Given artifactDO with artifactID: [{artifactID}] and artifactRevisionDO with artifactRevisionID : [{artifactRevisionID}] doesn't belong to each other.".format(artifactID=artifactDO.id, artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))

        artifactDict = {}
        artifactDict[u'id'] = artifactDO.id
        if artifactDO.name:
            artifactDict[u'title'] = artifactDO.name
        if artifactDO.handle:
            artifactDict[u'handle'] = artifactDO.handle
        if artifactDO.encodedID:
            artifactDict[u'encodedID'] = artifactDO.encodedID
        if artifactDO.description:
            artifactDict[u'description'] = artifactDO.description
        if artifactDO.creationTime:
            artifactDict[u'createdTime'] = str(artifactDO.creationTime)
        if artifactDO.updateTime:
            artifactDict[u'updatedTime'] = str(artifactDO.updateTime)
        
        #artifactType
        artifactTypeDO = artifactDO.type
        if artifactTypeDO:
            artifactTypeDict = {}
            artifactTypeDict[u'id'] = artifactTypeDO.id
            if artifactTypeDO.name:
                artifactTypeDict[u'name'] = artifactTypeDO.name
            if artifactTypeDO.extensionType:
                artifactTypeDict[u'extension'] = artifactTypeDO.extensionType
            if artifactTypeDO.description:
                artifactTypeDict[u'description'] = artifactTypeDO.description
            if artifactTypeDO.modality:
                artifactTypeDict[u'isModality'] = True
            else:
                artifactTypeDict[u'isModality'] = False
            artifactDict[u'type'] = artifactTypeDict

        #artifactLicense
        artifactLicenseDO = artifactDO.license
        if artifactLicenseDO:
            artifactLicenseDict = {}
            artifactLicenseDict[u'id'] = artifactLicenseDO.id
            if artifactLicenseDO.name:
                artifactLicenseDict[u'name'] = artifactLicenseDO.name
            if artifactLicenseDO.description:
                artifactLicenseDict[u'description'] = artifactLicenseDO.description
            artifactDict[u'license'] = artifactLicenseDict

        #artifactCreator
        artifactCreatorDO = artifactDO.creator
        if artifactCreatorDO:
            artifactCreatorDict = {}
            artifactCreatorDict[u'id'] = artifactCreatorDO.id
            if artifactCreatorDO.login:
                artifactCreatorDict[u'login'] = artifactCreatorDO.login
            """if artifactCreatorDO.defaultLogin:
                artifactCreatorDict[u'defaultLogin'] = artifactCreatorDO.defaultLogin
            if artifactCreatorDO.email:
                artifactCreatorDict[u'email'] = artifactCreatorDO.email"""
            if artifactCreatorDO.givenName:
                artifactCreatorDict[u'name'] = artifactCreatorDO.givenName
            if artifactCreatorDO.surname:
                artifactCreatorDict[u'surName'] = artifactCreatorDO.surname
            """if artifactCreatorDO.timezone:
                artifactCreatorDict[u'timeZone'] = artifactCreatorDO.timezone"""
            artifactDict[u'creator'] = artifactCreatorDict

        #artifactAncestor
        artifactAncestorDO = artifactDO.ancestor
        if artifactDO.ancestor:
            artifactAncestorDict = {}
            artifactAncestorDict[u'revisionID'] = artifactAncestorDO.id           
            artifactAncestorArtifactDO = artifactAncestorDO.artifact
            if artifactAncestorArtifactDO:
                artifactAncestorDict[u'id'] = artifactAncestorArtifactDO.id
                if artifactAncestorArtifactDO.name:
                    artifactAncestorDict[u'title'] = artifactAncestorArtifactDO.name
                if artifactAncestorArtifactDO.handle:
                    artifactAncestorDict[u'handle'] = artifactAncestorArtifactDO.handle
                if artifactAncestorArtifactDO.encodedID:
                    artifactAncestorDict[u'encodedID'] = artifactAncestorArtifactDO.encodedID
                if artifactAncestorArtifactDO.description:
                    artifactAncestorDict[u'description'] = artifactAncestorArtifactDO.description
                if artifactAncestorArtifactDO.type and artifactAncestorArtifactDO.type.name:
                    artifactAncestorDict[u'type'] = artifactAncestorArtifactDO.type.name
                if artifactAncestorArtifactDO.creator and artifactAncestorArtifactDO.creator.login:
                    artifactAncestorDict[u'creator'] = artifactAncestorArtifactDO.creator.login
                if artifactAncestorArtifactDO.creationTime:
                    artifactAncestorDict[u'createdTime'] = str(artifactAncestorArtifactDO.creationTime)
                if artifactAncestorArtifactDO.updateTime:
                    artifactAncestorDict[u'updatedTime'] = str(artifactAncestorArtifactDO.updateTime)
            artifactDict[u'ancestor'] = artifactAncestorDict

        #artifactExtendors
        if includeExtendedArtifacts is True:
            if artifactDO.encodedID:
                artifactExtendedArtifactDOs = meta.Session.query(model.Artifact).filter(model.Artifact.encodedID == artifactDO.encodedID).all()
                artifactExtendedArtifactDictList = []
                for artifactExtendedArtifactDO in artifactExtendedArtifactDOs:
                    if artifactExtendedArtifactDO.id != artifactDO.id:
                        artifactExtendedArtifactDict = {}
                        artifactExtendedArtifactDict[u'id'] = artifactExtendedArtifactDO.id
                        if artifactExtendedArtifactDO.name:
                            artifactExtendedArtifactDict[u'title'] = artifactExtendedArtifactDO.name
                        if artifactExtendedArtifactDO.handle:
                            artifactExtendedArtifactDict[u'handle'] = artifactExtendedArtifactDO.handle
                        if artifactExtendedArtifactDO.encodedID:
                            artifactExtendedArtifactDict[u'encodedID'] = artifactExtendedArtifactDO.encodedID
                        if artifactExtendedArtifactDO.description:
                            artifactExtendedArtifactDict[u'description'] = artifactExtendedArtifactDO.description
                        if artifactExtendedArtifactDO.type and artifactExtendedArtifactDO.type.name:
                            artifactExtendedArtifactDict[u'type'] = artifactExtendedArtifactDO.type.name
                        if artifactExtendedArtifactDO.creator and artifactExtendedArtifactDO.creator.login:
                            artifactExtendedArtifactDict[u'creator'] = artifactExtendedArtifactDO.creator.login
                        if artifactExtendedArtifactDO.creationTime:
                            artifactExtendedArtifactDict[u'createdTime'] = str(artifactExtendedArtifactDO.creationTime)
                        if artifactExtendedArtifactDO.updateTime:
                            artifactExtendedArtifactDict[u'updatedTime'] = str(artifactExtendedArtifactDO.updateTime)                
                        artifactExtendedArtifactDictList.append(artifactExtendedArtifactDict)
                artifactDict[u'extendedArtifacts'] = artifactExtendedArtifactDictList

        #artifactAuthors
        if includeAuthors is True:
            artifactAuthorDOs = artifactDO.authors
            artifactAuthorDictList = []
            for artifactAuthorDO in artifactAuthorDOs:
                artifactAuthorDict = {}
                artifactAuthorDict[u'name'] = artifactAuthorDO.name
                if artifactAuthorDO.sequence:
                    artifactAuthorDict[u'sequence'] = artifactAuthorDO.sequence
                
                artifactAuthorRoleDO = artifactAuthorDO.role
                if artifactAuthorRoleDO:
                    artifactAuthorRoleDict = {}
                    artifactAuthorRoleDict[u'id'] = artifactAuthorRoleDO.id
                    if artifactAuthorRoleDO.name:
                        artifactAuthorRoleDict[u'name'] = artifactAuthorRoleDO.name
                    if artifactAuthorRoleDO.description:
                        artifactAuthorRoleDict[u'description'] = artifactAuthorRoleDO.description
                    artifactAuthorDict[u'role'] = artifactAuthorRoleDict

                artifactAuthorDictList.append(artifactAuthorDict)
            artifactDict[u'authors'] = artifactAuthorDictList

        #artifactFeedbacks
        if includeFeedbacks is True:
            artifactFeedbackDOs = artifactDO.feedBacks
            artifactFeedbackDictList = []
            for artifactFeedbackDO in artifactFeedbackDOs:
                artifactFeedbackDict = {}
                artifactFeedbackDict[u'type'] = artifactFeedbackDO.type
                if artifactFeedbackDO.score:
                    artifactFeedbackDict[u'score'] = artifactFeedbackDO.score
                if artifactFeedbackDO.comments:
                    artifactFeedbackDict[u'comment'] = artifactFeedbackDO.comments
                if artifactFeedbackDO.creationTime:
                    artifactFeedbackDict[u'createdTime'] = str(artifactFeedbackDO.creationTime)
                if artifactFeedbackDO.isApproved:
                    artifactFeedbackDict[u'isApproved'] = True
                else:
                    artifactFeedbackDict[u'isApproved'] = False
               
                artifactFeedbackCreatorDO = artifactFeedbackDO.member
                if artifactFeedbackCreatorDO:
                    artifactFeedbackCreatorDict = {}
                    artifactFeedbackCreatorDict[u'id'] = artifactFeedbackCreatorDO.id
                    if artifactFeedbackCreatorDO.login:
                        artifactFeedbackCreatorDict[u'login'] = artifactFeedbackCreatorDO.login
                    """if artifactFeedbackCreatorDO.defaultLogin:
                        artifactFeedbackCreatorDict[u'defaultLogin'] = artifactFeedbackCreatorDO.defaultLogin
                    if artifactFeedbackCreatorDO.email:
                        artifactFeedbackCreatorDict[u'email'] = artifactFeedbackCreatorDO.email"""
                    if artifactFeedbackCreatorDO.givenName:
                        artifactFeedbackCreatorDict[u'name'] = artifactFeedbackCreatorDO.givenName
                    if artifactFeedbackCreatorDO.surname:
                        artifactFeedbackCreatorDict[u'surName'] = artifactFeedbackCreatorDO.surname
                    """if artifactFeedbackCreatorDO.timezone:
                        artifactFeedbackCreatorDict[u'timeZone'] = artifactFeedbackCreatorDO.timezone"""
                    artifactFeedbackDict[u'creator'] = artifactFeedbackCreatorDict
            
                if includeFeedbackHelpfuls:
                    artifactFeedbackHelpfulDictList = []
                    totalHelpfuls = 0
                    totalPositiveHelpfuls = 0
                    totalNegativeHelpfuls = 0
                    for artifactFeedbackHelpfulDO in artifactFeedbackDO.helpfuls:
                        artifactFeedbackHelpfulDict = {}
                        totalHelpfuls = totalHelpfuls+1
                        if artifactFeedbackHelpfulDO.isHelpful:
                            artifactFeedbackHelpfulDict[u'isHelpful'] = True
                            totalPositiveHelpfuls = totalPositiveHelpfuls+1
                        else:
                            artifactFeedbackHelpfulDict[u'isHelpful'] = False
                            totalNegativeHelpfuls = totalNegativeHelpfuls+1

                        artifactFeedbackHelpfulReviewerDO = artifactFeedbackHelpfulDO.member
                        if artifactFeedbackHelpfulReviewerDO:
                            artifactFeedbackHelpfulReviewerDict = {}
                            artifactFeedbackHelpfulReviewerDict[u'id'] = artifactFeedbackHelpfulReviewerDO.id
                            if artifactFeedbackHelpfulReviewerDO.login:
                                artifactFeedbackHelpfulReviewerDict[u'login'] = artifactFeedbackHelpfulReviewerDO.login
                            """if artifactFeedbackHelpfulReviewerDO.defaultLogin:
                                artifactFeedbackHelpfulReviewerDict[u'defaultLogin'] = artifactFeedbackHelpfulReviewerDO.defaultLogin
                            if artifactFeedbackHelpfulReviewerDO.email:
                                artifactFeedbackHelpfulReviewerDict[u'email'] = artifactFeedbackHelpfulReviewerDO.email"""
                            if artifactFeedbackHelpfulReviewerDO.givenName:
                                artifactFeedbackHelpfulReviewerDict[u'name'] = artifactFeedbackHelpfulReviewerDO.givenName
                            if artifactFeedbackHelpfulReviewerDO.surname:
                                artifactFeedbackHelpfulReviewerDict[u'surName'] = artifactFeedbackHelpfulReviewerDO.surname
                            """if artifactFeedbackHelpfulReviewerDO.timezone:
                                artifactFeedbackHelpfulReviewerDict[u'timeZone'] = artifactFeedbackHelpfulReviewerDO.timezone"""
                            artifactFeedbackHelpfulDict[u'reviewer'] = artifactFeedbackHelpfulReviewerDict
                        artifactFeedbackHelpfulDictList.append(artifactFeedbackHelpfulDict)
                    artifactFeedbackDict[u'helpfuls'] = artifactFeedbackHelpfulDictList
                    artifactFeedbackDict[u'aggregateHelpfuls'] = {}
                    artifactFeedbackDict[u'aggregateHelpfuls'][u'totalHelpfuls'] = totalHelpfuls
                    artifactFeedbackDict[u'aggregateHelpfuls'][u'totalPositiveHelpfuls'] = totalPositiveHelpfuls
                    artifactFeedbackDict[u'aggregateHelpfuls'][u'totalNegativeHelpfuls'] = totalNegativeHelpfuls
                    
                if includeFeedbackAbuseReports:
                    artifactFeedbackAbuseReportDictList = []
                    for artifactFeedbackAbuseReportDO in artifactFeedbackDO.abuseReports:
                        artifactFeedbackAbuseReportDict = {}
                        if artifactFeedbackAbuseReportDO.comments:
                            artifactFeedbackAbuseReportDict[u'comments'] = artifactFeedbackAbuseReportDO.comments
                        if artifactFeedbackAbuseReportDO.creationTime:
                            artifactFeedbackAbuseReportDict[u'createdTime'] = str(artifactFeedbackAbuseReportDO.creationTime)

                        artifactFeedbackAbuseReportReporterDO = artifactFeedbackAbuseReportDO.member
                        if artifactFeedbackAbuseReportReporterDO:
                            artifactFeedbackAbuseReportReporterDict = {}
                            artifactFeedbackAbuseReportReporterDict[u'id'] = artifactFeedbackAbuseReportReporterDO.id
                            if artifactFeedbackAbuseReportReporterDO.login:
                                artifactFeedbackAbuseReportReporterDict[u'login'] = artifactFeedbackAbuseReportReporterDO.login
                            """if artifactFeedbackAbuseReportReporterDO.defaultLogin:
                                artifactFeedbackAbuseReportReporterDict[u'defaultLogin'] = artifactFeedbackAbuseReportReporterDO.defaultLogin
                            if artifactFeedbackAbuseReportReporterDO.email:
                                artifactFeedbackAbuseReportReporterDict[u'email'] = artifactFeedbackAbuseReportReporterDO.email"""
                            if artifactFeedbackAbuseReportReporterDO.givenName:
                                artifactFeedbackAbuseReportReporterDict[u'name'] = artifactFeedbackAbuseReportReporterDO.givenName
                            if artifactFeedbackAbuseReportReporterDO.surname:
                                artifactFeedbackAbuseReportReporterDict[u'surName'] = artifactFeedbackAbuseReportReporterDO.surname
                            """if artifactFeedbackAbuseReportReporterDO.timezone:
                                artifactFeedbackAbuseReportReporterDict[u'timeZone'] = artifactFeedbackAbuseReportReporterDO.timezone"""
                            artifactFeedbackAbuseReportDict[u'reporter'] = artifactFeedbackAbuseReportReporterDict
                        artifactFeedbackAbuseReportDictList.append(artifactFeedbackAbuseReportDict)
                    artifactFeedbackDict[u'abuseReports'] = artifactFeedbackAbuseReportDictList                
                
                if includeFeedbackReviews:
                    artifactFeedbackReviewDictList = []
                    for artifactFeedbackReviewDO in artifactFeedbackDO.reviews:
                        artifactFeedbackReviewDict = {}
                        artifactFeedbackReviewDict[u'id'] = artifactFeedbackReviewDO.id
                        if artifactFeedbackReviewDO.reviewComment:
                            artifactFeedbackReviewDict[u'reviewComment'] = artifactFeedbackReviewDO.reviewComment
                        if artifactFeedbackReviewDO.creationTime:
                            artifactFeedbackReviewDict[u'createdTime'] = str(artifactFeedbackReviewDO.creationTime)
                        if artifactFeedbackReviewDO.updationTime:
                            artifactFeedbackReviewDict[u'updateTime'] = str(artifactFeedbackReviewDO.updationTime)
                        if artifactFeedbackReviewDO.notAbuse:
                            artifactFeedbackReviewDict[u'isAbused'] = False
                        else:
                            artifactFeedbackReviewDict[u'isAbused'] = True

                        artifactFeedbackReviewReviewerDO = artifactFeedbackReviewDO.member
                        if artifactFeedbackReviewReviewerDO:
                            artifactFeedbackReviewReviewerDict = {}
                            artifactFeedbackReviewReviewerDict[u'id'] = artifactFeedbackReviewReviewerDO.id
                            if artifactFeedbackReviewReviewerDO.login:
                                artifactFeedbackReviewReviewerDict[u'login'] = artifactFeedbackReviewReviewerDO.login
                            """if artifactFeedbackReviewReviewerDO.defaultLogin:
                                artifactFeedbackReviewReviewerDict[u'defaultLogin'] = artifactFeedbackReviewReviewerDO.defaultLogin
                            if artifactFeedbackReviewReviewerDO.email:
                                artifactFeedbackReviewReviewerDict[u'email'] = artifactFeedbackReviewReviewerDO.email"""
                            if artifactFeedbackReviewReviewerDO.givenName:
                                artifactFeedbackReviewReviewerDict[u'name'] = artifactFeedbackReviewReviewerDO.givenName
                            if artifactFeedbackReviewReviewerDO.surname:
                                artifactFeedbackReviewReviewerDict[u'surName'] = artifactFeedbackReviewReviewerDO.surname
                            """if artifactFeedbackReviewReviewerDO.timezone:
                                artifactFeedbackReviewReviewerDict[u'timeZone'] = artifactFeedbackReviewReviewerDO.timezone"""
                            artifactFeedbackReviewDict[u'reviewer'] = artifactFeedbackReviewReviewerDict
                        
                        if includeFeedbackReviewAbuseReports:
                            artifactFeedbackReviewAbuseReportDictList = []
                            for artifactFeedbackReviewAbuseReportDO in artifactFeedbackReviewDO.abuseReports:
                                artifactFeedbackReviewAbuseReportDict = {}
                                if artifactFeedbackReviewAbuseReportDO.comments:
                                    artifactFeedbackReviewAbuseReportDict[u'comments'] = artifactFeedbackReviewAbuseReportDO.comments
                                if artifactFeedbackReviewAbuseReportDO.creationTime:
                                    artifactFeedbackReviewAbuseReportDict[u'createdTime'] = str(artifactFeedbackReviewAbuseReportDO.creationTime)

                                artifactFeedbackReviewAbuseReportReporterDO = artifactFeedbackReviewAbuseReportDO.member
                                if artifactFeedbackReviewAbuseReportReporterDO:
                                    artifactFeedbackReviewAbuseReportReporterDict = {}
                                    artifactFeedbackReviewAbuseReportReporterDict[u'id'] = artifactFeedbackReviewAbuseReportReporterDO.id
                                    if artifactFeedbackReviewAbuseReportReporterDO.login:
                                        artifactFeedbackReviewAbuseReportReporterDict[u'login'] = artifactFeedbackReviewAbuseReportReporterDO.login
                                    """if artifactFeedbackReviewAbuseReportReporterDO.defaultLogin:
                                        artifactFeedbackReviewAbuseReportReporterDict[u'defaultLogin'] = artifactFeedbackReviewAbuseReportReporterDO.defaultLogin
                                    if artifactFeedbackReviewAbuseReportReporterDO.email:
                                        artifactFeedbackReviewAbuseReportReporterDict[u'email'] = artifactFeedbackReviewAbuseReportReporterDO.email"""
                                    if artifactFeedbackReviewAbuseReportReporterDO.givenName:
                                        artifactFeedbackReviewAbuseReportReporterDict[u'name'] = artifactFeedbackReviewAbuseReportReporterDO.givenName
                                    if artifactFeedbackReviewAbuseReportReporterDO.surname:
                                        artifactFeedbackReviewAbuseReportReporterDict[u'surName'] = artifactFeedbackReviewAbuseReportReporterDO.surname
                                    """if artifactFeedbackReviewAbuseReportReporterDO.timezone:
                                        artifactFeedbackReviewAbuseReportReporterDict[u'timeZone'] = artifactFeedbackReviewAbuseReportReporterDO.timezone"""
                                    artifactFeedbackReviewAbuseReportDict[u'reporter'] = artifactFeedbackReviewAbuseReportReporterDict
                                artifactFeedbackReviewAbuseReportDictList.append(artifactFeedbackReviewAbuseReportDict)   
                            artifactFeedbackReviewDict[u'abuseReports'] = artifactFeedbackReviewAbuseReportDictList
                        artifactFeedbackReviewDictList.append(artifactFeedbackReviewDict)
                    artifactFeedbackDict['reviews'] = artifactFeedbackReviewDictList                    
                       
                artifactFeedbackDictList.append(artifactFeedbackDict)
            artifactDict[u'feedbacks'] = artifactFeedbackDictList

        #artifactFeedbackAggregateScores
        if includeFeedbackAggregateScores is True:
            artifactFeedbackDOs = artifactDO.feedBacks
            artifactFeedbackTotalLikes = 0
            artifactFeedbackTotalDisLikes = 0
            artifactFeedbackTotalRatings=0
            artifactFeedbackOneRatings=0
            artifactFeedbackTwoRatings=0
            artifactFeedbackThreeRatings=0
            artifactFeedbackFourRatings=0
            artifactFeedbackFiveRatings=0
            for artifactFeedbackDO in artifactFeedbackDOs:
                if artifactFeedbackDO.type == 'rating':
                    if artifactFeedbackDO.score == 1:
                        artifactFeedbackOneRatings += 1
                    elif artifactFeedbackDO.score == 2:
                        artifactFeedbackTwoRatings += 1
                    elif artifactFeedbackDO.score == 3:
                        artifactFeedbackThreeRatings += 1
                    elif artifactFeedbackDO.score == 4:
                        artifactFeedbackFourRatings += 1
                    elif artifactFeedbackDO.score == 5:
                        artifactFeedbackFiveRatings += 1
                    else:
                        pass
                    artifactFeedbackTotalRatings+=1
                elif artifactFeedbackDO.type == 'vote':
                    if artifactFeedbackDO.score == 1:
                        artifactFeedbackTotalLikes += 1
                    elif artifactFeedbackDO.score == -1:
                        artifactFeedbackTotalDisLikes += 1
                    else:
                        pass
                else:
                    pass
            if artifactFeedbackTotalRatings != 0:
                artifactFeedbackAverageRating = round((artifactFeedbackOneRatings*1+artifactFeedbackTwoRatings*2+artifactFeedbackThreeRatings*3+artifactFeedbackFourRatings*4+artifactFeedbackFiveRatings*5)/float(artifactFeedbackTotalRatings), 2)
            else:
                artifactFeedbackAverageRating = 0.0
            artifactFeedbackAggregateScoresDict = {}
            artifactFeedbackAggregateVotingsDict = {}
            artifactFeedbackAggregateVotingsDict[u'totalLikes'] = artifactFeedbackTotalLikes
            artifactFeedbackAggregateVotingsDict[u'totalDisLikes'] = artifactFeedbackTotalDisLikes
            artifactFeedbackAggregateScoresDict[u'votings'] = artifactFeedbackAggregateVotingsDict
            artifactFeedbackAggregateRatingDict = {}
            artifactFeedbackAggregateRatingDict[u'totalRatings'] = artifactFeedbackTotalRatings
            artifactFeedbackAggregateRatingDict[u'averageRating'] = artifactFeedbackAverageRating
            artifactFeedbackAggregateRatingDict[u'oneRatings'] = artifactFeedbackOneRatings
            artifactFeedbackAggregateRatingDict[u'twoRatings'] = artifactFeedbackTwoRatings
            artifactFeedbackAggregateRatingDict[u'threeRatings'] = artifactFeedbackThreeRatings
            artifactFeedbackAggregateRatingDict[u'fourRatings'] = artifactFeedbackFourRatings
            artifactFeedbackAggregateRatingDict[u'fiveRatings'] = artifactFeedbackFiveRatings
            artifactFeedbackAggregateScoresDict[u'ratings'] = artifactFeedbackAggregateRatingDict
            artifactDict[u'aggregateFeedbackScores'] = artifactFeedbackAggregateScoresDict

        #artifactResources
        if includeResources is True:
            artifactResourceDictList = []
            for artifactRevisionResourceRevisionDO in artifactRevisionDO.resourceRevisions:
                if includeAllResources is True or artifactRevisionResourceRevisionDO.resource.isAttachment or artifactRevisionResourceRevisionDO.resource.type.name in ('cover page', 'cover page icon', 'cover video'):
                    artifactResourceDict = {}
                    artifactResourceDO = artifactRevisionResourceRevisionDO.resource
                    artifactResourceDict[u'id'] = artifactResourceDO.id
                    if artifactResourceDO.name:
                        artifactResourceDict[u'title'] = artifactResourceDO.name
                    if artifactResourceDO.handle:
                        artifactResourceDict[u'handle'] = artifactResourceDO.handle
                    if artifactResourceDO.description:
                        artifactResourceDict[u'description'] = artifactResourceDO.description
                    if artifactResourceDO.authors:
                        artifactResourceDict[u'authors'] = artifactResourceDO.authors
                    if artifactResourceDO.license:
                        artifactResourceDict[u'license'] = artifactResourceDO.license
                    if artifactResourceDO.uri:
                        artifactResourceDict[u'uri'] = artifactResourceDO.uri
                    if artifactResourceDO.satelliteUrl:
                        artifactResourceDict[u'satelliteURL'] = artifactResourceDO.satelliteUrl
                    if artifactResourceDO.refHash:
                        artifactResourceDict[u'referenceHash'] = artifactResourceDO.refHash
                    if artifactResourceDO.checksum:
                        artifactResourceDict[u'checkSum'] = artifactResourceDO.checksum 
                    if artifactResourceDO.creationTime:
                        artifactResourceDict[u'createdTime'] = str(artifactResourceDO.creationTime)
                    if artifactResourceDO.isAttachment:
                        artifactResourceDict[u'isAttachment'] = True
                    else:
                        artifactResourceDict[u'isAttachment'] = False
                    if artifactResourceDO.isExternal:
                        artifactResourceDict[u'isExternal'] = True
                    else:
                        artifactResourceDict[u'isExternal'] = False

                    artifactResourceTypeDO = artifactResourceDO.type
                    if artifactResourceTypeDO:
                        artifactResourceTypeDict = {}
                        artifactResourceTypeDict[u'id'] = artifactResourceTypeDO.id
                        if artifactResourceTypeDO.name:
                            artifactResourceTypeDict[u'name'] = artifactResourceTypeDO.name
                        if artifactResourceTypeDO.description:
                            artifactResourceTypeDict[u'description'] = artifactResourceTypeDO.description
                        if artifactResourceTypeDO.versionable:
                            artifactResourceDict[u'isVersionable'] = True
                        else:
                            artifactResourceDict[u'isVersionable'] = False
                        if artifactResourceTypeDO.streamable:
                            artifactResourceDict[u'isStreamable'] = True
                        else:
                            artifactResourceDict[u'isStreamable'] = False
                        artifactResourceDict[u'type'] = artifactResourceTypeDict

                    artifactResourceCreatorDO = artifactResourceDO.owner
                    if artifactResourceCreatorDO:
                        artifactResourceCreatorDict = {}
                        artifactResourceCreatorDict[u'id'] = artifactResourceCreatorDO.id
                        if artifactResourceCreatorDO.login:
                            artifactResourceCreatorDict[u'login'] = artifactResourceCreatorDO.login
                        """if artifactResourceCreatorDO.defaultLogin:
                            artifactResourceCreatorDict[u'defaultLogin'] = artifactResourceCreatorDO.defaultLogin
                        if artifactResourceCreatorDO.email:
                            artifactResourceCreatorDict[u'email'] = artifactResourceCreatorDO.email"""
                        if artifactResourceCreatorDO.givenName:
                            artifactResourceCreatorDict[u'name'] = artifactResourceCreatorDO.givenName
                        if artifactResourceCreatorDO.surname:
                            artifactResourceCreatorDict[u'surName'] = artifactResourceCreatorDO.surname
                        """if artifactResourceCreatorDO.timezone:
                            artifactResourceCreatorDict[u'timeZone'] = artifactResourceCreatorDO.timezone"""
                        artifactResourceDict[u'creator'] = artifactResourceCreatorDict

                    artifactResourceLanguageDO = artifactResourceDO.language
                    if artifactResourceLanguageDO:
                        artifactResourceLanguageDict = {}
                        artifactResourceLanguageDict[u'id'] = artifactResourceLanguageDO.id
                        if artifactResourceLanguageDO.code:
                            artifactResourceLanguageDict[u'code'] = artifactResourceLanguageDO.code
                        if artifactResourceLanguageDO.name:
                            artifactResourceLanguageDict[u'name'] = artifactResourceLanguageDO.name
                        artifactResourceDict[u'language'] = artifactResourceLanguageDict

                    if includeResourceAbuseReports is True:
                        artifactResourceAbuseReportDOs = artifactRevisionResourceRevisionDO.abuseReports
                        artifactResourceAbuseReportDictList = []
                        for artifactResourceAbuseReportDO in artifactResourceAbuseReportDOs:
                            artifactResourceAbuseReportDict = {}
                            artifactResourceAbuseReportDict[u'id'] = artifactResourceAbuseReportDO.id
                            if artifactResourceAbuseReportDO.status:
                                artifactResourceAbuseReportDict[u'status'] = artifactResourceAbuseReportDO.status
                            if artifactResourceAbuseReportDO.remark:
                                artifactResourceAbuseReportDict[u'remark'] = artifactResourceAbuseReportDO.remark
                            if artifactResourceAbuseReportDO.imageUrl:
                                artifactResourceAbuseReportDict[u'imageURL'] = artifactResourceAbuseReportDO.imageUrl
                            if artifactResourceAbuseReportDO.userAgent:
                                artifactResourceAbuseReportDict[u'userAgent'] = artifactResourceAbuseReportDO.userAgent
                            if artifactResourceAbuseReportDO.created:
                                artifactResourceAbuseReportDict[u'createdTime'] = str(artifactResourceAbuseReportDO.created)
                            if artifactResourceAbuseReportDO.updated:
                                artifactResourceAbuseReportDict[u'updatedTime'] = str(artifactResourceAbuseReportDO.updated)

                            artifactResourceAbuseReportCreatorDO = artifactResourceAbuseReportDO.reporter
                            if artifactResourceAbuseReportCreatorDO:
                                artifactResourceAbuseReportCreatorDict = {}
                                artifactResourceAbuseReportCreatorDict[u'id'] = artifactResourceAbuseReportCreatorDO.id
                                if artifactResourceAbuseReportCreatorDO.login:
                                    artifactResourceAbuseReportCreatorDict[u'login'] = artifactResourceAbuseReportCreatorDO.login
                                """if artifactResourceAbuseReportCreatorDO.defaultLogin:
                                    artifactResourceAbuseReportCreatorDict[u'defaultLogin'] = artifactResourceAbuseReportCreatorDO.defaultLogin
                                if artifactResourceAbuseReportCreatorDO.email:
                                    artifactResourceAbuseReportCreatorDict[u'email'] = artifactResourceAbuseReportCreatorDO.email"""
                                if artifactResourceAbuseReportCreatorDO.givenName:
                                    artifactResourceAbuseReportCreatorDict[u'name'] = artifactResourceAbuseReportCreatorDO.givenName
                                if artifactResourceAbuseReportCreatorDO.surname:
                                    artifactResourceAbuseReportCreatorDict[u'surName'] = artifactResourceAbuseReportCreatorDO.surname
                                """if artifactResourceAbuseReportCreatorDO.timezone:
                                    artifactResourceAbuseReportCreatorDict[u'timeZone'] = artifactResourceAbuseReportCreatorDO.timezone"""
                                artifactResourceAbuseReportDict[u'creator'] = artifactResourceAbuseReportCreatorDict                

                            artifactResourceAbuseReportReviewerDO = artifactResourceAbuseReportDO.reviewer
                            if artifactResourceAbuseReportReviewerDO:
                                artifactResourceAbuseReportReviewerDict = {}
                                artifactResourceAbuseReportReviewerDict[u'id'] = artifactResourceAbuseReportReviewerDO.id
                                if artifactResourceAbuseReportReviewerDO.login:
                                    artifactResourceAbuseReportReviewerDict[u'login'] = artifactResourceAbuseReportReviewerDO.login
                                """if artifactResourceAbuseReportReviewerDO.defaultLogin:
                                    artifactResourceAbuseReportReviewerDict[u'defaultLogin'] = artifactResourceAbuseReportReviewerDO.defaultLogin
                                if artifactResourceAbuseReportReviewerDO.email:
                                    artifactResourceAbuseReportReviewerDict[u'email'] = artifactResourceAbuseReportReviewerDO.email"""
                                if artifactResourceAbuseReportReviewerDO.givenName:
                                    artifactResourceAbuseReportReviewerDict[u'name'] = artifactResourceAbuseReportReviewerDO.givenName
                                if artifactResourceAbuseReportReviewerDO.surname:
                                    artifactResourceAbuseReportReviewerDict[u'surName'] = artifactResourceAbuseReportReviewerDO.surname
                                """if artifactResourceAbuseReportReviewerDO.timezone:
                                    artifactResourceAbuseReportReviewerDict[u'timeZone'] = artifactResourceAbuseReportReviewerDO.timezone"""
                                artifactResourceAbuseReportDict[u'reviewer'] = artifactResourceAbuseReportReviewerDict  

                            artifactResourceAbuseReportReasonDO = artifactResourceAbuseReportDO.abuseReason
                            if artifactResourceAbuseReportReasonDO:
                                artifactResourceAbuseReportReasonDict = {}
                                artifactResourceAbuseReportReasonDict[u'id'] = artifactResourceAbuseReportReasonDO.id
                                if artifactResourceAbuseReportReasonDO.name:
                                    artifactResourceAbuseReportReasonDict[u'name'] = artifactResourceAbuseReportReasonDO.name
                                if artifactResourceAbuseReportReasonDO.description:
                                    artifactResourceAbuseReportReasonDict[u'description'] = artifactResourceAbuseReportReasonDO.description
                                artifactResourceAbuseReportDict[u'reason'] = artifactResourceAbuseReportReasonDict

                            artifactResourceAbuseReportDictList.append(artifactResourceAbuseReportDict)
                        artifactResourceDict[u'abuseReports'] = artifactResourceAbuseReportDictList

                    if includeInlineDocuments is True:
                        artifactResourceInlineDocumentDOs = artifactResourceDO.inlineDocuments
                        artifactResourceInlineDocumentDictList = []
                        for artifactResourceInlineDocumentDO in artifactResourceInlineDocumentDOs:
                            artifactResourceInlineDocumentDict = {}
                            artifactResourceInlineDocumentDict[u'id'] = artifactResourceInlineDocumentDO.id
                            if artifactResourceInlineDocumentDO.documentID:
                                artifactResourceInlineDocumentDict[u'name'] = artifactResourceInlineDocumentDO.documentID
                            if artifactResourceInlineDocumentDO.creationTime:
                                artifactResourceInlineDocumentDict[u'createdTime'] = str(artifactResourceInlineDocumentDO.creationTime)
                            if artifactResourceInlineDocumentDO.updateTime:
                                artifactResourceInlineDocumentDict[u'updatedTime'] = str(artifactResourceInlineDocumentDO.updateTime)
                            artifactResourceInlineDocumentDictList.append(artifactResourceInlineDocumentDict)
                        artifactResourceDict[u'inlineDocuments'] = artifactResourceInlineDocumentDictList

                    if includeEmbeddedObjects is True:
                        artifactResourceCreatorLogin = None
                        if artifactResourceCreatorDO and artifactResourceCreatorDO.login:
                            artifactResourceCreatorLogin = artifactResourceCreatorDO.login
                        elif artifactResourceCreatorDO and artifactResourceCreatorDO.name:
                            artifactResourceCreatorLogin = artifactResourceCreatorDO.name.replace(' ','')
                        else:
                            artifactResourceCreatorLogin = u'ck12editor'
                        if artifactResourceCreatorLogin == u'ck12editor' or artifactResourceCreatorLogin == u'':
                            artifactResourceRealm = u''
                        else:
                            artifactResourceRealm = u'user:{artifactResourceCreatorLogin}'.format(artifactResourceCreatorLogin=artifactResourceCreatorLogin)
                        artifactResourceType = None
                        if artifactResourceTypeDO and artifactResourceTypeDO.name:
                            artifactResourceType = artifactResourceTypeDO.name
                        else:
                            artifactResourceType = u''
                        artifactResourceHandle = None
                        if artifactResourceDO.handle:
                            artifactResourceHandle = artifactResourceDO.handle
                            while True:
                                unQuotedArtifactResourceHandle = unquote(artifactResourceHandle)
                                if artifactResourceHandle == unQuotedArtifactResourceHandle:
                                    break
                                artifactResourceHandle = unQuotedArtifactResourceHandle
                        elif artifactResourceDO.name:
                            artifactResourceHandle = artifactResourceDO.name.replace(' ', '-')
                        else:
                            artifactResourceHandle = u''
                        artifactResourcePerma = u'/{artifactResourceType}/{artifactResourceHandle}/{artifactResourceRealm}'.format(artifactResourceType=artifactResourceType, artifactResourceHandle=artifactResourceHandle, artifactResourceRealm=artifactResourceRealm)
                        artifactResourceEmbeddedObjectDOs = artifactResourceDO.embeddedObjects
                        artifactResourceEmbeddedObjectDictList = []
                        for artifactResourceEmbeddedObjectDO in artifactResourceEmbeddedObjectDOs:
                            artifactResourceEmbeddedObjectDict = {}
                            artifactResourceEmbeddedObjectDict[u'id'] = artifactResourceEmbeddedObjectDO.id
                            artifactResourceEmbeddedObjectDict[u'detailedCode'] = self._generateDetailedCodeForEmbeddedObject(artifactResourceEmbeddedObjectDO, artifactResourcePerma)
                            if artifactResourceEmbeddedObjectDO.type:
                                artifactResourceEmbeddedObjectDict[u'type'] = artifactResourceEmbeddedObjectDO.type
                            if artifactResourceEmbeddedObjectDO.caption:
                                artifactResourceEmbeddedObjectDict[u'caption'] = artifactResourceEmbeddedObjectDO.caption
                            if artifactResourceEmbeddedObjectDO.description:
                                artifactResourceEmbeddedObjectDict[u'description'] = artifactResourceEmbeddedObjectDO.description
                            if artifactResourceEmbeddedObjectDO.uri:
                                artifactResourceEmbeddedObjectDict[u'uri'] = artifactResourceEmbeddedObjectDO.uri
                            if artifactResourceEmbeddedObjectDO.code:
                                artifactResourceEmbeddedObjectDict[u'code'] = artifactResourceEmbeddedObjectDO.code
                            if artifactResourceEmbeddedObjectDO.thumbnail:
                                artifactResourceEmbeddedObjectDict[u'thumbNail'] = artifactResourceEmbeddedObjectDO.thumbnail                                                       
                            if artifactResourceEmbeddedObjectDO.hash:
                                artifactResourceEmbeddedObjectDict[u'hash'] = artifactResourceEmbeddedObjectDO.hash
                            if artifactResourceEmbeddedObjectDO.width:
                                artifactResourceEmbeddedObjectDict[u'width'] = artifactResourceEmbeddedObjectDO.width
                            if artifactResourceEmbeddedObjectDO.height:
                                artifactResourceEmbeddedObjectDict[u'height'] = artifactResourceEmbeddedObjectDO.height
                            if artifactResourceEmbeddedObjectDO.blacklisted:
                                artifactResourceEmbeddedObjectDict[u'isBlackListed'] = True
                            else:
                                artifactResourceEmbeddedObjectDict[u'isBlackListed'] = False
                            if artifactResourceEmbeddedObjectDO.created:
                                artifactResourceEmbeddedObjectDict[u'createdTime'] = str(artifactResourceEmbeddedObjectDO.created)
                            if artifactResourceEmbeddedObjectDO.updated:
                                artifactResourceEmbeddedObjectDict[u'updatedTime'] = str(artifactResourceEmbeddedObjectDO.updated)

                            artifactResourceEmbeddedObjectProviderDO = artifactResourceEmbeddedObjectDO.provider
                            if artifactResourceEmbeddedObjectProviderDO:
                                artifactResourceEmbeddedObjectProviderDict = {}
                                artifactResourceEmbeddedObjectProviderDict[u'id'] = artifactResourceEmbeddedObjectProviderDO.id
                                if artifactResourceEmbeddedObjectProviderDO.name:
                                    artifactResourceEmbeddedObjectProviderDict[u'name'] = artifactResourceEmbeddedObjectProviderDO.name
                                if artifactResourceEmbeddedObjectProviderDO.domain:
                                    artifactResourceEmbeddedObjectProviderDict[u'domain'] = artifactResourceEmbeddedObjectProviderDO.domain
                                if artifactResourceEmbeddedObjectProviderDO.blacklisted:
                                    artifactResourceEmbeddedObjectProviderDict[u'isBlackListed'] = True
                                else:
                                    artifactResourceEmbeddedObjectProviderDict[u'isBlackListed'] = False
                                if artifactResourceEmbeddedObjectProviderDO.needsApi:
                                    artifactResourceEmbeddedObjectProviderDict[u'needsAPI'] = True
                                else:
                                    artifactResourceEmbeddedObjectProviderDict[u'needsAPI'] = False                    
                                if artifactResourceEmbeddedObjectProviderDO.created:
                                    artifactResourceEmbeddedObjectProviderDict[u'createdTime'] = str(artifactResourceEmbeddedObjectProviderDO.created)
                                if artifactResourceEmbeddedObjectProviderDO.updated:
                                    artifactResourceEmbeddedObjectProviderDict[u'updatedTime'] = str(artifactResourceEmbeddedObjectProviderDO.updated)
                                artifactResourceEmbeddedObjectDict[u'provider'] = artifactResourceEmbeddedObjectProviderDict
                            artifactResourceEmbeddedObjectDictList.append(artifactResourceEmbeddedObjectDict)
                        artifactResourceDict[u'embeddedObjects'] = artifactResourceEmbeddedObjectDictList
                    
                    artifactResourceDictList.append(artifactResourceDict)
            artifactDict[u'resources'] = artifactResourceDictList

        #artifactRevisions
        artifactRevisionDictList = []
        artifactRevisionDict = {}
        artifactRevisionDict[u'id'] = artifactRevisionDO.id
        
        if artifactRevisionDO.id == artifactDO.revisions[0].id:
            artifactRevisionDict[u'isLatest'] = True
        else:
            artifactRevisionDict[u'isLatest'] = False
        
        if artifactRevisionDO.revision:
            artifactRevisionDict[u'no'] = artifactRevisionDO.revision
        if artifactRevisionDO.comment:
            artifactRevisionDict[u'comment'] = artifactRevisionDO.comment
        if artifactRevisionDO.messageToUsers:
            artifactRevisionDict[u'messageToUsers'] = artifactRevisionDO.messageToUsers
        if artifactRevisionDO.downloads:
            artifactRevisionDict[u'downloads'] = artifactRevisionDO.downloads
        if artifactRevisionDO.favorites:
            artifactRevisionDict[u'favourites'] = artifactRevisionDO.favorites
        if artifactRevisionDO.creationTime:
            artifactRevisionDict[u'createdTime'] = str(artifactRevisionDO.creationTime)
        if artifactRevisionDO.publishTime:
            artifactRevisionDict[u'publishedTime'] = str(artifactRevisionDO.publishTime)
        
        #artifactRevision - contentRelated
        if includeContent is True:
            artifactRevisionContentRevisionDO = self._extractArtifactRevisionContentRevisionDO(artifactRevisionDO)
            artifactResourceSatelliteURLsDict = self._generateArtifactResourceSatelliteURLsDict(artifactRevisionDO)
            
            artifactRevisionContentRevisionContentDO = None
            if artifactRevisionContentRevisionDO and artifactRevisionContentRevisionDO.resource:
                    artifactRevisionContentRevisionResourceContentDOs = artifactRevisionContentRevisionDO.resource.contents
                    contentRevisionIDArtifactRevisionContentRevisionContentDOMap = {}
                    for artifactRevisionContentRevisionResourceContentDO in artifactRevisionContentRevisionResourceContentDOs:
                        contentRevisionIDArtifactRevisionContentRevisionContentDOMap[artifactRevisionContentRevisionResourceContentDO.contentRevisionID] = artifactRevisionContentRevisionResourceContentDO
                        if artifactRevisionContentRevisionDO.revision == str(artifactRevisionContentRevisionResourceContentDO.contentRevisionID):
                            artifactRevisionContentRevisionContentDO = artifactRevisionContentRevisionResourceContentDO

                    #If the exact row with matching revision as contentRevisionID is not found
                    #implementing the existing logic, getting the nth max contentRevisionID row (n=revision)
                    if not artifactRevisionContentRevisionContentDO:
                        contentRevisionIDs = contentRevisionIDArtifactRevisionContentRevisionContentDOMap.keys()
                        contentRevisionIDs.sort()
                        contentRevisionIDOffset = int(artifactRevisionContentRevisionDO.revision) - 1 if artifactRevisionContentRevisionDO.revision else 0
                        if contentRevisionIDOffset < len(contentRevisionIDs):
                            artifactRevisionContentRevisionContentDO = contentRevisionIDArtifactRevisionContentRevisionContentDOMap[contentRevisionIDs[contentRevisionIDOffset]]

            if artifactRevisionContentRevisionContentDO:
                artifactRevisionContentRevisionDict = {}
                artifactRevisionContentRevisionDict[u'id'] = artifactRevisionContentRevisionContentDO.contentRevisionID
                if artifactRevisionContentRevisionContentDO.checksum:
                    artifactRevisionContentRevisionDict[u'checkSum'] = artifactRevisionContentRevisionContentDO.checksum
                if artifactRevisionContentRevisionContentDO.creationTime:
                    artifactRevisionContentRevisionDict[u'createdTime'] = str(artifactRevisionContentRevisionContentDO.creationTime)
                if artifactRevisionContentRevisionContentDO.contents:
                    if artifactRevisionContentRevisionContentDO.compressed:
                        try:
                            artifactRevisionContentRevisionContentRawContentXHTML = zlib.decompress(artifactRevisionContentRevisionContentDO.contents)
                        except:
                            artifactRevisionContentRevisionContentRawContentXHTML = artifactRevisionContentRevisionContentDO.contents
                    else:
                        artifactRevisionContentRevisionContentRawContentXHTML = artifactRevisionContentRevisionContentDO.contents
                    
                    if artifactTypeDO and artifactTypeDO.name == 'lesson' and '<div class="x-ck12-data-concept">' in artifactRevisionContentRevisionContentRawContentXHTML and "</div>" in artifactRevisionContentRevisionContentRawContentXHTML[artifactRevisionContentRevisionContentRawContentXHTML.index('<div class="x-ck12-data-concept">')+33:]:
                        artifactRevisionChildConceptRevisionDO = None
                        artifactRevisionChildConceptRevisionRelationSequence = 0
                        for artifactRevisionChildRevisionRelationDO in artifactRevisionDO.children:
                            if artifactRevisionChildRevisionRelationDO.child and artifactRevisionChildRevisionRelationDO.child.artifact and artifactRevisionChildRevisionRelationDO.child.artifact.type and artifactRevisionChildRevisionRelationDO.child.artifact.type.name == 'concept':
                                if not artifactRevisionChildConceptRevisionDO or (artifactRevisionChildRevisionRelationDO.sequence and artifactRevisionChildRevisionRelationDO.sequence > artifactRevisionChildConceptRevisionRelationSequence):
                                    artifactRevisionChildConceptRevisionDO = artifactRevisionChildRevisionRelationDO.child
                                    artifactRevisionChildConceptRevisionRelationSequence = artifactRevisionChildRevisionRelationDO.sequence
                                
                        if artifactRevisionChildConceptRevisionDO:
                            artifactRevisionChildConceptRevisionID = artifactRevisionChildConceptRevisionDO.id                 
                            artifactRevisionChildConceptRevisionContentRevisionDO = self._extractArtifactRevisionContentRevisionDO(artifactRevisionChildConceptRevisionDO)
                            artifactRevisionChildConceptResourceSatelliteURLsDict = self._generateArtifactResourceSatelliteURLsDict(artifactRevisionChildConceptRevisionDO)
                            artifactResourceSatelliteURLsDict.update(artifactRevisionChildConceptResourceSatelliteURLsDict)
                            
                            artifactRevisionChildConceptRevisionContentRevisionContentDO = None
                            if artifactRevisionChildConceptRevisionContentRevisionDO and artifactRevisionChildConceptRevisionContentRevisionDO.resource:
                                artifactRevisionChildConceptRevisionContentRevisionResourceContentDOs = artifactRevisionChildConceptRevisionContentRevisionDO.resource.contents
                                contentRevisionIDArtifactRevisionChildConceptRevisionContentRevisionContentDOMap = {}
                                for artifactRevisionChildConceptRevisionContentRevisionResourceContentDO in artifactRevisionChildConceptRevisionContentRevisionResourceContentDOs:
                                    contentRevisionIDArtifactRevisionChildConceptRevisionContentRevisionContentDOMap[artifactRevisionChildConceptRevisionContentRevisionResourceContentDO.contentRevisionID] = artifactRevisionChildConceptRevisionContentRevisionResourceContentDO
                                    if artifactRevisionChildConceptRevisionContentRevisionDO.revision == str(artifactRevisionChildConceptRevisionContentRevisionResourceContentDO.contentRevisionID):
                                        artifactRevisionChildConceptRevisionContentRevisionContentDO = artifactRevisionChildConceptRevisionContentRevisionResourceContentDO

                                #If the exact row with matching revision as contentRevisionID is not found
                                #implementing the existing logic, getting the nth max contentRevisionID row (n=revision)
                                if not artifactRevisionChildConceptRevisionContentRevisionContentDO:
                                    contentRevisionIDs = contentRevisionIDArtifactRevisionChildConceptRevisionContentRevisionContentDOMap.keys()
                                    contentRevisionIDs.sort()
                                    contentRevisionIDOffset = int(artifactRevisionChildConceptRevisionContentRevisionDO.revision) - 1 if artifactRevisionChildConceptRevisionContentRevisionDO.revision else 0
                                    if contentRevisionIDOffset < len(contentRevisionIDs):
                                        artifactRevisionChildConceptRevisionContentRevisionContentDO = contentRevisionIDArtifactRevisionChildConceptRevisionContentRevisionContentDOMap[contentRevisionIDs[contentRevisionIDOffset]]

                            if artifactRevisionChildConceptRevisionContentRevisionContentDO and artifactRevisionChildConceptRevisionContentRevisionContentDO.contents:
                                if artifactRevisionChildConceptRevisionContentRevisionContentDO.compressed:
                                    try:
                                        artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML = zlib.decompress(artifactRevisionChildConceptRevisionContentRevisionContentDO.contents)
                                    except:
                                        artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML = artifactRevisionChildConceptRevisionContentRevisionContentDO.contents
                                else:
                                    artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML = artifactRevisionChildConceptRevisionContentRevisionContentDO.contents
                                
                                if artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML and "<body>" in artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML and "</body>" in artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML[artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML.index("<body>")+6:]:   
                                    parentDivStartingIndex = artifactRevisionContentRevisionContentRawContentXHTML.index('<div class="x-ck12-data-concept">')
                                    parentDivEndingIndex = parentDivStartingIndex+artifactRevisionContentRevisionContentRawContentXHTML[parentDivStartingIndex:].index('</div>')+6
                                    childBodyStartingIndex = artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML.index("<body>")+6
                                    childBodyEndingIndex = childBodyStartingIndex+artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML[childBodyStartingIndex:].index("</body>")

                                    artifactRevisionContentRevisionContentRawContentXHTML = artifactRevisionContentRevisionContentRawContentXHTML[:parentDivStartingIndex]+'\n<!-- Begin inserted XHTML [CONCEPT: '+str(artifactRevisionChildConceptRevisionID)+'] -->\n'+artifactRevisionChildConceptRevisionContentRevisionContentRawContentXHTML[childBodyStartingIndex:childBodyEndingIndex]+'\n<!-- End inserted XHTML [CONCEPT: '+str(artifactRevisionChildConceptRevisionID)+'] -->\n'+artifactRevisionContentRevisionContentRawContentXHTML[parentDivEndingIndex:]
                        
                    artifactRevisionContentRevisionDict[u'rawContents'] = artifactRevisionContentRevisionContentRawContentXHTML
                    if includeProcessedContent is True:
                        artifactRevisionContentRevisionDict[u'processedContents'] = self._processRawContentXHTML(artifactRevisionContentRevisionContentRawContentXHTML, artifactResourceSatelliteURLsDict)
                
                artifactRevisionDict[u'contentRevision'] = artifactRevisionContentRevisionDict

        #artifactRevision - standardRelated
        if includeRevisionStandards is True:
            artifactRevisionStandardDOs = artifactRevisionDO.standards
            artifactRevisionStandardDictList = []
            for artifactRevisionStandardDO in artifactRevisionStandardDOs:
                artifactRevisionStandardDict = {}
                artifactRevisionStandardDict[u'id'] = artifactRevisionStandardDO.id
                if artifactRevisionStandardDO.title:
                    artifactRevisionStandardDict[u'title'] = artifactRevisionStandardDO.title
                if artifactRevisionStandardDO.description:
                    artifactRevisionStandardDict[u'description'] = artifactRevisionStandardDO.description
                if artifactRevisionStandardDO.section:
                    artifactRevisionStandardDict[u'section'] = artifactRevisionStandardDO.section
                
                artifactRevisionStandardSubjectDO =  artifactRevisionStandardDO.subject
                if artifactRevisionStandardSubjectDO:
                    artifactRevisionStandardSubjectDict = {}
                    artifactRevisionStandardSubjectDict[u'id'] = artifactRevisionStandardSubjectDO.id
                    if artifactRevisionStandardSubjectDO.name:
                        artifactRevisionStandardSubjectDict[u'name'] = artifactRevisionStandardSubjectDO.name
                    artifactRevisionStandardDict[u'subject'] = artifactRevisionStandardSubjectDict

                artifactRevisionStandardBoardDO = artifactRevisionStandardDO.standardBoard
                if artifactRevisionStandardBoardDO:
                    artifactRevisionStandardBoardDict = {}
                    artifactRevisionStandardBoardDict[u'id'] = artifactRevisionStandardBoardDO.id
                    if artifactRevisionStandardBoardDO.name:
                        artifactRevisionStandardBoardDict[u'name'] = artifactRevisionStandardBoardDO.name
                    if artifactRevisionStandardBoardDO.longname:
                        artifactRevisionStandardBoardDict[u'longName'] = artifactRevisionStandardBoardDO.longname
                    if artifactRevisionStandardBoardDO.sequence:
                        artifactRevisionStandardBoardDict[u'sequence'] = artifactRevisionStandardBoardDO.sequence
                    artifactRevisionStandardBoardCountryDO = artifactRevisionStandardBoardDO.country
                    if artifactRevisionStandardBoardCountryDO:
                        artifactRevisionStandardBoardCountryDict = {}
                        artifactRevisionStandardBoardCountryDict[u'id'] = artifactRevisionStandardBoardCountryDO.id
                        if artifactRevisionStandardBoardCountryDO.name:
                            artifactRevisionStandardBoardCountryDict[u'name'] = artifactRevisionStandardBoardCountryDO.name
                        if artifactRevisionStandardBoardCountryDO.code2Letter:
                            artifactRevisionStandardBoardCountryDict[u'twoLetterCode'] = artifactRevisionStandardBoardCountryDO.code2Letter
                        if artifactRevisionStandardBoardCountryDO.code3Letter:
                            artifactRevisionStandardBoardCountryDict[u'threeLetterCode'] = artifactRevisionStandardBoardCountryDO.code3Letter
                        if artifactRevisionStandardBoardCountryDO.codeNumeric:
                            artifactRevisionStandardBoardCountryDict[u'numericCode'] = artifactRevisionStandardBoardCountryDO.codeNumeric
                        if artifactRevisionStandardBoardCountryDO.image:
                            artifactRevisionStandardBoardCountryDict[u'image'] = artifactRevisionStandardBoardCountryDO.image
                        if artifactRevisionStandardBoardCountryDO.creationTime:
                            artifactRevisionStandardBoardCountryDict[u'createdTime'] = str(artifactRevisionStandardBoardCountryDO.creationTime)
                        if artifactRevisionStandardBoardCountryDO.updateTime:
                            artifactRevisionStandardBoardCountryDict[u'updatedTime'] = str(artifactRevisionStandardBoardCountryDO.updateTime)        
                        artifactRevisionStandardBoardDict[u'country'] = artifactRevisionStandardBoardCountryDict
                    artifactRevisionStandardDict[u'board'] = artifactRevisionStandardBoardDict
                
                if includeRevisionStandardGrades is True:
                    artifactRevisionStandardGradeDOs = artifactRevisionStandardDO.grades
                    artifactRevisionStandardGradeDictList = []
                    for artifactRevisionStandardGradeDO in artifactRevisionStandardGradeDOs:
                        artifactRevisionStandardGradeDict = {}
                        artifactRevisionStandardGradeDict[u'id'] = artifactRevisionStandardGradeDO.id
                        if artifactRevisionStandardGradeDO.name:
                            artifactRevisionStandardGradeDict[u'name'] = artifactRevisionStandardGradeDO.name
                        artifactRevisionStandardGradeDictList.append(artifactRevisionStandardGradeDict)
                    artifactRevisionStandardDict[u'grades'] = artifactRevisionStandardGradeDictList
                
                artifactRevisionStandardDictList.append(artifactRevisionStandardDict)
            artifactRevisionDict[u'standards'] = artifactRevisionStandardDictList

        #artifactRevision - childrenRelated
        if includeChildren is True:
            artifactRevisionChildArtifactRevisionRelationDOs = artifactRevisionDO.children
            artifactRevisionChildDictList = []
            for artifactRevisionChildArtifactRevisionRelationDO in artifactRevisionChildArtifactRevisionRelationDOs:
                artifactRevisionChildDict = {}
                artifactRevisionChildDict[u'revisionID'] = artifactRevisionChildArtifactRevisionRelationDO.hasArtifactRevisionID
                if artifactRevisionChildArtifactRevisionRelationDO.sequence:
                    artifactRevisionChildDict[u'sequenceNO'] = artifactRevisionChildArtifactRevisionRelationDO.sequence

                if artifactRevisionChildArtifactRevisionRelationDO.child:
                    if artifactRevisionChildArtifactRevisionRelationDO.child.artifact:
                        artifactRevisionChildDict[u'id'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.id
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.encodedID:
                            artifactRevisionChildDict[u'encodedID'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.encodedID
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.name:
                            artifactRevisionChildDict[u'title'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.name
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.handle:
                            artifactRevisionChildDict[u'handle'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.handle
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.description:
                            artifactRevisionChildDict[u'description'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.description
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.type and artifactRevisionChildArtifactRevisionRelationDO.child.artifact.type.name:
                            artifactRevisionChildDict[u'type'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.type.name
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.creator and artifactRevisionChildArtifactRevisionRelationDO.child.artifact.creator.login:
                            artifactRevisionChildDict[u'creator'] = artifactRevisionChildArtifactRevisionRelationDO.child.artifact.creator.login                
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.creationTime:
                            artifactRevisionChildDict[u'createdTime'] = str(artifactRevisionChildArtifactRevisionRelationDO.child.artifact.creationTime)
                        if artifactRevisionChildArtifactRevisionRelationDO.child.artifact.updateTime:
                            artifactRevisionChildDict[u'updatedTime'] = str(artifactRevisionChildArtifactRevisionRelationDO.child.artifact.updateTime)
                    
                    if includeGrandChildren is True:
                        artifactRevisionGrandChildArtifactRevisionRelationDOs = artifactRevisionChildArtifactRevisionRelationDO.child.children
                        artifactRevisionGrandChildDictList = []
                        for artifactRevisionGrandChildArtifactRevisionRelationDO in artifactRevisionGrandChildArtifactRevisionRelationDOs:
                            if artifactRevisionGrandChildArtifactRevisionRelationDO.child and artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact and artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.type and artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.type != 'concept':
                                artifactRevisionGrandChildDict = {}
                                artifactRevisionGrandChildDict[u'revisionID'] = artifactRevisionGrandChildArtifactRevisionRelationDO.hasArtifactRevisionID
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.sequence:
                                    artifactRevisionGrandChildDict[u'sequenceNO'] = artifactRevisionGrandChildArtifactRevisionRelationDO.sequence

                                artifactRevisionGrandChildDict[u'id'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.id
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.encodedID:
                                    artifactRevisionGrandChildDict[u'encodedID'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.encodedID
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.name:
                                    artifactRevisionGrandChildDict[u'title'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.name
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.handle:
                                    artifactRevisionGrandChildDict[u'handle'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.handle
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.description:
                                    artifactRevisionGrandChildDict[u'description'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.description
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.type and artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.type.name:
                                    artifactRevisionGrandChildDict[u'type'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.type.name
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.creator and artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.creator.login:
                                    artifactRevisionGrandChildDict[u'creator'] = artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.creator.login                
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.creationTime:
                                    artifactRevisionGrandChildDict[u'createdTime'] = str(artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.creationTime)
                                if artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.updateTime:
                                    artifactRevisionGrandChildDict[u'updatedTime'] = str(artifactRevisionGrandChildArtifactRevisionRelationDO.child.artifact.updateTime)                        
                                artifactRevisionGrandChildDictList.append(artifactRevisionGrandChildDict)
                        artifactRevisionChildDict[u'children'] = artifactRevisionGrandChildDictList

                artifactRevisionChildDictList.append(artifactRevisionChildDict)
            artifactRevisionDict[u'children'] = artifactRevisionChildDictList
        
        artifactRevisionDictList.append(artifactRevisionDict)
        artifactDict[u'revisions'] = artifactRevisionDictList

        #artifactBrowseTerms
        if includeBrowseTerms is True:
            artifactBrowseTermDOs = artifactDO.browseTerms
            artifactBrowseTermDictList = []
            for artifactBrowseTermDO in artifactBrowseTermDOs:
                artifactBrowseTermDict = {}
                artifactBrowseTermDict[u'id'] = artifactBrowseTermDO.id
                if artifactBrowseTermDO.name:
                    artifactBrowseTermDict[u'name'] = artifactBrowseTermDO.name
                if artifactBrowseTermDO.encodedID:
                    artifactBrowseTermDict[u'encodedID'] = artifactBrowseTermDO.encodedID
                if artifactBrowseTermDO.handle:
                    artifactBrowseTermDict[u'handle'] = artifactBrowseTermDO.handle
                if artifactBrowseTermDO.description:
                    artifactBrowseTermDict[u'description'] = artifactBrowseTermDO.description
                if artifactBrowseTermDO.parentID:
                    artifactBrowseTermDict[u'parentID'] = artifactBrowseTermDO.parentID
                
                artifactBrowseTermTypeDO = artifactBrowseTermDO.type
                if artifactBrowseTermTypeDO:
                    artifactBrowseTermTypeDict = {}
                    artifactBrowseTermTypeDict[u'id'] = artifactBrowseTermTypeDO.id
                    if artifactBrowseTermTypeDO.name:
                        artifactBrowseTermTypeDict[u'name'] = artifactBrowseTermTypeDO.name
                    artifactBrowseTermDict[u'type'] = artifactBrowseTermTypeDict
                
                if includeBrowseTermStandards is True:
                    artifactBrowseTermStandardDOs = artifactBrowseTermDO.standards
                    artifactBrowseTermStandardDictList=[]
                    for artifactBrowseTermStandardDO in artifactBrowseTermStandardDOs:
                        artifactBrowseTermStandardDict = {}
                        artifactBrowseTermStandardDict[u'id'] = artifactBrowseTermStandardDO.id
                        if artifactBrowseTermStandardDO.title:
                            artifactBrowseTermStandardDict[u'title'] = artifactBrowseTermStandardDO.title
                        if artifactBrowseTermStandardDO.description:
                            artifactBrowseTermStandardDict[u'description'] = artifactBrowseTermStandardDO.description
                        if artifactBrowseTermStandardDO.section:
                            artifactBrowseTermStandardDict[u'section'] = artifactBrowseTermStandardDO.section
                        
                        artifactBrowseTermStandardSubjectDO =  artifactBrowseTermStandardDO.subject
                        if artifactBrowseTermStandardSubjectDO:
                            artifactBrowseTermStandardSubjectDict = {}
                            artifactBrowseTermStandardSubjectDict[u'id'] = artifactBrowseTermStandardSubjectDO.id
                            if artifactBrowseTermStandardSubjectDO.name:
                                artifactBrowseTermStandardSubjectDict[u'name'] = artifactBrowseTermStandardSubjectDO.name
                            artifactBrowseTermStandardDict[u'subject'] = artifactBrowseTermStandardSubjectDict

                        artifactBrowseTermStandardBoardDO = artifactBrowseTermStandardDO.standardBoard
                        if artifactBrowseTermStandardBoardDO:
                            artifactBrowseTermStandardBoardDict = {}
                            artifactBrowseTermStandardBoardDict[u'id'] = artifactBrowseTermStandardBoardDO.id
                            if artifactBrowseTermStandardBoardDO.name:
                                artifactBrowseTermStandardBoardDict[u'name'] = artifactBrowseTermStandardBoardDO.name
                            if artifactBrowseTermStandardBoardDO.longname:
                                artifactBrowseTermStandardBoardDict[u'longName'] = artifactBrowseTermStandardBoardDO.longname
                            if artifactBrowseTermStandardBoardDO.sequence:
                                artifactBrowseTermStandardBoardDict[u'sequence'] = artifactBrowseTermStandardBoardDO.sequence
                            artifactBrowseTermStandardBoardCountryDO = artifactBrowseTermStandardBoardDO.country
                            if artifactBrowseTermStandardBoardCountryDO:
                                artifactBrowseTermStandardBoardCountryDict = {}
                                artifactBrowseTermStandardBoardCountryDict[u'id'] = artifactBrowseTermStandardBoardCountryDO.id
                                if artifactBrowseTermStandardBoardCountryDO.name:
                                    artifactBrowseTermStandardBoardCountryDict[u'name'] = artifactBrowseTermStandardBoardCountryDO.name
                                if artifactBrowseTermStandardBoardCountryDO.code2Letter:
                                    artifactBrowseTermStandardBoardCountryDict[u'twoLetterCode'] = artifactBrowseTermStandardBoardCountryDO.code2Letter
                                if artifactBrowseTermStandardBoardCountryDO.code3Letter:
                                    artifactBrowseTermStandardBoardCountryDict[u'threeLetterCode'] = artifactBrowseTermStandardBoardCountryDO.code3Letter
                                if artifactBrowseTermStandardBoardCountryDO.codeNumeric:
                                    artifactBrowseTermStandardBoardCountryDict[u'numericCode'] = artifactBrowseTermStandardBoardCountryDO.codeNumeric
                                if artifactBrowseTermStandardBoardCountryDO.image:
                                    artifactBrowseTermStandardBoardCountryDict[u'image'] = artifactBrowseTermStandardBoardCountryDO.image
                                if artifactBrowseTermStandardBoardCountryDO.creationTime:
                                    artifactBrowseTermStandardBoardCountryDict[u'createdTime'] = str(artifactBrowseTermStandardBoardCountryDO.creationTime)
                                if artifactBrowseTermStandardBoardCountryDO.updateTime:
                                    artifactBrowseTermStandardBoardCountryDict[u'updatedTime'] = str(artifactBrowseTermStandardBoardCountryDO.updateTime)        
                                artifactBrowseTermStandardBoardDict[u'country'] = artifactBrowseTermStandardBoardCountryDict
                            artifactBrowseTermStandardDict[u'board'] = artifactBrowseTermStandardBoardDict
                        
                        if includeBrowseTermStandardGrades is True:
                            artifactBrowseTermStandardGradeDOs = artifactBrowseTermStandardDO.grades
                            artifactBrowseTermStandardGradeDictList = []
                            for artifactBrowseTermStandardGradeDO in artifactBrowseTermStandardGradeDOs:
                                artifactBrowseTermStandardGradeDict = {}
                                artifactBrowseTermStandardGradeDict[u'id'] = artifactBrowseTermStandardGradeDO.id
                                if artifactBrowseTermStandardGradeDO.name:
                                    artifactBrowseTermStandardGradeDict[u'name'] = artifactBrowseTermStandardGradeDO.name
                                artifactBrowseTermStandardGradeDictList.append(artifactBrowseTermStandardGradeDict)
                            artifactBrowseTermStandardDict[u'grades'] = artifactBrowseTermStandardGradeDictList
                        
                        artifactBrowseTermStandardDictList.append(artifactBrowseTermStandardDict)
                    artifactBrowseTermDict[u'standards'] = artifactBrowseTermStandardDictList

                artifactBrowseTermDictList.append(artifactBrowseTermDict)
            artifactDict[u'browseTerms'] = artifactBrowseTermDictList

        #artifactTagTerms
        if includeTagTerms is True:
            artifactTagTermDOs = artifactDO.tagTerms
            artifactTagTermDictList = []
            for artifactTagTermDO in artifactTagTermDOs:
                artifactTagTermDict = {}
                artifactTagTermDict[u'id'] = artifactTagTermDO.id
                if artifactTagTermDO.name:
                    artifactTagTermDict[u'name'] = artifactTagTermDO.name
                artifactTagTermDictList.append(artifactTagTermDict)
            artifactDict[u'tagTerms'] = artifactTagTermDictList

        #artifactSearchTerms
        if includeSearchTerms is True:
            artifactSearchTermDOs = artifactDO.searchTerms
            artifactSearchTermDictList = []
            for artifactSearchTermDO in artifactSearchTermDOs:
                artifactSearchTermDict = {}
                artifactSearchTermDict[u'id'] = artifactSearchTermDO.id
                if artifactSearchTermDO.name:
                    artifactSearchTermDict[u'name'] = artifactSearchTermDO.name
                artifactSearchTermDictList.append(artifactSearchTermDict)
            artifactDict[u'searchTerms'] = artifactSearchTermDictList

        #artifactVocabularies
        if includeVocabularies is True:
            artifactVocabularyRelationDOs = artifactDO.vocabulary
            artifactVocabularyDictList = []
            for artifactVocabularyRelationDO in artifactVocabularyRelationDOs:
                artifactVocabularyDO = artifactVocabularyRelationDO.vocabulary
                artifactVocabularyDict = {}
                artifactVocabularyDict[u'id'] = artifactVocabularyDO.id
                if artifactVocabularyDO.term:
                    artifactVocabularyDict[u'term'] = artifactVocabularyDO.term
                if artifactVocabularyDO.definition:
                    artifactVocabularyDict[u'definition'] = artifactVocabularyDO.definition
                artifactVocabularyLanguageDO = artifactVocabularyDO.language
                if artifactVocabularyLanguageDO:
                    artifactVocabularyLanguageDict = {}
                    artifactVocabularyLanguageDict[u'id'] = artifactVocabularyLanguageDO.id
                    if artifactVocabularyLanguageDO.code:
                        artifactVocabularyLanguageDict[u'code'] = artifactVocabularyLanguageDO.code
                    if artifactVocabularyLanguageDO.name:
                        artifactVocabularyLanguageDict[u'name'] = artifactVocabularyLanguageDO.name
                    artifactVocabularyDict[u'language'] =  artifactVocabularyLanguageDict
                artifactVocabularyDictList.append(artifactVocabularyDict)
            artifactDict[u'vocabularies'] = artifactVocabularyDictList

        #artifactDomainCollectionContexts
        if includeDomainCollectionContexts is True:
            artifactDomainCollectionContextDOs = artifactDO.domainCollectionContexts

            domainEncodedIDs = []
            collectionCreatorIDConceptCollectionHandlesMap = {}
            for artifactDomainCollectionContextDO in artifactDomainCollectionContextDOs:
                if artifactDomainCollectionContextDO.domain and artifactDomainCollectionContextDO.domain.encodedID:
                    domainEncodedIDs.append(artifactDomainCollectionContextDO.domain.encodedID)

                if artifactDomainCollectionContextDO.collectionCreatorID and artifactDomainCollectionContextDO.conceptCollectionHandle:
                    collectionCreatorID = artifactDomainCollectionContextDO.collectionCreatorID
                    conceptCollectionHandle = artifactDomainCollectionContextDO.conceptCollectionHandle
                    if collectionCreatorID not in collectionCreatorIDConceptCollectionHandlesMap:
                        collectionCreatorIDConceptCollectionHandlesMap[collectionCreatorID] = []
                    if conceptCollectionHandle not in collectionCreatorIDConceptCollectionHandlesMap[collectionCreatorID]:
                        collectionCreatorIDConceptCollectionHandlesMap[collectionCreatorID].append(conceptCollectionHandle)    

            #Domain (Concept) Related Info from Mongo - Currently being used to give back 'status' (deleted vs published) to client
            #Can be removed when we do hard delete of invalid domains from FLX DB
            domainEncodedIDConceptNodeMap = {}
            if domainEncodedIDs:
                encodedIDConceptInfos = self.conceptNode.getByEncodedIDs(domainEncodedIDs)
                for encodedIDConceptInfo in encodedIDConceptInfos:
                    encodedID =  encodedIDConceptInfo.get('encodedID')
                    if encodedID:
                        domainEncodedIDConceptNodeMap[encodedID] = encodedIDConceptInfo

            #Collection Related Info from Mongo - These should be populated by a call to taxonomy instead of a fetching from cache
            collectionContextCollectionNodeMap = {}
            if collectionCreatorIDConceptCollectionHandlesMap:
                for collectionCreatorID, conceptCollectionHandles in collectionCreatorIDConceptCollectionHandlesMap.items():
                    conceptCollectionHandleInfos = self.collectionNode.getByConceptCollectionHandles(conceptCollectionHandles=conceptCollectionHandles, collectionCreatorID=collectionCreatorID, publishedOnly=True)
                    for conceptCollectionHandleInfo in conceptCollectionHandleInfos:
                        conceptCollectionHandle = conceptCollectionHandleInfo.get('handle')
                        collectionCreatorID = conceptCollectionHandleInfo.get('collection').get('creatorID')
                        if conceptCollectionHandle and collectionCreatorID:
                            if (conceptCollectionHandle, collectionCreatorID) not in collectionContextCollectionNodeMap:
                                collectionContextCollectionNodeMap[(conceptCollectionHandle, collectionCreatorID)] = conceptCollectionHandleInfo

            #These can be any browseTermCollectionContexts at the DBSchema level
            #We make sure those browseTerms are domain-typed in the application layer
            artifactDomainCollectionContextDictList = []
            for artifactDomainCollectionContextDO in artifactDomainCollectionContextDOs:                
                artifactDomainCollectionContextDict = {}

                #domainInfo - will mandatorily be present for all domainCollectionContexts
                if artifactDomainCollectionContextDO.domain and artifactDomainCollectionContextDO.domain.type and artifactDomainCollectionContextDO.domain.type.name in ('domain', 'pseudodomain'):
                    artifactDomainCollectionContextDomainDO = artifactDomainCollectionContextDO.domain
                    artifactDomainCollectionContextDomainTypeDO = artifactDomainCollectionContextDomainDO.type                

                    artifactDomainCollectionContextDomainDict = {}
                    artifactDomainCollectionContextDomainDict[u'id'] = artifactDomainCollectionContextDomainDO.id
                    if artifactDomainCollectionContextDomainDO.name:
                        artifactDomainCollectionContextDomainDict[u'name'] = artifactDomainCollectionContextDomainDO.name
                    if artifactDomainCollectionContextDomainDO.encodedID:
                        artifactDomainCollectionContextDomainDict[u'encodedID'] = artifactDomainCollectionContextDomainDO.encodedID
                    if artifactDomainCollectionContextDomainDO.handle:
                        artifactDomainCollectionContextDomainDict[u'handle'] = artifactDomainCollectionContextDomainDO.handle
                    if artifactDomainCollectionContextDomainDO.description:
                        artifactDomainCollectionContextDomainDict[u'description'] = artifactDomainCollectionContextDomainDO.description
                    if artifactDomainCollectionContextDomainDO.parentID:
                        artifactDomainCollectionContextDomainDict[u'parentID'] = artifactDomainCollectionContextDomainDO.parentID

                    artifactDomainCollectionContextDomainTypeDict = {}
                    artifactDomainCollectionContextDomainTypeDict[u'id'] = artifactDomainCollectionContextDomainTypeDO.id
                    if artifactDomainCollectionContextDomainTypeDO.name:
                        artifactDomainCollectionContextDomainTypeDict[u'name'] = artifactDomainCollectionContextDomainTypeDO.name
                    artifactDomainCollectionContextDomainDict[u'type'] = artifactDomainCollectionContextDomainTypeDict

                    #Add other domain (concept) related info from taxonomy (not stored in the primary FLXDB)
                    conceptNode = {}
                    subjectID = None
                    branchID = None
                    if artifactDomainCollectionContextDomainDO.encodedID:
                        if artifactDomainCollectionContextDomainDO.encodedID in domainEncodedIDConceptNodeMap:
                            conceptNode = domainEncodedIDConceptNodeMap.get(artifactDomainCollectionContextDomainDO.encodedID)
                        if artifactDomainCollectionContextDomainDO.encodedID.count('.') >= 2:
                            artifactDomainCollectionContextDomainDOEncodedIDParts = artifactDomainCollectionContextDomainDO.encodedID.split('.')
                            subjectID = artifactDomainCollectionContextDomainDOEncodedIDParts[0]
                            branchID = artifactDomainCollectionContextDomainDOEncodedIDParts[1]

                    conceptStatus = conceptNode.get('status') if conceptNode.get('status') else 'deleted'
                    if conceptStatus:
                        artifactDomainCollectionContextDomainDict[u'status'] = conceptStatus

                    conceptOldHandles = conceptNode.get('oldHandles') if conceptNode.get('oldHandles') else []
                    if conceptOldHandles:
                        artifactDomainCollectionContextDomainDict[u'oldHandles'] = conceptOldHandles

                    conceptBranch = conceptNode.get('branch') if conceptNode.get('branch') else ArtifactDataModel.branchInfos.get(branchID)
                    if conceptBranch:
                        artifactDomainCollectionContextDomainDict[u'branch'] = conceptBranch 

                    conceptSubject = conceptNode.get('subject') if conceptNode.get('subject') else ArtifactDataModel.subjectInfos.get(subjectID)
                    if conceptSubject:
                        artifactDomainCollectionContextDomainDict[u'subject'] = conceptSubject

                    artifactDomainCollectionContextDict[u'domain'] = artifactDomainCollectionContextDomainDict

                    #collectionContext - though present with in the domain-check condition, will be present at the same level as 'domain' in the response
                    if artifactDomainCollectionContextDO.conceptCollectionHandle and artifactDomainCollectionContextDO.collectionCreatorID:
                        conceptCollectionHandle = artifactDomainCollectionContextDO.conceptCollectionHandle
                        collectionCreatorID = artifactDomainCollectionContextDO.collectionCreatorID

                        artifactDomainCollectionContextCollectionDict = {}
                        artifactDomainCollectionContextCollectionDict[u'conceptCollectionHandle'] = conceptCollectionHandle
                        artifactDomainCollectionContextCollectionDict[u'collectionCreatorID'] = collectionCreatorID
                        
                        #Add other collection related info from taxonomy (not stored in the primary FLXDB)
                        if (conceptCollectionHandle, collectionCreatorID) in collectionContextCollectionNodeMap:
                            collectionNode = collectionContextCollectionNodeMap.get((conceptCollectionHandle, collectionCreatorID))
                            conceptCollectionTitle = collectionNode.get('title')
                            conceptCollectionAbsoluteHandle = collectionNode.get('absoluteHandle')
                            collectionHandle = collectionNode.get('collection').get('handle')
                            collectionTitle = collectionNode.get('collection').get('title')
                            isCollectionCanonical = collectionNode.get('collection').get('isCanonical')
                            if conceptCollectionAbsoluteHandle:
                                artifactDomainCollectionContextCollectionDict['conceptCollectionAbsoluteHandle'] = conceptCollectionAbsoluteHandle                        
                            if conceptCollectionTitle:
                                artifactDomainCollectionContextCollectionDict['conceptCollectionTitle'] = conceptCollectionTitle
                            if collectionHandle:
                                artifactDomainCollectionContextCollectionDict['collectionHandle'] = collectionHandle                        
                            if collectionTitle:
                                artifactDomainCollectionContextCollectionDict['collectionTitle'] = collectionTitle
                            if isCollectionCanonical:
                                artifactDomainCollectionContextCollectionDict['isCanonical'] = True
                            else:
                                artifactDomainCollectionContextCollectionDict['isCanonical'] = False

                        artifactDomainCollectionContextDict[u'collectionContext'] = artifactDomainCollectionContextCollectionDict

                artifactDomainCollectionContextDictList.append(artifactDomainCollectionContextDict)
            artifactDict[u'domainCollectionContexts'] = artifactDomainCollectionContextDictList          

        return artifactDict

    def _generateArtifactDescendantDOsAndIdentifiers(self, artifactRevisionDO, artifactDescendantIdentifier):
        parentArtifactRevisionDOList = []
        parentArtifactRevisionDOList.append(artifactRevisionDO)
        
        #A valid and compressed list of integers are expected to be received here.
        for artifactDescendantIdentifierPart in artifactDescendantIdentifier:
            if artifactDescendantIdentifierPart == 0:
                artifactRevisionDO = artifactRevisionDO
            else:
                if artifactDescendantIdentifierPart <= len(artifactRevisionDO.children):
                    artifactRevisionDO = artifactRevisionDO.children[artifactDescendantIdentifierPart-1].child
                else:
                    raise exceptions.ResourceNotFoundException(u"ArtifactDescendant with the given artifactDescendantIdentifier : [{artifactDescendantIdentifier}] could not be found for the artifactRevision with artifactRevisionID : [{artifactRevisionID}].".format(artifactDescendantIdentifier=artifactDescendantIdentifier, artifactRevisionID=parentArtifactRevisionDOList[0].id).encode('utf-8'))
            parentArtifactRevisionDOList.append(artifactRevisionDO)

        descendantArtifactRevisionDO = artifactRevisionDO
        nextDescendantArtifactRevisionDO = None
        previousDescendantArtifactRevisionDO = None
        nextArtifactDescendantIdentifier = list(artifactDescendantIdentifier)
        previousArtifactDescendantIdentifier = list(artifactDescendantIdentifier)

        for i in range(0, len(descendantArtifactRevisionDO.children)):
            if descendantArtifactRevisionDO.children[i].child.artifact.type.name != 'concept':
                nextDescendantArtifactRevisionDO = descendantArtifactRevisionDO.children[i].child
                nextArtifactDescendantIdentifier.append(i+1)
                break                    

        #length of parentArtifactRevisionDOList by here will be equal to length of artifactDescendantIdentifier+1
        for index, artifactDescendantIdentifierPart in reversed(list(enumerate(artifactDescendantIdentifier))):
            if not nextDescendantArtifactRevisionDO or not previousDescendantArtifactRevisionDO:
                artifactRevisionDO = parentArtifactRevisionDOList[index+1]
                parentArtifactRevisionDO = parentArtifactRevisionDOList[index]
                
                if not nextDescendantArtifactRevisionDO:
                    del nextArtifactDescendantIdentifier[index]
                    if artifactDescendantIdentifierPart+1 <= len(parentArtifactRevisionDO.children):
                        for i in range(artifactDescendantIdentifierPart+1, len(parentArtifactRevisionDO.children)+1):
                            if parentArtifactRevisionDO.children[i-1].child.artifact.type.name != 'concept':
                                nextDescendantArtifactRevisionDO = parentArtifactRevisionDO.children[i-1].child
                                nextArtifactDescendantIdentifier.append(i)
                                break

                if not previousDescendantArtifactRevisionDO:
                    del previousArtifactDescendantIdentifier[index]
                    if artifactDescendantIdentifierPart-1 >= 1:
                        for i in reversed(range(1, artifactDescendantIdentifierPart)):
                            if parentArtifactRevisionDO.children[i-1].child.artifact.type.name != 'concept':
                                previousDescendantArtifactRevisionDO = parentArtifactRevisionDO.children[i-1].child
                                previousArtifactDescendantIdentifier.append(i)

                                for i in reversed(range(1, len(previousDescendantArtifactRevisionDO.children)+1)):
                                    if previousDescendantArtifactRevisionDO.children[i-1].child.artifact.type.name != 'concept':
                                        previousDescendantArtifactRevisionDO = previousDescendantArtifactRevisionDO.children[i-1].child
                                        previousArtifactDescendantIdentifier.append(i)
                                        break
                                break
                    elif artifactDescendantIdentifierPart-1 == 0:
                        previousDescendantArtifactRevisionDO = parentArtifactRevisionDO

        return descendantArtifactRevisionDO, artifactDescendantIdentifier, nextDescendantArtifactRevisionDO, nextArtifactDescendantIdentifier, previousDescendantArtifactRevisionDO, previousArtifactDescendantIdentifier

    def _generateArtifactDictWithDescendants(self, artifactDO, artifactRevisionDO, descendantArtifactRevisionDO, artifactDescendantIdentifier, nextDescendantArtifactRevisionDO, nextArtifactDescendantIdentifier, previousDescendantArtifactRevisionDO, previousArtifactDescendantIdentifier, queryOptions):
        if not isinstance(artifactDO, model.Artifact) or not artifactDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactDO : [{artifactDO}] received.".format(artifactDO=artifactDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactDO):
            raise exceptions.InvalidArgumentException(u"Given artifactDO with artifactID : [{artifactID}] is not attached to the current session.".format(artifactID=artifactDO.id).encode('utf-8'))
                
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))

        artifactDict = {}
        artifactDict[u'revisionID'] = artifactRevisionDO.id
        artifactDict[u'id'] = artifactDO.id
        if artifactDO.name:
            artifactDict[u'title'] = artifactDO.name
        if artifactDO.handle:
            artifactDict[u'handle'] = artifactDO.handle
        if artifactDO.encodedID:
            artifactDict[u'encodedID'] = artifactDO.encodedID
        if artifactDO.description:
            artifactDict[u'description'] = artifactDO.description
        if artifactDO.type and artifactDO.type.name:
            artifactDict[u'type'] = artifactDO.type.name
        if artifactDO.creator and artifactDO.creator.login:
            artifactDict[u'creator'] = artifactDO.creator.login
        if artifactDO.creationTime:
            artifactDict[u'createdTime'] = str(artifactDO.creationTime)
        if artifactDO.updateTime:
            artifactDict[u'updatedTime'] = str(artifactDO.updateTime)

        if descendantArtifactRevisionDO:
            descendantArtifactDict = self.generateArtifactDict(descendantArtifactRevisionDO.artifact, descendantArtifactRevisionDO, **queryOptions)
            if artifactDescendantIdentifier:
                descendantArtifactDict[u'identifier'] = '.'.join(str(i) for i in artifactDescendantIdentifier)
            artifactDict[u'descendantArtifact'] = descendantArtifactDict
        
        if nextDescendantArtifactRevisionDO:
            nextDescendantArtifactDict = {}
            nextDescendantArtifactDict[u'revisionID'] = nextDescendantArtifactRevisionDO.id
            nextDescendantArtifactDO = nextDescendantArtifactRevisionDO.artifact
            if nextDescendantArtifactDO:
                nextDescendantArtifactDict[u'id'] = nextDescendantArtifactDO.id
                if nextDescendantArtifactDO.name:
                    nextDescendantArtifactDict[u'title'] = nextDescendantArtifactDO.name
                if nextDescendantArtifactDO.handle:
                    nextDescendantArtifactDict[u'handle'] = nextDescendantArtifactDO.handle
                if nextDescendantArtifactDO.encodedID:
                    nextDescendantArtifactDict[u'encodedID'] = nextDescendantArtifactDO.encodedID
                if nextDescendantArtifactDO.description:
                    nextDescendantArtifactDict[u'description'] = nextDescendantArtifactDO.description
                if nextDescendantArtifactDO.type and nextDescendantArtifactDO.type.name:
                    nextDescendantArtifactDict[u'type'] = nextDescendantArtifactDO.type.name
                if nextDescendantArtifactDO.creator and nextDescendantArtifactDO.creator.login:
                    nextDescendantArtifactDict[u'creator'] = nextDescendantArtifactDO.creator.login
                if nextDescendantArtifactDO.creationTime:
                    nextDescendantArtifactDict[u'createdTime'] = str(nextDescendantArtifactDO.creationTime)
                if nextDescendantArtifactDO.updateTime:
                    nextDescendantArtifactDict[u'updatedTime'] = str(nextDescendantArtifactDO.updateTime)
            if nextArtifactDescendantIdentifier:
                nextDescendantArtifactDict[u'identifier'] = '.'.join(str(i) for i in nextArtifactDescendantIdentifier)
            artifactDict[u'nextDescendantArtifact'] = nextDescendantArtifactDict

        if previousDescendantArtifactRevisionDO:
            previousDescendantArtifactDict = {}
            previousDescendantArtifactDict[u'revisionID'] = previousDescendantArtifactRevisionDO.id
            previousDescendantArtifactDO = previousDescendantArtifactRevisionDO.artifact
            if previousDescendantArtifactDO:
                previousDescendantArtifactDict[u'id'] = previousDescendantArtifactDO.id
                if previousDescendantArtifactDO.name:
                    previousDescendantArtifactDict[u'title'] = previousDescendantArtifactDO.name
                if previousDescendantArtifactDO.handle:
                    previousDescendantArtifactDict[u'handle'] = previousDescendantArtifactDO.handle
                if previousDescendantArtifactDO.encodedID:
                    previousDescendantArtifactDict[u'encodedID'] = previousDescendantArtifactDO.encodedID
                if previousDescendantArtifactDO.description:
                    previousDescendantArtifactDict[u'description'] = previousDescendantArtifactDO.description
                if previousDescendantArtifactDO.type and previousDescendantArtifactDO.type.name:
                    previousDescendantArtifactDict[u'type'] = previousDescendantArtifactDO.type.name
                if previousDescendantArtifactDO.creator and previousDescendantArtifactDO.creator.login:
                    previousDescendantArtifactDict[u'creator'] = previousDescendantArtifactDO.creator.login
                if previousDescendantArtifactDO.creationTime:
                    previousDescendantArtifactDict[u'createdTime'] = str(previousDescendantArtifactDO.creationTime)
                if previousDescendantArtifactDO.updateTime:
                    previousDescendantArtifactDict[u'updatedTime'] = str(previousDescendantArtifactDO.updateTime)
            if previousArtifactDescendantIdentifier:
                previousDescendantArtifactDict[u'identifier'] = '.'.join(str(i) for i in previousArtifactDescendantIdentifier)
            artifactDict[u'previousDescendantArtifact'] = previousDescendantArtifactDict

        return artifactDict

    def _generateArtifactFeedbackDictList(self, artifactDO, considerFeedbacksWithCommentOnly=False, includeHelpfuls=False, includeAbuseReports=False, includeReviews=False, includeReviewAbuseReports=False, offset=0, limit=0):
        if not isinstance(artifactDO, model.Artifact) or not artifactDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactDO : [{artifactDO}] received.".format(artifactDO=artifactDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactDO):
            raise exceptions.InvalidArgumentException(u"Given artifactDO with artifactID : [{artifactID}] is not attached to the current session.".format(artifactID=artifactDO.id).encode('utf-8'))
                
        artifactFeedbackDOsQuery = meta.Session.query(model.ArtifactFeedback).filter(model.ArtifactFeedback.artifactID==artifactDO.id)
        if considerFeedbacksWithCommentOnly:
            artifactFeedbackDOsQuery = artifactFeedbackDOsQuery.filter(model.ArtifactFeedback.comments != None)
        
        artifactFeedbackDOsQuery = artifactFeedbackDOsQuery.order_by(model.ArtifactFeedback.creationTime.desc())
        
        if offset:
            artifactFeedbackDOsQuery = artifactFeedbackDOsQuery.offset(offset)
        if limit:
            artifactFeedbackDOsQuery = artifactFeedbackDOsQuery.limit(limit)
        
        artifactFeedbackDOs = artifactFeedbackDOsQuery.all()
        artifactFeedbackDictList = []
        for artifactFeedbackDO in artifactFeedbackDOs:
            artifactFeedbackDict = {}
            artifactFeedbackDict[u'artifactID'] = artifactFeedbackDO.artifactID
            artifactFeedbackDict[u'type'] = artifactFeedbackDO.type
            if artifactFeedbackDO.score:
                artifactFeedbackDict[u'score'] = artifactFeedbackDO.score
            if artifactFeedbackDO.comments:
                artifactFeedbackDict[u'comment'] = artifactFeedbackDO.comments
            if artifactFeedbackDO.creationTime:
                artifactFeedbackDict[u'createdTime'] = str(artifactFeedbackDO.creationTime)
            if artifactFeedbackDO.isApproved:
                artifactFeedbackDict[u'isApproved'] = True
            else:
                artifactFeedbackDict[u'isApproved'] = False
           
            artifactFeedbackCreatorDO = artifactFeedbackDO.member
            if artifactFeedbackCreatorDO:
                artifactFeedbackCreatorDict = {}
                artifactFeedbackCreatorDict[u'id'] = artifactFeedbackCreatorDO.id
                if artifactFeedbackCreatorDO.login:
                    artifactFeedbackCreatorDict[u'login'] = artifactFeedbackCreatorDO.login
                """if artifactFeedbackCreatorDO.defaultLogin:
                    artifactFeedbackCreatorDict[u'defaultLogin'] = artifactFeedbackCreatorDO.defaultLogin
                if artifactFeedbackCreatorDO.email:
                    artifactFeedbackCreatorDict[u'email'] = artifactFeedbackCreatorDO.email"""
                if artifactFeedbackCreatorDO.givenName:
                    artifactFeedbackCreatorDict[u'name'] = artifactFeedbackCreatorDO.givenName
                if artifactFeedbackCreatorDO.surname:
                    artifactFeedbackCreatorDict[u'surName'] = artifactFeedbackCreatorDO.surname
                """if artifactFeedbackCreatorDO.timezone:
                    artifactFeedbackCreatorDict[u'timeZone'] = artifactFeedbackCreatorDO.timezone"""
                artifactFeedbackDict[u'creator'] = artifactFeedbackCreatorDict

            if includeHelpfuls:
                artifactFeedbackHelpfulDictList = []
                totalHelpfuls = 0
                totalPositiveHelpfuls = 0
                totalNegativeHelpfuls = 0
                for artifactFeedbackHelpfulDO in artifactFeedbackDO.helpfuls:
                    artifactFeedbackHelpfulDict = {}
                    totalHelpfuls = totalHelpfuls+1
                    if artifactFeedbackHelpfulDO.isHelpful:
                        artifactFeedbackHelpfulDict[u'isHelpful'] = True
                        totalPositiveHelpfuls = totalPositiveHelpfuls+1
                    else:
                        artifactFeedbackHelpfulDict[u'isHelpful'] = False
                        totalNegativeHelpfuls = totalNegativeHelpfuls+1

                    artifactFeedbackHelpfulReviewerDO = artifactFeedbackHelpfulDO.member
                    if artifactFeedbackHelpfulReviewerDO:
                        artifactFeedbackHelpfulReviewerDict = {}
                        artifactFeedbackHelpfulReviewerDict[u'id'] = artifactFeedbackHelpfulReviewerDO.id
                        if artifactFeedbackHelpfulReviewerDO.login:
                            artifactFeedbackHelpfulReviewerDict[u'login'] = artifactFeedbackHelpfulReviewerDO.login
                        """if artifactFeedbackHelpfulReviewerDO.defaultLogin:
                            artifactFeedbackHelpfulReviewerDict[u'defaultLogin'] = artifactFeedbackHelpfulReviewerDO.defaultLogin
                        if artifactFeedbackHelpfulReviewerDO.email:
                            artifactFeedbackHelpfulReviewerDict[u'email'] = artifactFeedbackHelpfulReviewerDO.email"""
                        if artifactFeedbackHelpfulReviewerDO.givenName:
                            artifactFeedbackHelpfulReviewerDict[u'name'] = artifactFeedbackHelpfulReviewerDO.givenName
                        if artifactFeedbackHelpfulReviewerDO.surname:
                            artifactFeedbackHelpfulReviewerDict[u'surName'] = artifactFeedbackHelpfulReviewerDO.surname
                        """if artifactFeedbackHelpfulReviewerDO.timezone:
                            artifactFeedbackHelpfulReviewerDict[u'timeZone'] = artifactFeedbackHelpfulReviewerDO.timezone"""
                        artifactFeedbackHelpfulDict[u'reviewer'] = artifactFeedbackHelpfulReviewerDict
                    artifactFeedbackHelpfulDictList.append(artifactFeedbackHelpfulDict)
                artifactFeedbackDict[u'helpfuls'] = artifactFeedbackHelpfulDictList
                artifactFeedbackDict[u'aggregateHelpfuls'] = {}
                artifactFeedbackDict[u'aggregateHelpfuls'][u'totalHelpfuls'] = totalHelpfuls
                artifactFeedbackDict[u'aggregateHelpfuls'][u'totalPositiveHelpfuls'] = totalPositiveHelpfuls
                artifactFeedbackDict[u'aggregateHelpfuls'][u'totalNegativeHelpfuls'] = totalNegativeHelpfuls
                
            if includeAbuseReports:
                artifactFeedbackAbuseReportDictList = []
                for artifactFeedbackAbuseReportDO in artifactFeedbackDO.abuseReports:
                    artifactFeedbackAbuseReportDict = {}
                    if artifactFeedbackAbuseReportDO.comments:
                        artifactFeedbackAbuseReportDict[u'comments'] = artifactFeedbackAbuseReportDO.comments
                    if artifactFeedbackAbuseReportDO.creationTime:
                        artifactFeedbackAbuseReportDict[u'createdTime'] = str(artifactFeedbackAbuseReportDO.creationTime)

                    artifactFeedbackAbuseReportReporterDO = artifactFeedbackAbuseReportDO.member
                    if artifactFeedbackAbuseReportReporterDO:
                        artifactFeedbackAbuseReportReporterDict = {}
                        artifactFeedbackAbuseReportReporterDict[u'id'] = artifactFeedbackAbuseReportReporterDO.id
                        if artifactFeedbackAbuseReportReporterDO.login:
                            artifactFeedbackAbuseReportReporterDict[u'login'] = artifactFeedbackAbuseReportReporterDO.login
                        """if artifactFeedbackAbuseReportReporterDO.defaultLogin:
                            artifactFeedbackAbuseReportReporterDict[u'defaultLogin'] = artifactFeedbackAbuseReportReporterDO.defaultLogin
                        if artifactFeedbackAbuseReportReporterDO.email:
                            artifactFeedbackAbuseReportReporterDict[u'email'] = artifactFeedbackAbuseReportReporterDO.email"""
                        if artifactFeedbackAbuseReportReporterDO.givenName:
                            artifactFeedbackAbuseReportReporterDict[u'name'] = artifactFeedbackAbuseReportReporterDO.givenName
                        if artifactFeedbackAbuseReportReporterDO.surname:
                            artifactFeedbackAbuseReportReporterDict[u'surName'] = artifactFeedbackAbuseReportReporterDO.surname
                        """if artifactFeedbackAbuseReportReporterDO.timezone:
                            artifactFeedbackAbuseReportReporterDict[u'timeZone'] = artifactFeedbackAbuseReportReporterDO.timezone"""
                        artifactFeedbackAbuseReportDict[u'reporter'] = artifactFeedbackAbuseReportReporterDict
                    artifactFeedbackAbuseReportDictList.append(artifactFeedbackAbuseReportDict)
                artifactFeedbackDict[u'abuseReports'] = artifactFeedbackAbuseReportDictList                
            
            if includeReviews:
                artifactFeedbackReviewDictList = []
                for artifactFeedbackReviewDO in artifactFeedbackDO.reviews:
                    artifactFeedbackReviewDict = {}
                    artifactFeedbackReviewDict[u'id'] = artifactFeedbackReviewDO.id
                    if artifactFeedbackReviewDO.reviewComment:
                        artifactFeedbackReviewDict[u'reviewComment'] = artifactFeedbackReviewDO.reviewComment
                    if artifactFeedbackReviewDO.creationTime:
                        artifactFeedbackReviewDict[u'createdTime'] = str(artifactFeedbackReviewDO.creationTime)
                    if artifactFeedbackReviewDO.updationTime:
                        artifactFeedbackReviewDict[u'updateTime'] = str(artifactFeedbackReviewDO.updationTime)
                    if artifactFeedbackReviewDO.notAbuse:
                        artifactFeedbackReviewDict[u'isAbused'] = False
                    else:
                        artifactFeedbackReviewDict[u'isAbused'] = True

                    artifactFeedbackReviewReviewerDO = artifactFeedbackReviewDO.member
                    if artifactFeedbackReviewReviewerDO:
                        artifactFeedbackReviewReviewerDict = {}
                        artifactFeedbackReviewReviewerDict[u'id'] = artifactFeedbackReviewReviewerDO.id
                        if artifactFeedbackReviewReviewerDO.login:
                            artifactFeedbackReviewReviewerDict[u'login'] = artifactFeedbackReviewReviewerDO.login
                        """if artifactFeedbackReviewReviewerDO.defaultLogin:
                            artifactFeedbackReviewReviewerDict[u'defaultLogin'] = artifactFeedbackReviewReviewerDO.defaultLogin
                        if artifactFeedbackReviewReviewerDO.email:
                            artifactFeedbackReviewReviewerDict[u'email'] = artifactFeedbackReviewReviewerDO.email"""
                        if artifactFeedbackReviewReviewerDO.givenName:
                            artifactFeedbackReviewReviewerDict[u'name'] = artifactFeedbackReviewReviewerDO.givenName
                        if artifactFeedbackReviewReviewerDO.surname:
                            artifactFeedbackReviewReviewerDict[u'surName'] = artifactFeedbackReviewReviewerDO.surname
                        """if artifactFeedbackReviewReviewerDO.timezone:
                            artifactFeedbackReviewReviewerDict[u'timeZone'] = artifactFeedbackReviewReviewerDO.timezone"""
                        artifactFeedbackReviewDict[u'reviewer'] = artifactFeedbackReviewReviewerDict
                    
                    if includeReviewAbuseReports:
                        artifactFeedbackReviewAbuseReportDictList = []
                        for artifactFeedbackReviewAbuseReportDO in artifactFeedbackReviewDO.abuseReports:
                            artifactFeedbackReviewAbuseReportDict = {}
                            if artifactFeedbackReviewAbuseReportDO.comments:
                                artifactFeedbackReviewAbuseReportDict[u'comments'] = artifactFeedbackReviewAbuseReportDO.comments
                            if artifactFeedbackReviewAbuseReportDO.creationTime:
                                artifactFeedbackReviewAbuseReportDict[u'createdTime'] = str(artifactFeedbackReviewAbuseReportDO.creationTime)

                            artifactFeedbackReviewAbuseReportReporterDO = artifactFeedbackReviewAbuseReportDO.member
                            if artifactFeedbackReviewAbuseReportReporterDO:
                                artifactFeedbackReviewAbuseReportReporterDict = {}
                                artifactFeedbackReviewAbuseReportReporterDict[u'id'] = artifactFeedbackReviewAbuseReportReporterDO.id
                                if artifactFeedbackReviewAbuseReportReporterDO.login:
                                    artifactFeedbackReviewAbuseReportReporterDict[u'login'] = artifactFeedbackReviewAbuseReportReporterDO.login
                                """if artifactFeedbackReviewAbuseReportReporterDO.defaultLogin:
                                    artifactFeedbackReviewAbuseReportReporterDict[u'defaultLogin'] = artifactFeedbackReviewAbuseReportReporterDO.defaultLogin
                                if artifactFeedbackReviewAbuseReportReporterDO.email:
                                    artifactFeedbackReviewAbuseReportReporterDict[u'email'] = artifactFeedbackReviewAbuseReportReporterDO.email"""
                                if artifactFeedbackReviewAbuseReportReporterDO.givenName:
                                    artifactFeedbackReviewAbuseReportReporterDict[u'name'] = artifactFeedbackReviewAbuseReportReporterDO.givenName
                                if artifactFeedbackReviewAbuseReportReporterDO.surname:
                                    artifactFeedbackReviewAbuseReportReporterDict[u'surName'] = artifactFeedbackReviewAbuseReportReporterDO.surname
                                """if artifactFeedbackReviewAbuseReportReporterDO.timezone:
                                    artifactFeedbackReviewAbuseReportReporterDict[u'timeZone'] = artifactFeedbackReviewAbuseReportReporterDO.timezone"""
                                artifactFeedbackReviewAbuseReportDict[u'reporter'] = artifactFeedbackReviewAbuseReportReporterDict
                            artifactFeedbackReviewAbuseReportDictList.append(artifactFeedbackReviewAbuseReportDict)   
                        artifactFeedbackReviewDict[u'abuseReports'] = artifactFeedbackReviewAbuseReportDictList
                    artifactFeedbackReviewDictList.append(artifactFeedbackReviewDict)
                artifactFeedbackDict['reviews'] = artifactFeedbackReviewDictList                    
            
            artifactFeedbackDictList.append(artifactFeedbackDict)
        
        return artifactFeedbackDictList

    def _generateArtifactDraftDict(self, artifactDraftDO):
        if not isinstance(artifactDraftDO, model.ArtifactDraft) or not artifactDraftDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactDraftDO : [{artifactDraftDO}] received.".format(artifactDraftDO=artifactDraftDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactDraftDO):
            raise exceptions.InvalidArgumentException(u"Given artifactDraftDO with artifactDraftID : [{artifactDraftID}] is not attached to the current session.".format(artifactDraftID=artifactDraftDO.id).encode('utf-8'))
        
        artifactDraftDict = {}
        artifactDraftDict[u'id'] = artifactDraftDO.id
        artifactDraftDict[u'handle'] = artifactDraftDO.handle
        artifactDraftDict[u'typeID'] = artifactDraftDO.artifactTypeID
        artifactDraftDict[u'creatorID'] = artifactDraftDO.creatorID
        if artifactDraftDO.artifactRevisionID:
            artifactDraftDict[u'artifactRevisionID'] = artifactDraftDO.artifactRevisionID
        if artifactDraftDO.isCompressed:
            try:
                artifactDraftData = zlib.decompress(artifactDraftDO.draft)
            except:
                artifactDraftData = artifactDraftDO.draft
        else:
            artifactDraftData = artifactDraftDO.draft
        try:
            artifactDict = json.loads(artifactDraftData)
        except Exception:
            raise exceptions.SystemDataException(u"Invalid artifactDraftData : [{artifactDraftData}] is stored as a draft for a draft with artifactDraftID : [{artifactDraftID}] in the database.Internal System data error.Could be an invalid JSON. Please rectify by calling the updateAPI or contacting the admin.".format(artifactDraftData=artifactDraftData, artifactDraftID=artifactDraftDO.id).encode('utf-8'))

        artifactDraftDict[u'draft'] = artifactDict
        artifactDraftDict[u'createdTime'] = artifactDraftDO.created.replace(tzinfo=Local).isoformat()
        artifactDraftDict[u'updatedTime'] = artifactDraftDO.updated.replace(tzinfo=Local).isoformat()
        return artifactDraftDict    

    def _generateCurrentLoggedInMemberDict(self, session):
        currentLoggedInMemberDict = {}
        currentLoggedInMember = user.getCurrentUser(anonymousOkay=False, autoLogin=True, throwbackException=False,  txSession=session)
        if currentLoggedInMember:
            currentLoggedInMemberDict['memberID'] = currentLoggedInMember.id
            currentLoggedInMemberDict['memberEmail'] = currentLoggedInMember.email
            currentLoggedInMemberDict['memberLogin'] = currentLoggedInMember.login
            currentLoggedInMemberDict['memberDefaultLogin'] = currentLoggedInMember.defaultLogin        
        return currentLoggedInMemberDict  

    #currently considers only the first revision in the revisionsArray
    def _processResponseDictForLibraryInfos(self, memberDict, responseDict, responseDictFormat):
        if not memberDict:
            raise Exception(u"Invalid memberDict : [{memberDict}] is received.".format(memberDict=memberDict).encode('utf-8'))
                
        if not isinstance(responseDict, dict):
            raise exceptions.InvalidArgumentException(u"Invalid type responseDict : [{responseDict}] received. A valid dict is expected.".format(responseDict=responseDict).encode('utf-8'))

        if responseDictFormat not in ('ARTIFACT_DRAFT', 'ARTIFACT_DESCENDANT', 'ARTIFACT'):
            raise Exception(u"Invalid responseDictFormat : [{responseDictFormat}] is received.".format(responseDictFormat=responseDictFormat).encode('utf-8'))
        
        artifactRevisionDict = {}
        if responseDictFormat == 'ARTIFACT_DRAFT':
            if isinstance(responseDict.get('draft'), dict) and isinstance(responseDict['draft'].get('revisions'), list) and len(responseDict['draft']['revisions'])>0 and isinstance(responseDict['draft']['revisions'][0], dict):
                artifactRevisionDict = responseDict['draft']['revisions'][0]
        elif responseDictFormat == 'ARTIFACT_DESCENDANT':
            if isinstance(responseDict.get('descendantArtifact'), dict) and isinstance(responseDict['descendantArtifact'].get('revisions'), list) and len(responseDict['descendantArtifact'].get('revisions'))>0 and isinstance(responseDict['descendantArtifact']['revisions'][0], dict):
                artifactRevisionDict =  responseDict['descendantArtifact']['revisions'][0] 
        else:
            if isinstance(responseDict.get('revisions'), list) and len(responseDict.get('revisions'))>0 and isinstance(responseDict['revisions'][0], dict):
                artifactRevisionDict = responseDict['revisions'][0]
        
        artifactRevisionID = None
        if artifactRevisionDict.has_key('artifactRevisionID'):
            artifactRevisionID = artifactRevisionDict.get('artifactRevisionID')
        elif artifactRevisionDict.has_key('id'):
            artifactRevisionID = artifactRevisionDict.get('id')
        
        if memberDict and artifactRevisionID:
            artifactRevisionIDLibraryInfosMap = self.getMemberArtifactLibraryInfosByArtifactRevisionIDs(memberDict, [artifactRevisionID], isSubTransaction=True)
            if artifactRevisionIDLibraryInfosMap.has_key(artifactRevisionID):
                artifactRevisionDict[u'libraryInfos'] = artifactRevisionIDLibraryInfosMap[artifactRevisionID]
            else:
                artifactRevisionDict[u'libraryInfos'] = []

        return responseDict

    #currently considers only the first revision in the revisionsArray
    def _processResponseDictForChildrenDraftInfos(self, memberDict, responseDict, responseDictFormat):
        if not memberDict:
            raise Exception(u"Invalid memberDict : [{memberDict}] is received.".format(memberDict=memberDict).encode('utf-8'))
                
        if not isinstance(responseDict, dict):
            raise exceptions.InvalidArgumentException(u"Invalid type responseDict : [{responseDict}] received. A valid dict is expected.".format(responseDict=responseDict).encode('utf-8'))

        if responseDictFormat not in ('ARTIFACT_DRAFT', 'ARTIFACT_DESCENDANT', 'ARTIFACT'):
            raise Exception(u"Invalid responseDictFormat : [{responseDictFormat}] is received.".format(responseDictFormat=responseDictFormat).encode('utf-8'))
        
        childDicts = []
        if responseDictFormat == 'ARTIFACT_DRAFT':
            if isinstance(responseDict.get('draft'), dict) and isinstance(responseDict['draft'].get('revisions'), list) and len(responseDict['draft']['revisions'])>0 and isinstance(responseDict['draft']['revisions'][0], dict) and isinstance(responseDict['draft']['revisions'][0].get('children'), list):
                childDicts = responseDict['draft']['revisions'][0]['children']
        elif responseDictFormat == 'ARTIFACT_DESCENDANT':
            if isinstance(responseDict.get('descendantArtifact'), dict) and isinstance(responseDict['descendantArtifact'].get('revisions'), list) and len(responseDict['descendantArtifact'].get('revisions'))>0 and isinstance(responseDict['descendantArtifact']['revisions'][0], dict) and isinstance(responseDict['descendantArtifact']['revisions'][0].get('children'), list):
                childDicts =  responseDict['descendantArtifact']['revisions'][0]['children']  
        else:
            if isinstance(responseDict.get('revisions'), list) and len(responseDict.get('revisions'))>0 and isinstance(responseDict['revisions'][0], dict) and isinstance(responseDict['revisions'][0].get('children'), list):
                childDicts = responseDict['revisions'][0]['children'] 
        
        childArtifactRevisionIDs = []
        for childDict in childDicts:
            if isinstance(childDict, dict):
                childArtifactRevisionID = 0
                if childDict.has_key('artifactRevisionID'):
                    childArtifactRevisionID = childDict['artifactRevisionID']
                elif childDict.has_key('revisionID'):
                    childArtifactRevisionID = childDict['revisionID']
                if childArtifactRevisionID:
                    childArtifactRevisionIDs.append(childArtifactRevisionID)

        artifactChildArtifactDraftCountsMap = {}
        artifactDraftInfosMap = {}
        if memberDict and childArtifactRevisionIDs:
            artifactChildArtifactDraftCountsMap = self.getMemberArtifactChildArtifactDraftCountsByArtifactRevisionIDs(memberDict, childArtifactRevisionIDs, isSubTransaction=True)
            artifactDraftInfosMap = self.getMemberArtifactDraftInfosByArtifactRevisionIDs(memberDict, childArtifactRevisionIDs, isSubTransaction=True)

        for childDict in childDicts:
            if isinstance(childDict, dict):
                childArtifactRevisionID = 0
                if childDict.has_key('artifactRevisionID'):
                    childArtifactRevisionID = childDict['artifactRevisionID']
                elif childDict.has_key('revisionID'):
                    childArtifactRevisionID = childDict['revisionID']
                
                if childArtifactRevisionID:
                    if artifactChildArtifactDraftCountsMap.has_key(childArtifactRevisionID):
                        childDict['draftChildrenCount'] = artifactChildArtifactDraftCountsMap[childArtifactRevisionID]
                    else:
                        childDict['draftChildrenCount'] = 0

                    if artifactDraftInfosMap.has_key(childArtifactRevisionID):
                        artifactDraftInfo = artifactDraftInfosMap[childArtifactRevisionID]
                        childDict['hasDraft'] = True
                        childDict['draftInfo'] = {}
                        childDict['draftInfo']['draftTypeID'] = artifactDraftInfo[0]
                        childDict['draftInfo']['draftHandle'] = artifactDraftInfo[1]
                        childDict['draftInfo']['draftCreatorID'] = artifactDraftInfo[2]
                        childDict['draftInfo']['draftCreatedTime'] = artifactDraftInfo[3]
                        childDict['draftInfo']['draftLastUpdatedTime'] = artifactDraftInfo[4]
                    else:
                        childDict['hasDraft'] = False 

        return responseDict

    def _extractAndProcessArtifactDraftDict(self, artifactRevisionDO, includeProcessedContent=False, includeChildrenDraftInfos=False, includeLibraryInfos=False):
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))
        
        artifactDraftDict = None
        currentLoggedInMemberDict = self._generateCurrentLoggedInMemberDict(session=meta.Session)
        if currentLoggedInMemberDict and artifactRevisionDO.id:
            try:
                artifactDraftDict = self.getArtifactDraftByArtifactRevisionID(currentLoggedInMemberDict, artifactRevisionDO.id, isSubTransaction=True)
                artifactDraftDict['isDraft'] = True

                #noiseRemoval - look like front end is storing a JSON with draftFlags as well. 
                if isinstance(artifactDraftDict, dict) and isinstance(artifactDraftDict.get('draft'), dict):
                    artifactDraftDict['draft'].pop('isDraft', False)
                    artifactDraftDict['draft'].pop('hasDraft', False)
                    artifactDraftDict['draft'].pop('hasXhtml', False)
                    artifactDraftDict['draft'].pop('children', [])
                    
                    if isinstance(artifactDraftDict['draft'].get('revisions'), list) and len(artifactDraftDict['draft']['revisions'])>0 and isinstance(artifactDraftDict['draft']['revisions'][0].get('children'), list):
                        childDicts = artifactDraftDict['draft']['revisions'][0]['children']
                        for childDict in childDicts:
                            if isinstance(childDict, dict):
                                childDict.pop('draftChildrenCount', 0)
                                childDict.pop('hasDraft', False)
                
                if includeProcessedContent and isinstance(artifactDraftDict, dict) and isinstance(artifactDraftDict.get('draft'), dict) and artifactDraftDict['draft'].get('xhtml') and not artifactDraftDict['draft']['xhtml'].find('<!--This is not content XHTML. Ignore-->') >= 0:
                    artifactRevisionContentRevisionContentRawContentXHTML = artifactDraftDict['draft']['xhtml']
                    artifactResourceSatelliteURLsDict = self._generateArtifactResourceSatelliteURLsDict(artifactRevisionDO)
                    artifactDraftDict['draft']['processedXhtml'] = self._processRawContentXHTML(artifactRevisionContentRevisionContentRawContentXHTML, artifactResourceSatelliteURLsDict)
                
                if includeChildrenDraftInfos:
                    artifactDraftDict = self._processResponseDictForChildrenDraftInfos(currentLoggedInMemberDict, artifactDraftDict, 'ARTIFACT_DRAFT')
                
                if includeLibraryInfos:
                    artifactDraftDict = self._processResponseDictForLibraryInfos(currentLoggedInMemberDict, artifactDraftDict, 'ARTIFACT_DRAFT')

            except exceptions.ResourceNotFoundException:
                pass
        return artifactDraftDict

    def _processArtifactDictForDraftInfo(self, memberDict, artifactRevisionDO, artifactDict, artifactDictFormat):
        if not memberDict:
            raise Exception(u"Invalid memberDict : [{memberDict}] is received.".format(memberDict=memberDict).encode('utf-8'))
         
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))
        
        if not isinstance(artifactDict, dict):
            raise exceptions.InvalidArgumentException(u"Invalid type artifactDict : [{artifactDict}] received. A valid dict is expected.".format(artifactDict=artifactDict).encode('utf-8'))

        if artifactDictFormat not in ('ARTIFACT_DESCENDANT', 'ARTIFACT'):
            raise Exception(u"Invalid artifactDictFormat : [{artifactDictFormat}] is received.".format(artifactDictFormat=artifactDictFormat).encode('utf-8'))
        
        if artifactDictFormat == 'ARTIFACT_DESCENDANT':
            actualArtifactDict =  artifactDict['descendantArtifact'] if isinstance(artifactDict.get('descendantArtifact'), dict) else {}
        else:
            actualArtifactDict = artifactDict

        if memberDict and artifactRevisionDO.id and actualArtifactDict:
            artifactDraftInfosMap = self.getMemberArtifactDraftInfosByArtifactRevisionIDs(memberDict, [artifactRevisionDO.id], isSubTransaction=True)                
            if artifactDraftInfosMap and artifactDraftInfosMap.get(artifactRevisionDO.id):
                artifactDraftInfo = artifactDraftInfosMap[artifactRevisionDO.id]
                actualArtifactDict['hasDraft'] = True
                actualArtifactDict['draftInfo'] = {}
                actualArtifactDict['draftInfo']['draftTypeID'] = artifactDraftInfo[0]
                actualArtifactDict['draftInfo']['draftHandle'] = artifactDraftInfo[1]
                actualArtifactDict['draftInfo']['draftCreatorID'] = artifactDraftInfo[2]
                actualArtifactDict['draftInfo']['draftCreatedTime'] = artifactDraftInfo[3]
                actualArtifactDict['draftInfo']['draftLastUpdatedTime'] = artifactDraftInfo[4]
            else:
                actualArtifactDict['hasDraft'] = False

        return artifactDict
    
    def _processArtifactDict(self, artifactRevisionDO, artifactDict, artifactDictFormat, includeDraftInfo=False, includeChildrenDraftInfos=False, includeLibraryInfos=False):
        if not isinstance(artifactRevisionDO, model.ArtifactRevision) or not artifactRevisionDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionDO : [{artifactRevisionDO}] received.".format(artifactRevisionDO=artifactRevisionDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(artifactRevisionDO):
            raise exceptions.InvalidArgumentException(u"Given artifactRevisionDO with artifactRevisionID: [{artifactRevisionID}] is not attached to the current session.".format(artifactRevisionID=artifactRevisionDO.id).encode('utf-8'))
                
        if not isinstance(artifactDict, dict):
            raise exceptions.InvalidArgumentException(u"Invalid type artifactDict : [{artifactDict}] received. A valid dict is expected.".format(artifactDict=artifactDict).encode('utf-8'))

        if artifactDictFormat not in ('ARTIFACT_DESCENDANT', 'ARTIFACT'):
            raise Exception(u"Invalid artifactDictFormat : [{artifactDictFormat}] is received.".format(artifactDictFormat=artifactDictFormat).encode('utf-8'))
        
        if includeDraftInfo or includeChildrenDraftInfos or includeLibraryInfos:
            currentLoggedInMemberDict = self._generateCurrentLoggedInMemberDict(session=meta.Session)
            if currentLoggedInMemberDict and artifactRevisionDO.id:
                if artifactDictFormat == 'ARTIFACT_DESCENDANT':
                    if isinstance(artifactDict.get('descendantArtifact'), dict):
                        artifactDict['descendantArtifact']['isDraft'] = False
                else:
                    artifactDict['isDraft'] = False

                if includeDraftInfo:
                    artifactDict = self._processArtifactDictForDraftInfo(currentLoggedInMemberDict, artifactRevisionDO, artifactDict, artifactDictFormat)    

                if includeChildrenDraftInfos:
                    artifactDict = self._processResponseDictForChildrenDraftInfos(currentLoggedInMemberDict, artifactDict, artifactDictFormat)

                if includeLibraryInfos:
                    artifactDict = self._processResponseDictForLibraryInfos(currentLoggedInMemberDict, artifactDict, artifactDictFormat)
        return artifactDict

    def getMemberArtifactLibraryInfosByArtifactRevisionIDs(self, memberDict, artifactRevisionIDs, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')    
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))
            
            if not isinstance(artifactRevisionIDs, list) or not artifactRevisionIDs or not all((isinstance(artifactRevisionID, long) or isinstance(artifactRevisionID, int)) for artifactRevisionID in artifactRevisionIDs):
                raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionIDs : [{artifactRevisionIDs}] is received.".format(artifactRevisionIDs=artifactRevisionIDs).encode('utf-8'))

            artifactRevisionIDArtifactIDInfos = meta.Session.query(meta.ArtifactRevisions.c.id, meta.ArtifactRevisions.c.artifactID).filter(meta.ArtifactRevisions.c.id.in_(artifactRevisionIDs)).all()
            artifactIDArtifactRevisionIDsMap = {}
            for artifactRevisionIDArtifactIDInfo in artifactRevisionIDArtifactIDInfos:
                artifactRevisionID = artifactRevisionIDArtifactIDInfo[0]
                artifactID = artifactRevisionIDArtifactIDInfo[1]
                if artifactID not in artifactIDArtifactRevisionIDsMap:
                    artifactIDArtifactRevisionIDsMap[artifactID] = []
                artifactIDArtifactRevisionIDsMap[artifactID].append(artifactRevisionID)
            artifactIDs = artifactIDArtifactRevisionIDsMap.keys()

            artifactRevisionIDLibraryInfosMap = {}
            if artifactIDs:
                artifactLibraryInfos = meta.Session.query(meta.MemberLibraryObjects.c.objectID, meta.MemberLibraryObjects.c.created, meta.ArtifactRevisions.c.artifactID).filter(meta.MemberLibraryObjects.c.memberID == memberID, meta.MemberLibraryObjects.c.objectType == 'artifactRevision').join(meta.ArtifactRevisions, meta.MemberLibraryObjects.c.objectID==meta.ArtifactRevisions.c.id).filter(meta.ArtifactRevisions.c.artifactID.in_(artifactIDs)).all()
                for artifactLibraryInfo in artifactLibraryInfos:
                    artifactRevisionLibraryInfo = {}
                    artifactRevisionLibraryInfo[u'revisionID'] = artifactLibraryInfo[0]
                    artifactRevisionLibraryInfo[u'addedTime'] = artifactLibraryInfo[1]
                    
                    artifactID = artifactLibraryInfo[2]
                    artifactRevisionIDs = artifactIDArtifactRevisionIDsMap[artifactID]
                    for artifactRevisionID in artifactRevisionIDs:
                        if artifactRevisionID not in artifactRevisionIDLibraryInfosMap:
                            artifactRevisionIDLibraryInfosMap[artifactRevisionID] = []
                        artifactRevisionIDLibraryInfosMap[artifactRevisionID].append(artifactRevisionLibraryInfo)

            meta.Session.commit()
            return artifactRevisionIDLibraryInfosMap
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()     

    def getMemberArtifactDraftInfosByArtifactRevisionIDs(self, memberDict, artifactRevisionIDs, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')    
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            if not isinstance(artifactRevisionIDs, list) or not artifactRevisionIDs or not all((isinstance(artifactRevisionID, long) or isinstance(artifactRevisionID, int)) for artifactRevisionID in artifactRevisionIDs):
                raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionIDs : [{artifactRevisionIDs}] is received.".format(artifactRevisionIDs=artifactRevisionIDs).encode('utf-8'))

            artifactDraftInfos = meta.Session.query(meta.ArtifactDraft.c.artifactRevisionID, meta.ArtifactDraft.c.artifactTypeID, meta.ArtifactDraft.c.handle, meta.ArtifactDraft.c.creatorID, meta.ArtifactDraft.c.created, meta.ArtifactDraft.c.updated).filter(meta.ArtifactDraft.c.creatorID == memberID, meta.ArtifactDraft.c.artifactRevisionID.in_(artifactRevisionIDs)).all()
            artifactDraftInfosMap = {}
            for artifactDraftInfo in artifactDraftInfos:
               artifactDraftInfosMap[artifactDraftInfo[0]] = artifactDraftInfo[1:]
            meta.Session.commit()
            return artifactDraftInfosMap
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()  

    def getMemberArtifactChildArtifactDraftCountsByArtifactRevisionIDs(self, memberDict, artifactRevisionIDs, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')    
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))
            
            if not isinstance(artifactRevisionIDs, list) or not artifactRevisionIDs or not all((isinstance(artifactRevisionID, long) or isinstance(artifactRevisionID, int)) for artifactRevisionID in artifactRevisionIDs):
                raise exceptions.InvalidArgumentException(u"Invalid artifactRevisionIDs : [{artifactRevisionIDs}] is received.".format(artifactRevisionIDs=artifactRevisionIDs).encode('utf-8'))

            artifactChildArtifactDraftCounts = meta.Session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, func.count(meta.ArtifactRevisionRelations.c.artifactRevisionID)).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID.in_(artifactRevisionIDs)).join(meta.ArtifactDraft, and_(meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==meta.ArtifactDraft.c.artifactRevisionID, meta.ArtifactDraft.c.creatorID==memberID)).group_by(meta.ArtifactRevisionRelations.c.artifactRevisionID).all()
            artifactChildArtifactDraftCountsMap = {}
            for artifactChildArtifactDraftCount in artifactChildArtifactDraftCounts:
                artifactChildArtifactDraftCountsMap[artifactChildArtifactDraftCount[0]] = artifactChildArtifactDraftCount[1]

            meta.Session.commit()
            return artifactChildArtifactDraftCountsMap
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove() 
  
    
    def getArtifactByRevisionIDAndDescendantIdentifier(self, artifactRevisionID, artifactDescendantIdentifier, queryOptions, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            artifactRevisionDOFromRevisionID = meta.Session.query(model.ArtifactRevision).get(artifactRevisionID)
            if artifactRevisionDOFromRevisionID is None:
                raise exceptions.ResourceNotFoundException(u"ArtifactRevsion with the given artifactRevisionID : [{artifactRevisionID}] could not be found in the dataBase.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))
            
            responseDict = None
            returnDraftIfDraftExists = queryOptions.pop('returnDraftIfDraftExists', False)
            includeChildrenDraftInfos = queryOptions.pop('includeChildrenDraftInfos', False)
            includeLibraryInfos = queryOptions.pop('includeLibraryInfos', False)
            if artifactDescendantIdentifier:
                artifactDescendantDOsAndIdentifiers = self._generateArtifactDescendantDOsAndIdentifiers(artifactRevisionDOFromRevisionID, artifactDescendantIdentifier)
                if returnDraftIfDraftExists:
                    includeProcessedContent = queryOptions.get('includeProcessedContent', False)
                    artifactDraftDict = self._extractAndProcessArtifactDraftDict(artifactDescendantDOsAndIdentifiers[0], includeProcessedContent, includeChildrenDraftInfos, includeLibraryInfos)
                    if artifactDraftDict:
                        artifactDict = self._generateArtifactDictWithDescendants(artifactRevisionDOFromRevisionID.artifact, artifactRevisionDOFromRevisionID, None, None, artifactDescendantDOsAndIdentifiers[2], artifactDescendantDOsAndIdentifiers[3], artifactDescendantDOsAndIdentifiers[4], artifactDescendantDOsAndIdentifiers[5], queryOptions)
                        artifactDict['descendantArtifact'] = artifactDraftDict
                        responseDict = artifactDict
                
                if not responseDict:
                    includeDraftInfo = queryOptions.pop('includeDraftInfo', False)
                    artifactDict = self._generateArtifactDictWithDescendants(artifactRevisionDOFromRevisionID.artifact, artifactRevisionDOFromRevisionID, artifactDescendantDOsAndIdentifiers[0], artifactDescendantDOsAndIdentifiers[1], artifactDescendantDOsAndIdentifiers[2], artifactDescendantDOsAndIdentifiers[3], artifactDescendantDOsAndIdentifiers[4], artifactDescendantDOsAndIdentifiers[5], queryOptions)
                    artifactDict = self._processArtifactDict(artifactDescendantDOsAndIdentifiers[0], artifactDict, 'ARTIFACT_DESCENDANT', includeDraftInfo, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDict
            else:
                if returnDraftIfDraftExists:
                    includeProcessedContent = queryOptions.get('includeProcessedContent', False)
                    artifactDraftDict = self._extractAndProcessArtifactDraftDict(artifactRevisionDOFromRevisionID, includeProcessedContent, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDraftDict

                if not responseDict:
                    includeDraftInfo = queryOptions.pop('includeDraftInfo', False)
                    artifactDict = self.generateArtifactDict(artifactRevisionDOFromRevisionID.artifact, artifactRevisionDOFromRevisionID, **queryOptions)
                    artifactDict = self._processArtifactDict(artifactRevisionDOFromRevisionID, artifactDict, 'ARTIFACT', includeDraftInfo, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDict

            meta.Session.commit()
            return responseDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactByIDRevisionNOAndDescendantIdentifier(self, artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            artifactDOFromID = meta.Session.query(model.Artifact).get(artifactID)
            if not artifactDOFromID:
                raise exceptions.ResourceNotFoundException(u"Artifact with the given artifactID : [{artifactID}] could not be found in the dataBase.".format(artifactID=artifactID).encode('utf-8'))
            
            if artifactRevisionNO:
                try:
                    artifactRevisionDOFromIDAndRevisionNO = meta.Session.query(model.ArtifactRevision).filter(model.ArtifactRevision.artifactID == artifactID, model.ArtifactRevision.revision == artifactRevisionNO).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevsion with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination could not be found in the dataBase.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple ArtifactRevsions with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination are found in the dataBase. Internal System data error.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
            else:
                artifactRevisionDOFromIDAndRevisionNO = artifactDOFromID.revisions[0]
            
            responseDict = None
            returnDraftIfDraftExists = queryOptions.pop('returnDraftIfDraftExists', False)
            includeChildrenDraftInfos = queryOptions.pop('includeChildrenDraftInfos', False)
            includeLibraryInfos = queryOptions.pop('includeLibraryInfos', False)
            if artifactDescendantIdentifier:
                artifactDescendantDOsAndIdentifiers = self._generateArtifactDescendantDOsAndIdentifiers(artifactRevisionDOFromIDAndRevisionNO, artifactDescendantIdentifier)
                if returnDraftIfDraftExists:
                    includeProcessedContent = queryOptions.get('includeProcessedContent', False)
                    artifactDraftDict = self._extractAndProcessArtifactDraftDict(artifactDescendantDOsAndIdentifiers[0], includeProcessedContent, includeChildrenDraftInfos, includeLibraryInfos)
                    if artifactDraftDict:
                        artifactDict = self._generateArtifactDictWithDescendants(artifactDOFromID, artifactRevisionDOFromIDAndRevisionNO, None, None, artifactDescendantDOsAndIdentifiers[2], artifactDescendantDOsAndIdentifiers[3], artifactDescendantDOsAndIdentifiers[4], artifactDescendantDOsAndIdentifiers[5], queryOptions)
                        artifactDict['descendantArtifact'] = artifactDraftDict
                        responseDict = artifactDict

                if not responseDict:
                    includeDraftInfo = queryOptions.pop('includeDraftInfo', False)
                    artifactDict = self._generateArtifactDictWithDescendants(artifactDOFromID, artifactRevisionDOFromIDAndRevisionNO, artifactDescendantDOsAndIdentifiers[0], artifactDescendantDOsAndIdentifiers[1], artifactDescendantDOsAndIdentifiers[2], artifactDescendantDOsAndIdentifiers[3], artifactDescendantDOsAndIdentifiers[4], artifactDescendantDOsAndIdentifiers[5], queryOptions)
                    artifactDict = self._processArtifactDict(artifactDescendantDOsAndIdentifiers[0], artifactDict, 'ARTIFACT_DESCENDANT', includeDraftInfo, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDict                 
            else:
                if returnDraftIfDraftExists:
                    includeProcessedContent = queryOptions.get('includeProcessedContent', False)
                    artifactDraftDict = self._extractAndProcessArtifactDraftDict(artifactRevisionDOFromIDAndRevisionNO, includeProcessedContent, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDraftDict

                if not responseDict:
                    includeDraftInfo = queryOptions.pop('includeDraftInfo', False)
                    artifactDict = self.generateArtifactDict(artifactDOFromID, artifactRevisionDOFromIDAndRevisionNO, **queryOptions)
                    artifactDict = self._processArtifactDict(artifactRevisionDOFromIDAndRevisionNO, artifactDict, 'ARTIFACT', includeDraftInfo, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDict

            meta.Session.commit()
            return responseDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier(self, artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            try:
                artifactTypeDO = meta.Session.query(meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name == artifactType).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactType with the given artifactType : [{artifactType}] could not be found in the dataBase.".format(artifactType=artifactType).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple ArtifactTypes with the given artifactType : [{artifactType}] are found in the dataBase. Internal System data error.".format(artifactType=artifactType).encode('utf-8'))            
            artifactTypeID = artifactTypeDO.id

            try:
                artifactCreatorDO = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == artifactCreator).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Member with the given memberLogin : [{artifactCreator}] could not be found in the dataBase.".format(artifactCreator=artifactCreator).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple members with the given memberLogin : [{artifactCreator}] are found in the dataBase. Internal System data error.".format(artifactCreator=artifactCreator).encode('utf-8'))
            artifactCreatorID = artifactCreatorDO.id

            try:
                artifactDOFromTypeHandleAndCreator = meta.Session.query(model.Artifact).filter(model.Artifact.artifactTypeID==artifactTypeID, model.Artifact.handle==artifactHandle, model.Artifact.creatorID==artifactCreatorID).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Artifact with the given artifactType : [{artifactType}], artifactHandle : [{artifactHandle}],  artifactCreator : [{artifactCreator}] combination could not be found in the dataBase.".format(artifactType=artifactType, artifactHandle=artifactHandle, artifactCreator=artifactCreator).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifacts with the given artifactType : [{artifactType}], artifactHandle : [{artifactHandle}],  artifactCreator : [{artifactCreator}] combination are found in the dataBase. Internal System data error.".format(artifactType=artifactType, artifactHandle=artifactHandle, artifactCreator=artifactCreator).encode('utf-8'))
            
            if artifactRevisionNO:
                try:
                    artifactID = artifactDOFromTypeHandleAndCreator.id
                    artifactRevisionDOFromTypeHandleCreatorAndRevisionNO = meta.Session.query(model.ArtifactRevision).filter(model.ArtifactRevision.artifactID == artifactID, model.ArtifactRevision.revision == artifactRevisionNO).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevsion with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination could not be found in the dataBase.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple ArtifactRevsions with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination are found in the dataBase. Internal System data error.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
            else:
                artifactRevisionDOFromTypeHandleCreatorAndRevisionNO = artifactDOFromTypeHandleAndCreator.revisions[0]

            responseDict = None
            returnDraftIfDraftExists = queryOptions.pop('returnDraftIfDraftExists', False)
            includeChildrenDraftInfos = queryOptions.pop('includeChildrenDraftInfos', False)
            includeLibraryInfos = queryOptions.pop('includeLibraryInfos', False)
            if artifactDescendantIdentifier:
                artifactDescendantDOsAndIdentifiers = self._generateArtifactDescendantDOsAndIdentifiers(artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, artifactDescendantIdentifier)
                if returnDraftIfDraftExists:
                    includeProcessedContent = queryOptions.get('includeProcessedContent', False)
                    artifactDraftDict = self._extractAndProcessArtifactDraftDict(artifactDescendantDOsAndIdentifiers[0], includeProcessedContent, includeChildrenDraftInfos, includeLibraryInfos)
                    if artifactDraftDict:
                        artifactDict = self._generateArtifactDictWithDescendants(artifactDOFromTypeHandleAndCreator, artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, None, None, artifactDescendantDOsAndIdentifiers[2], artifactDescendantDOsAndIdentifiers[3], artifactDescendantDOsAndIdentifiers[4], artifactDescendantDOsAndIdentifiers[5], queryOptions)
                        artifactDict['descendantArtifact'] = artifactDraftDict
                        responseDict = artifactDict

                if not responseDict:
                    includeDraftInfo = queryOptions.pop('includeDraftInfo', False)
                    artifactDict = self._generateArtifactDictWithDescendants(artifactDOFromTypeHandleAndCreator, artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, artifactDescendantDOsAndIdentifiers[0], artifactDescendantDOsAndIdentifiers[1], artifactDescendantDOsAndIdentifiers[2], artifactDescendantDOsAndIdentifiers[3], artifactDescendantDOsAndIdentifiers[4], artifactDescendantDOsAndIdentifiers[5], queryOptions)
                    artifactDict = self._processArtifactDict(artifactDescendantDOsAndIdentifiers[0], artifactDict, 'ARTIFACT_DESCENDANT', includeDraftInfo, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDict                 
                
            else:
                if returnDraftIfDraftExists:
                    includeProcessedContent = queryOptions.get('includeProcessedContent', False)
                    artifactDraftDict = self._extractAndProcessArtifactDraftDict(artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, includeProcessedContent, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDraftDict

                if not responseDict:
                    includeDraftInfo = queryOptions.pop('includeDraftInfo', False)
                    artifactDict = self.generateArtifactDict(artifactDOFromTypeHandleAndCreator, artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, **queryOptions)
                    artifactDict = self._processArtifactDict(artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, artifactDict, 'ARTIFACT', includeDraftInfo, includeChildrenDraftInfos, includeLibraryInfos)
                    responseDict = artifactDict

            includeCoverImage = queryOptions.pop('includeCoverImage', False)
            if includeCoverImage:
                coverImage = artifactDOFromTypeHandleAndCreator.getCoverImageUri()
                if coverImage:
                    artifactDict['coverImage'] = coverImage

            meta.Session.commit()
            return responseDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    
    def getArtifactFeedbacksByRevisionIDAndDescendantIdentifier(self, artifactRevisionID, artifactDescendantIdentifier, queryOptions, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            artifactRevisionDOFromRevisionID = meta.Session.query(model.ArtifactRevision).get(artifactRevisionID)
            if artifactRevisionDOFromRevisionID is None:
                raise exceptions.ResourceNotFoundException(u"ArtifactRevsion with the given artifactRevisionID : [{artifactRevisionID}] could not be found in the dataBase.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))
            
            if artifactDescendantIdentifier:
                artifactDescendantDOsAndIdentifiers = self._generateArtifactDescendantDOsAndIdentifiers(artifactRevisionDOFromRevisionID, artifactDescendantIdentifier)
                artifactForFeedbacksDO = artifactDescendantDOsAndIdentifiers[0].artifact
            else:
                artifactForFeedbacksDO = artifactRevisionDOFromRevisionID.artifact

            artifactFeedbackDictList = self._generateArtifactFeedbackDictList(artifactForFeedbacksDO, **queryOptions)
            meta.Session.commit()
            return artifactFeedbackDictList
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier(self, artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            artifactDOFromID = meta.Session.query(model.Artifact).get(artifactID)
            if not artifactDOFromID:
                raise exceptions.ResourceNotFoundException(u"Artifact with the given artifactID : [{artifactID}] could not be found in the dataBase.".format(artifactID=artifactID).encode('utf-8'))
            
            if artifactRevisionNO:
                try:
                    artifactRevisionDOFromIDAndRevisionNO = meta.Session.query(model.ArtifactRevision).filter(model.ArtifactRevision.artifactID == artifactID, model.ArtifactRevision.revision == artifactRevisionNO).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevsion with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination could not be found in the dataBase.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple ArtifactRevsions with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination are found in the dataBase. Internal System data error.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
            else:
                artifactRevisionDOFromIDAndRevisionNO = artifactDOFromID.revisions[0]

            if artifactDescendantIdentifier:
                artifactDescendantDOsAndIdentifiers = self._generateArtifactDescendantDOsAndIdentifiers(artifactRevisionDOFromIDAndRevisionNO, artifactDescendantIdentifier)
                artifactForFeedbacksDO = artifactDescendantDOsAndIdentifiers[0].artifact
            else:
                artifactForFeedbacksDO = artifactRevisionDOFromIDAndRevisionNO.artifact
            
            artifactFeedbackDictList = self._generateArtifactFeedbackDictList(artifactForFeedbacksDO, **queryOptions)
            meta.Session.commit()
            return artifactFeedbackDictList
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier(self, artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            try:
                artifactTypeDO = meta.Session.query(meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name == artifactType).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactType with the given artifactType : [{artifactType}] could not be found in the dataBase.".format(artifactType=artifactType).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple ArtifactTypes with the given artifactType : [{artifactType}] are found in the dataBase. Internal System data error.".format(artifactType=artifactType).encode('utf-8'))            
            artifactTypeID = artifactTypeDO.id

            try:
                artifactCreatorDO = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == artifactCreator).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Member with the given memberLogin : [{artifactCreator}] could not be found in the dataBase.".format(artifactCreator=artifactCreator).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple members with the given memberLogin : [{artifactCreator}] are found in the dataBase. Internal System data error.".format(artifactCreator=artifactCreator).encode('utf-8'))
            artifactCreatorID = artifactCreatorDO.id

            try:
                artifactDOFromTypeHandleAndCreator = meta.Session.query(model.Artifact).filter(model.Artifact.artifactTypeID==artifactTypeID, model.Artifact.handle==artifactHandle, model.Artifact.creatorID==artifactCreatorID).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Artifact with the given artifactType : [{artifactType}], artifactHandle : [{artifactHandle}],  artifactCreator : [{artifactCreator}] combination could not be found in the dataBase.".format(artifactType=artifactType, artifactHandle=artifactHandle, artifactCreator=artifactCreator).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifacts with the given artifactType : [{artifactType}], artifactHandle : [{artifactHandle}],  artifactCreator : [{artifactCreator}] combination are found in the dataBase. Internal System data error.".format(artifactType=artifactType, artifactHandle=artifactHandle, artifactCreator=artifactCreator).encode('utf-8'))            

            if artifactRevisionNO:
                try:
                    artifactID = artifactDOFromTypeHandleAndCreator.id
                    artifactRevisionDOFromTypeHandleCreatorAndRevisionNO = meta.Session.query(model.ArtifactRevision).filter(model.ArtifactRevision.artifactID == artifactID, model.ArtifactRevision.revision == artifactRevisionNO).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevsion with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination could not be found in the dataBase.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple ArtifactRevsions with the given artifactID : [{artifactID}] and artifactRevisionNO : [{artifactRevisionNO}] combination are found in the dataBase. Internal System data error.".format(artifactID=artifactID, artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
            else:            
                artifactRevisionDOFromTypeHandleCreatorAndRevisionNO = artifactDOFromTypeHandleAndCreator.revisions[0]

            if artifactDescendantIdentifier:
                artifactDescendantDOsAndIdentifiers = self._generateArtifactDescendantDOsAndIdentifiers(artifactRevisionDOFromTypeHandleCreatorAndRevisionNO, artifactDescendantIdentifier)
                artifactForFeedbacksDO = artifactDescendantDOsAndIdentifiers[0].artifact
            else:
                artifactForFeedbacksDO = artifactRevisionDOFromTypeHandleCreatorAndRevisionNO.artifact
            
            artifactFeedbackDictList = self._generateArtifactFeedbackDictList(artifactForFeedbacksDO, **queryOptions)
            meta.Session.commit()
            return artifactFeedbackDictList
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    
    def createArtifactDraft(self, memberDict, artifactDict, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            artifactDraftType = artifactDict.get('artifactType')
            try:
                artifactDraftTypeDO = meta.Session.query(meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name == artifactDraftType).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactType with the given artifactType : [{artifactDraftType}] could not be found in the dataBase.".format(artifactDraftType=artifactDraftType).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple ArtifactTypes with the given artifactType : [{artifactDraftType}] are found in the dataBase. Internal System data error.".format(artifactDraftType=artifactDraftType).encode('utf-8'))            
            artifactDraftTypeID = artifactDraftTypeDO.id

            artifactDraftHandle = artifactDict.get('handle')
            if not artifactDraftHandle:
                artifactBookTitle = artifactDict.get('bookTitle')
                if artifactBookTitle is None:
                    artifactBookTitle = ''    
                artifactTitle = artifactDict.get('title')
                if artifactTitle:
                    if artifactDraftType == 'chapter':
                        artifactTitle = self._appendBookNameToChapterName(artifactTitle, artifactBookTitle)
                    artifactDraftHandle = self._convertTitleToHandle(artifactTitle)
            if not artifactDraftHandle:
                    raise exceptions.InvalidArgumentException(u"Invalid handle : [{artifactDraftHandle}] is received.".format(artifactDraftHandle=artifactDraftHandle).encode('utf-8'))

            #artifactDraftHandle = self._convertTitleToHandle(artifactDraftHandle)
            try:
                #you can fire a query.one as type+owner+handle togeather forms the a unique key and only 1 result is guaranteed
                artifactDraftDOFromHandle= meta.Session.query(meta.ArtifactDraft.c.id).filter(meta.ArtifactDraft.c.handle==artifactDraftHandle, meta.ArtifactDraft.c.artifactTypeID==artifactDraftTypeID, meta.ArtifactDraft.c.creatorID==memberID).one()
            except exc.NoResultFound:
                artifactDraftDOFromHandle = None
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifactDrafts with the given handle : [{artifactDraftHandle}],  artifactType : [{artifactDraftType}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactDraftHandle=artifactDraftHandle, artifactDraftType=artifactDraftType, memberID=memberID).encode('utf-8'))   
            if artifactDraftDOFromHandle is not None:
                raise exceptions.ResourceAlreadyExistsException(u"Another ArtifactDraft with the received handle : [{artifactDraftHandle}], artifactType : [{artifactDraftType}], memberID : [{memberID}] combination already exists in the database.".format(artifactDraftHandle=artifactDraftHandle, artifactDraftType=artifactDraftType, memberID=memberID).encode('utf-8'))

            artifactDraftArtifactRevisionID = artifactDict.get('artifactRevisionID')
            if artifactDraftArtifactRevisionID:
                try:
                    artifactDraftArtifactRevisionInfo = meta.Session.query(meta.ArtifactRevisions.c.id, meta.Artifacts.c.creatorID).join(meta.Artifacts, meta.ArtifactRevisions.c.artifactID==meta.Artifacts.c.id).filter(meta.ArtifactRevisions.c.id == artifactDraftArtifactRevisionID).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevision with the given artifactRevisionID : [{artifactDraftArtifactRevisionID}] could not be found in the dataBase.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple artifactRevisions with the given artifactRevisionID : [{artifactDraftArtifactRevisionID}] are found in the dataBase. Internal System data error.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
                if artifactDraftArtifactRevisionInfo[1] != memberID:
                    raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized to create an artifactDraft with artifactRevisionID : [{artifactDraftArtifactRevisionID}].".format(memberID=memberID, artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))

                artifactID = artifactDict.get('artifactID')
                try:
                    latestArtifactRevisionID, = meta.Session.query(meta.ArtifactRevisions.c.id).filter(meta.ArtifactRevisions.c.artifactID == artifactID).order_by(model.ArtifactRevision.id.desc()).first()
                except exc.NoResultFound:
                    latestArtifactRevisionID = None
                if artifactDraftArtifactRevisionID != latestArtifactRevisionID:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevision with the given artifactRevisionID : [{artifactDraftArtifactRevisionID}] is not the latest one.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))

                try:
                    artifactDraftDOFromArtifactRevisionID = meta.Session.query(meta.ArtifactDraft.c.id).filter(meta.ArtifactDraft.c.artifactRevisionID==artifactDraftArtifactRevisionID, meta.ArtifactDraft.c.creatorID==memberID).one()
                except exc.NoResultFound:
                    artifactDraftDOFromArtifactRevisionID = None
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple artifactDrafts with the given artifactRevisionID : [{artifactDraftArtifactRevisionID}],  memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID, memberID=memberID).encode('utf-8'))
                if artifactDraftDOFromArtifactRevisionID is not None:
                    raise exceptions.ResourceAlreadyExistsException(u"Another ArtifactDraft with the received artifactRevisionID : [{artifactDraftArtifactRevisionID}], memberID : [{memberID}] combination already exists in the database.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID, memberID=memberID).encode('utf-8'))
                
            artifactDraftDO = model.ArtifactDraft(artifactTypeID=artifactDraftTypeID, handle=artifactDraftHandle, creatorID=memberID)
            if artifactDraftArtifactRevisionID:
                artifactDraftDO.artifactRevisionID = artifactDraftArtifactRevisionID            
            artifactDraftData = json.dumps(artifactDict)
            try:
                artifactDraftData = zlib.compress(artifactDraftData)
                isArtifactDraftDataCompressed = True
            except Exception, e:
                isArtifactDraftDataCompressed = False #compression failed - proceed with out compressing the content
            artifactDraftDO.draft = artifactDraftData
            artifactDraftDO.isCompressed = isArtifactDraftDataCompressed
        
            meta.Session.add(artifactDraftDO)
            meta.Session.flush()
            artifactDraftDict = self._generateArtifactDraftDict(artifactDraftDO)
            meta.Session.commit()
            return artifactDraftDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def updateArtifactDraftByID(self, memberDict, artifactDraftID, artifactDict, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            artifactDraftDOFromID = meta.Session.query(model.ArtifactDraft).get(artifactDraftID)
            if not artifactDraftDOFromID:
                raise exceptions.ResourceNotFoundException(u"ArtifactDraft with the given artifactDraftID : [{artifactDraftID}] could not be found in the dataBase.".format(artifactDraftID=artifactDraftID).encode('utf-8'))

            if artifactDraftDOFromID.creatorID != memberID:
                raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized to read or update or delete the artifactDraft with artifactDraftID : [{artifactDraftID}].".format(memberID=memberID, artifactDraftID=artifactDraftID).encode('utf-8'))

            artifactDraftType = artifactDict.get('artifactType')
            try:
                artifactDraftTypeDO = meta.Session.query(meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name == artifactDraftType).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactType with the given artifactType : [{artifactDraftType}] could not be found in the dataBase.".format(artifactDraftType=artifactDraftType).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple ArtifactTypes with the given artifactType : [{artifactDraftType}] are found in the dataBase. Internal System data error.".format(artifactDraftType=artifactDraftType).encode('utf-8'))            
            artifactDraftTypeID = artifactDraftTypeDO.id

            artifactDraftHandle = artifactDict.get('handle')
            if not artifactDraftHandle:
                artifactBookTitle = artifactDict.get('bookTitle')
                if artifactBookTitle is None:
                    artifactBookTitle = ''    
                artifactTitle = artifactDict.get('title')
                if artifactTitle:
                    if artifactDraftType == 'chapter':
                        artifactTitle = self._appendBookNameToChapterName(artifactTitle, artifactBookTitle)
                    artifactDraftHandle = self._convertTitleToHandle(artifactTitle)
            if not artifactDraftHandle:
                    raise exceptions.InvalidArgumentException(u"Invalid handle : [{artifactDraftHandle}] is received.".format(artifactDraftHandle=artifactDraftHandle).encode('utf-8'))

            #artifactDraftHandle = self._convertTitleToHandle(artifactDraftHandle)
            try:
                #you can fire a query.one as type+owner+handle togeather forms the a unique key and only 1 result is guaranteed
                artifactDraftDOFromHandle= meta.Session.query(meta.ArtifactDraft.c.id).filter(meta.ArtifactDraft.c.handle==artifactDraftHandle, meta.ArtifactDraft.c.artifactTypeID==artifactDraftTypeID, meta.ArtifactDraft.c.creatorID==memberID).one()
            except exc.NoResultFound:
                artifactDraftDOFromHandle = None
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifactDrafts with the given handle : [{artifactDraftHandle}],  artifactType : [{artifactDraftType}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactDraftHandle=artifactDraftHandle, artifactDraftType=artifactDraftType, memberID=memberID).encode('utf-8'))        
            if artifactDraftDOFromHandle is not None and artifactDraftDOFromHandle.id != artifactDraftDOFromID.id:
                raise exceptions.ResourceAlreadyExistsException(u"Another ArtifactDraft with the received handle : [{artifactDraftHandle}], artifactType : [{artifactDraftType}], memberID : [{memberID}] combination already exists in the database.".format(artifactDraftHandle=artifactDraftHandle, artifactDraftType=artifactDraftType, memberID=memberID).encode('utf-8'))

            artifactDraftArtifactRevisionID = artifactDict.get('artifactRevisionID')
            if artifactDraftArtifactRevisionID:
                try:
                    artifactDraftArtifactRevisionInfo = meta.Session.query(meta.ArtifactRevisions.c.id, meta.Artifacts.c.creatorID).join(meta.Artifacts, meta.ArtifactRevisions.c.artifactID==meta.Artifacts.c.id).filter(meta.ArtifactRevisions.c.id == artifactDraftArtifactRevisionID).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"ArtifactRevision with the given given artifactRevisionID : [{artifactDraftArtifactRevisionID}] could not be found in the dataBase.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple artifactRevisions with the given given artifactRevisionID : [{artifactDraftArtifactRevisionID}] are found in the dataBase. Internal System data error.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
                if artifactDraftArtifactRevisionInfo[1] != memberID:
                    raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized to update his artifactDraft to have artifactRevisionID : [{artifactDraftArtifactRevisionID}].".format(memberID=memberID, artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
 
                try:
                    artifactDraftDOFromArtifactRevisionID = meta.Session.query(meta.ArtifactDraft.c.id).filter(meta.ArtifactDraft.c.artifactRevisionID==artifactDraftArtifactRevisionID, meta.ArtifactDraft.c.creatorID==memberID).one()
                except exc.NoResultFound:
                    artifactDraftDOFromArtifactRevisionID = None
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple artifactDrafts with the given artifactRevisionID : [{artifactDraftArtifactRevisionID}],  memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID, memberID=memberID).encode('utf-8'))
                if artifactDraftDOFromArtifactRevisionID is not None and artifactDraftDOFromArtifactRevisionID.id != artifactDraftDOFromID.id:
                    raise exceptions.ResourceAlreadyExistsException(u"Another ArtifactDraft with the received artifactRevisionID : [{artifactDraftArtifactRevisionID}], memberID : [{memberID}] combination already exists in the database.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID, memberID=memberID).encode('utf-8'))

            artifactDraftDOFromID.artifactTypeID = artifactDraftTypeID
            artifactDraftDOFromID.handle = artifactDraftHandle
            if artifactDraftArtifactRevisionID:
                artifactDraftDOFromID.artifactRevisionID = artifactDraftArtifactRevisionID
            
            artifactDraftData = json.dumps(artifactDict)
            try:
                artifactDraftData = zlib.compress(artifactDraftData)
                isArtifactDraftDataCompressed = True
            except Exception, e:
                isArtifactDraftDataCompressed = False #compression failed - proceed with out compressing the content
            artifactDraftDOFromID.draft = artifactDraftData
            artifactDraftDOFromID.isCompressed = isArtifactDraftDataCompressed

            meta.Session.flush()
            artifactDraftDict = self._generateArtifactDraftDict(artifactDraftDOFromID)
            meta.Session.commit()
            return artifactDraftDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def deleteArtifactDraftByID(self, memberDict, artifactDraftID, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            artifactDraftDOFromID = meta.Session.query(model.ArtifactDraft).get(artifactDraftID)
            if not artifactDraftDOFromID:
                raise exceptions.ResourceNotFoundException(u"ArtifactDraft with the given artifactDraftID : [{artifactDraftID}] could not be found in the dataBase.".format(artifactDraftID=artifactDraftID).encode('utf-8'))

            if artifactDraftDOFromID.creatorID != memberID:
                raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized to read or update or delete the artifactDraft with artifactDraftID : [{artifactDraftID}].".format(memberID=memberID, artifactDraftID=artifactDraftID).encode('utf-8'))

            meta.Session.delete(artifactDraftDOFromID)
            meta.Session.commit()

            artifactDraftDict = {}
            artifactDraftDict['artifactDraftID'] = artifactDraftID
            artifactDraftDict['creatorID'] = memberID
            artifactDraftDict['artifactDraftStatus'] = 'SUCCESFULLY DELETED'
            return artifactDraftDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactDraftByTypeAndHandle(self, memberDict, artifactDraftType, artifactDraftHandle, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            try:
                artifactDraftTypeDO = meta.Session.query(meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name == artifactDraftType).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactType with the given artifactDraftType : [{artifactDraftType}] could not be found in the dataBase.".format(artifactDraftType=artifactDraftType).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple ArtifactTypes with the given artifactDraftType : [{artifactDraftType}] are found in the dataBase. Internal System data error.".format(artifactDraftType=artifactDraftType).encode('utf-8'))            
            artifactDraftTypeID = artifactDraftTypeDO.id

            #artifactDraftHandle = self._convertTitleToHandle(artifactDraftHandle)
            try:
                #you can fire a query.one as type+owner+handle togeather forms the a unique key and only 1 result is guaranteed
                artifactDraftDOFromHandle = meta.Session.query(model.ArtifactDraft).filter(model.ArtifactDraft.artifactTypeID==artifactDraftTypeID, model.ArtifactDraft.handle==artifactDraftHandle, model.ArtifactDraft.creatorID==memberID).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactDraft with the given given artifactDraftType : [{artifactDraftType}], artifactDraftHandle : [{artifactDraftHandle}], memberID : [{memberID}] combination could not be found in the dataBase.".format(artifactDraftType=artifactDraftType, artifactDraftHandle=artifactDraftHandle, memberID=memberID).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifactDrafts with the given artifactDraftType : [{artifactDraftType}], artifactDraftHandle : [{artifactDraftHandle}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format( artifactDraftType=artifactDraftType, artifactDraftHandle=artifactDraftHandle, memberID=memberID).encode('utf-8'))            

            artifactDraftDict = self._generateArtifactDraftDict(artifactDraftDOFromHandle)
            meta.Session.commit()
            return artifactDraftDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactDraftByArtifactRevisionID(self, memberDict, artifactDraftArtifactRevisionID, collaborationGroupID=None, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')    
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            artifactDraftDOFromArtifactRevisionID = meta.Session.query(model.ArtifactDraft).filter_by(artifactRevisionID=artifactDraftArtifactRevisionID).first()
            if not artifactDraftDOFromArtifactRevisionID:
                raise exceptions.ResourceNotFoundException(u"ArtifactDraft with the given given artifactDraftArtifactRevisionID : [{artifactDraftArtifactRevisionID}] could not be found in the dataBase.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
            log.debug('getArtifactDraftByArtifactRevisionID: artifactDraftDOFromArtifactRevisionID[%s]' % artifactDraftDOFromArtifactRevisionID)

            if artifactDraftDOFromArtifactRevisionID.creatorID != memberID:
                log.debug('getArtifactDraftByArtifactRevisionID: not owner')
                ar = api._getArtifactRevisionByID(meta.Session, artifactDraftDOFromArtifactRevisionID.artifactRevisionID)
                log.debug('getArtifactDraftByArtifactRevisionID: artifactID[%s]' % ar.artifactID)
                authMemberID = memberID
                log.debug('getArtifactDraftByArtifactRevisionID: authMemberID[%s]' % authMemberID)
                if collaborationGroupID:
                    groupMember = api._getMemberGroup(meta.Session, id=authMemberID, groupID=collaborationGroupID)
                    log.debug('getArtifactDraftByArtifactRevisionID: groupMember[%s]' % groupMember)
                    if groupMember:
                        #
                        #  We allow all collorators to have read access. Check permission as if this is the creator.
                        #
                        authMemberID = artifactDraftDOFromArtifactRevisionID.creatorID
                log.debug('getArtifactDraftByArtifactRevisionID: authMemberID[%s]' % authMemberID)
                api._authorizeBookEditing(meta.Session, authMemberID, None, api.BOOK_EDITING_READ, artifactDraftDOFromArtifactRevisionID.creatorID, ar.artifactID)
                log.debug('getArtifactDraftByArtifactRevisionID: authorized')

            """
            try:
                artifactDraftDOFromArtifactRevisionID = meta.Session.query(model.ArtifactDraft).filter(model.ArtifactDraft.artifactRevisionID==artifactDraftArtifactRevisionID, model.ArtifactDraft.creatorID==memberID).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"ArtifactDraft with the given given artifactDraftArtifactRevisionID : [{artifactDraftArtifactRevisionID}],  memberID : [{memberID}] combination could not be found in the dataBase.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID, memberID=memberID).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifactDrafts with the given artifactDraftArtifactRevisionID : [{artifactDraftArtifactRevisionID}],  memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID, memberID=memberID).encode('utf-8'))            
            """
            
            artifactDraftDict = self._generateArtifactDraftDict(artifactDraftDOFromArtifactRevisionID)
            log.debug('getArtifactDraftByArtifactRevisionID: artifactDraftDict[%s]' % artifactDraftDict)
            meta.Session.commit()
            return artifactDraftDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactDraftByID(self, memberDict, artifactDraftID, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')    
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            artifactDraftDOFromID = meta.Session.query(model.ArtifactDraft).get(artifactDraftID)
            if not artifactDraftDOFromID:
                raise exceptions.ResourceNotFoundException(u"ArtifactDraft with the given artifactDraftID : [{artifactDraftID}] could not be found in the dataBase.".format(artifactDraftID=artifactDraftID).encode('utf-8'))

            log.debug('getArtifactDraftByID: artifactDraftDOFromID[%s]' % artifactDraftDOFromID)
            if artifactDraftDOFromID.creatorID != memberID:
                #raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized to read or update or delete the artifactDraft with artifactDraftID : [{artifactDraftID}].".format(memberID=memberID, artifactDraftID=artifactDraftID).encode('utf-8'))
                log.debug('getArtifactDraftByID: not owner')
                ar = api._getArtifactRevisionByID(meta.Session, artifactDraftDOFromID.artifactRevisionID)
                log.debug('getArtifactDraftByID: artifactID[%s]' % ar.artifactID)
                api._authorizeBookEditing(meta.Session, memberID, None, api.BOOK_EDITING_READ, artifactDraftDOFromID.creatorID, ar.artifactID)
                log.debug('getArtifactDraftByID: authorized')

            artifactDraftDict = self._generateArtifactDraftDict(artifactDraftDOFromID)
            meta.Session.commit()
            return artifactDraftDict
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()

    def getArtifactDrafts(self, memberDict, isSubTransaction=False):
        meta.Session.begin(subtransactions=isSubTransaction)
        try:
            #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            artifactDraftDOList = meta.Session.query(model.ArtifactDraft).filter(model.ArtifactDraft.creatorID==memberID).all()
            artifactDraftDictList = []
            for artifactDraftDO in artifactDraftDOList:
                artifactDraftDictList.append(self._generateArtifactDraftDict(artifactDraftDO))

            meta.Session.commit()
            return artifactDraftDictList
        except SQLAlchemyError, sqlae:
            if not isSubTransaction:
                meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            if not isSubTransaction:
                meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            if not isSubTransaction:
                meta.Session.close()
                meta.Session.remove()         


    ##Save (Create And Update) Artifact Related Methods

    @staticmethod
    def deleteMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID):
        if not memberID:
            raise Exception(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))
    
        if not artifactRevisionID:
            raise Exception(u"Invalid artifactRevisionID : [{artifactRevisionID}] is received.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))
    
        deletedDraftsCount = session.query(model.ArtifactDraft).filter(model.ArtifactDraft.artifactRevisionID==artifactRevisionID, model.ArtifactDraft.creatorID==memberID).delete()
        
        draftExistedAndDeleted = False
        if deletedDraftsCount == 1:
            draftExistedAndDeleted = True
        elif deletedDraftsCount == 0:
            draftExistedAndDeleted = False
        else:
            raise Exception(u"More than one draft for the given memberID : [{memberID}], artifactRevisionID : [{artifactRevisionID}] are found in the database.System data Error.".format(memberID=memberID, artifactRevisionID=artifactRevisionID).encode('utf-8'))        
    
        return draftExistedAndDeleted


    def _generateArtifactDescendantRevisionDO(self, artifactRevisionDO, artifactDescendantIdentifier):
        parentArtifactRevisionDOList = []
        parentArtifactRevisionDOList.append((artifactRevisionDO, None))

        # artifactDescendantIdentifier is a list. Eg [4,3] when 4.3 would've been originally passed as identifier
        for artifactDescendantIdentifierPart in artifactDescendantIdentifier:
            if artifactDescendantIdentifierPart == 0:
                artifactRevisionDO = artifactRevisionDO
            else:
                if artifactDescendantIdentifierPart <= len(artifactRevisionDO.children):
                    artifactRevisionDO = artifactRevisionDO.children[artifactDescendantIdentifierPart-1].child
                else:
                    raise exceptions.ResourceNotFoundException(u"ArtifactDescendant with the given artifactDescendantIdentifier : [{artifactDescendantIdentifier}] could not be found for the artifactRevision with artifactRevisionID : [{artifactRevisionID}].".format(artifactDescendantIdentifier=artifactDescendantIdentifier, artifactRevisionID=parentArtifactRevisionDOList[0][0].id).encode('utf-8'))
            parentArtifactRevisionDOList.append((artifactRevisionDO, artifactDescendantIdentifierPart - 1))

        descendantArtifactRevisionDO = artifactRevisionDO
        log.debug('size of parents list: [%s]' % len(parentArtifactRevisionDOList))
        return descendantArtifactRevisionDO, parentArtifactRevisionDOList

    def _getBrowseTermByID(self, id):
        try:
            query = meta.Session.query(model.BrowseTerm).filter(model.BrowseTerm.id == long(id))
            return utils._queryOne(query)
        except ValueError:
            return None

    # TagTerm Related functions
    def _deleteArtifactHasTagTerm(self, artifactID, tagTermID):

        at = meta.Session.query(model.ArtifactHasTagTerms).filter(model.ArtifactHasTagTerms.artifactID==artifactID,
                                                             model.ArtifactHasTagTerms.tagTermID==tagTermID).one()
        if not at:
            #log.warn('No such ArtifactHasTagTerms row for artifactID: [%s], tagTermID: [%s]' %(artifactID, tagTermID))
            return
        meta.Session.delete(at)
        meta.Session.flush()

    def _getTagTermByName(self, name):
        try:
            query = meta.Session.query(model.TagTerm).filter(model.TagTerm.name == name).one()
        except exc.NoResultFound:
            return None
        except exc.MultipleResultsFound:
            raise exceptions.SystemDataException(u"Multiple TagTerms with the given name : [{name}] are found in the dataBase. Internal System data error.".format(name=name).encode('utf-8'))

        return query

    def _createTagTerm(self, name):
        tagTerm = model.TagTerm(name=name)
        meta.Session.add(tagTerm)
        meta.Session.flush()
        return tagTerm

    def _createArtifactHasTagTerm(self, artifactID, tagTermID):
        ahtt = model.ArtifactHasTagTerms(artifactID=artifactID, tagTermID=tagTermID)
        meta.Session.add(ahtt)
        meta.Session.flush()
        return ahtt

    # SearchTerm related functions
    def _deleteArtifactHasSearchTerm(self, artifactID, searchTermID):

        ahst = meta.Session.query(model.ArtifactHasSearchTerms).filter(model.ArtifactHasSearchTerms.artifactID==artifactID,
                                                             model.ArtifactHasSearchTerms.searchTermID==searchTermID).one()
        if not ahst:
            #log.warn('No such ArtifactHasSearchTerms row for artifactID: [%s], searchTermID: [%s]' %(artifactID, searchTermID))
            return
        meta.Session.delete(ahst)
        meta.Session.flush()

    def _getSearchTermByName(self, name):
        try:
            query = meta.Session.query(model.SearchTerm).filter(model.SearchTerm.name == name).one()
        except exc.NoResultFound:
            return None
        except exc.MultipleResultsFound:
            raise exceptions.SystemDataException(u"Multiple SearchTerms with the given name : [{name}] are found in the dataBase. Internal System data error.".format(name=name).encode('utf-8'))

        return query

    def _createSearchTerm(self, name):
        searchTerm = model.SearchTerm(name=name)
        meta.Session.add(searchTerm)
        meta.Session.flush()
        return searchTerm

    def _createArtifactHasSearchTerm(self, artifactID, searchTermID):
        ahtt = model.ArtifactHasSearchTerms(artifactID=artifactID, searchTermID=searchTermID)
        meta.Session.add(ahtt)
        meta.Session.flush()
        return ahtt


    def _createArtifactHasBrowseTerm(self, artifactID, browseTermID):
        ahbt = model.ArtifactHasBrowseTerms(artifactID=artifactID, browseTermID=browseTermID)
        meta.Session.add(ahbt)
        meta.Session.flush()
        return ahbt

    def _deleteArtifactHasBrowseTerm(self, artifactID, browseTermID):

        ahbt = meta.Session.query(model.ArtifactHasBrowseTerms).filter(model.ArtifactHasBrowseTerms.artifactID==artifactID,
                                                             model.ArtifactHasBrowseTerms.browseTermID==browseTermID).one()
        if not ahbt:
            #log.warn('No such ArtifactHasBrowseTerms row for artifactID: [%s], browseTermID: [%s]' %(artifactID, browseTermID))
            return
        meta.Session.delete(ahbt)
        meta.Session.flush()

    def _getLatestResourceRevisionFromResourceID(self, resourceID):
        rr_query = meta.Session.query(model.ResourceRevision).filter(model.ResourceRevision.resourceID == resourceID)
        #rr = rr_query.order_by(int(model.ResourceRevision.revision).desc())
        rr_list = rr_query.all()
        rr_list = sorted(rr_list, key=lambda rr: int(rr.revision), reverse=True)
        return rr_list[0]

    def _getChildConceptRevisionDO(self, artifactRevisionDO):
        artifactRevisionChildConceptRevisionDO = None
        artifactRevisionChildConceptRevisionRelationSequence = 0
        for artifactRevisionChildRevisionRelationDO in artifactRevisionDO.children:
            if artifactRevisionChildRevisionRelationDO.child and artifactRevisionChildRevisionRelationDO.child.artifact and artifactRevisionChildRevisionRelationDO.child.artifact.type and artifactRevisionChildRevisionRelationDO.child.artifact.type.name == 'concept':
                if not artifactRevisionChildConceptRevisionDO or (artifactRevisionChildRevisionRelationDO.sequence and artifactRevisionChildRevisionRelationDO.sequence > artifactRevisionChildConceptRevisionRelationSequence):
                    artifactRevisionChildConceptRevisionDO = artifactRevisionChildRevisionRelationDO.child
                    artifactRevisionChildConceptRevisionRelationSequence = artifactRevisionChildRevisionRelationDO.sequence

        return artifactRevisionChildConceptRevisionDO

    def _deleteArtifactRevisionHasResources(self, artifactRevisionID, resourceRevisionID):
        arhr = meta.Session.query(model.ArtifactRevisionHasResources).filter(artifactRevisionID=artifactRevisionID,
                                                                             resourceRevisionID=resourceRevisionID).one()

        meta.Session.delete(arhr)
        meta.Session.flush()

    def _createNewArtifactRevision(self, artifactRevisionDO, oldChildArtifactRevisionDO, newChildArtifactRevisionDO):
        newArtifactRevisionDO = model.ArtifactRevision(artifactID=artifactRevisionDO.artifact.id,
                                                       revision=str(long(artifactRevisionDO.revision)+1))
        meta.Session.add(newArtifactRevisionDO)
        meta.Session.flush()
        newArtifactRevisionDO.children = []
        for child in artifactRevisionDO.children:
            hasArtifactRevisionID = child.hasArtifactRevisionID
            if child.hasArtifactRevisionID == oldChildArtifactRevisionDO.id:
                hasArtifactRevisionID = newChildArtifactRevisionDO.id

            relation = model.ArtifactRevisionRelation(artifactRevisionID=newArtifactRevisionDO.id,
                                                      hasArtifactRevisionID=hasArtifactRevisionID,
                                                      sequence=child.sequence)
            meta.Session.add(relation)
            newArtifactRevisionDO.children.append(relation)

        newArtifactRevisionDO.resourceRevisions = artifactRevisionDO.resourceRevisions
        newArtifactRevisionDO.standards = artifactRevisionDO.standards
        meta.Session.flush()
        return newArtifactRevisionDO

    def _addArtifactRevisionToLibrary(self, memberDO, objectID, objectType, parentID, domainID=None):
        # TODO: see if we should write our own function to replace the below api call
        if api._getMemberLibraryObject(meta.Session,  memberDO.id, objectID, objectType, domainID=domainID):
            return None
        if not domainID:
            domainID = api._getNullPseudoDomainID(meta.Session)
        libraryObject, memberLabelIDs = None, []
        existingLibObj = api._getMemberLibraryObjectByParentID(meta.Session, objectType=objectType, parentID=parentID,
                                                       memberID=memberDO.id, domainID=domainID)
        if existingLibObj:
            log.debug("Got library object for parentID: %d, libObj.objectID: %d, objectID: %d"
                      % (parentID, existingLibObj.objectID, objectID))
            if existingLibObj.objectID != objectID:
                ## Save the labels
                memberLabelDOs = api._getLabelsForMemberLibraryObject(meta.Session, libraryObjectID=existingLibObj.id)
                for ml in memberLabelDOs:
                    memberLabelIDs.append(ml.id)
                log.debug("Deleting MemberLibraryObject with id: %s" % existingLibObj.objectID)
                meta.Session.delete(existingLibObj)
                meta.Session.flush()
            else:
                libraryObject = existingLibObj

        if not libraryObject:

            log.debug('_addArtifactRevisionToLibrary: Adding to library objId[%s] objType[%s] parentId[%s] memberID[%s]'
                      % (objectID, objectType, parentID, memberDO.id))
            libraryObject = model.MemberLibraryObject(objectID=objectID, objectType=objectType, memberID=memberDO.id,
                                                      parentID=parentID, domainID=domainID, created=self.requestTimeStamp)
            meta.Session.add(libraryObject)
            meta.Session.flush()
            if memberLabelIDs:
                for labelID in memberLabelIDs:
                    meta.Session.add(model.MemberLibraryObjectHasLabel(libraryObjectID=libraryObject.id, labelID=labelID))
        return libraryObject

    def _updateAuthors(self, memberDO, artifactDO, newAuthorList):
        if newAuthorList is not None:
            existingAuthors = artifactDO.authors
            # Delete existing authors    
            for ea in existingAuthors:
                meta.Session.delete(ea)
            meta.Session.flush()
            # Add new authors
            newAuthorListToInsert = []
            seq = 1
            for na in newAuthorList:
                if 'role' not in na or ('name' not in na['role'] and 'id' not in na['role']):
                    raise exceptions.InvalidArgumentException("Missing field: 'role' or 'name'/'id' in 'role' in author".encode('utf-8'))
                if 'id' in na['role']:
                    role_id = na['role']['id']
                else:
                    role_id = api._getMemberRoleIDByName(meta.Session, na['role']['name'])
                    if not role_id:
                        raise exceptions.InvalidArgumentException("Invalid author role: [%s] sent in the request body." % na['role']['name'])
                if not na.get('name', None):
                    raise exceptions.InvalidArgumentException("Invalid author name sent in the request body.")
                newAuthorListToInsert.append({'artifactID': artifactDO.id, 'name': na['name'], 'roleID': role_id,
                                              'sequence': seq})
                seq += 1
            if newAuthorListToInsert:
                meta.Session.execute(meta.ArtifactAuthors.insert().values(newAuthorListToInsert))

    def _updateTagTerms(self, artifactDO, newTagTerms):
        if newTagTerms is not None:
            detachedTagIDSet = set([tt.id for tt in artifactDO.tagTerms])
            newArtifactHasTagTermsList = []
            for tagTermDict in newTagTerms:
                if 'name' not in tagTermDict:
                    raise exceptions.InvalidArgumentException("Missing field: name in tagTerm: {tagTermDict}".format(tagTermDict=tagTermDict).encode('utf-8'))
                if 'id' not in tagTermDict:
                    tt = self._getTagTermByName(name=tagTermDict['name'])
                    if not tt:
                        tt = self._createTagTerm(name=tagTermDict['name'])
                    tagTermID = tt.id
                else:
                    try:
                        tagTermID = int(tagTermDict['id'])
                    except (ValueError, TypeError):
                        raise exceptions.InvalidArgumentException(u"Invalid id : [{tagTermID}] is received in tagTerm: [{tagTermDict}] .".format(tagTermID=tagTermDict['id'],tagTermDict=tagTermDict).encode('utf-8'))
                if tagTermID in detachedTagIDSet:
                    detachedTagIDSet.remove(tagTermID)
                else:
                    newArtifactHasTagTermsList.append({'artifactID': artifactDO.id, 'tagTermID': tagTermID})

            # Delete ArtifactHasTagTerms for TagTerms that are not associated any more
            query = meta.Session.query(model.ArtifactHasTagTerms).filter(and_(model.ArtifactHasTagTerms.artifactID == artifactDO.id,
                                                                  model.ArtifactHasTagTerms.tagTermID.in_(list(detachedTagIDSet))))
            query.delete(synchronize_session=False)
            if newArtifactHasTagTermsList:
                meta.Session.execute(meta.ArtifactHasTagTerms.insert().values(newArtifactHasTagTermsList))
            meta.Session.flush()

    def _getBrowseTermByNameType(self, btName, typeName=None, btTypesDict=None):
        if not btTypesDict:
            btTypesDict = api._getBrowseTermTypesDict(meta.Session)
        query = meta.Session.query(model.BrowseTerm).filter_by(name=btName.strip())
        if typeName:
            if typeName not in btTypesDict:
                raise exceptions.InvalidArgumentException("Invalid browseTerm typeName: [{typeName}] received".format(typeName=typeName).encode('utf-8'))
            query = query.filter_by(termTypeID=btTypesDict[typeName.strip()].id)
        browseTerms = query.all()
        return None if not browseTerms else browseTerms[0]
    
    def _checkAndCreateRelatedArtifact(self, artifactDO, browseTermDO, conceptCollectionHandle=None, collectionCreatorID=None):
        if browseTermDO.type.name in ['domain', 'pseudodomain']:
            sequence = None
            if artifactDO.encodedID:
                try:
                    sequence = int(artifactDO.encodedID.split('.')[-1])
                except:
                    pass
            hasRelatedArtifact = api._getRelatedArtifact(meta.Session, artifactDO.id, browseTermDO.id, 
                        conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
            if not hasRelatedArtifact:
                sequence = None if not sequence else sequence
                ## Add entry to RelatedArtifacts
                log.debug("Adding related artifact for artifactID: %s, domainID: %s" % (artifactDO.id, browseTermDO.id))
                api._createRelatedArtifact(meta.Session, artifactID=artifactDO.id, domainID=browseTermDO.id, sequence=sequence,
                        conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
            meta.Session.flush()

    def _updateBrowseTerms(self, artifactDO, newBrowseTerms, browseTermCache=None, copyCase=False, donotCopyDomain=False):
        if newBrowseTerms is not None:
            detachedBrowseTermIDSet = set([bt.id for bt in artifactDO.browseTerms])
            btTypesDict = api._getBrowseTermTypesDict(meta.Session)
            # Original implementation (in api.py) assumes that if 'id' of a browseTerm is not passed then a new
            # browseTerm should be created. Currently, we are not allowing the creation of a new browseTerm here.
            for newBrowseTermDict in newBrowseTerms:
                if 'id' not in newBrowseTermDict:
                    if newBrowseTermDict.get('encodedID'):
                        browseTermDO = ArtifactDataModel.getBrowseTermByEncodedID(meta.Session, newBrowseTermDict['encodedID'])
                        if not browseTermDO:
                            raise exceptions.NotFoundException("BrowseTerm with encodedID: [{eid}] could not be found".format(
                                    eid=newBrowseTermDict['encodedID']).encode('utf-8'))
                        newBrowseTermID = browseTermDO.id
                    elif 'name' in newBrowseTermDict and 'typeName' in newBrowseTermDict:
                        browseTermDO = self._getBrowseTermByNameType(btName=newBrowseTermDict['name'], typeName=newBrowseTermDict['typeName'], btTypesDict=btTypesDict)
                        if not browseTermDO:
                            raise exceptions.NotFoundException("BrowseTerm with name: [{btName}] and type: [{typeName}] could not be found".format(btName=newBrowseTermDict['name'], typeName=newBrowseTermDict['typeName']).encode('utf-8'))
                        newBrowseTermID = browseTermDO.id
                    else:
                        raise exceptions.InvalidArgumentException("Missing fields in browseTerm: Either id or (name and typeName) is required".encode('utf-8'))
                else:
                    try:
                        newBrowseTermID = int(newBrowseTermDict['id'])
                    except (ValueError, TypeError):
                        raise exceptions.InvalidArgumentException(u"Invalid id : [{browseTermID}] received in browseTerm: [{newBrowseTermDict}] .".format(browseTermID=newBrowseTermDict['id'], newBrowseTermDict=newBrowseTermDict).encode('utf-8'))
                    browseTermDO = self._getBrowseTermByID(newBrowseTermID)
                    if not browseTermDO:
                        raise exceptions.NotFoundException("BrowseTerm with id: [{newBrowseTermID}] could not be found".format(newBrowseTermID=newBrowseTermID).encode('utf-8'))

                bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook']
                # skip subject and branch level terms [Bug: 15699]
                if browseTermDO.type.name == 'domain' and artifactDO.type.name not in bookLevelArtifactTypes and \
                        browseTermDO.encodedID and len(browseTermDO.encodedID.split('.')) <= 2:
                    raise Exception(u"Cannot add subject and branch level term [{encodedID}].".format(
                        encodedID=browseTermDO.encodedID).encode('utf-8'))
                if newBrowseTermID in detachedBrowseTermIDSet:
                    detachedBrowseTermIDSet.remove(newBrowseTermID)
                else:
                    # Don't copy another artifact's pseudodomain
                    if (browseTermDO.type.name == 'pseudodomain' and copyCase) or (browseTermDO.type.name == 'domain' and donotCopyDomain):
                        continue
                    # domain, pseudodomain association now present only in Related Artifacts table - story #152217160
                    if browseTermDO.type.name not in ['domain', 'pseudodomain']:
                        artifactDO.browseTerms.append(browseTermDO)
                    self._checkAndCreateRelatedArtifact(artifactDO, browseTermDO)
                    api.invalidateBrowseTerm(browseTermCache, browseTermDO.id, memberID=artifactDO.creatorID, session=meta.Session)
            
            artifactDO.browseTerms = filter(lambda bt: bt.id not in detachedBrowseTermIDSet, artifactDO.browseTerms)
            for browseTermID in detachedBrowseTermIDSet:
                browseTermDO = self._getBrowseTermByID(browseTermID)
                if browseTermDO.type.name in ['domain', 'pseudodomain']:
                    api._deleteRelatedArtifact(meta.Session, artifactID=artifactDO.id, domainID=browseTermDO.id)
                api.invalidateBrowseTerm(browseTermCache, browseTermID, memberID=artifactDO.creatorID, session=meta.Session)
            meta.Session.flush()


    # Don't call this function if artifactDO.browseTerms is not up to date with db
    def _processPseudoDomain(self, artifactDO, browseTermCache):
        if artifactDO.type.modality:
            
            relatedArtifactDOs = ArtifactDataModel.getRelatedArtifactsForArtifact(meta.Session, artifactDO.id)
            domainTypeRelatedArtifactDOs = filter(lambda raDO: raDO.domain.type.name == 'domain', 
                                                  relatedArtifactDOs) if relatedArtifactDOs else []
            psuedoDomainTypeRelatedArtifactDOs = filter(lambda raDO: raDO.domain.type.name == 'pseudodomain', 
                                                        relatedArtifactDOs) if relatedArtifactDOs else []
            
            # Dissociate pseudodomain if domain present
            if domainTypeRelatedArtifactDOs and psuedoDomainTypeRelatedArtifactDOs:
                for ra in psuedoDomainTypeRelatedArtifactDOs:
                    meta.Session.delete(ra)
                    api.invalidateBrowseTerm(browseTermCache, ra.domainID, memberID=artifactDO.creatorID, session=meta.Session)
                meta.Session.flush()
            
            # create pseudo domain if there's no domain and pseudo domain already
            elif not domainTypeRelatedArtifactDOs and not psuedoDomainTypeRelatedArtifactDOs:
                domainTerm = api._createPseudoDomainNode(meta.Session, artifactDO, createArtifactHasBrowseTerm=False)
                #artifactDO.browseTerms.append(domainTerm)
                self._checkAndCreateRelatedArtifact(artifactDO, domainTerm)
                api.invalidateBrowseTerm(browseTermCache, domainTerm.id, memberID=artifactDO.creatorID, session=meta.Session)
    
    
    def _updateBrowseTermsAndCollections(self, artifactDO, newBrowseTerms, browseTermCache=None, copyCase=False, donotCopyDomain=False, collections=None):
        self._updateBrowseTerms(artifactDO, newBrowseTerms, browseTermCache, copyCase, donotCopyDomain)
        meta.Session.flush()
        levels = filter(lambda bt: bt.type.name == 'level', artifactDO.browseTerms) if artifactDO.browseTerms else None
        if not levels:
            browseTermDO = self._getBrowseTermByNameType(btName='at grade', typeName='level')
            if browseTermDO:
                artifactDO.browseTerms = artifactDO.browseTerms if artifactDO.browseTerms else []
                artifactDO.browseTerms.append(browseTermDO)
                api.invalidateBrowseTerm(browseTermCache, browseTermDO.id, memberID=artifactDO.creatorID, session=meta.Session)
        meta.Session.flush()
        self._updateCollections(artifactDO, collections, browseTermCache)
        meta.Session.flush()
        self._processPseudoDomain(artifactDO, browseTermCache)
        meta.Session.flush()

    def _updateCollections(self, artifactDO, collections, browseTermCache):
        if collections is not None:
            relatedArtifactDOs = ArtifactDataModel.getRelatedArtifactsForArtifact(meta.Session, artifactDO.id)
            detachedCollectionsRelatedArtifactDOs = filter(lambda raDO: raDO.conceptCollectionHandle and raDO.collectionCreatorID > 0, 
                                                           relatedArtifactDOs) if relatedArtifactDOs else []
            for cDict in collections:
                if not cDict.get('conceptCollectionHandle') or not cDict.get('collectionCreatorID'):
                    raise exceptions.InvalidArgumentException("Missing field: conceptCollectionHandle or collectionCreatorID in collection: [{cDict}]".format(
                        cDict=cDict).encode('utf-8'))
                # TODO: remove this line 
                cDict['collectionCreatorID'] = int(cDict['collectionCreatorID'])
                existingCollection = False
                for c in detachedCollectionsRelatedArtifactDOs:
                    if c.conceptCollectionHandle == cDict['conceptCollectionHandle'] and c.collectionCreatorID == cDict['collectionCreatorID']:
                        existingCollection = True
                if existingCollection:
                    detachedCollectionsRelatedArtifactDOs = filter(lambda c: not (
                                            c.conceptCollectionHandle == cDict['conceptCollectionHandle'] and 
                                            c.collectionCreatorID == cDict['collectionCreatorID']), detachedCollectionsRelatedArtifactDOs)
                else:
                    if cDict['collectionCreatorID'] != 3:
                        raise exceptions.InvalidArgumentException("collectionCreatorID cannot be other than 3".encode('utf-8'))
                    cNode = collectionNode.CollectionNode(model.Artifact.getMongoDB()).getByConceptCollectionHandle(
                        conceptCollectionHandle=cDict['conceptCollectionHandle'], collectionCreatorID=cDict['collectionCreatorID'])
                    if not cNode:
                        raise exceptions.InvalidArgumentException(("Cannot find an entry for conceptCollectionHandle[%s], collectionCreatorID[%s]" % (
                            cDict['conceptCollectionHandle'], cDict['collectionCreatorID'])).encode('utf-8'))
                    
                    browseTermDO = ArtifactDataModel.getBrowseTermByEncodedID(meta.Session, cNode['encodedID'])
                    
                    # TODO: is the below check required ?
                    bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook']
                    # skip subject and branch level terms [Bug: 15699]
                    if browseTermDO.type.name == 'domain' and artifactDO.type.name not in bookLevelArtifactTypes and \
                            browseTermDO.encodedID and len(browseTermDO.encodedID.split('.')) <= 2:
                        raise Exception(u"Cannot add subject and branch level term [{encodedID}].".format(
                            encodedID=browseTermDO.encodedID).encode('utf-8'))
                    
                    self._checkAndCreateRelatedArtifact(artifactDO, browseTermDO)
                    self._checkAndCreateRelatedArtifact(artifactDO, browseTermDO, cDict['conceptCollectionHandle'], cDict['collectionCreatorID'])
                    api.invalidateBrowseTerm(browseTermCache, browseTermDO.id, memberID=artifactDO.creatorID, session=meta.Session)
            
            # TODO: Fix the bolow call
            '''api._deleteConceptCollectionHandlesForArtifact(meta.Session, artifactID=artifactDO.id,
                        conceptCollectionHandles=[c.conceptCollectionHandle for c in detachedCollectionsRelatedArtifactDOs],
                        collectionCreatorIDs=[c.collectionCreatorID for c in detachedCollectionsRelatedArtifactDOs])'''
            for c in detachedCollectionsRelatedArtifactDOs:
                api.invalidateBrowseTerm(browseTermCache, c.domainID, memberID=artifactDO.creatorID, session=meta.Session)
                meta.Session.delete(c)
            meta.Session.flush()
            
            # Delete entry from Related Artifacts if there's no entry in collection context
            relatedArtifactDOs = ArtifactDataModel.getRelatedArtifactsForArtifact(meta.Session, artifactDO.id)
            relatedArtifactDOsWithCollection = filter(lambda raDO: raDO.conceptCollectionHandle and raDO.collectionCreatorID > 0, 
                                                           relatedArtifactDOs) if relatedArtifactDOs else []
            raDomainIDsWithCollection = [ra.domainID for ra in relatedArtifactDOsWithCollection]
            for ra in relatedArtifactDOs:
                if ra.domainID not in raDomainIDsWithCollection:
                    meta.Session.delete(ra)
                    api.invalidateBrowseTerm(browseTermCache, ra.domainID, memberID=artifactDO.creatorID, session=meta.Session)
            meta.Session.flush()
            
    
    @staticmethod
    def getRelatedArtifactsForArtifact(session, artifactID):
        return session.query(model.RelatedArtifact).filter(model.RelatedArtifact.artifactID == artifactID).all()
        #return filter(lambda raDO: raDO.conceptCollectionHandle and raDO.collectionCreatorID > 0, raDOs) if raDOs else []
        
    @staticmethod
    def getBrowseTermsByEncodedIDs(session, encodedIDs):
        return session.query(model.BrowseTerm).filter(model.BrowseTerm.encodedID.in_(encodedIDs)).all() if encodedIDs else []
    
    @staticmethod
    def getBrowseTermByEncodedID(session, encodedID):
        query = session.query(model.BrowseTerm).filter(model.BrowseTerm.encodedID == encodedID)
        return utils.queryOne(query)


    def _updateSearchTerms(self, artifactDO, newSearchTerms):
        if newSearchTerms is not None:
            detachedSearchTermIDSet = set([st.id for st in artifactDO.searchTerms])
            newArtifactHasSearchTermsList = []
            for searchTermDict in newSearchTerms:
                if 'name' not in searchTermDict:
                    raise exceptions.InvalidArgumentException("Missing field: name in searchTerm: [{searchTermDict}]".format(searchTermDict=searchTermDict).encode('utf-8'))
                if 'id' not in searchTermDict:
                    # This search term has been added by the user since we don't have the id.
                    st = self._getSearchTermByName(name=searchTermDict['name'])
                    if not st:
                        st = self._createSearchTerm(name=searchTermDict['name'])
                    searchTermID = st.id
                else:
                    # This search term was originally present before since we have its id.
                    try:
                        searchTermID = int(searchTermDict['id'])
                    except (ValueError, TypeError):
                        raise exceptions.InvalidArgumentException(u"Invalid id : [{searchTermID}] is received in searchTerm: [{searchTermDict}] .".format(searchTermID=searchTermDict['id'],searchTermDict=searchTermDict).encode('utf-8'))
                if searchTermID in detachedSearchTermIDSet:
                    detachedSearchTermIDSet.remove(searchTermID)
                else:
                    newArtifactHasSearchTermsList.append({'artifactID': artifactDO.id, 'searchTermID': searchTermID})

            # Delete ArtifactHasSearchTerms for searchTerms that are not associated any more
            query = meta.Session.query(model.ArtifactHasSearchTerms).filter(and_(model.ArtifactHasSearchTerms.artifactID == artifactDO.id,
                                                                  model.ArtifactHasSearchTerms.searchTermID.in_(list(detachedSearchTermIDSet))))
            query.delete(synchronize_session=False)

            if newArtifactHasSearchTermsList:
                meta.Session.execute(meta.ArtifactHasSearchTerms.insert().values(newArtifactHasSearchTermsList))
            meta.Session.flush()
            

    def _associateResources(self, artifactRevisionDO, resourceRevisionDOs, processContentTypeResource=False):
        return  

    @staticmethod
    def getArtifactDOFromTypeHandleCreator(session, artifactTypeID, artifactHandle, artifactCreatorID):
        query = session.query(model.Artifact).filter(model.Artifact.artifactTypeID == artifactTypeID,
                                    model.Artifact.handle == artifactHandle,
                                    model.Artifact.creatorID == artifactCreatorID)
        return utils.queryOne(query)

    @staticmethod
    def getArtifactDOFromArtifactDict(session, artifactDict):
        """
            Get the artifact from the payload
                1. By id
                2. By type, handle and creator
                3. By revisionID
        """
        artifactDO = None
        if 'id' in artifactDict:
            artifactDO = ArtifactDataModel.getArtifactById(session, artifactDict['id'])
            if artifactDO is None:
                raise exceptions.ResourceNotFoundException(u"Artifact with id : [{artifactID}] could not be found in the dataBase."
                                                       .format(artifactID=artifactDict['id']).encode('utf-8'))
        
        if artifactDO is None and 'revisionID' in artifactDict:
            artifactRevisionDO = ArtifactDataModel.getArtifactRevisionById(session, artifactDict['revisionID'])
            if artifactRevisionDO is None:
                raise exceptions.ResourceNotFoundException(u"ArtifactRevision with revisionID : [{revisionID}] could not be found in the dataBase."
                                                                   .format(revisionID=artifactDict['revisionID']).encode('utf-8'))
            artifactDO = artifactRevisionDO.artifact
        
        if artifactDO is None and 'type' in artifactDict and 'creator' in artifactDict and 'handle' in artifactDict:
            artifactTypeDO = ArtifactDataModel.getArtifactTypeDOFromArtifactDict(session, artifactDict)
            artifactCreatorDO = ArtifactDataModel.getArtifactCreatorDOFromArtifactDict(session, artifactDict)
            if artifactTypeDO is not None and artifactCreatorDO is not None:
                artifactDO = ArtifactDataModel.getArtifactDOFromTypeHandleCreator(session, artifactTypeDO.id,
                                                                              artifactDict['handle'],
                                                                              artifactCreatorDO.id)
                if artifactDO is None:
                    raise exceptions.ResourceNotFoundException(u"Artifact with type : [{type}], handle : [{handle}], creator [{creator}] \
                            could not be found in the dataBase.".format(
                                type=artifactTypeDO.name, handle=artifactDict['handle'], creator=artifactCreatorDO.id).encode('utf-8'))
                    
        return artifactDO
    
    
    @staticmethod
    def getResourceDOFromResourceDict(session, resourceDict):
        resourceDO = None
        if 'id' in resourceDict:
            resourceDO = ResourceDataManager.getResourceByID(session, int(resourceDict['id']))
            if resourceDO is None:
                raise exceptions.ResourceNotFoundException(u"Resource with resourceID : [{resourceID}] could not be found in the dataBase."
                                                       .format(resourceID=resourceDict['id']).encode('utf-8'))
        if resourceDO is None and 'revisionID' in resourceDict:
            rrDO = ResourceDataManager.getResourceRevisionByID(session, resourceDict['revisionID'])
            if rrDO is None:
                raise exceptions.ResourceNotFoundException(u"ResourceRevision with revisionID : [{revisionID}] could not be found in the dataBase."
                                                                   .format(revisionID=resourceDict['revisionID']).encode('utf-8'))
            resourceDO = rrDO.resource
        return resourceDO
    
    
    def createArtifact(self, memberID, artifactDict):
        meta.Session.begin()
        try:
            meta.Session.query(model.Member).filter(model.Member.id == memberID).one()
        except exc.NoResultFound:
            raise exceptions.ResourceNotFoundException(u"Member with memberID : [{memberID}] could not be found in the dataBase.".format(memberID=memberID).encode('utf-8'))

        # Check in case this artifact already exists. Dict shouldn't have id, handle, revisionID kind of crap.
        # Call _createArtifact
        return None

    def _generateUniqueHandle(self, artifactTitle, artifactTypeDO, artifactCreatorDO):
        handle = self._convertTitleToHandle(artifactTitle)
        prevArtifactDO = meta.Session.query(model.Artifact).filter(model.Artifact.artifactTypeID == artifactTypeDO.id,
                                                                model.Artifact.handle == handle,
                                                                model.Artifact.creatorID == artifactCreatorDO.id).first()
        if prevArtifactDO:
            artifactQuery = meta.Session.query(model.Artifact).filter(model.Artifact.artifactTypeID == artifactTypeDO.id,
                                                                    model.Artifact.creatorID == artifactCreatorDO.id)
            prevArtifactDO = artifactQuery.order_by(model.Artifact.id.desc()).first()
            handle += '-' + str(prevArtifactDO.id)
        return handle

    @staticmethod
    def _checkEncodedID(artifactTypeDO, artifactDO, encodedID):
        query = meta.Session.query(model.Artifact).filter(model.Artifact.encodedID == encodedID)
        artifactDOwithEncodedId = utils.queryOne(query)
        if artifactDOwithEncodedId and ((artifactDO and artifactDO.id != artifactDOwithEncodedId.id) or not artifactDO):
            error = 'Artifact with encodedID: %s already exists.' % encodedID
            log.error('createArtifact: ' + error)
            raise exceptions.AlreadyExistsException(error.encode('utf-8'))
        if artifactTypeDO.modality and artifactTypeDO.extensionType != encodedID.upper().split('.')[-2]:
            raise Exception('Invalid encodedID for type: %s' % artifactTypeDO.name)
        return encodedID

    @staticmethod
    def getArtifactTypeByName(session, typeName):
        query = session.query(model.ArtifactType).prefix_with('SQL_CACHE').filter(model.ArtifactType.name==typeName)
        return utils.queryOne(query)
    
    @staticmethod
    def getArtifactTypeById(session, id):
        query = session.query(model.ArtifactType).prefix_with('SQL_CACHE').filter(model.ArtifactType.id==id)
        return utils.queryOne(query)
    
    @staticmethod
    def getArtifactById(session, id):
        query = session.query(model.Artifact).filter(model.Artifact.id == id)
        return utils.queryOne(query)
    
    @staticmethod
    def getArtifactRevisionById(session, id):
        query = session.query(model.ArtifactRevision).filter(model.ArtifactRevision.id == id)
        return utils.queryOne(query)
    
    @staticmethod
    def getLicenseByName(session, licenseName):
        query = session.query(model.License).prefix_with('SQL_CACHE').filter(model.License.name == licenseName)
        return utils.queryOne(query)

    @staticmethod
    def getArtifactRevisionsByIDs(session, ids):
        if not ids:
            return []
        query = session.query(model.ArtifactRevision)
        query = query.filter(model.ArtifactRevision.id.in_(ids))
        return query.all()
    
    @staticmethod
    def getArtifactsByIDs(session, ids):
        if not ids:
            return []
        query = session.query(model.Artifact)
        query = query.filter(model.Artifact.id.in_(ids))
        return query.all()


    @staticmethod
    def getArtifactTypeDOFromArtifactDict(session, artifactDict):
        #
        # Try to get the artifact Type by id first, if name is passed get it by name
        #
        artifactTypeDO = None
        if 'type' in artifactDict:
            if 'id' in artifactDict['type'] and artifactDict['type']['id']:
                artifactTypeDO = ArtifactDataModel.getArtifactTypeById(session, artifactDict['type']['id'])
                if artifactTypeDO is None:
                    raise exceptions.UnknownArtifactTypeException('Invalid type id [%s]' % artifactDict['type']['id'].encode("utf-8"))
            if artifactTypeDO is None and 'name' in artifactDict['type'] and artifactDict['type']['name']:
                artifactTypeDO = ArtifactDataModel.getArtifactTypeByName(session, artifactDict['type']['name'])
                if artifactTypeDO is None:
                    raise exceptions.UnknownArtifactTypeException('Invalid type [%s]' % artifactDict['type']['name'].encode("utf-8"))
        return artifactTypeDO
    
    @staticmethod
    def getArtifactCreatorDOFromArtifactDict(session, artifactDict):
        #
        # Try to get the creator by id first, if login is passed get it by login
        #
        artifactCreatorDO = None
        if 'creator' in artifactDict:
            if 'id' in artifactDict['creator'] and artifactDict['creator']['id']:
                artifactCreatorDO = MemberDataManager.getMemberbyID(session, artifactDict['creator']['id'])
            if artifactCreatorDO is None and 'login' in artifactDict['creator'] and artifactDict['creator']['login']:
                artifactCreatorDO = MemberDataManager.getMemberbyLogin(session, artifactDict['creator']['login'])
        return artifactCreatorDO


    def _checkForMultipleCoverImages(self, artifactRevisionDO):
        coverPageCnt = coverPageIconCnt = 0
        resourceRevisionDOs = artifactRevisionDO.resourceRevisions
        for resourceRevisionDO in resourceRevisionDOs:
            resourceDO = resourceRevisionDO.resource
            if resourceDO.type.name == 'cover page':
                coverPageCnt += 1
            if resourceDO.type.name == 'cover page icon':
                coverPageIconCnt += 1
        if coverPageCnt > 1 or coverPageIconCnt > 1:
            raise Exception(u'Only 1 resource of type "cover page" or "cover page icon" is allowed.').encode("utf-8")
         

    def _createArtifact(self, memberDO, artifactDict, artifactCache=None):
        """
            This function handles create artifact case. Will be called when we're not able to find the artifact from payload and 
            input parameters. It checks all the fields before update and throws exception
             
            @param memberDO: logged in user
            @param artifactDict: payload of the artifact to be created.
            
        """
        log.info('_createArtifact: begin for member [%s] ' % memberDO.id)
        log.debug('_createArtifact artifactdict [%s] ' % artifactDict)
        utils.checkAttributes(['type', 'title'], **artifactDict)
        artifactTypeDO = ArtifactDataModel.getArtifactTypeDOFromArtifactDict(meta.Session, artifactDict)
        if artifactTypeDO is None:
            log.error('_createArtifact: Invalid type [%s]' % artifactDict['type'])
            raise exceptions.UnknownArtifactTypeException('Invalid type [%s]' % artifactDict['type'].encode("utf-8"))
        if artifactDict['title'] == '':
            raise exceptions.CannotCreateArtifactException(u"_createArtifact: Title cannot be blank".encode("utf-8"))
        
        # Dictionary for creating Artifact Database Object
        kwargs = {}
        kwargs['name'] = artifactDict['title']
        if artifactTypeDO.name == 'chapter':
            # TODO: check and populate this field when calling this function
            utils.checkAttributes(['bookTitle'], **artifactDict)
            kwargs['name'] = self._appendBookNameToChapterName(artifactDict['title'], artifactDict['bookTitle'])

        # Only admins can create artifact with custom handle
        if artifactDict.get('handle', None) and MemberDataManager.isGroupAdmin(session=meta.Session, memberDO=memberDO, groupID=1):
            kwargs['handle'] = self._convertTitleToHandle(artifactDict['handle'])
        else:
            kwargs['handle'] = self._generateUniqueHandle(artifactTitle=kwargs['name'], artifactTypeDO=artifactTypeDO,
                                                          artifactCreatorDO=memberDO)

        if ArtifactDataModel.getArtifactDOFromTypeHandleCreator(meta.Session, artifactTypeID=artifactTypeDO.id, artifactHandle=kwargs['handle'],
                                                    artifactCreatorID=memberDO.id):
            error = "Artifact with handle: [%s], creatorID: [%d], type: [%s] already exists" % (kwargs['handle'], memberDO.id, artifactTypeDO.name)
            log.error('_createArtifact: %s' % error)
            raise exceptions.AlreadyExistsException(error.encode('utf-8'))

        encodedID = artifactDict.get('encodedID')
        if encodedID:
            encodedID = encodedID.upper()
            ArtifactDataModel._checkEncodedID(artifactTypeDO, None, encodedID)
            kwargs['encodedID'] = encodedID

        kwargs['creatorID'] = memberDO.id
        kwargs['artifactTypeID'] = artifactTypeDO.id
        if 'license' in artifactDict and 'name' in artifactDict['license']:
            licenseDO = ArtifactDataModel.getLicenseByName(meta.Session, artifactDict['license']['name'])
            kwargs['licenseID'] = licenseDO.id if licenseDO else None
        kwargs['creationTime'] = self.requestTimeStamp
        kwargs['description'] = artifactDict.get('description', None)

        languageName = artifactDict.get('language', {}).get('name', 'english')
        language = api._getLanguageByNameOrCode(meta.Session, nameOrCode=languageName)
        if not language:
            raise exceptions.InvalidArgumentException('Invalid languageCode [%s]' % languageName)
        kwargs['languageID'] = language.id
        
        artifactDO = model.Artifact(**kwargs)
        meta.Session.add(artifactDO)
        meta.Session.flush()

        contentRevisionDict, contentPresent, artifactRevisionDict = None, False, {}
        if 'revisions' in artifactDict:
            if len(artifactDict['revisions']) > 1:
                raise exceptions.InvalidArgumentException("Length of revisions list cannot exceed 1".encode('utf-8'))
            artifactRevisionDict = artifactDict['revisions'][0]
            if 'contentRevision' in artifactRevisionDict:
                contentRevisionDict = artifactRevisionDict['contentRevision']
                if 'xhtml' in contentRevisionDict:
                    contentPresent = True

        arkwargs = {
                    'artifactID': artifactDO.id,
                    'revision': '1',
                    'downloads': 0,
                    'favorites': 0,
                    'messageToUsers': artifactRevisionDict['messageToUsers'] if 'messageToUsers' in artifactRevisionDict else None,
                    'comment': artifactRevisionDict['comment'] if 'comment' in artifactRevisionDict else None
                }

        artifactRevisionDO = model.ArtifactRevision(**arkwargs)
        artifactRevisionDO.artifact = artifactDO # TODO: revisit
        meta.Session.add(artifactRevisionDO)
        #artifactDO.revisions = [artifactRevisionDO] # TODO: revisit
        meta.Session.flush()

        if 'authors' in artifactDict:
            self._updateAuthors(memberDO, artifactDO, artifactDict['authors'])
        else:
            self._updateAuthors(memberDO, artifactDO, [{'name':memberDO.fix().name, 'role':{'name':'author'}}])
        if 'tagTerms' in artifactDict:
            self._updateTagTerms(artifactDO, artifactDict['tagTerms'])
        self._updateBrowseTermsAndCollections(artifactDO, artifactDict.get('browseTerms'), 
                            browseTermCache=artifactCache.relatedArtifactCache.browseTermCache if artifactCache else None, 
                            collections=artifactDict.get('collections'))
        if 'searchTerms' in artifactDict:
            self._updateSearchTerms(artifactDO, artifactDict['searchTerms'])

        if artifactDict.get('resources', None) is not None:
            # We are getting resource IDs in the input and not ResourceRevision IDs
            # Resource ID -> Latest Resource Revision ID
            # Associate RRIDs with latest artifactRevision
            resourceRevisionDOs = []
            for resourceDict in artifactDict['resources']:
                resourceDO = ArtifactDataModel.getResourceDOFromResourceDict(meta.Session, resourceDict)
                if resourceDO is None:
                    raise Exception("Unable to get the resource for data [%s]" % resourceDict)
                resourceRevisionDOs.append(resourceDO.revisions[0])
            # Associate the same ResourceRevisions with the new ArtifactRevision
            ResourceDataManager.associateResources(meta.Session, memberDO, artifactRevisionDO, resourceRevisionDOs, 
                                               processContentTypeResource=False, toAppend=False)

        if contentPresent:
            # Convert to xhtml and Do Rosetta Validation
            xhtml = helpers.transform_to_xhtml(contentRevisionDict['xhtml'], validateRosetta=True, validateImages=True)
            resourceDict = {
                    'name' : artifactDO.name,
                    'description' : artifactDO.description,
                    'uri' : str(artifactRevisionDO.id)
                }
            contentTypeResourceDO = ResourceDataManager.createContentTypeResource(meta.Session, memberDO, resourceDict)
            newContentTypeResourceRevisionCreated, contentTypeResourceRevisionDO = ResourceDataManager.checkAndUpdateContentTypeResource(
                                                            meta.Session, memberDO, contentTypeResourceDO, xhtml)
            artifactRevisionDO.resourceRevisions.append(contentTypeResourceRevisionDO)
        
        meta.Session.flush()
        log.info('_createArtifact: end for member [%s] ' % memberDO.id)
        log.debug('_createArtifact done')
        return artifactRevisionDO, True
    

    def _copyArtifact(self, memberDO, srcArtifactDO, srcArtifactRevisionDO, artifactDict, artifactCache=None):
        """
            This function handles copy artifact case. Will be called when update artifact is called and owner != logged in user.
            It checks all the fields before update and throws exception
            
            @param memberDO: logged in user
            @param srcArtifactDO: source artifact from which copy has to be made
            @param srcArtifactRevisionDO: source artifact revision from which resource copy has to be made.
                                            If this parameter is None, then latest revision will used 
            @param artifactDict: payload of the artifact to be copied. while doing copy artifact, the field values passed in the
                                    payload will overwrite the values from the source artifact
            
        """
        log.info('_copyArtifact: begin for member [%s] ' % memberDO.id)
        log.debug('_copyArtifact artifactdict [%s] ' % artifactDict)
        # TODO: Confirm this. Duplicate Titles allowed ?
        artifactDict['title'] = srcArtifactDO.name if 'title' not in artifactDict else artifactDict['title']
        utils.checkAttributes(['title'], **artifactDict)
        artifactTypeDO = ArtifactDataModel.getArtifactTypeByName(meta.Session, artifactDict['changedArtifactType']) if artifactDict.get(
            'changedArtifactType', None) else srcArtifactDO.type
        kwargs = {}
        kwargs['name'] = artifactDict['title']
        if artifactTypeDO.name == 'chapter':
            # TODO: check and populate this field when calling this function
            utils.checkAttributes(['bookTitle'], **artifactDict)
            bookName = artifactDict['bookTitle']
            kwargs['name'] = self._appendBookNameToChapterName(artifactDict['title'], bookName)
        
        # Only admins can create artifact with custom handle
        if artifactDict.get('handle', None) and MemberDataManager.isGroupAdmin(session=meta.Session, memberDO=memberDO, groupID=1):
            kwargs['handle'] = self._convertTitleToHandle(artifactDict['handle'])
        else:
            kwargs['handle'] = self._generateUniqueHandle(artifactTitle=kwargs['name'], artifactTypeDO=artifactTypeDO,
                                                          artifactCreatorDO=memberDO)
        if ArtifactDataModel.getArtifactDOFromTypeHandleCreator(meta.Session, artifactTypeID=artifactTypeDO.id, artifactHandle=kwargs['handle'],
                                                    artifactCreatorID=memberDO.id):
            error = "Artifact with handle: [%s], creatorID: [%d], type: [%s] already exists" % (kwargs['handle'], memberDO.id, artifactTypeDO.name)
            log.error('_copyArtifact: %s' % error)
            raise exceptions.AlreadyExistsException(error.encode('utf-8'))
        
        srcArtifactRevisionDO = srcArtifactDO.revisions[0] if srcArtifactRevisionDO is None else srcArtifactRevisionDO
        
        kwargs['artifactTypeID'] = artifactTypeDO.id
        kwargs['description'] = artifactDict['description'] if 'description' in artifactDict else srcArtifactDO.description
        kwargs['creatorID'] = memberDO.id
        kwargs['ancestorID'] = srcArtifactRevisionDO.id
        kwargs['creationTime'] = self.requestTimeStamp
        if 'license' in artifactDict and 'name' in artifactDict['license']:
            licenseDO = ArtifactDataModel.getLicenseByName(meta.Session, artifactDict['license']['name'])
            kwargs['licenseID'] = licenseDO.id if licenseDO else None
        else:
            kwargs['licenseID'] = srcArtifactDO.licenseID

        if 'language' in artifactDict and 'name' in artifactDict['language']:
            languageDO = api._getLanguageByNameOrCode(meta.Session, nameOrCode=artifactDict['language']['name'])
            if not languageDO:
                raise exceptions.InvalidArgumentException('Invalid languageCode [%s]' % artifactDict['language']['name'])
            kwargs['languageID'] = languageDO.id
        else:
            kwargs['languageID'] = srcArtifactDO.languageID

        
        destArtifactDO = model.Artifact(**kwargs)

        destArtifactDO.authors = []
        destArtifactDO.browseTerms = []
        destArtifactDO.tagTerms = []
        destArtifactDO.searchTerms = []

        contentRevisionDict, artifactRevisionDict, contentPresent = None, {}, False
        if 'revisions' in artifactDict:
            if len(artifactDict['revisions']) > 1:
                raise exceptions.InvalidArgumentException("Length of revisions list cannot exceed 1".encode('utf-8'))
            artifactRevisionDict = artifactDict['revisions'][0]
            if 'contentRevision' in artifactRevisionDict:
                contentRevisionDict = artifactRevisionDict['contentRevision']
                if 'xhtml' in contentRevisionDict:
                    contentPresent = True
        
        messageToUsers = artifactRevisionDict['messageToUsers'] if 'messageToUsers' in artifactRevisionDict else srcArtifactRevisionDO.messageToUsers
        comment = artifactRevisionDict['comment'] if 'comment' in artifactRevisionDict else srcArtifactRevisionDO.comment
        destArtifactRevisionDO = model.ArtifactRevision(revision='1', messageToUsers=messageToUsers, comment=comment)
        
        destArtifactDO.revisions = [destArtifactRevisionDO]
        destArtifactRevisionDO.resourceRevisions = []
        destArtifactDO.artifact = destArtifactDO
        # TODO: How are standards updated ?
        destArtifactRevisionDO.standards = srcArtifactRevisionDO.standards
        meta.Session.add(destArtifactDO)
        meta.Session.flush()

        log.debug('_copyArtifact: copying authors, browseTerms, tagTerms, searchTerms')
        if 'authors' in artifactDict:    
            self._updateAuthors(memberDO, destArtifactDO, artifactDict['authors'])
        else:
            for author in srcArtifactDO.authors:
                artifactAuthorDO = model.ArtifactAuthor(artifactID=destArtifactDO.id,
                                                        name=author.name,
                                                        roleID=author.roleID,
                                                        sequence=author.sequence)
                destArtifactDO.authors.append(artifactAuthorDO)
        browseTermCache = artifactCache.relatedArtifactCache.browseTermCache if artifactCache else None
        if 'browseTerms' in artifactDict:
            self._updateBrowseTermsAndCollections(destArtifactDO, artifactDict['browseTerms'], browseTermCache, copyCase=True, 
                    donotCopyDomain=artifactDict.get('donotCopyDomain', False), collections=artifactDict.get('collections'))
        else:
            for bt in srcArtifactDO.browseTerms:
                if bt.type.name == 'pseudodomain' or (bt.type.name == 'domain' and artifactDict.get('donotCopyDomain', False)):
                    continue
                if bt.type.name == 'domain':
                    from flx.model import migrated_concepts as mc
                    supercedingConcept = mc._getSupercedingConcept(meta.Session, encodedID=bt.encodedID)
                    bt = supercedingConcept if supercedingConcept else bt
                    self._checkAndCreateRelatedArtifact(destArtifactDO, bt)
                else:
                    destArtifactDO.browseTerms.append(bt)
                api.invalidateBrowseTerm(browseTermCache, bt.id, memberID=memberDO.id, session=meta.Session)
            self._updateBrowseTermsAndCollections(destArtifactDO, newBrowseTerms=None, browseTermCache=browseTermCache, 
                    collections=artifactDict.get('collections'))
        if 'tagTerms' in artifactDict:
            self._updateTagTerms(destArtifactDO, artifactDict['tagTerms'])
        else:
            for tt in srcArtifactDO.tagTerms:
                destArtifactDO.tagTerms.append(tt)
        if 'searchTerms' in artifactDict:
            self._updateSearchTerms(destArtifactDO, artifactDict['searchTerms'])
        else:
            for st in srcArtifactDO.searchTerms:
                destArtifactDO.searchTerms.append(st)
                
        if not contentPresent:
            ResourceDataManager.associateResources(meta.Session, memberDO, destArtifactRevisionDO, srcArtifactRevisionDO.resourceRevisions,
                                                   processContentTypeResource=True)
        else:
            ResourceDataManager.associateResources(meta.Session, memberDO, destArtifactRevisionDO, srcArtifactRevisionDO.resourceRevisions,
                                                   processContentTypeResource=False)
            # Convert to xhtml and Do Rosetta Validation
            xhtml = helpers.transform_to_xhtml(contentRevisionDict['xhtml'], validateRosetta=True, validateImages=True)
            resourceDict = {
                    'name' : destArtifactDO.name,
                    'description' : destArtifactDO.description,
                    'uri' : str(destArtifactRevisionDO.id)
                }
            contentTypeResourceDO = ResourceDataManager.createContentTypeResource(meta.Session, memberDO, resourceDict)
            newContentTypeResourceRevisionCreated, contentTypeResourceRevisionDO = ResourceDataManager.checkAndUpdateContentTypeResource(
                                                        meta.Session, memberDO, contentTypeResourceDO, xhtml)
            destArtifactRevisionDO.resourceRevisions.append(contentTypeResourceRevisionDO)
            
        # TODO: add domain ?
        meta.Session.add(destArtifactRevisionDO)
        meta.Session.flush()

        log.debug('_copyArtifact: dest artifact details: aid[%s] arid[%s]' % (destArtifactDO.id, destArtifactRevisionDO.id))
        log.info('_copyArtifact: end for member [%s] ' % memberDO.id)
        log.debug('_copyArtifact done')
        return destArtifactRevisionDO, True

    
    @staticmethod
    def decodeBase64EncodedFields(artifactDict):
        try:
            if 'description' in artifactDict:
                artifactDict['description'] = base64.b64decode(artifactDict['description'])
        except TypeError:
            log.warn("Error decoding description base64")
            raise Exception("Error decoding description base 64")
        try:
            if 'revisions' in artifactDict:
                if len(artifactDict['revisions']) > 1:
                    raise exceptions.InvalidArgumentException("Length of revisions list cannot exceed 1".encode('utf-8'))
                artifactRevisionDict = artifactDict['revisions'][0]
                if 'contentRevision' in artifactRevisionDict:
                    contentRevisionDict = artifactRevisionDict['contentRevision']
                    if 'xhtml' in contentRevisionDict:
                        contentRevisionDict['xhtml'] = base64.b64decode(contentRevisionDict['xhtml'])
        except TypeError:
            log.warn("Error decoding xhtml base64")
            raise Exception("Error decoding xhtml base 64")

    bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook', 'testbook']
    chapterLevelArtifactTypes = ['chapter']
    sectionLevelArtifactTypes = ['lesson', 'section']
    supportedArtifactTypes = ['lecture', 'lab', 'preread', 'postread', 'activity', 'prepostread', 'whileread', 'flashcard', \
                'studyguide', 'lessonplan', 'handout', 'rubric', 'presentation', 'web', 'rwa', 'enrichment']
    supportedArtifactTypes = supportedArtifactTypes + bookLevelArtifactTypes + chapterLevelArtifactTypes + sectionLevelArtifactTypes
    
    def updateArtifact(self, memberDO, artifactDO, artifactRevisionDO, artifactDict, parentType=None, artifactCache=None, origSiblingsDict={}):
        """
            This is the generic function to update artifact and its children. Based on the input and payload this calls
                1. _createArtifact() if it's not able to get artifact from payload and parameters
                2. _copyArtifact() if it gets the artifact but the owner != logged in user
                3. _updateArtifact() if it gets the artifact and owner = logged in user
            In recursion, we start processing the children first. If new revision of any child is created, then it
            creates new revision of the parent as well.
             
            @param memberDO: logged in user
            @param artifactDO: artifact to be updated, if null, will try to get it from the payload
            @param artifactRevisionDO: artifact revision to be updated. This is found from payload 
            @param artifactDict: payload of artifact to by updated including payload of children artifacts
            @param parentType: type of parent artifact. This is needed for following checks
                                    1. A book should be outermost artifact
                                    2. Chapter can only exist within a book
                                    3. Lesson can exist independently, or within a chapter or within a book
                                These checks should take care of cycles in parent children relations
            @param artifactCache: This is passed from controller as it is part of controller package
            @param origSiblingsDict: For chapter case which is owned by user, make a copy if its not part part of current book already
                                    -> This is required to quickly determine if chapter was already part of the book
        """
        #ArtifactDataModel.decodeBase64EncodedFields(artifactDict)
        log.debug('updateArtifact: artifactDict [%s] ' % artifactDict)
        
        # If forUpdate flag is not passed, just return the artifactRevisionDO
        # For chapter case which is owned by user, make a copy if its not part part of current book already, add forUpdate flag in artifactDict
        if not artifactDict.get('forUpdate', None):
            if not artifactRevisionDO and 'revisionID' in artifactDict: 
                artifactRevisionDO = ArtifactDataModel.getArtifactRevisionById(meta.Session, artifactDict['revisionID'])
            if not artifactRevisionDO:
                if not artifactDO:
                    artifactDO = ArtifactDataModel.getArtifactDOFromArtifactDict(meta.Session, artifactDict)
                artifactRevisionDO = artifactDO.revisions[0] if artifactDO else None
            if artifactRevisionDO:
                # For chapter which is owned by user, make a copy if its not part part of current book already
                if parentType in ArtifactDataModel.bookLevelArtifactTypes:
                    if artifactDO is None:
                        artifactDO = artifactRevisionDO.artifact
                    if artifactDO.type.name in ArtifactDataModel.chapterLevelArtifactTypes and artifactDO.id not in origSiblingsDict and artifactDO.creatorID == memberDO.id:
                        artifactDict['forUpdate'] = True
                        if artifactDict.get('revisions', None):
                            artifactDict['revisions'][0]['children'] = None
                        log.info('updateArtifact: chapter with artifact id [%s] owned by user, not already part of book for member [%s]' % (
                                        artifactDO.id, memberDO.id))
                    else:
                        return artifactRevisionDO, False
                else:
                    return artifactRevisionDO, False
        
        if artifactDO is None:
            artifactDO = ArtifactDataModel.getArtifactDOFromArtifactDict(meta.Session, artifactDict)
    
        artifactTypeDO = artifactDO.type if artifactDO else ArtifactDataModel.getArtifactTypeDOFromArtifactDict(meta.Session, artifactDict)
        if artifactTypeDO is None:
            raise Exception("Unable to determine artifact type. type field required".encode("utf-8"))
        if artifactTypeDO.name not in ArtifactDataModel.supportedArtifactTypes:
            raise exceptions.InvalidArgumentException("Artifact Type should be one of book, chapter, lesson, section".encode('utf-8'))
        #
        #   Checks  -> Book can't be child of any Artifact
        #           -> Chapter has to within a Book
        #           -> Lesson has to be within a Chapter or a Book
        #           -> Section has to be within a Chapter or a Book ?
        #  These checks should take care of cycles as well
        if parentType:
            if artifactTypeDO.name in ArtifactDataModel.bookLevelArtifactTypes:
                raise exceptions.InvalidArgumentException("Book cannot be child of any artifact".encode('utf-8'))
            elif artifactTypeDO.name in ArtifactDataModel.chapterLevelArtifactTypes:
                if parentType not in ArtifactDataModel.bookLevelArtifactTypes:
                    raise exceptions.InvalidArgumentException("Chapter should be contained only within a book".encode('utf-8'))
            elif artifactTypeDO.name in ArtifactDataModel.sectionLevelArtifactTypes:
                if not (parentType in ArtifactDataModel.chapterLevelArtifactTypes or parentType in ArtifactDataModel.bookLevelArtifactTypes):
                    raise exceptions.InvalidArgumentException(("[%s] should be contained only within a chapter or a book" % artifactTypeDO.name).encode('utf-8'))
        
        origArtifactRevisionDO = artifactDO.revisions[0] if artifactDO else None
        origChildRevisionDOs = [revRel.child for revRel in artifactDO.revisions[0].children] if artifactDO else []
        
        # This is required to determine if the chapter artifact owned by user, is already part of the current book
        origChildrenArtifactsDict = {}
        if artifactTypeDO.name in ArtifactDataModel.bookLevelArtifactTypes:
            artifactIDs = []
            for childRevisionDO in origChildRevisionDOs:
                artifactIDs.append(childRevisionDO.artifactID)
            artifactDOs = ArtifactDataModel.getArtifactsByIDs(meta.Session, artifactIDs)
            for a in artifactDOs:
                origChildrenArtifactsDict[a.id] = True
        
        childRevisionDOs, childrenChanged = None, False
        artifactRevisionDict = None
        if 'revisions' in artifactDict:
            if len(artifactDict['revisions']) > 1:
                raise exceptions.InvalidArgumentException("Length of revisions list cannot exceed 1".encode('utf-8'))
            artifactRevisionDict = artifactDict['revisions'][0]

        # json payload format of children is same as parent. Update Children first in recursion
        if artifactRevisionDict and artifactRevisionDict.get('children', None) is not None:
            childRevisionDOs = []
            bookName = None
            # we append bookname in chapter title and handle
            if artifactDO and artifactDO.type.name in ArtifactDataModel.bookLevelArtifactTypes:
                bookName = artifactDict.get('title') if artifactDict.get('title') else artifactDO.name
            if bookName is None and artifactTypeDO and artifactTypeDO.name in ArtifactDataModel.bookLevelArtifactTypes:
                utils.checkAttributes(['title'], **artifactDict)
                bookName = artifactDict.get('title')
            
            # get all children artifact revision objects and artifact objects in single query
            childrenRevisionsDict, revisionsForQuery = {}, []
            for childDict in artifactRevisionDict['children']:
                if 'revisionID' in childDict:
                    revisionsForQuery.append(long(childDict['revisionID']))
            ars = ArtifactDataModel.getArtifactRevisionsByIDs(meta.Session, revisionsForQuery)
            artifactIDs = []
            for ar in ars:
                childrenRevisionsDict[ar.id] = ar
                artifactIDs.append(ar.artifactID)
            artifactDOs = ArtifactDataModel.getArtifactsByIDs(meta.Session, artifactIDs)
            childrenArtifactsDict = {} 
            for a in artifactDOs:
                childrenArtifactsDict[a.id] = a

            for childDict in artifactRevisionDict['children']:
                if (artifactDO and artifactDO.type.name in ArtifactDataModel.bookLevelArtifactTypes and not childDict.get('bookName', None)) or \
                        (artifactTypeDO and artifactTypeDO.name in ArtifactDataModel.bookLevelArtifactTypes):
                    childDict['bookTitle'] = bookName
                childRevisionDO = None
                if 'revisionID' in childDict  and childrenRevisionsDict.get(long(childDict.get('revisionID')), None):
                    childRevisionDO = childrenRevisionsDict[childDict['revisionID']]
                childArtifactDO = childrenArtifactsDict.get(childRevisionDO.artifactID, None) if childRevisionDO else None
                childRevisionDO, childRevisionCreated = self.updateArtifact(memberDO, artifactDO=childArtifactDO, artifactRevisionDO=childRevisionDO,
                            artifactDict=childDict, parentType=artifactTypeDO.name, artifactCache=artifactCache, origSiblingsDict=origChildrenArtifactsDict)
                log.info('updateArtifact: childRevisionDO [%s], childRevisionCreated[%s] for member [%s]' % (
                                childRevisionDO.id, childRevisionCreated, memberDO.id))
                childRevisionDOs.append(childRevisionDO)
                if childRevisionCreated:
                    childrenChanged = True
        
        create_copy_update_case = 1 # 1 for create, 2 for copy, 3 for update
        newArtifactRevisionDO, newArtifactRevisionCreated = None, False
        
        # create case
        if artifactDO is None:
            newArtifactRevisionDO, newArtifactRevisionCreated = self._createArtifact(memberDO, artifactDict, artifactCache=artifactCache)
            create_copy_update_case = 1
        
        # copy case
        elif artifactDO.creatorID != memberDO.id:
            if artifactDO.type.name == 'section':
                artifactDict['changedArtifactType'] = 'lesson'
                artifactDict['donotCopyDomain'] = True
            # Group Editing Change, list taken from artifact.py controller file
            if artifactDO.type.name not in ['book', 'tebook', 'workbook', 'labkit', 'quizbook', 'testbook']:
                api._authorizeBookEditing(meta.Session, memberDO.id, memberDO.email, api.BOOK_EDITING_FINALIZE, artifactDO.creatorID, artifactDO.id)
            # Copy, the revision of the artifact which is passed as input, else copy the most recent revision
            if artifactDict.get('revisionID', None):
                srcArtifactRevisionDO = ArtifactDataModel.getArtifactRevisionById(meta.Session, artifactDict['revisionID'])
                if srcArtifactRevisionDO is None:
                    raise Exception(u'Invalid artifact revision id passed %(revision)s' % {"revision":artifactDict[
                        'revisionID']})
                if srcArtifactRevisionDO.artifact.id != artifactDO.id:
                    error = "Passed Revision id[%s] does not belong to passed artifact id[%s]" % (artifactDict['revisionID'], artifactDO.id)
                    raise exceptions.InvalidArgumentException(error.encode('utf-8'))
            else:
                srcArtifactRevisionDO = artifactDO.revisions[0]
            # copy only when forUpdate flag is passed or any child is updated
            if artifactDict.get('forUpdate', None) or childrenChanged:
                newArtifactRevisionDO, newArtifactRevisionCreated = self._copyArtifact(memberDO, artifactDO, srcArtifactRevisionDO, artifactDict, artifactCache=artifactCache)
            else:
                newArtifactRevisionDO, newArtifactRevisionCreated = srcArtifactRevisionDO if srcArtifactRevisionDO else artifactDO.revisions[0], False
            create_copy_update_case = 2
            
        # update case
        else:
            originalArtifactRevisionID = artifactDO.revisions[0].id
            # update only when forUpdate flag is passed or any child is updated
            if artifactDict.get('forUpdate', None) or childrenChanged:
                # For chapter which is owned by user, make a copy if its not part part of current book already
                if artifactTypeDO.name in ArtifactDataModel.chapterLevelArtifactTypes and artifactDO.id not in origSiblingsDict:
                    newArtifactRevisionDO, newArtifactRevisionCreated = self._copyArtifact(memberDO, artifactDO, origArtifactRevisionDO, 
                                                                                           artifactDict, artifactCache=artifactCache)
                else:
                    # Group Editing Change
                    api._checkBookFinalizationLock(meta.Session, artifactDO.id)
                    newArtifactRevisionDO, newArtifactRevisionCreated = self._updateArtifact(memberDO, artifactDO, artifactDict, artifactCache=artifactCache)
                    # delete draft in update case
                    ArtifactDataModel.deleteMemberArtifactDraftByArtifactRevisionID(session=meta.Session, 
                                                                                    memberID=memberDO.id, 
                                                                                    artifactRevisionID=originalArtifactRevisionID)
            else:
                passedArtifactRevisionDO = None
                if artifactDict.get('revisionID', None):
                    passedArtifactRevisionDO = ArtifactDataModel.getArtifactRevisionById(meta.Session, artifactDict['revisionID'])
                newArtifactRevisionDO, newArtifactRevisionCreated = passedArtifactRevisionDO if passedArtifactRevisionDO else artifactDO.revisions[0], False
            create_copy_update_case = 3

        log.debug('updateArtifact: childrenChanged[%s]' % childrenChanged)
        if childRevisionDOs is not None:
            if len(childRevisionDOs) != len(origChildRevisionDOs):
                childrenChanged = True
            else:
                for i in xrange(0, len(childRevisionDOs)):
                    if childRevisionDOs[i].id != origChildRevisionDOs[i].id:
                        childrenChanged = True
        log.debug('updateArtifact: childrenChanged[%s] newArtifactRevisionCreated[%s] ' % (childrenChanged, newArtifactRevisionCreated))
        
        # If only children are changed, create a new Artifact Revision
        if childrenChanged and not newArtifactRevisionCreated:
            newArtifactRevisionDO = model.ArtifactRevision(artifactID=artifactDO.id,
                                                           revision=str(long(origArtifactRevisionDO.revision) + 1),
                                                           downloads=0, favorites=0)
            log.info('updateArtifact: creating new revision since children changed for member [%s]' % memberDO.id)
            newArtifactRevisionCreated = True
            newArtifactRevisionDO.artifact = artifactDO
            meta.Session.add(newArtifactRevisionDO)
            meta.Session.flush()
            newArtifactRevisionDO.resourceRevisions = origArtifactRevisionDO.resourceRevisions
        if newArtifactRevisionCreated:
            if create_copy_update_case == 3 and origArtifactRevisionDO.publishTime:
                newArtifactRevisionDO.publishTime = datetime.now()
            if origArtifactRevisionDO and origArtifactRevisionDO.standards:
                newArtifactRevisionDO.standards = origArtifactRevisionDO.standards
            
            # Associate the updated children with new Artifact Revision
            if childRevisionDOs is None:
                childRevisionDOs = origChildRevisionDOs
            if childRevisionDOs:
                sequence, childrenIdDict, relations = 1, {}, []
                
                artifactIDs, childrenArtifactsDict = [], {}
                for childRevisionDO in childRevisionDOs:
                    artifactIDs.append(childRevisionDO.artifactID)
                artifactDOs = ArtifactDataModel.getArtifactsByIDs(meta.Session, artifactIDs)
                for a in artifactDOs:
                    childrenArtifactsDict[a.id] = a
                
                for childRevisionDO in childRevisionDOs:
                    childArtifactDO = childrenArtifactsDict[childRevisionDO.artifactID]
                    if childArtifactDO.id in childrenIdDict:
                        raise Exception("Same artifact with title [%s] present multiple times in [%s]" % (childArtifactDO.name, 
                                                                                        newArtifactRevisionDO.artifact.name))
                    childrenIdDict[childArtifactDO.id] = True
                         
                    log.debug('updateArtifact: ArtifactRevisionRelation data: artifactRevisionID[%s], hasArtifactRevisionID[%s], sequence[%s]'
                                    % (newArtifactRevisionDO.id, childRevisionDO.id, sequence))
                    relations.append({'artifactRevisionID': newArtifactRevisionDO.id, 'hasArtifactRevisionID': childRevisionDO.id, 'sequence': sequence})
                    sequence += 1
            
                if relations:
                    meta.Session.execute(meta.ArtifactRevisionRelations.insert().values(relations))
                
                for childRevisionDO in childRevisionDOs:
                    if api._hasCycle(meta.Session, newArtifactRevisionDO.artifact.id, childRevisionDO.artifactID):
                        raise Exception(((u'Cycle detected while adding child[%(child.id)s] to %(artifact.id)s')  % {"child.id":childRevisionDO.id,"artifact.id": newArtifactRevisionDO.artifact.id}).encode("utf-8"))

        # Do not copy generated PDF, HTML and ePub resources since the artifact may have changed.
        newArtifactRevisionDO.resourceRevisions = filter(lambda rr: rr.resource.type.name not in model.PRINT_RESOURCE_TYPES, 
                                                            newArtifactRevisionDO.resourceRevisions)
        ## Log the new artifact revision event
        # create case
        if create_copy_update_case == 1:
            api._processCreateArtifactEvents(meta.Session, newArtifactRevisionDO.artifact)
        # copy case
        elif create_copy_update_case == 2:
            ## New revision created
            data = { 'type': newArtifactRevisionDO.artifact.type.name, 'id': newArtifactRevisionDO.artifact.id, 
                    'version': newArtifactRevisionDO.revision }
            api._createEventForType(meta.Session, typeName='ARTIFACT_REVISION_CREATED', objectID=newArtifactRevisionDO.artifact.id, 
                                    objectType='artifact', eventData=json.dumps(data), ownerID=memberDO.id, processInstant=True)
        # update case
        else:
            if newArtifactRevisionDO.id != origArtifactRevisionDO.id:
                ## New revision created
                data = { 'type': newArtifactRevisionDO.artifact.type.name, 'id': newArtifactRevisionDO.artifact.id,
                        'version': newArtifactRevisionDO.revision }
                api._createEventForType(meta.Session, typeName='ARTIFACT_REVISION_CREATED', objectID=newArtifactRevisionDO.artifact.id, 
                                        objectType='artifact', eventData=json.dumps(data), ownerID=memberDO.id, processInstant=True)
            # TODO: do it right way
            api.invalidateArtifact(cache=artifactCache, artifact=newArtifactRevisionDO.artifact, memberID=memberDO.id)
        meta.Session.flush()
        log.debug('updateArtifact: done')
        if newArtifactRevisionCreated:
            self._addArtifactRevisionToLibrary(memberDO, objectID=newArtifactRevisionDO.id, objectType='artifactRevision',
                                                   parentID=newArtifactRevisionDO.artifact.id)
        return newArtifactRevisionDO, newArtifactRevisionCreated
        

    def _updateArtifact(self, memberDO, artifactDO, artifactDict, artifactCache=None):
        """
            This function handles 1 single case:
             -----> Update an artifact owned by the user
            It checks all the fields before updating and throws an exception if there's any problem.
            
            Creates a new revision of the artifact when content is updated
             
             @param memberDO: logged in user
             @param artifactDO: artifact to be updated, has to be non null
             @param artifactDict: payload of artifact to by updated
        """
        log.info('_updateArtifact: begin for member [%s] ' % memberDO.id)
        log.debug('_updateArtifact artifactdict [%s] ' % artifactDict)
        artifactRevisionDO, artifactTypeDO = artifactDO.revisions[0], artifactDO.type
        if artifactDict.get('revisionID', None) and artifactRevisionDO.id != artifactDict['revisionID']:
            raise exceptions.OldRevisionUpdateException(u"Revision passed is not the latest for artifact with title '{title}'.".format(
                title=artifactDO.name).encode('utf-8'))
        if 'title' in artifactDict and artifactDict['title']:
            artifactDO.name = artifactDict['title']
            if artifactTypeDO.name in ArtifactDataModel.chapterLevelArtifactTypes:
                # TODO: check and populate 'bookTitle' field when calling this function
                utils.checkAttributes(['bookTitle'], **artifactDict)
                bookName = artifactDict['bookTitle']
                if not bookName:
                    raise Exception('Null/Empty bookTitle passed in the chapter[title: %s] payload' % artifactDO.name)
                artifactDO.name = self._appendBookNameToChapterName(artifactDict['title'], bookName)

        # Only admins can modify handle
        if artifactDict.get('handle', None) and MemberDataManager.isGroupAdmin(session=meta.Session, memberDO=memberDO, groupID=1):
            handle = self._convertTitleToHandle(artifactDict['handle'])
            if artifactDO.handle != handle:
                if ArtifactDataModel.getArtifactDOFromTypeHandleCreator(meta.Session, artifactTypeID=artifactTypeDO.id,
                                                                        artifactHandle=handle,
                                                                        artifactCreatorID=memberDO.id):
                    raise Exception('Artifact with handle: [%s] already exists' % handle)
                api._archiveArtifactHandle(meta.Session, artifactDO.id, artifactDO.handle, artifactDO.artifactTypeID, artifactDO.creatorID)
                if artifactCache:
                    api.invalidatePerma(artifactCache, artifactDO)
                artifactDO.handle = handle

        # TODO: clarify this. extension Type check only on modalities ?
        encodedID = artifactDict.get('encodedID')
        if encodedID:
            encodedID = encodedID.upper()
            ArtifactDataModel._checkEncodedID(artifactTypeDO, artifactDO, encodedID)
            artifactDO.encodedID = encodedID
            
        if 'description' in artifactDict:
            artifactDO.description = artifactDict['description']
        if 'license' in artifactDict and 'name' in artifactDict['license']:
            licenseDO = ArtifactDataModel.getLicenseByName(meta.Session, artifactDict['license']['name'])
            artifactDO.licenseID = licenseDO.id if licenseDO else None
        if 'language' in artifactDict and 'name' in artifactDict['language']:
            languageDO = api._getLanguageByNameOrCode(meta.Session, nameOrCode=artifactDict['language']['name'])
            if not languageDO:
                raise exceptions.InvalidArgumentException('Invalid languageCode [%s]' % artifactDict['language']['name'])
            artifactDO.languageID = languageDO.id
        if 'authors' in artifactDict:
            self._updateAuthors(memberDO, artifactDO, artifactDict['authors'])
        if 'tagTerms' in artifactDict:
            self._updateTagTerms(artifactDO, artifactDict['tagTerms'])
        self._updateBrowseTermsAndCollections(artifactDO, artifactDict.get('browseTerms'), 
                            browseTermCache=artifactCache.relatedArtifactCache.browseTermCache if artifactCache else None, 
                            collections=artifactDict.get('collections'))
        if 'searchTerms' in artifactDict:
            self._updateSearchTerms(artifactDO, artifactDict['searchTerms'])
        artifactDO.updateTime = datetime.now()
        
        newArtifactRevisionDO, newArtifactRevisionCreated, artifactRevisionDict = artifactRevisionDO, False, None
        log.debug('_updateArtifact: artifactRevisionDOID[%s]' % artifactRevisionDO.id)
        
        contentTypeResourceRevisionDO = self._extractArtifactRevisionContentRevisionDO(artifactRevisionDO)
        # Check and update Content type resource, Create new Artifact revision if contents are updated
        if 'revisions' in artifactDict:
            if len(artifactDict['revisions']) > 1:
                raise exceptions.InvalidArgumentException("Length of revisions list cannot exceed 1".encode('utf-8'))
            artifactRevisionDict = artifactDict['revisions'][0]
            if 'contentRevision' in artifactRevisionDict:
                contentRevisionDict = artifactRevisionDict['contentRevision']
                if 'xhtml' in contentRevisionDict:
                    contentTypeResourceDO = None
                    if contentTypeResourceRevisionDO is None:
                        resourceDict = {
                                'name' : artifactDO.name,
                                'description' : artifactDO.description,
                                'uri' : str(artifactRevisionDO.id)
                            }
                        contentTypeResourceDO = ResourceDataManager.createContentTypeResource(meta.Session, memberDO, resourceDict)                    
                    else:
                        contentTypeResourceDO = contentTypeResourceRevisionDO.resource
                        
                    # Convert to xhtml and Do Rosetta Validation
                    xhtml = helpers.transform_to_xhtml(contentRevisionDict['xhtml'], validateRosetta=True, validateImages=True)
                    newContentTypeResourceRevisionCreated, contentTypeResourceRevisionDO = ResourceDataManager.checkAndUpdateContentTypeResource(
                                                                    meta.Session, memberDO, contentTypeResourceDO, xhtml)
                    # Create new ArtifactRevision
                    if newContentTypeResourceRevisionCreated:
                        newArtifactRevisionDO = model.ArtifactRevision(artifactID=artifactDO.id,
                                                                       revision=str(long(artifactDO.revisions[0].revision)+1),
                                                                       downloads=0, favorites=0)
                        log.info('_updateArtifact: creating new revision since contents changed for member[%s]' % memberDO.id)
                        meta.Session.add(newArtifactRevisionDO)
                        meta.Session.flush()
                        newArtifactRevisionDO.artifact = artifactDO
                        newArtifactRevisionCreated = True
                        
        log.debug('_updateArtifact: newArtifactRevisionCreated[%s]' % newArtifactRevisionCreated)
        if newArtifactRevisionCreated or artifactDict.get('resources', None) is not None:
            resourceRevisionDOs = artifactRevisionDO.resourceRevisions
            origResourcesDict, resourcesChanged = {}, False
            for rrdo in artifactRevisionDO.resourceRevisions:
                origResourcesDict[rrdo.id] = rrdo
            if artifactDict.get('resources', None) is not None:
                # We are getting resource IDs in the input and not ResourceRevision IDs
                # Resource ID -> Latest Resource Revision ID
                # Associate RRIDs with latest artifactRevision
                resourceRevisionDOs = []
                for resourceDict in artifactDict['resources']:
                    resourceDO = ArtifactDataModel.getResourceDOFromResourceDict(meta.Session, resourceDict)
                    if resourceDO is None:
                        raise Exception("Unable to get the resource for data [%s]" % resourceDict)
                    resourceRevisionDOs.append(resourceDO.revisions[0])
                # TODO: revisit this. All resources are passed in payload ?
                if len(resourceRevisionDOs) != len(origResourcesDict) - 1:
                    resourcesChanged = True
                for rrdo in resourceRevisionDOs:
                    if rrdo.id not in origResourcesDict:
                        resourcesChanged = True
            log.debug('_updateArtifact: newArtifactRevisionCreated[%s], resourcesChanged[%s]' % (newArtifactRevisionCreated, resourcesChanged))
            
            # Associate the Resource Revisions with the (new) ArtifactRevision
            if newArtifactRevisionCreated or resourcesChanged:
                newArtifactRevisionDO.resourceRevisions = []
                if newArtifactRevisionCreated and artifactDict.get('resources', None) is None:
                    newArtifactRevisionDO.resourceRevisions = filter(lambda rr: rr.resource.resourceTypeID != 1, resourceRevisionDOs)
                else:
                    ResourceDataManager.associateResources(meta.Session, memberDO, newArtifactRevisionDO, resourceRevisionDOs,
                                                           processContentTypeResource=False, toAppend=False)
                if contentTypeResourceRevisionDO:
                    newArtifactRevisionDO.resourceRevisions.append(contentTypeResourceRevisionDO)
        
        if artifactRevisionDict:
            if 'messageToUsers' in artifactRevisionDict:
                messageToUsers = artifactRevisionDict['messageToUsers']
                if messageToUsers is not None and messageToUsers != '':
                    if newArtifactRevisionDO.messageToUsers != messageToUsers:
                        newArtifactRevisionDO.messageToUsers = messageToUsers
            if 'comment' in artifactRevisionDict:
                newArtifactRevisionDO.comment = artifactRevisionDict['comment']
        meta.Session.flush()
        log.debug('_updateArtifact done')
        log.info('_updateArtifact: end for member [%s] ' % memberDO.id)
        return newArtifactRevisionDO, newArtifactRevisionCreated    

            
    def updateArtifactEntryFunction(self, memberID, artifactDict, artifactType=None, artifactHandle=None,
                                    artifactCreator=None, artifactDescendantIdentifier=None, artifactCache=None):
        """
            Entry function for updating/saving an artifact (book/chapter/lesson/section), covering all possible update scenarios
            such as creating/updating an independent Lesson, Book, Chapter(s) within a book, Lesson(s) within Chapter(Book)
            
            @param memberID: The logged in userID
            @param artifactDict: The json payload passed in the HTTP request body as input to be updated
            @param artifactType: Ex: book, chapter, lesson
            @param artifactHandle: The handle of the artifact
            @param artifactCreator: The login of the creator of the artifact. This is present as part of read urls as well.
                                    If the artifactCreator and logged in user are not same then a copy of the artifact will be made
            @param artifactDescendantIdentifier: The identifier of Lesson or Chapter within a book 
                                                Ex: 2.4 ---> 4th Lesson within 2nd Chapter of the book
                                                    2.0 ---> 2nd chapter within a book
        """
        log.debug('updateArtifactEntryFunction artifactdict [%s] ' % artifactDict)
        # All db queries/updates are done in a single transaction. If there's any issue, changes are rolled back.
        meta.Session.begin()
        self.requestTimeStamp = datetime.now() # TODO: use this timestamp for all updates within a session, confirm this
        try:
            # artifactDO will have the outermost artifact object. If a lesson within a chapter within a book is being updated,
            # then it will point to the book artifact.
            artifactDO = None
            memberDO = MemberDataManager.getMemberbyID(meta.Session, memberID)
            if memberDO is None:
                raise exceptions.ResourceNotFoundException(u"Member with memberID : [{memberID}] could not be found in the dataBase.".format(
                    memberID=memberID).encode('utf-8'))
            log.info('updateArtifactEntryFunction: begin for member[%s]' % memberDO.id)
            
            log.debug('artifactType [%s], artifactHandle [%s], artifactCreator [%s]' % (artifactType, artifactHandle, artifactCreator))
            
            # First find the artifact object to be updated (Update case)
            # See if artifact type, handle, creator were passed as part of the url
            if artifactType and artifactHandle and artifactCreator:
                artifactTypeDO = ArtifactDataModel.getArtifactTypeByName(meta.Session, artifactType)
                if not artifactTypeDO:
                    log.error('updateArtifactEntryFunction: Invalid type [%s]' % artifactType)
                    raise exceptions.UnknownArtifactTypeException('Invalid type [%s]' % artifactType.encode("utf-8"))
                artifactCreatorDO = MemberDataManager.getMemberbyLogin(meta.Session, artifactCreator)
                if artifactCreatorDO is None:
                    raise exceptions.ResourceNotFoundException(u"Member with Login : [{login}] could not be found in the dataBase.".format(
                        login=artifactCreator).encode('utf-8'))
                artifactDO = ArtifactDataModel.getArtifactDOFromTypeHandleCreator(meta.Session, artifactTypeDO.id, artifactHandle, artifactCreatorDO.id)
            else:
                # Find the artifact to be updated from the payload passed
                artifactDO = ArtifactDataModel.getArtifactDOFromArtifactDict(meta.Session, artifactDict)
            
            # forUpdate flag is used to identify whether a child has to updated. This is done to handle all update scenarios.
            # Ex: When we want to update chapters or Lessons within a book, we send the
            # minimal data of the children(in JSON) which shouldn't be updated alongwith the data of the children to be updated.
            # In this case, the flag helps us to identify those children to be updated.
            # The outermost artifact is by default to be updated.
            artifactDict['forUpdate'] = True
            
            # processedArtifactDict will have payload of the outermost artifact to be updated (for update lesson/chapter within a book)
            # Ex: When updating lesson(s), chapter(s) within a book, we construct the payload for the book
            processedArtifactDict = artifactDict
            if artifactDescendantIdentifier:
                rootAncestorArtifactDO, childArtifactRevisionDO = artifactDO, artifactDO.revisions[0]
                rootArtifactDict = {'revisionID': childArtifactRevisionDO.id, 'forUpdate': True}
                processedArtifactDict = rootArtifactDict
                log.debug('rootAncestorArtifactDO[%s]' % rootAncestorArtifactDO.id)
                for j in xrange(0, len(artifactDescendantIdentifier)):
                    childPosition = artifactDescendantIdentifier[j]
                    childrenList, origChildRevisionDOs = [], [revRel.child for revRel in childArtifactRevisionDO.children]
                    for i in xrange(0, len(origChildRevisionDOs)):
                        forUpdate = True if i == childPosition - 1 else False
                        if forUpdate:
                            childArtifactRevisionDO = origChildRevisionDOs[i]
                            log.debug('childArtifactRevisionDO [%s]' % childArtifactRevisionDO.id)
                        childrenList.append({'revisionID': origChildRevisionDOs[i].id, 'forUpdate': forUpdate})
                    processedArtifactDict['revisions'] = [{'children':childrenList}]
                    if childPosition == len(origChildRevisionDOs) + 1:
                        processedArtifactDict['revisions'][0]['children'].append(artifactDict)
                        break
                    elif childPosition <= len(origChildRevisionDOs):
                        if j == len(artifactDescendantIdentifier) - 1:
                            processedArtifactDict['revisions'][0]['children'][childPosition - 1] = artifactDict
                            # In case artifact details are also provided in the JSON, check that the artifact being referred to is same.
                            artifactDOFromDict = ArtifactDataModel.getArtifactDOFromArtifactDict(meta.Session, artifactDict)
                            if artifactDOFromDict and artifactDOFromDict.id != childArtifactRevisionDO.artifact.id:
                                error = "artifact found by descendant identifier [%s] and payload with id [%s] don't match" \
                                        % (childArtifactRevisionDO.artifact.id, artifactDOFromDict.id)
                                raise exceptions.InvalidArgumentException(error.encode('utf-8'))
                        processedArtifactDict = processedArtifactDict['revisions'][0]['children'][childPosition - 1]
                    else:
                        raise Exception('Invalid artifactDescendantIdentifier'.encode("utf-8"))
                processedArtifactDict = rootArtifactDict
            newArtifactRevisionDO, newArtifactRevisionCreated = self.updateArtifact(memberDO, artifactDO, None, processedArtifactDict, 
                                                                                    artifactCache=artifactCache, origSiblingsDict={})
            log.info('updateArtifactEntryFunction: newArtifactRevisionDO [%s], newArtifactRevisionCreated[%s] for member [%s]' % 
                                (newArtifactRevisionDO.id, newArtifactRevisionCreated, memberDO.id))
            
            # Log audit trail 
            try:
                auditType = 'update_artifact' if artifactDO else 'create_artifact'
                auditTrailDict = {
                        'auditType': auditType,
                        'artifactType': newArtifactRevisionDO.artifact.type.name,
                        'artifactID': newArtifactRevisionDO.artifact.id,
                        'memberID': memberDO.id,
                        'nonImpersonateMemberID': memberDO.id,
                        'creationTime': datetime.utcnow()
                }
                AuditTrail().insertTrail(collectionName='adminTracking', data=auditTrailDict)
            except Exception, e:
                log.error('_createArtifact: There was an issue logging the audit trail: %s' % e)
            
            artifactDict, rootArtifactRevisionDO = {}, newArtifactRevisionDO
            
            #
            #  SATISH TODO: handle it right way. Figure out the realm.
            #
            ck12Editor = None
            if ck12Editor is None:
                ck12Editor = config.get('ck12_editor', 'ck12editor')
            if memberDO.login == ck12Editor:
                artifactDict['realm'] = None
            else:
                name = memberDO.login
                if name is None or name == '':
                    name = memberDO.name.replace(' ', '')
                artifactDict['realm'] = 'user:%s' % name
                
            if artifactDescendantIdentifier:
                artifactDict['position'] = ".".join(map(str, artifactDescendantIdentifier))
                artifactDict['position'] = artifactDict['position'] + ".0" if len(artifactDescendantIdentifier) == 1 else artifactDict['position']
                artifactDict['context'] = {
                        'id':newArtifactRevisionDO.artifact.id ,
                        'latestRevision': newArtifactRevisionDO.revision,
                        'realm' : artifactDict['realm'],
                        'handle' : newArtifactRevisionDO.artifact.handle,
                        'title' : newArtifactRevisionDO.artifact.name,
                        'artifactType' : newArtifactRevisionDO.artifact.type.name,
                        }
                newArtifactRevisionDO, parentArtifactRevisionDOList = self._generateArtifactDescendantRevisionDO(
                        newArtifactRevisionDO, artifactDescendantIdentifier)
            
            artifactDict['type'] = {'name':newArtifactRevisionDO.artifact.type.name, 'id':newArtifactRevisionDO.artifact.type.id}
            artifactDict['artifactID'] = newArtifactRevisionDO.artifact.id
            artifactDict['handle'] = newArtifactRevisionDO.artifact.handle
            artifactDict['revision'] = newArtifactRevisionDO.revision
	
            artifactDict['artifactRevisionID'] = newArtifactRevisionDO.id
            artifactDict['creatorID'] = memberDO.id
            artifactDict['isModality'] = True if newArtifactRevisionDO.artifact.type.modality else False
            artifactDict['encodedID'] = newArtifactRevisionDO.artifact.encodedID
            
            # Infinite Scrolling on ui if this is not sent
            coverImage = newArtifactRevisionDO.getCoverImageUri()
            if coverImage:
                artifactDict['coverImage'] = coverImage
            
            # TODO: pseudo domain case not working
            domainTerm, level = None, None
            for bt in newArtifactRevisionDO.artifact.browseTerms:
                if bt.type.name == 'level':
                    level = bt.name.lower()

            if level:
                artifactDict['level'] = level
            
            # getting domain/pseudo-domain from RelatedArtifacts table and not from ArtifactHasBrowseTerms table
            relatedArtifactDOs = ArtifactDataModel.getRelatedArtifactsForArtifact(meta.Session, newArtifactRevisionDO.artifact.id)
            for rado in relatedArtifactDOs:
                if rado.domainID and rado.domainID > 0:
                    domainTerm = self._getBrowseTermByID(rado.domainID)
                    if domainTerm:
                        break
            
            if domainTerm:
                from flx.model import migrated_concepts as mc 
                supercedingConcept = mc._getSupercedingConcept(meta.Session, encodedID=domainTerm.encodedID)
                domainTerm = supercedingConcept if supercedingConcept else domainTerm
                artifactDict['domain'] = newArtifactRevisionDO.artifact._getDomainTermDict(domainTerm)

            meta.Session.flush()
            meta.Session.commit()

            taskId = helpers.reindexArtifacts(artifactIds=[rootArtifactRevisionDO.artifact.id], user=memberDO.id, recursive=True)
            log.info("Reindex task id: [%s]" % taskId)

            #artifactDict = self.generateArtifactDict(artifactDescendantDO, artifactDescendantRevisionDO, includeAuthors=True, includeResources=True, includeAllResources=True, includeEmbeddedObjects=False, includeContent=True, includeProcessedContent=True, includeRevisionStandards=True, includeRevisionStandardGrades=True, includeGrandChildren=False, includeBrowseTerms=True, includeBrowseTermStandards=True, includeBrowseTermStandardGrades=False, includeTagTerms=True, includeSearchTerms=True, includeVocabularies=True)
            log.info('updateArtifactEntryFunction: end for member [%s]' % memberDO.id)
            return artifactDict
        except Exception, e:
            meta.Session.rollback()
            # all exceptions are logged from controller level
            #log.error("[%s]" % str(e), exc_info=e)
            raise
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()
