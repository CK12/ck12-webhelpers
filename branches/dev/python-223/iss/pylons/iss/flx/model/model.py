"""
    Map database tables to python classes.
"""

from flx.lib import helpers as h
from flx.lib.fc import fcclient as fc
from flx.model import meta
from flx.model import FlxModel
from pylons import config
from pylons.i18n.translation import _
from sqlalchemy import orm, desc
from urllib import quote
import logging
import re

log = logging.getLogger(__name__)

ck12Editor = None
RESOURCE_TYPE_RE = re.compile(r'http[s]?://.*%2B([A-Za-z_0-9]*?)\.1$')

def resourceName2Handle(name):
    if name:
        return name.rstrip('/').replace(' ', '-')
    return name

"""
    Classes to be filled in by the mapper of SqlAlchemy.
"""

class Language(FlxModel):
    pass


class Member(FlxModel):

    def fix(self):
        for attr in ['givenName', 'surname', 'login', 'email']:
            if hasattr(self, attr):
                setattr(self, attr, h.decode_encrypted(getattr(self, attr)))
        if not hasattr(self, 'name'):
            self.name = ('%s %s' % (self.givenName, self.surname)).strip()
        return self

    def asDict(self, includePersonal=False, obfuscateEmail=False, top=True):
        info = {
            'id': self.id,
            'stateID': self.stateID,
            'authID': self.id,
            'email': self.email,
            'login': self.login,
            'defaultLogin': self.defaultLogin,
            'name': ('%s %s' % (self.givenName, self.surname)).strip(), 
            'timezone': self.timezone
        }

        if obfuscateEmail:
            email = self.email
            if '@' not in email:
                email = email[:3] + '*'*(len(email) - 3)
            else:
                emailID, domain = email.split('@')
                email = emailID[:3] + '*'*(len(emailID) - 3) + '@' + domain
            info['email'] = email

        if includePersonal:
            info['givenName'] = self.givenName
            info['surname'] = self.surname
            if not info['givenName'] and not info['surname']:
                info['givenName'] = self.email
        return info

    def infoDict(self):
        mdict = {
            'firstName': self.givenName,
            'lastName': self.surname,
            'name': ('%s %s' % (self.givenName, self.surname)).strip(), 
            'email': self.email, 
            'login': self.login,
            'defaultLogin': self.defaultLogin,
        }
        if not mdict['firstName'] and not mdict['lastName']:
            mdict['firstName'] = self.email
            mdict['name'] = self.email
        return mdict


class Resource(FlxModel):

    def getUri(self, suffix='', oldStyle=False, unresolved=False, perma=False, local=False):
        """
            Return the uri for this resource.

            suffix is optional suffix to get a variation of the resource (eg. 'thumb' will return a thumbnail image)
            oldStyle is deprecated and should not be used except when loading data into fedora.
            unresolved when set to True returns the uri as-is from the database otherwise the uri is changed to reflect
            the correct host name of the media server.
        """
        if self.type.versionable or self.isExternal or unresolved:
            return self.uri

        if self.type.name not in ['cover page', 'image']:
            suffix = ''

        if local:
            fcclient = fc.FCClient()
            url = fcclient.getResourceLink(self.refHash, self.type, dsSuffix=suffix)
            if oldStyle:
                return url.replace('f-d:', 'flx2-d:').replace('f-s:', 'flx2-s:')
            return url

        if oldStyle:
            return h.getDataPath(self.uri, id=self.ownerID)

        if perma:
            return self.getPermaUri(suffix=suffix, fullUrl=True)

        fcclient = fc.FCClient()
        return fcclient.getResourceLink(self.refHash, self.type, dsSuffix=suffix)

    def getPermaUri(self, suffix='default', fullUrl=False, qualified=False):
        global config
        resourceType, handle, realm = self.getPermaParts()
        if suffix == 'default' or self.type.name not in ['cover page', 'image']:
            suffix = None
        if realm is None:
            perma = '/%s/%s' % (quote(resourceType), quote(h.safe_encode(handle)))
        else:
            perma = '/%s/%s/%s' % (quote(resourceType), quote(h.safe_encode(realm)), quote(h.safe_encode(handle)))

        if suffix:
            perma = '/%s%s' % (quote(suffix), perma)

        if fullUrl or qualified:
            perma = u'/flx/show%s' % (perma)
            if qualified:
                if not config or not config.get('flx_prefix_url'):
                    config = h.load_pylons_config()

                prefixUrl = config.get('flx_prefix_url')
                if prefixUrl.endswith('/flx'):
                    prefixUrl = prefixUrl[:-4]
                perma = u'%s%s' % (prefixUrl, perma)
        return perma

    def getPermaParts(self):
        login = self.owner.login
        ck12Editor = config.get('ck12_editor')
        if not ck12Editor:
            ck12Editor = 'ck12Editor'
        if login == ck12Editor:
            realm = None
        else:
            if login:
                realm = 'user:%s' % login.strip()
            else:
                raise Exception((_(u"No login found!")).encode("utf-8"))

        resourceType = self.type.name

        handle = self.handle
        if not handle:
            handle = self.uri.replace(' ', '-')
        handle = u'%s' % handle
        
        return resourceType, handle, realm
        
    def getXhtml(self, revisionID=0, withMathJax=False):
        if not revisionID:
            resourceRevision = self.revisions[0]
        else:
            for resourceRevision in self.revisions:
                if resourceRevision.id == revisionID:
                    break

        return resourceRevision.getXhtml(withMathJax=withMathJax)

    def getSatelliteUrl(self):
        return self.satelliteUrl

    def asDict(self, resourceRevision=None, suffix=None,addResourceURL=False):
        if not resourceRevision:
            resourceRevision = self.revisions[0]
        resourceTypeName, handle, realm = self.getPermaParts()
        resourceDict = {
            'id': self.id,
            'name': self.name,
            'type': resourceTypeName,
            'description': self.description,
            'uri': self.getUri(suffix=suffix, perma=True),
            'permaUri': self.getPermaUri(suffix=suffix),
            'handle': handle,
            'realm': realm,
            'isExternal': self.isExternal,
            'isAttachment': self.isAttachment,
            'streamable': self.type.streamable,
            'originalName': self.uri,
            'ownerID': self.ownerID,
            'authors': self.authors,
            'license': self.license,
            'created': self.creationTime if self.creationTime else None,
            'revision': resourceRevision.revision,
            'resourceRevisionID': resourceRevision.id,
            'revisions': [ resourceRevision.asDict() ],
            'publishTime': resourceRevision.publishTime if resourceRevision.publishTime else None,
            'filesize': resourceRevision.filesize,
            'isAbused': resourceRevision.isContentAbused(),
            'satelliteUrl': self.satelliteUrl,
        }

        if addResourceURL:
            resourceDict['resourceURL'] = self.satelliteUrl

        return resourceDict


class ResourceRevision(FlxModel):
    def getPlaceholder(self):
        return '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Content Disabled</title></head><body>The requested content has been disabled.</body></html>'

    def getXhtml(self, withMathJax=False):
        if self.resource.type.name == 'contents':
            raise Exception((_(u"Content type not supported")).encode("utf-8"))

        return None

    def asDict(self):
        revDict = {
            'id': self.id,
            'revision': self.revision,
            'hash': self.hash,
            'filesize': self.filesize,
            'created': self.creationTime if self.creationTime else None,
            'publishTime': self.publishTime if self.publishTime else None,
            'isPublic': self.publishTime != None,
            'resourceID': self.resourceID,
        }
        return revDict


class ResourceType(FlxModel):

    def asDict(self):
        rtDict = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'versionable': self.versionable,
            'streamable': self.streamable,
        }
        return rtDict

TASK_STATUS_IN_PROGRESS = 'IN PROGRESS'                                                                                                                                                                        
TASK_STATUS_PENDING = 'PENDING'
TASK_STATUS_SUCCESS = 'SUCCESS'
TASK_STATUS_FAILURE = 'FAILURE'
TASK_STATUSES = [TASK_STATUS_IN_PROGRESS, TASK_STATUS_PENDING, TASK_STATUS_SUCCESS, TASK_STATUS_FAILURE]

class Task(FlxModel):

    def asDict(self):
        taskDict = {
            'id': self.id,
            'name': self.name,
            'taskID': self.taskID,
            'status': self.status,
            'message': self.message,
            'userdata': self.userdata,
            'artifactKey': self.artifactKey,
            'hostname': self.hostname,
            'started': self.started,
            'updated': self.updated,
        }
        if self.owner:
            taskDict['owner'] = {
                'id': self.owner.id,
                'login': self.owner.login
            }
        return taskDict


########## Reviewed Object Table Mappings ##########

orm.mapper(Language, meta.Languages)

orm.mapper(Member, meta.Members,
        properties={
            'tasks': orm.relation(Task, cascade='delete', lazy=True),
        }
    )

orm.mapper(Resource, meta.Resources,
        properties={
            'revisions': orm.relation(ResourceRevision,
                                      primaryjoin=meta.Resources.c.id == meta.ResourceRevisions.c.resourceID,
                                      order_by=[desc(meta.ResourceRevisions.c.id)],
                                      back_populates='resource',
                                      cascade='delete'),
            'type': orm.relation(ResourceType,
                                 lazy=False,
                                 uselist=False),
            'owner': orm.relation(Member,
                                  lazy=False,
                                  uselist=False),
            'language': orm.relation(Language,
                                     lazy=False,
                                     uselist=False),
        }
    )
orm.mapper(ResourceRevision, meta.ResourceRevisions,
        properties={
            'resource': orm.relation(Resource,
                                     primaryjoin=meta.ResourceRevisions.c.resourceID == meta.Resources.c.id,
                                     back_populates='revisions',
                                     lazy=False
                                    ),            
        }
    )
orm.mapper(ResourceType, meta.ResourceTypes)

orm.mapper(Task, meta.Tasks,
        properties={
            'owner': orm.relation(Member, primaryjoin=meta.Tasks.c.ownerID == meta.Members.c.id, lazy=True),
        }
    )
