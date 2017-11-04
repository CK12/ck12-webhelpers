'''
This calls and manages 2.0 APIs
'''
import urllib2, urllib, jsonlib, json
from multiform import MultiPartForm
from pylons.i18n.translation import _ 
from multipartpost import MultipartPostHandler
from flx.model import api, model as m
from flx.lib.helpers import reindexArtifacts, getLoginCookie
import flx.controllers.eohelper as eohelper
from flx.controllers.resourceHelper import ResourceHelper
from flx.controllers.common import ArtifactCache
import logging
import os, time
from datetime import datetime
import settings
import re
import glob
import random
from string import atoi
from flx.lib import helpers as h
from BeautifulSoup import BeautifulStoneSoup

#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)
#logging.basicConfig(filename=settings.LOG_FILENAME,level=settings.LOG_LEVEL,)

FLX_PREFIX = settings.FLX_PREFIX
PREFIX = "flx"
GENERIC_CONCEPT_COVER = settings.DEFAULT_CONCEPT_COVER
GENERIC_LESSON_COVER = settings.DEFAULT_LESSON_COVER
GENERIC_CHAPTER_COVER = settings.DEFAULT_CHAPTER_COVER
GENERIC_FLEXBOOK_COVER = settings.DEFAULT_BOOK_COVER
IMAGE_HANDLER_URL = FLX_PREFIX +'/'+ PREFIX +'/create/resource'


class APIManager:

    def __init__(self, config=None):
        self.log = logging.getLogger(__name__)
        #self.log.setLevel(log_level)
        #self.log.info("Initializing WikiImporter object")
        self.buffer = ''
        self.toCache = settings.GENERATE_CACHE
        self.config = config
        self.rh = ResourceHelper()

    def setLogger(self, logger):
        self.log = logger

    def get_member_roles_dict(self):
        memberRoles = api.getMemberRoles()
        memberRolesDict = {}
        for memberRole in memberRoles:
            memberRolesDict[memberRole.name.lower()] = memberRole.id
        return memberRolesDict

    def save_artifact_internal(self, artifact_info, user_id, artifact_type, is_metadata_mode=False, toCache=True):
        """
            Uses the internal apis to create or update an artifact.
                artifact_info: a dictionary containing all details about an artifact
                user_id: the owner of the artifact
                artifact_type: the type name of the artifact
        """
        kwargs = {}
        kwargs['typeName'] = artifact_type
        artifactType = api.getArtifactTypeByName(typeName=artifact_type)

        coverImagesDirectory = settings.BOOK_COVER_IMAGES_DIR
        coverImages = glob.glob(coverImagesDirectory + '*.jpg')
        downloadDirectory = settings.CUSTOM_COVER_WORKDIR
        if not os.path.exists(downloadDirectory):
            os.mkdir(downloadDirectory)
        randomNumber = random.randint(0, len(coverImages)-1)
        GENERIC_FLEXBOOK_COVER = coverImages[randomNumber]
        if artifact_type.lower() == "concept":
            generic_cover = GENERIC_CONCEPT_COVER
        elif artifact_type.lower() in [ "lesson", "section", "rwa"]:
            generic_cover = GENERIC_LESSON_COVER
        elif artifact_type.lower() == "chapter":
            generic_cover = GENERIC_CHAPTER_COVER
            kwargs['bookTitle'] = artifact_info.get('bookTitle')
        elif artifact_type.lower() in ["book", "tebook", "workbook", "studyguide", "labkit", "quizbook"]:
            generic_cover = GENERIC_FLEXBOOK_COVER

        kwargs['creator'] = user_id
        kwargs['name'] = artifact_info.get('title')
        kwargs['description'] = artifact_info.get('desc')
        kwargs['handle'] = artifact_info.get('handle')
        creationTime = artifact_info.get('created')
        if creationTime:
            kwargs['creationTime'] = datetime.strptime(creationTime[:-2], '%Y-%m-%d %H:%M:%S')
        if not kwargs['handle']:
            kwargs['handle'] = m.title2Handle(kwargs['name'])
        else:
            kwargs['handle'] = m.title2Handle(kwargs['handle'])
        if artifact_info.get('licenseName'):
            kwargs['licenseName'] = artifact_info.get('licenseName')
        if artifact_info.get('encoded_id'):
            kwargs['encodedID'] = artifact_info.get('encoded_id')
            if kwargs['typeName'] == 'chapter':
                try:
                    seq = int(kwargs['encodedID'].split('.')[-1])
                    if seq != artifact_info.get('seq'):
                        self.log.warn("The actual sequence number [%d] does not match the EID sequence [%d] for %s" % (artifact_info.get('seq'), seq, kwargs['name'])) 
                except:
                    pass
        artifact = None
        ## Check if artifact exists
        if kwargs.get('handle'):
            maxAttempts = 999
            loopCnt = 0
            while True:
                loopCnt += 1
                if loopCnt > maxAttempts:
                    self.log.error("Attempts to find a unique name/handle exceeded max limit: %d" % loopCnt)
                    break
                if artifact_type == 'chapter':
                    handle = m.title2Handle('%s%s%s' % (kwargs['handle'], m.getChapterSeparator(), kwargs.get('bookTitle', '')))
                else:
                    handle = kwargs['handle']
                artifact = api.getArtifactByHandle(handle=handle, typeID=artifactType.id, creatorID=user_id)
                if not artifact and kwargs.get('encodedID'):
                    artifactByEID = api.getArtifactByEncodedID(encodedID=kwargs['encodedID'])
                    if artifactByEID:
                        self.log.warn("Found existing artifact. Encoded ID matched: %s but not handle: %s" % (kwargs['encodedID'], kwargs['handle']))
                        artifact = artifactByEID
                if not artifact:
                    break
                elif artifact_type != 'chapter' and artifact_type != 'book':
                    break
                elif kwargs.get('encodedID'):
                    ## If encodedID is specified it is the same artifact - we simply update it
                    ## Should not happen for 1.x migrated books - bug 9401
                    self.log.info("Encoded ID matched: updating artifact: %s" % str(artifact.id))
                    break
                else:
                    #check if the children are same
                    matched_art_childlist = artifact.getChildren()
                    actual_art_childlist = artifact_info.get('children_ids')
                    if actual_art_childlist:
                        actual_art_childlist = actual_art_childlist.values()
                    if not actual_art_childlist:
                        actual_art_xhtml = artifact_info.get('xhtml')
                        matched_art_xhtml = h.transform_to_xhtml(artifact.getXhtml())
                        if not self.areContentIdentical(actual_art_xhtml, matched_art_xhtml): 
                            current_name_list = kwargs['name'].split(' ')
                            end_num = current_name_list.pop()
                            if current_name_list and current_name_list[len(current_name_list) - 1] == '--':
                                kwargs['name'] = " ".join(current_name_list) + " %s" % (atoi(end_num)+1)
                            else:
                                kwargs['name'] = kwargs['name'] + " -- 1"
                            kwargs['handle'] = m.title2Handle(kwargs['name']) 
                            artifact_info['title'] = kwargs['name']   
                            artifact_info['handle'] = kwargs['handle']   
                            artifact = None
                            continue
                        else:
                            break
                    if len(matched_art_childlist) == 0:
                        break
                    else:
                        matched_art_childlist = [each_child.id for each_child in matched_art_childlist]
                        matched_art_childlist = [atoi(str(x)) for x in matched_art_childlist]   
                        actual_art_childlist = [atoi(str(x)) for x in actual_art_childlist]
                        actual_art_childlist.sort()
                        matched_art_childlist.sort()
                        if actual_art_childlist == matched_art_childlist:
                            break
                        else:
                            current_name_list = kwargs['name'].split(' ')
                            end_num = current_name_list.pop()
                            if current_name_list and current_name_list[len(current_name_list) - 1] == '--':
                                kwargs['name'] = " ".join(current_name_list) + " %s" % (atoi(end_num)+1)
                            else:
                                kwargs['name'] = kwargs['name'] + " -- 1"
                            kwargs['handle'] = m.title2Handle(kwargs['name']) 
                            artifact_info['title'] = kwargs['name']   
                            artifact_info['handle'] = kwargs['handle']   
                            artifact = None
        kwargs['authors'] = []
        author_details_dict = {}
        if artifact_info.get('author_details'):
            self.log.info("Raw author data: %s" % artifact_info['author_details'])
            ## get unique list
            authorDict = {}
            for x in artifact_info['author_details']:
                key = '%s-%s' % (x['type'].strip().lower(), x['readable_name'])
                authorDict[key] = x
            kwargs['authors'] = [ (x['readable_name'],
                                   api.getMemberRoleIDByName(name=x['type'].strip().lower())) for x in authorDict.values() ]
            self.log.info("Authors: %s" % kwargs['authors'])
            author_details_dict = artifact_info['author_details']
            artifact_info['updated_author_details'] = author_details_dict
        artifact_info['author_details'] = kwargs['authors']
        kwargs['resources'] = []
        language = api.getLanguageByName(name='English')
        contentType = api.getResourceTypeByName(name='contents')
        contentDict = {
            'resourceType': contentType,
            'name': kwargs['name'],
            'description': kwargs['description'],
            'isExternal': False,
            'uriOnly': False,
            'languageID': language.id,
        }
        contentDict['contents'] = artifact_info.get('xhtml', '')
        kwargs['resources'].append(contentDict)

        children_ids = artifact_info.get('children_ids')
        if children_ids:
            kwargs['children'] = []
            for num in range(0,len(children_ids)):
                ca = api.getArtifactByID(id=children_ids[num+1])
                if ca:
                    kwargs['children'].append({'artifact': ca})


        self.log.info("Children ids: %s" % artifact_info.get('children_ids'))
        self.log.info("Authors: %s" % str(kwargs.get('authors')))
        makePublic = False
        try:
            if artifact:
                makePublic = artifact.revisions[0].publishTime != None
                self.log.info("Artifact exists. Updating: [%s] %s %s with %s" % (kwargs['typeName'], artifact.id, artifact.getTitle(), kwargs['name']))
                if not is_metadata_mode:
                    artifact = self.update_artifact_internal(artifact, artifact_info, user_id)
            else:
                makePublic = True
                self.log.info("Artifact does not exist. [%s] Creating: %s %s" % (artifact_type, kwargs['name'], kwargs['typeName']))
                self.log.info('kwargs for createArtifact: %s' %(kwargs))
                artifact = api.createArtifact(**kwargs)
                api.deleteArtifactAttributersByArtifactID(artifactID=artifact.id)
                authorDict = {}
                memberRolesDict = self.get_member_roles_dict()
                if author_details_dict:
                    for x in author_details_dict:
                        authorDict = x
                        roleID = memberRolesDict[x['type'].strip().lower()]
                        authorDict['artifactID'] = artifact.id
                        authorDict['roleID'] = roleID
                        authorDict['deleteIfExists'] = False
                        self.createArtifactAttributer(**authorDict)

        except Exception, e:
            self.log.error("Error saving artifact: %s" % str(e), exc_info=e)
            raise e

        if not artifact:
            artifact_info['id'] = None
            artifact_rev_id = None
            return artifact_info['id'], artifact_rev_id
        
        artifact_info['id'] = artifact.id
        artifact_rev_id = artifact.revisions[0].id
        ck12Editor = self.config.get('ck12_editor')
        if not ck12Editor:
            ck12Editor = 'ck12editor'
        if artifact.creator.login.lower() == ck12Editor.lower() and makePublic:
            ## Auto-publish
            api.publishArtifactRevision(artifactRevision=artifact.revisions[0], recursive=False)
            self.log.info("Published artifact revision: %d" % artifact_rev_id)
        else:
            self.log.info("Did not publish artifact revision, the creator login is: %s and makePublic: %s" % (artifact.creator.login, str(makePublic)))

        if artifact_type.lower() == "lesson" or artifact_type.lower() == "concept" or artifact_type.lower() == "section":
            if artifact_info['cover_image'] != None:
                self.log.debug("Cover image for: "+ artifact_info['title'] +", is: "+ str(artifact_info['cover_image']));
                cover_image_url,resource_id = self.create_resource_int(artifact_info['cover_image'], user_id, "cover page",artifact_info['title'])
                #cover_image_url,resource_id = self.create_resource(artifact_info['cover_image'], user_id, "cover page",artifact_info['title'])
                if not cover_image_url == artifact_info['cover_image']:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])
            else:
                cover_image_url,resource_id = self.create_resource_int(generic_cover, user_id, resource_type="cover page")
                #cover_image_url,resource_id = self.create_resource(generic_cover, user_id, resource_type="cover page")
                if not cover_image_url == generic_cover:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])
        else:
            if artifact_info['cover_image'] == None:
                self.createCustomCover(user_id, artifact, generic_cover)
            else:
                try:
                    if artifact_info.get('cover_image_url') and artifact_info.get('cover_image_url').find('thumb.jpg') >= 0:
                        parsed_wiki_url = urllib2.urlparse.urlparse(artifact_info['cover_image_url'])
                        wiki_url = "%s://%s/"%(parsed_wiki_url.scheme, parsed_wiki_url.netloc)
                        highResCoverImageName = artifact_info['cover_image_url'].split('/')[-1].replace('_thumb', '')
                        if highResCoverImageName.startswith('File-3A'):
                            highResCoverImageName = highResCoverImageName.replace('File-3A', '')

                        #Step 1: Download the full resolution image from wiki
                        wiki_fileinfo_url = wiki_url + 'wiki/index.php/File:%s' %(highResCoverImageName)
                        downloadDirectory = settings.CUSTOM_COVER_WORKDIR
                        if not os.path.exists(downloadDirectory):
                            os.mkdir(downloadDirectory)
                        req = urllib2.Request(wiki_fileinfo_url, headers={'User-Agent' : "CK12 Browser"})
                        f = urllib2.urlopen(req)
                        if f.code == 200:
                            content = f.read()
                            reObj = re.compile('<a href="(.*?)" class="internal" title="(.*?)">Full resolution</a>')
                            downloadUri = reObj.findall(content)[0][0]
                            self.log.info('\t Downloading: %s into %s' %(wiki_url + downloadUri, downloadDirectory))
                            urllib.urlretrieve(wiki_url + downloadUri, downloadDirectory + '/' + highResCoverImageName)
                            artifact_info['cover_image'] = downloadDirectory + '/' + highResCoverImageName
                        else:
                            self.log.info('\t Full resolution cover image does not exist. Skipping...')
                except Exception as e:
                    self.log.error('\t Exception while importing high res image: %s'%e.__str__())
                    
                self.log.info("Cover image for: "+ artifact_info['title'] +", is: "+ str(artifact_info['cover_image']));
                cover_image_url,resource_id = self.create_resource_int(artifact_info['cover_image'], user_id, "cover page",artifact_info['title'])
                #cover_image_url,resource_id = self.create_resource(artifact_info['cover_image'], user_id, "cover page",artifact_info['title'])
                self.log.info("Cover image resource url: %s, id: %s" % (cover_image_url, resource_id))
                if not cover_image_url == artifact_info['cover_image']:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])


        resource_id = self.save_video_snippet(user_id, artifact_info)
        ## The resource type now changed from video to cover video
        xhtml = artifact_info.get('xhtml')
        if resource_id and xhtml and not is_metadata_mode:
            perma = self.get_resource_perma(resourceID=resource_id)
            self.log.debug("New perma: %s" % perma)
            oldPerma = perma.replace(urllib.quote('/cover video/'), '/video/')
            self.log.debug("Old perma: %s" % oldPerma)
            xhtml = h.safe_decode(h.safe_encode(xhtml).replace(h.safe_encode(oldPerma), h.safe_encode(perma)))
            self.log.info("xhtml: %s, artifact_info['xhtml']: %s" % (type(xhtml).__name__, type(artifact_info.get('xhtml')).__name__))
            if xhtml != artifact_info.get('xhtml'):
                self.log.debug("Replaced cover video url")
            artifact_info['xhtml'] = xhtml
            artifact = self.update_artifact_internal(artifact, artifact_info, user_id)

        ## Start async tasks to rebuild math cache
        try:
            if self.toCache and toCache and not is_metadata_mode:
                pass
                #rebuildMathCache(artifactID=artifact_info['id'], userID=user_id)
            self.log.info("Scheduled rebuild of math cache: %s" % artifact_info['id'])
        except Exception, e:
            self.log.error("Error generating math cache: %s" % str(e))
        return artifact_info["id"], artifact_rev_id

    def createArtifactAttributer(self, **kwargs):
        """
            Tries to safely create ArtifactAttributer entry - tries 3 times
            before giving up on Lock wait timeout errors.
        """
    	attempts = 0
    	while attempts < 3:
            attempts += 1
            try:
                api.createArtifactAttributer(**kwargs)
                break
            except Exception, e:
                self.log.info("[Attempt: %d] Error inserting into ArtifactAttributer: %s" % (attempts, str(e)), exc_info=e) 
                if attempts < 3 and 'lock wait timeout exceeded' in str(e).lower():
                    time.sleep(5)
                else:
                    raise e

    def areContentIdentical(self, content1, content2):
        isIdentical = False
        try:
            actual_content_re = re.compile('<html.*?<body>(.*?)<div class="x-ck12-data-section">', re.DOTALL)
            actual_content1 = actual_content_re.findall(content1)[0]
            actual_content2 = actual_content_re.findall(content2)[0]
            new_content_re = re.compile('<div class="x-ck12-data">(.*)</div>', re.DOTALL)
            if actual_content1.__contains__('<div class="x-ck12-data">'):
                actual_content1 = new_content_re.findall(actual_content1)[0]
            if actual_content2.__contains__('<div class="x-ck12-data">'):
                actual_content2 = new_content_re.findall(actual_content2)[0]
            replace_char_list = [' ','\n','<p>','</p>','=""']
            actual_content1 = actual_content1.split('</body>')[0]
            actual_content2 = actual_content2.split('</body>')[0]
            for each_replace_char in replace_char_list:
                actual_content1 = actual_content1.replace(each_replace_char,'')
                actual_content2 = actual_content2.replace(each_replace_char,'')
            actual_content1 = re.sub('hash%3D.*?"','',actual_content1)
            actual_content2 = re.sub('hash%3D.*?"','',actual_content2)
            actual_content1 = re.sub('name=".*?"','',actual_content1)
            actual_content2 = re.sub('name=".*?"','',actual_content2)
            if actual_content1 == actual_content2:
                isIdentical = True
        except Exception as e:
            self.log.error('Exception from areContentIdentical: %s' % e.__str__(), exc_info=e)
            isIdentical = False
        return isIdentical

    def reindex_artifacts(self, artifact_ids, user_id):
        ## Start async tasks to rebuild math cache
        try:
            reindexArtifacts(artifactIds=artifact_ids, user=user_id)
            self.log.info("Scheduled reindex of artifacts: %s" % artifact_ids)
        except Exception, e:
            self.log.error("Error scheduling reindex artifacts: %s" % str(e))

    def update_artifact_internal(self, artifact, artifact_info, user_id):
        """
            Update existing artifact
        """
        kwargs = {}
        xhtmlID, uri = artifact.getContentInfo()
        if xhtmlID and uri:
            ## If this content resource did not exist before, 
            ## we cannot add it during update - so we skip it.
            language = api.getLanguageByName(name='English')
            contentType = api.getResourceTypeByName(name='contents')
            contentDict = {
                'resourceType': contentType,
                'name': artifact_info.get('title'),
                'description': artifact_info.get('desc'),
                'isExternal': False,
                'uriOnly': False,
                'languageID': language.id,
            }
            contentDict['contents'] = artifact_info.get('xhtml')
            contentDict['id'] = xhtmlID
            kwargs['resources'] = [ contentDict, ]
        kwargs['artifact'] = artifact
        kwargs['member'] = api.getMemberByID(id=int(user_id))
        kwargs['name'] = artifact_info.get('title')
        if artifact_info.get('handle'):
            kwargs['handle'] = artifact_info.get('handle')
        if artifact_info.get('encoded_id'):
            kwargs['encodedID'] = artifact_info.get('encoded_id')
        kwargs['description'] = artifact_info.get('desc')
        kwargs['authors'] = artifact_info.get('author_details')
        if artifact.type.name == 'chapter':
            kwargs['bookTitle'] = artifact_info.get('bookTitle')

        children_ids = artifact_info.get('children_rev_ids')
        if children_ids:
            kwargs['children'] = []
            for num in range(0, len(children_ids)):
                if children_ids[num+1] != artifact.revisions[0].id:
                    kwargs['children'].append(children_ids[num+1])
            self.log.info("Children of artifact: %s" % kwargs['children'])
        self.log.info("update_artifact_internal: Updating :%s" % kwargs)
        
        kwargs['cache'] = ArtifactCache()
        artifact = api.updateArtifact(**kwargs)
        api.deleteArtifactAttributersByArtifactID(artifactID=artifact.id)
        authorDict = {}
        memberRolesDict = self.get_member_roles_dict()
        if artifact_info.get('updated_author_details'):
            for x in artifact_info['updated_author_details']:
                authorDict = x
                roleID = memberRolesDict[x['type'].strip().lower()]
                authorDict['artifactID'] = artifact.id
                authorDict['roleID'] = roleID
                authorDict['deleteIfExists'] = False
                self.createArtifactAttributer(**authorDict)

        if artifact:
            artifact_cache = ArtifactCache()
            api.invalidateArtifact(artifact_cache, artifact)
        self.log.info("update_artifact_internal: Updated: %s" % artifact.id)
        return artifact

    def is_domain_present(self, domain_name):
        is_present = False
        try:
            domain_term = api.getDomainTermByEncodedID(domain_name)
            if not domain_term:
                domain_term = api.getDomainTermByName(domain_name)
            if domain_term:
                is_present = True
        except Exception as e:
            is_present = False
        return is_present

    def is_duplicate_title(self, user_id, artifact_info, artifact_type):
        artifact_title = artifact_info.get('title','')
        encoded_id = artifact_info.get('encoded_id',None)
        artifact_handle = m.title2Handle(artifact_title)
        artifactType = api.getArtifactTypeByName(typeName=artifact_type)
        artifact = None
        if artifact_handle:
            artifact = api.getArtifactByHandle(handle=artifact_handle, typeID=artifactType.id, creatorID=user_id)
            if not artifact and encoded_id:
                artifactByEID = api.getArtifactByEncodedID(encodedID=encoded_id)
                if artifactByEID:
                    artifact = artifactByEID

        if artifact:
            return True
        else:
            return False


    def is_duplicate_artifact(self, user_id, artifact_info, artifact_type):
        is_duplicate = False
        artifact_title = artifact_info.get('title','')
        encoded_id = artifact_info.get('encoded_id',None)
        artifact_handle = m.title2Handle(artifact_title)
        current_artifact_parent_title = artifact_info['parent_title']
        current_artifact_parent_typeID = api.getArtifactTypeByName(typeName=artifact_info['parent_type']).id
        artifactType = api.getArtifactTypeByName(typeName=artifact_type)
        artifact = None
        if artifact_handle:
            artifact = api.getArtifactByHandle(handle=artifact_handle, typeID=artifactType.id, creatorID=user_id)
            if not artifact and encoded_id:
                artifactByEID = api.getArtifactByEncodedID(encodedID=encoded_id)
                if artifactByEID:
                    artifact = artifactByEID

        if artifact:
            artifact_parents = api.getArtifactParents(artifactID=artifact.id)
            for each_parent in artifact_parents:
                each_artifact = api.getArtifactByID(id=each_parent['parentID'])
                if current_artifact_parent_title.lower().strip() == each_artifact.name.lower().strip() and current_artifact_parent_typeID == each_parent['parentTypeID']:
                    is_duplicate = True
                    break
            return is_duplicate
        else:
            return is_duplicate

    def save_artifact(self, artifact_info, user_id, artifact_type):
        """
            Saves (creates or updates) an artifact using the HTTP APIs
        """

        if artifact_type.lower() == "concept":
            generic_cover = GENERIC_CONCEPT_COVER
        elif artifact_type.lower() == "lesson":
            generic_cover = GENERIC_CHAPTER_COVER
        elif artifact_type.lower() == "chapter":
            generic_cover = GENERIC_CHAPTER_COVER
        elif artifact_type.lower() == "book":
            generic_cover = GENERIC_FLEXBOOK_COVER

        form = MultiPartForm()
        form.add_field("cover image description","")
        form.add_field("cover image name","")
        form.add_field("cover image uri","")
        try:
            form.add_field("xhtml",artifact_info['xhtml'])
        except Exception as e:
            form.add_field("xhtml","")
        form.add_field("xhtml path","")
        try:
            form.add_field("summary",artifact_info['desc'])
        except Exception as e:
            form.add_field("summary",'')
  
        if not self.toCache:
            form.add_field("reindex", 'False')
        else:
            try:
                form.add_field("reindex",artifact_info['reindex'])
            except Exception as e:
                form.add_field("reindex",'False')

        if not self.toCache:
            form.add_field("cache math", 'False')
        else:
            try:
                form.add_field("cache math",artifact_info['cache_math'])
            except Exception as e:
                form.add_field("cache math",'False')

        try:
            form.add_field("encodedID",artifact_info['encoded_id'])
        except Exception as e:
            form.add_field("encodedID",'')

        artifact_title = ''
        try:
            form.add_field("title",artifact_info['title'])
            artifact_title = artifact_info['title']
        except Exception as e:
            form.add_field("title",'')
        form.add_field("type",artifact_type)
        form.add_field("submit","OK")

        try:
            if artifact_info['author_details'] != None:
                form.add_field("authors",artifact_info['author_details']['readable_name'])
        except Exception as e:
            self.log.error('Error adding authors for %s %s' %(artifact_type, artifact_title))
        children_ids = artifact_info['children_ids']

        if len(children_ids) > 0:
            for num in range(0,len(children_ids)):
                form.add_field("children",str(children_ids[num+1]))

        body = str(form)
        request = urllib2.Request('%s/%s/create/%s'%(FLX_PREFIX, PREFIX, artifact_type))
        request.add_header('Content-type', form.get_content_type())
        request.add_header('Cookie', 'userID=%s'% str(user_id))
        request.add_header('Content-length', len(body))
        request.add_data(body)
        save_artifact_req = urllib2.urlopen(request)
        save_artifact_response = save_artifact_req.read()
        save_artifact_response = jsonlib.read(save_artifact_response)
        self.log.info("Response from handler: "+ str(save_artifact_response))
        try:
            artifact_info['id'] = save_artifact_response['response'][artifact_type]['id']
        except Exception as e:
            artifact_info['id'] = None
            return artifact_info['id']


        if artifact_type.lower() == "lesson" or artifact_type.lower() == "concept":
            if artifact_info['cover_image'] != None:
                self.log.debug("Cover image for: "+ artifact_info['title'] +", is: "+ str(artifact_info['cover_image']));
                cover_image_url,resource_id = self.create_resource_int(artifact_info['cover_image'], user_id, "cover page",artifact_info['title'])
                #cover_image_url,resource_id = self.create_resource(artifact_info['cover_image'], user_id, "cover page",artifact_info['title'])
                if not cover_image_url == artifact_info['cover_image']:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])
        else:
            if artifact_info['cover_image'] == None:
                cover_image_url,resource_id = self.create_resource_int(generic_cover, user_id, resource_type="cover page")
                #cover_image_url,resource_id = self.create_resource(generic_cover, user_id, resource_type="cover page")
                if not cover_image_url == generic_cover:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])

        if str(save_artifact_response['responseHeader']['status']) == '1038':
            self.update_artifact(artifact_info, user_id)

        resource_id = self.save_video_snippet(user_id, artifact_info)
        #self.saveAllVideoSnippets(user_id, artifact_info)

        return artifact_info["id"]

    def save_video_snippet(self, user_id, artifact_info):
        resource_id = None
        try:
            video_snippet = artifact_info.get('first_video_snippet')
            if video_snippet is not None:
                video_url = artifact_info['first_video_url']
                if artifact_info.get('first_video_resid'):
                    self.log.info("Updating resource: %s to be cover video" % artifact_info.get('first_video_resid'))
                    resource_uri, resource_id = self.update_resource_int(artifact_info.get('first_video_resid'), user_id, 'cover video', video_url)
                else:
                    self.log.info("Creating cover video resource for: %s, url: %s" % (artifact_info['id'], video_url))
                    resource_uri, resource_id = self.create_resource_int(video_url, user_id, 'cover video', video_url, video_snippet)
                    #resource_uri, resource_id = self.create_resource(video_url, user_id, 'cover video', video_url, video_snippet)
                self.log.info('Video Resource ID: %s'% resource_id.__str__())
                if resource_uri is not None:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])
            else:
                self.log.info("Could not find first_video_snippet for artifact: %s" % artifact_info['id'])
            return resource_id
        except Exception as e:
            self.log.error('Exception: save video snippet: %s'% e.__str__())

    def update_artifact(self, artifact_info, user_id):
        """
            Updates an existing artifact using HTTP API
                - no longer used (replaced by save_artifact_internal()) - Nimish
        """
        form = MultiPartForm()
        form.add_field("title",artifact_info['title'])
        form.add_field("summary",artifact_info['desc'])
        form.add_field("xhtml", artifact_info['xhtml'])
        children_ids = artifact_info['children_ids']

        if len(children_ids) > 0:
            childrenID_str = "["
            for num in range(0,len(children_ids)):
                childrenID_str = childrenID_str + str(children_ids[num+1]) +", "
            
            childrenID_str = childrenID_str[:-2] +"]"
            form.add_field("children",childrenID_str)
        body = str(form)
        try:
            request = urllib2.Request('%s/%s/update/%s'%(FLX_PREFIX, PREFIX, str(artifact_info['id'])))
            self.log.info('UPDATE URL: %s/%s/update/%s'%(FLX_PREFIX, PREFIX, str(artifact_info['id'])))
            request.add_header('Content-type', form.get_content_type())
            request.add_header('Cookie', 'userID=%s'% str(user_id))
            request.add_header('Content-length', len(body))
            request.add_data(body)
            update_artifact_req = urllib2.urlopen(request)
            update_artifact_response = update_artifact_req.read()
            update_artifact_response = jsonlib.read(update_artifact_response)
            self.log.info("Response from handler: "+ str(update_artifact_response))
            try:
                return update_artifact_response["response"][artifact_info['artifactType']]["id"]
            except Exception, ae:
                return update_artifact_response["response"]['artifact']["id"]
        except Exception as e:
            self.log.info('EXception: update artifact: %s'% e.__str__())
            

    def bulk_upload_browse_terms(self, user_id, browse_term_csv_path, toCache=True, toWait=False):
        try:
            self.log.info("Uploading browseTerms: %s" % browse_term_csv_path)
            browse_term_bulk_upload_api = FLX_PREFIX +'/'+PREFIX+'/load/browseTerms'
            opener = urllib2.build_opener(MultipartPostHandler)

            params = {"file" : open(browse_term_csv_path, "r") }
            params['submit'] = "Upload"
            params['waitFor'] = toWait
            params['toReindex'] = str(toCache)
            
            urllib2.install_opener(opener)
            req = urllib2.Request(browse_term_bulk_upload_api, params)
            req.add_header('Cookie', getLoginCookie(user_id))
            
            #self.log.info("Params: "+ str(req.headers))
            res = urllib2.urlopen(req)
            resource_upload_response = res.read()
            resource_upload_response = jsonlib.read(resource_upload_response)
            print "Response from handler: "+  str(resource_upload_response)

            try:
                status = resource_upload_response["responseHeader"]["status"]
                if status != 0:
                    self.log.error('Browse terms not uploaded successfully')
                    self.log.error('reason: '+resource_upload_response['response']['message'] )
            except Exception as e:
                self.log.info("Error: "+ str(e))
        
        except Exception as e:
            self.log.error('Error when bulk uploading browse terms: %s' % str(e), exc_info=e)


    def create_resource(self, image_path, user_id, resource_type='image', resource_name='image', resource_desc='image'):
        self.log.info("post image payload: "+ image_path)
        self.log.info("image handler url: "+ IMAGE_HANDLER_URL)
        internal_url = ''
        try:
            opener = urllib2.build_opener(MultipartPostHandler)
            if image_path.startswith('http'):
                params = {"resourceUri" : image_path }
            else:
                params = {"resourcePath" : open(image_path, "rb") }
            params['resourceType'] = resource_type
            params['resourceName'] = resource_name
            params['resourceDesc'] = resource_desc
            params['submit'] = "Save"
            
            urllib2.install_opener(opener)
            req = urllib2.Request(IMAGE_HANDLER_URL, params)
            req.add_header('Cookie', 'userID=%s'% str(user_id))
            
            self.log.info("Params: "+ str(params))
            res = urllib2.urlopen(req)
            resource_upload_response = res.read()
            resource_upload_response = jsonlib.read(resource_upload_response)
            print "Response from handler: "+  str(resource_upload_response)
            resourceID = None
            resourceUri = image_path

            try:
                resourceID = resource_upload_response["response"]["resourceID"]
                resourceUri = resource_upload_response["response"]["resourceUri"]
            except Exception as e:
                self.log.error("Error: "+ str(e))
                resourceID = None
            if resourceID == None:
                return (image_path, None)
            else:
                return (resourceUri, resourceID)
        except Exception as e:
            self.log.error("Error: "+ str(e))
            return (image_path,None)

    def create_resource_int(self, image_path, user_id, resource_type='image',
                            resource_name='image', resource_desc='image',
                            authors=None, license=None):
        self.log.info("post image payload interal: %s" % image_path)
        internal_url = ''
        resourceDict = {}
        try:
            path, name = os.path.split(image_path)
            timestamp = datetime.now().strftime("%Y%m%d%s%f")
            if name:
                name = "%s-%s%s"%(os.path.splitext(name)[0],timestamp,os.path.splitext(name)[1])
            imageName = image_path
            if image_path.lower().startswith('http'):
                resourceDict['uri'] = image_path
                resourceDict['uriOnly'] = True
                resourceDict['isExternal'] = True 
            else:
                if not os.path.exists(image_path):
                    image_path = urllib2.unquote(image_path)
                if not os.path.exists(image_path):
                    image_path = BeautifulStoneSoup(image_path, convertEntities=BeautifulStoneSoup.HTML_ENTITIES)
                    image_path = h.safe_encode(unicode(image_path))
                resourceDict['uri'] = open("%s" % image_path, "rb")
                resourceDict['uriOnly'] = False
                resourceDict['isExternal'] = False
                resourceDict['handle'] = name
                imageName = os.path.basename(image_path)
            resourceDict['resourceType'] = api.getResourceTypeByName(name=resource_type)
            resourceDict['name'] = name
            resourceDict['description'] = resource_desc
            language = api.getLanguageByName(name='English')
            resourceDict['languageID'] = language.id
            resourceDict['ownerID'] = user_id   
            resourceDict['creationTime'] = datetime.now()
            resourceDict['authors'] = authors
            resourceDict['license'] = license
            
            if resource_type == 'cover video' or resource_type == 'video':
               resourceDict['uriOnly'] = True
               resourceDict['isExternal'] = True
            
            ## Check if already exists ...
            self.log.info("Check if resource exists by uri and handle ...")
            r = None
            if imageName:
                self.log.info("Checking resource by uri: %s" % imageName)
                r = api.getResourceByUri(uri=imageName, ownerID=resourceDict.get('ownerID'))
            if not r and resourceDict.get('handle'):
                r = api.getResourceByHandle(handle=m.resourceName2Handle(resourceDict.get('handle')), 
                        typeID=resourceDict.get('resourceType').id, ownerID=resourceDict.get('ownerID'))
            if r:
                self.log.info("Found existing resource: %s" % r.id)
                return self.get_resource_perma(resource=r), r.id

            self.log.info("No resource found. Need to create! Params: %s" % str(resourceDict))

            resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
            resourceID = resourceRevision.resource.id
            ## Use the perma url
            resourceUri = self.get_resource_perma(resource=resourceRevision.resource)
            return (resourceUri, resourceID)
        except Exception as e:
            self.log.error("Error: "+ str(e))
            return (image_path, None)

    def get_resource_perma(self, resource=None, resourceID=None):
        if not resource and resourceID:
            resource = api.getResourceByID(id=resourceID)
        return resource.getPermaUri(fullUrl=True)

    def update_resource_int(self, resourceID, user_id, resource_type='image', resourceUri=None):
        try:
            resourceDict = {}
            resourceDict['id'] = int(resourceID)
            resource = api.getResourceByID(id=resourceDict['id'])
            resourceDict['resourceType'] = api.getResourceTypeByName(name=resource_type)
            resourceDict['resourceRevision'] = resource.revisions[0]
            resourceDict['resourceName'] = resource.name
            resourceDict['resourceDesc'] = resource.description
            if resourceUri:
                resourceDict['resourceUri'] = resourceUri
            if resource_type == 'cover video' or resource_type == 'video':
                resourceDict['uriOnly'] = True
                resourceDict['isExternal'] = True
            else:
                resourceDict['uriOnly'] = False
                resourceDict['isExternal'] = False

            resourceDict['ownerID'] = user_id 
           
            member = api.getMemberByID(id=user_id)
            self.log.info("Params: "+ str(resourceDict))

            resourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member, commit=True)
            resourceID = resourceRevision.resource.id
            ## Use the perma url
            resourceUri = self.get_resource_perma(resource=resourceRevision.resource)
            return (resourceUri, resourceID)
        except Exception as e:
            self.log.error("Error: "+ str(e))
            return (resourceUri, None)

    def get_eo_info(self, eo_id=None, eo=None):
        ## Get the eo id
        if eo_id:
            eo = api.getEmbeddedObjectByID(id=int(eo_id))
        elif eo['url']:
            eo = eohelper.getEmbeddedObjectFromUrl(eo['url'], checkBlacklist=False)
        elif eo['code']:
            eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(code=eo['code'])
            eo = eowrapper.getEmbeddedObject(checkBlacklist=False)
        return eo.asDict(errorIfBlacklisted=False)

    def associate_resource_with_eo(self, user_id, resource_id, eo_id=None, eo=None):
        if not resource_id:
            return
        if not eo_id:
            info_res = self.get_eo_info(eo=eo)
            eo_id = info_res['id']

        eo = api.getEmbeddedObjectByID(id=int(eo_id))
        eoDict = { 'id': eo.id, 'resourceID': int(resource_id) }
        eo = api.updateEmbeddedObject(**eoDict)
        self.log.info("Associate Resource to EmbeddedObject: %s" % eo.resource)

    def getResourceIDPerma(self, user_id, url):
        try:
            if not url.startswith('http'):
                url = self.config.get('flx_prefix_url') + url
            request = urllib2.Request(url)
            request.add_header('Cookie', 'userID=%s'% str(user_id))
            info_req = urllib2.urlopen(request)
            info_response = info_req.read()
            self.log.info("Response for get resource info: %s" % info_response)
            info_response = json.loads(info_response)
            for key in info_response['response']:
                return info_response['response'][key]['id']
            return None
        except Exception, e:
            self.log.error("Exception getting resource id: %s" % str(e), exc_info=e)
            return None

    def _getEmbeddedObject(self, param, type='url', width=None, height=None, checkBlacklist=True):
        """
            Internal method to get an embedded object instance by url or code if one exists in the database.
            Raises error if one is not found.
        """
        eo = None
        if type == 'url':
            url = param
            eo = eohelper.getEmbeddedObjectFromUrl(url, width=width, height=height, checkBlacklist=checkBlacklist)
            if not eo:
                raise Exception((_(u'Could not get embedded object by url: [%(url)s]')  % {"url":url}).encode("utf-8"))
        elif type == 'code':
            code = param
            eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(code=code)
            eo = eowrapper.getEmbeddedObject(checkBlacklist=checkBlacklist)
            if not eo:
                raise Exception((_(u'Could not get embedded object for code: %(code)s')  % {"code":code}).encode("utf-8"))
        else:
            raise Exception((_(u'Unknown request')).encode("utf-8"))
        if checkBlacklist and eohelper.isEmbeddedObjectAbused(eo):
            raise Exception((_(u'EmbeddedObject is forbidden: %(eo.id)s')  % {"eo.id":eo.id}).encode("utf-8"))
        return eo

    def create_embedded_object(self, embedInfo, user_id, post_code=True):
        eo = None
        code = embedInfo['embeddable']
        try:
            eowrapper = None
            if not code:
                raise Exception((_(u'Invalid request. No embedded code in POST')).encode("utf-8"))
            try:
                eo = self._getEmbeddedObject(code, type='code', checkBlacklist=True)
            except Exception, e:
                ## No such object - create it
                eowrapper = eohelper.EmbeddedObjectWrapper(url=None, embedInfo=embedInfo, ownerID=user_id)

            if eowrapper:
                eo = eowrapper.createEmbeddedObject(checkBlacklist=True)

            return eo
        except Exception, e:
            self.log.error("Exception constructing embedded object: %s" % str(e), exc_info=e)
            try:
                ## Get a placeholder image
                self.log.info("FLX_HOME: %s" % self.config.get('flx_home'))
                imageDir = os.path.join(self.config.get('flx_home'), 'flx', 'public', 'media', 'images', 'placeholders')
                eo = eohelper.createPlaceholderEmbeddedObject(imageDir, memberID=user_id, type='video', error=str(e))
                self.log.info("Returning eo: %s" % eo.asDict())
                return eo
            except Exception, ee:
                self.log.error("Error getting placeholder object: %s" % str(ee), exc_info=ee)
                return None
            finally:
                self.createEvent('EMBEDDED_OBJECT_CREATE_FAILED', objectID=None, objectType=None, eventData='%s' % str(e), memberID=user_id)

    def associate_resources(self, user_id, concept_id, xhtml):
        """
            Associate all resources (images and embedded objects) with an artifact
            The resources are parsed from the xhtml for the artifact.
        """
        if not xhtml:
            return
        try:
            imgRegex = re.compile(r'<img ([^<>]*)([/]*>|</img>)', re.I)
            srcRegex = re.compile(r'[ ]*src="([^"]*)"', re.I)
            imgs = imgRegex.findall(xhtml)
            self.log.info("imgs: %s" % imgs)
            if imgs:
                for img, tagend in imgs:
                    try:
                        self.log.info("Handling image resource: %s" % img)
                        if 'class="x-ck12-math"' in img.lower() or 'class="x-ck12-block-math"' in img.lower():
                            ## Equations
                            continue
                        m = srcRegex.search(img)
                        if m:
                            src = m.group(1)
                            if '/flx/math/' in src:
                                continue
                            src = src.replace('/show/', '/get/perma/resource/info/')
                            self.log.info("Image source: %s" % src)
                            resourceID = self.getResourceIDPerma(user_id, src)
                            self.log.info("Going to tie resource %s to concept %s" % (resourceID, concept_id))
                            self.associate_resource(user_id, resourceID, concept_id)
                    except Exception, e:
                        self.log.error("Error associating image resources: %s" % img)

            iframeRegex = re.compile(r'<iframe ([^>]*)>', re.I)
            idRegex = re.compile(r'[ ]*name="([0-9]*)"', re.I)
            iframes = iframeRegex.findall(xhtml)
            self.log.info("iframes: %s" % iframes)
            if iframes:
                for iframe in iframes:
                    try:
                        self.log.info("Handling eo resource: %s" % str(iframe))
                        m = idRegex.search(iframe)
                        if m:
                            eoID = int(m.group(1))
                            self.log.info("EmbeddedObject ID: %s" % eoID)
                            eo_info = self.get_eo_info(eo_id=eoID)
                            resourceID = eo_info['resource']['id']
                            self.log.info("Going to tie resource %s to concept %s" % (resourceID, concept_id))
                            self.associate_resource(user_id, resourceID, concept_id)
                    except Exception, e:
                        self.log.error("Error associating iframe (eo) resources: %s" % iframe)
        except Exception, e:
            self.log.error("Error associating resources to artifact: %s." % concept_id)
            self.log.error(e.__str__())

    def associate_resource(self, user_id, resource_id, artifact_id):
        """
            Associate resource with an artifact - using the internal API helper method
        """
        if not resource_id:
            return
        resource = api.getResourceByID(id=int(resource_id))
        artifact = api.getArtifactByID(id=int(artifact_id))
        member = api.getMemberByID(id=int(user_id))

        if resource and artifact and member:
            resourceID, resourceRevisionID = self.rh.createResourceArtifactAssociation(resource, artifact, member)
            self.log.info("Associated resource: %s with artifact: %s (resource revision: %s)" % (resourceID, artifact_id, resourceRevisionID))
        else:
            raise Exception((_(u'Invalid arguments: resource: %(resource_id)s artifact: %(artifact_id)s member: %(user_id)s')  % {"resource_id":resource_id,"artifact_id": artifact_id,"user_id": user_id}).encode("utf-8"))

    def createEvent(self, eventType, objectID=None, objectType=None, eventData=None, memberID=None):
        e = api.createEventForType(typeName=eventType, objectID=objectID, objectType=objectType, eventData=eventData, ownerID=memberID, processInstant=True)
        return e

    def createCustomCover(self, user_id, artifact, coverImagePath):
        from datetime import datetime
        outputCoverImage = None
        try:
            title = artifact.getTitle().replace('\n', ' ').replace('\r', ' ').replace('\t', ' ').replace('/','')
            if not title:
                raise Exception((_(u"Must specify a Book title to create custom cover")).encode("utf-8"))

            customCoverWorkdir = settings.CUSTOM_COVER_WORKDIR
            if not os.path.exists(customCoverWorkdir):
                os.mkdir(customCoverWorkdir)

            timestamp = datetime.now().strftime("%Y%m%d%s%f")
            #outputCoverImage = customCoverWorkdir + title.replace(' ', '_') + '.jpg'
            outputCoverImage = customCoverWorkdir + 'custom-' + h.safe_encode(title).replace(' ', '_') + '-%s' %(timestamp) + '.jpg'
            outputCoverImage = h.createCustomCoverImage(settings.CUSTOM_COVER_TEMPLATE,
                                     coverImagePath, title, outputCoverImage)
            resourceRevision = self._createCoverImageResource(user_id, outputCoverImage)
            self._associateCoverImage(artifact, resourceRevision)
            return resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
        except Exception, e:
            logging.error('Exception in custom cover image creation[%s]' % str(e), exc_info=e)
            return None
        finally:
            if outputCoverImage:
                if os.path.exists(outputCoverImage):
                    os.remove(outputCoverImage)

    def _createCoverImageResource(self, user_id, cover_image_path):
        resourceDict = {}
        path, name = os.path.split(cover_image_path)
        resourceDict['uri'] = open(cover_image_path, "rb")
        resourceDict['uriOnly'] = False
        resourceDict['isExternal'] = False
        resourceDict['resourceType'] = api.getResourceTypeByName(name='cover page')
        resourceDict['name'] = name
        resourceDict['description'] = None
        language = api.getLanguageByName(name='English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = user_id
        resourceDict['creationTime'] = datetime.now()
        resourceRevision = api.createResource(resourceDict=resourceDict,
                                              commit=True)
        return resourceRevision

    def _associateCoverImage(self, artifact, resourceRevision):
        artifactRevision = artifact.revisions[0]
        artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                      resourceRevisionID=resourceRevision.id)
        return artifactRevisionHasResource

    def getAllSubjectBrowseTerms(self):
        pageNum = 1
        pageSize = 64
        subjectBrowseTerms = []
        while True:
            tmpList = api.getSubjectBrowseTerms(pageNum=pageNum, pageSize=pageSize)
            if not tmpList:
                break
            subjectBrowseTerms.extend(tmpList)
            pageNum = pageNum + 1
        return [x.name.lower() for x in subjectBrowseTerms]

    def addRelatedArtifacts(self, artifact_id, related_eid_list):
        browse_term_list = []
        try:
            self.log.info("related_eid_list: %s" % related_eid_list)
            for each_eid in related_eid_list:
                for each_split_eid in each_eid.split(','):
                    each_split_eid = each_split_eid.strip()
                    if each_split_eid:
                        each_split_eid = h.getDomainEIDFromEID(each_split_eid)
                        self.log.info("each_split_eid: %s" % each_split_eid)
                        browse_term_list.append(api.getBrowseTermByEncodedID(each_split_eid))
            self.log.info("browse_term_list: %s" % browse_term_list)
            api.deleteRelatedArtifactsForArtifact(artifact_id)
            for each_browse_term in browse_term_list:
                if each_browse_term:
                    kwargs = {}
                    kwargs['domainID'] = each_browse_term.id
                    kwargs['sequence'] = None
                    kwargs['artifactID'] = artifact_id
                    api.createRelatedArtifact(**kwargs)
                    api.createArtifactHasBrowseTerm(artifactID=artifact_id, browseTermID=each_browse_term.id)
        except Exception as e:
            self.log.error("Error adding related_eid: %s" % str(e), exc_info=e)

    def updateTaskUserData(self, taskID, updateDict={}):
        if taskID:
            task = api.getTaskByID(id=int(taskID))
            if task:
                udata = task.userdata
                if udata:
                    udJson = json.loads(udata)
                else:
                    udJson = {}
                udJson.update(updateDict)
                task.userdata = json.dumps(udJson)
                logging.info("Setting userdata: %s" % task.userdata)
                api.updateTask(id=task.id, userdata=task.userdata)
            else:
                logging.error("No such task by id: %s" % taskID)
        else:
            logging.error("Empty taskID specified.")
            
    def delete_existing_browse_terms_for_artifact(self,artifactID):
        artifactDict = api.getArtifactContentDict(artifactID)
        if artifactDict:
            browse_term_keywords = ['gradeGrid','subjectGrid','searchGrid','stateGrid']
            try:
                for browse_term_keyword in browse_term_keywords :
                    if artifactDict.has_key(browse_term_keyword):
                        for keyword in artifactDict[browse_term_keyword]:
                            try :
                                browseTermID = keyword[0]
                                api.deleteArtifactHasBrowseTerm(artifactID,browseTermID)
                            except Exception,e:
                                self.log.error("Error deleting browse term for artifact %s : %s" % (artifactID,str(e)))
            except Exception, e:
                self.log.error("Error deleting browse terms for artifact %s : %s" % (artifactID,str(e)))
