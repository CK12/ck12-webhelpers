from flx.controllers.celerytasks.generictask import GenericTask
from flx.model import api, utils
from flx.model.model import title2Handle
import flx.lib.helpers as h
import logging
import json
from flx.controllers.common import ArtifactCache
from pylons.i18n.translation import _

logger = logging.getLogger(__name__)

class memberViewedArtifactTask(GenericTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, memberID, artifactID, revisionID, **kwargs):
        """
            Added artifact identified by artifactID to the view list of
            member identified by memberID.
        """
        GenericTask.run(self, **kwargs)
        logger.info("Updating statistics for member[%s] artifact[%s] revision[%s]" % (memberID, artifactID, revisionID))
        logger.info("DB: %s" % self.config['sqlalchemy.url'])

        try:
            api.updateDownloadCount(revisionID=revisionID)
            api.updateMemberViewedArtifact(memberID=memberID, artifactID=artifactID)
            return "Updated counts for artifact: %s" % artifactID
        except Exception, e:
            logger.error("Unable to add artifact %s to member %s's view list: %s" % (artifactID, memberID, e))
            raise e

class deleteArtifactTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, artifactID, artifactType, memberID, recursive, **kwargs):
        """
        Delete the artifact by artifactID
        """
        GenericTask.run(self, **kwargs)
        artifact = api.getArtifactByID(id=artifactID)
        if not artifact:
            return

        logger.info("Deleting artifact[%s]" % artifact.id)
        if artifactType is None :
            artifactType = 'Artifact'
        artifactID = int(artifactID)

        idsDeleted, idsKept = api.deleteArtifact(artifact=artifact, recursive=recursive, cache=ArtifactCache())
        if artifactID in idsKept:
            logger.error("%s %s is being used by others"  % (artifactType,artifact.name))
            raise Exception((_(u'%(type)s "%(artifact.name)s" is being used by others')  % {"type":artifactType,"artifact.name": artifact.name}).encode("utf-8"))

        ## Reindex
        toDelete = [artifactID]
        domainIDs = api.getDomainIDsWithNoModalitiesForArtifactIDs(toDelete)
        logger.info("Deleting index for domains %s" % domainIDs)
        toDelete = toDelete.__add__([-(dm) for dm in domainIDs])
        taskId = h.reindexArtifacts(toDelete, user=memberID)
        logger.info("Task id: %s" % taskId)

        ## Create a delete event
        api.createEventForType(typeName='ARTIFACT_DELETED', objectID=artifactID, objectType='artifact', eventData='Artifact %d deleted.' % int(artifactID), ownerID=memberID, processInstant=True, notificationID=kwargs.get('notificationID'))

class QuickDeleteArtifactTask(deleteArtifactTask):

    recordToDB = False

class assembleArtifactTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "artifact"
        self.localArtifactsDict = {}

    def _getArtifactFromCache(self, artifactID):
        if not self.localArtifactsDict.has_key(artifactID):
            artifactDict, ar = ArtifactCache().load(id=artifactID,infoOnly=True)
            self.localArtifactsDict[artifactID] = (artifactDict, ar)
        return self.localArtifactsDict.get(artifactID)

    def getArtifactRevisionParentHandles(self, artifactID, memberID):
        "Return list of 'Type:Handle' of the artifact parents"
        logger.info("getArtifactRevisionParentHandles: artifact: %d, member:%d" % (artifactID, memberID))
        artifactRevisionParentHandleList = []
        if not artifactID:
            return artifactRevisionParentHandleList
        parents = api.getArtifactParentsByCreatorID(artifactID=artifactID, creatorID=memberID)
        if parents:
            for parent in parents:
                handles = self.getArtifactRevisionParentHandles(parent['parentID'], memberID)
                if handles:
                    artifactRevisionParentHandleList.extend([x for x in handles if x not in artifactRevisionParentHandleList])
        else:
            artifactDict, ar = self._getArtifactFromCache(artifactID)
            identifier = "%s:%s"%(artifactDict['type']['name'],artifactDict['handle'])
            if str(artifactDict['creatorID']) == str(memberID) and identifier not in artifactRevisionParentHandleList and artifactDict['type']['name'].strip().lower() != 'chapter':
                artifactRevisionParentHandleList.append(identifier)

        return artifactRevisionParentHandleList

    def getParentHandles(self, parent, memberID, artifactParentHandleList):
        if parent and len(parent) > 0:
            logger.info('getParentHandles: parent[%s]' % parent)
            artifactID = parent['parentID']
            typeID = parent['parentTypeID']
            if typeID == 1:
                artifactDict, ar = self._getArtifactFromCache(artifactID)
                logger.info('getParentHandles: creatorID[%s] memberID[%s]' % (artifactDict['creatorID'], memberID))
                if str(artifactDict['creatorID']) == str(memberID):
                    artifactParentHandleList.append("%s:%s"%(artifactDict['type']['name'], artifactDict['handle']))
            else:
                parents = api.getArtifactParents(artifactID)
                for parent in parents:
                    self.getParentHandles(parent, memberID, artifactParentHandleList)

    def getArtifactParentHandles(self, artifactID, memberID):
        artifactParentHandleList = []
        if not artifactID:
            return artifactParentHandleList
        parents = api.getArtifactParents(artifactID)
        logger.info('getArtifactParentHandles: 1 artifactID[%s] parents[%s]' % (artifactID, parents))
        if parents and len(parents) > 0:
            for parent in parents:
                self.getParentHandles(parent, memberID, artifactParentHandleList)
        logger.info('getArtifactParentHandles: artifactParentHandleList[%s]' % artifactParentHandleList)
        return artifactParentHandleList

    def getAllChildren(self, artifactRevisionID, typeID):
        all_children_ids = api.getArtifactDescendantRevisionIDs(artifactRevisionID=artifactRevisionID)
        child_list = []
        artifactIDList = []
        for each_id in all_children_ids:
            artifactIDs = api.getArtifactIDsForRevisionIDs(revisionIDs=[each_id])
            if artifactIDs:
                artifactID = artifactIDs[0]
                if not artifactIDList.__contains__(artifactID):
                    artifactIDList.append(artifactID)
                else:
                    continue
                each_artifact_dict, each_artifact = self._getArtifactFromCache(artifactID)
                #each_artifact = api.getArtifactByID(id=each_id)
                #each_artifact_dict = each_artifact.asDict()
                if each_artifact_dict['type']['id'] == typeID:
                    child_list.append(each_artifact_dict)
        return child_list

    def run(self, **kwargs):
        """
            Assemble artifact.
        """
        artifactID = None
        udata = None
        memberID = None
        member = None
        e = None
        try:
            GenericTask.run(self, **kwargs)
            info = kwargs['info']
            deepCopy_phase = info.get('deepCopy_phase', 'analysis')
            artifactID = info.get('artifactID')
            artifactTypeDict = kwargs['artifactTypeDict']
            artifact_dict, artifact = ArtifactCache().load(artifactID,infoOnly=True)
            source_member_id = artifact_dict['creatorID']
            memberID = kwargs['memberID']
            del kwargs['memberID']
            member = api.getMemberByID(id=memberID)
            kwargs['member'] = member
            messages = []
            kwargs['messages'] = messages
            logger.info('assembleArtifactTask: kwargs[%s]' % kwargs)
            sourceArtifactType = artifactTypeDict[info.get('artifactType')]
            current_user_artifact = api.getArtifactByHandle(info['handle'], sourceArtifactType, member.id)
            if not current_user_artifact:
                logger.warn("Could not find target artifact handle[%s] and type[%s]. Trying handle of source artifact." % (info['handle'], sourceArtifactType))
                current_user_artifact = api.getArtifactByHandle(artifact_dict['handle'], sourceArtifactType, member.id)
            if not current_user_artifact:
                logger.warn("Could not find the artifact of type [%s] in target user space with handle [%s]. Trying with title to handle conversion." % (sourceArtifactType, artifact_dict['handle']))
                info['handle'] = title2Handle(info['handle'])
                current_user_artifact = api.getArtifactByHandle(info['handle'], sourceArtifactType, member.id)
            if not current_user_artifact:
                logger.warn("Could not find the artifact of type [%s] in target user space with handle [%s]. Will create a new artifact." % (sourceArtifactType, info['handle']))
            else:
                logger.info("Found target artifact [id:%s] of type[%s] and handle [%s]." % (current_user_artifact.id, current_user_artifact.type.name, current_user_artifact.handle))

            ## Update task with known information
            udata = {'sourceArtifactID': artifactID, 'sourceArtifactRevisionID': info.get('artifactRevisionID'), 'sourceMemberID': source_member_id, 
                    'targetMemberID': memberID, 'sourceArtifactHandle': artifact_dict.get('handle')}
            if current_user_artifact:
                udata['targetArtifactID'] = current_user_artifact.id
            self.userdata = json.dumps(udata)
            self.updateTask()

            conflict_list = []
            typeID = artifactTypeDict['lesson']
            typeID2 = artifactTypeDict['section']
            recd_lesson_children = self.getAllChildren(info.get('artifactRevisionID'),typeID=typeID)
            recd_lesson_children.extend(self.getAllChildren(info.get('artifactRevisionID'),typeID=typeID2))
            if current_user_artifact:
                if info.get('artifactType') == 'book' or info.get('artifactType') == 'chapter':
                    for each_recd_lesson in recd_lesson_children:
                        logger.info("Checking: %s,%s,id: %s" % (each_recd_lesson['handle'], each_recd_lesson['artifactType'], each_recd_lesson['id']))
                        user_lesson = api.getArtifactByHandle(each_recd_lesson['handle'], each_recd_lesson['type']['id'], member.id)
                        if user_lesson:
                            user_lesson = user_lesson.asDict()
                            user_lesson_parents = self.getArtifactRevisionParentHandles(user_lesson['id'], memberID=member.id)
                            #recd_lesson_parents = self.getArtifactRevisionParentHandles(each_recd_lesson['id'], memberID=source_member_id)
                            if 'book:%s' % current_user_artifact.handle not in user_lesson_parents:
                                logger.warn("Adding %s of type %s to conflict list (artifactID: %s, artifactRevisionID: %s) because this artifact exists but is not in target user's book[%d]" % (user_lesson['handle'], user_lesson['type']['name'], user_lesson['id'], user_lesson['artifactRevisionID'], current_user_artifact.id))
                                conflict_lesson = {}
                                conflict_lesson['handle'] = user_lesson['handle']
                                conflict_lesson['type'] = user_lesson['type']['name']
                                conflict_list.append(conflict_lesson)
            elif recd_lesson_children:
                for each_recd_lesson in recd_lesson_children:
                    logger.info("Checking: %s,%s,id: %s" % (each_recd_lesson['handle'], each_recd_lesson['artifactType'], each_recd_lesson['id']))
                    user_lesson = api.getArtifactByHandle(each_recd_lesson['handle'], each_recd_lesson['type']['id'], member.id)
                    if user_lesson:
                        user_lesson = user_lesson.asDict()
                        logger.warn("Adding %s of type %s to conflict list (artifactID: %s, artifactRevisionID: %s) because it exists in target user space as standalone" % (user_lesson['handle'], user_lesson['type']['name'], user_lesson['id'], user_lesson['artifactRevisionID']))
                        conflict_lesson = {}
                        conflict_lesson['handle'] = user_lesson['handle']
                        conflict_lesson['type'] = user_lesson['type']['name']
                        conflict_list.append(conflict_lesson)
            if current_user_artifact:
                udata['targetArtifactID'] = current_user_artifact.id
                kwargs['info']['targetArtifactID'] = current_user_artifact.id
            if conflict_list:
                udata['conflicts'] = conflict_list
                raise Exception("Following is the list of artifacts those got conflicted in the namespace: %s"%conflict_list)
            if deepCopy_phase == 'analysis':
                kwargs_deepCopy = kwargs
                kwargs_deepCopy['analysis_dict'] = {"update":[],"sameRev":[],"create":[]}
                analysis_dict = api.deep_copy_analysis(**kwargs_deepCopy)
                udata['analysis_dict'] = analysis_dict
                logger.info("Analysis Data: %s" % analysis_dict)
                e = None
            else:
                kwargs['cache'] = ArtifactCache()
                ar = api.assembleArtifact(**kwargs)
                artifact = ar.artifact
                data = 'Assembled %s to artifact %d' % (artifactID, artifact.id)
                e = api.createEventForType(typeName='ARTIFACT_COPIED', objectID=artifact.id, objectType='artifact', eventData=data, ownerID=memberID, processInstant=False)

                ## Reindex
                taskID = h.reindexArtifacts([artifact.id], user=memberID, recursive=True)
                logger.info("Reindex task id: %s" % taskID)
                artifactID = artifact.id
                return data
        except Exception, ex:
            logger.error('Error copying artifact [%s]' % (str(ex)), exc_info=ex)
            data = 'Assemble artifact failed, Reason: [%s]' % (str(ex))
            objectType = 'artifact' if artifactID else None
            e = api.createEventForType(typeName='ARTIFACT_COPY_FAILED', objectID=artifactID, objectType=objectType, eventData=data, ownerID=memberID, processInstant=False)
            raise ex
        finally:
            if udata:
                self.userdata = json.dumps(udata)
            if not e:
                logger.error('Unable to send the notification as Event object is not defined or skip_notify is set to True')
            else:
                memberEmail = member.email if member else None
                n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifactID, objectType='artifact', address=memberEmail, subscriberID=memberID, type='email', frequency='instant')
                h.processInstantNotifications([e.id], notificationIDs=[n.id], user=memberID, noWait=True)

class ArtifactRecacher(GenericTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, artifactID, artifactRevisionID, **kwargs):
        """
            Invalidate & then Load the mentioned artifact & artifactRevision Cache
        """
        GenericTask.run(self, **kwargs)
        logger.info("Recaching artifactID[%s] artifactRevisionID[%s]" % (artifactID, artifactRevisionID))

        try:
            try:
                artifactID = long(artifactID)
            except ValueError:
                from base64 import standard_b64encode

                #
                #  Memcachedb cannot handle control characters. So encode the id and use it for the key in Cache
                #
                artifactID = artifactID.encode('ascii', 'xmlcharrefreplace')
                artifactID = standard_b64encode(artifactID)
            except TypeError:
                raise Exception((_(u'Unknown type of object received as artifactID, %s.' % artifactID)).encode('utf-8'))

            #The revisionID received here should be the actualRevisionID (of type long).
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError) as e:
                raise Exception((_('Unknown type of object received as revisionID, %s.' % artifactRevisionID)).encode('utf-8'))

            artifactCache = ArtifactCache()
            if artifactID or artifactRevisionID :
                if artifactID :
                    if artifactRevisionID :
                        artifactCache.invalidate(id=artifactID, artifactRevisionID=artifactRevisionID)
                        artifactCache.load(id=artifactID, artifactRevisionID=artifactRevisionID)
                    else :
                        artifactCache.invalidate(id=artifactID)
                        artifactCache.load(id=artifactID)
                else :
                    artifactCache.invalidate(revisionID=artifactRevisionID)
                    artifactCache.load(revisionID=artifactRevisionID)
            else :
                raise Exception((_(u'Both id, %s, and revisionID, %s, cannot be empty.' % (artifactID, artifactRevisionID))).encode('utf-8')) 
        except Exception, e:
            logger.error("Unable to recache artifact [%s], [%s] : [%s]" % (artifactID, artifactRevisionID, e))
            raise e

class FinalizeBookTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "artifact"

    def run(self, **kwargs):
        """
            Finalize sepective sections of the book.
        """
        loglevel = kwargs.get('loglevel')
        logger.info('FinalizeBookTask.run: start')
        logger.info('FinalizeBookTask.run: loglevel[%s]' % loglevel)
        try:
            GenericTask.run(self, **kwargs)

            info = kwargs.get('info')
            memberID = kwargs.get('memberID')
            bookTypes = kwargs.get('bookTypes')
            browseTermTypes = json.loads(kwargs.get('browseTermTypes'))
            memberRoleDict = json.loads(kwargs.get('memberRoleDict'))
            memberRoleNameDict = json.loads(kwargs.get('memberRoleNameDict'))
            logger.info('FinalizeBookTask.run: memberID[%s]' % memberID)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = api._getMemberByID(session, id=memberID)
                memberEmail = member.email
                memberName = member.name
                memberDefaultLogin = member.defaultLogin
                finalizeList = api._finalizeBook(session, info, member, bookTypes, browseTermTypes, memberRoleDict, memberRoleNameDict, ArtifactCache(), task=self)
                logger.info('FinalizeBookTask.run: finalizeList[%s]' % finalizeList)
            #
            #  Send email to notify user.
            #
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                failureList = []
                for finalizeItem in finalizeList:
                    if finalizeItem.get('message', None):
                        artifactID = finalizeItem.get('artifactID')
                        artifact = api._getArtifactByID(session, artifactID)
                        if not artifact:
                            failureList.append('%s: %s' % (artifactID, finalizeItem.message))
                        else:
                            failureList.append('%s: %s' % (artifact.name, finalizeItem.message))
                bookID = info.get('artifactID')
                book = api._getArtifactByID(session, bookID)
                data = {
                    'bookID': bookID,
                    'bookName': book.name,
                    'bookPerma': '%s/user:%s/book/%s' % (self.config['web_prefix_url'], memberDefaultLogin, book.handle),
                    'memberName': memberName,
                    'memberEmail': memberEmail,
                    'failureList': failureList,
                }
            e = api.createEventForType(typeName='BOOK_FINALIZATION', objectID=bookID, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=memberID, subscriberID=memberID, processInstant=False)
            n = api.createNotification(eventTypeID=e.eventTypeID, objectID=bookID, objectType='artifact', address=memberEmail, subscriberID=memberID, type='email', frequency='instant')
            h.processInstantNotifications([e.id], notificationIDs=[n.id], user=memberID, noWait=False)

            try:
                h.reindexArtifacts([info.get('artifactID')], user=memberID, recursive=False)
            except Exception:
                pass
            return finalizeList
        except Exception as e:
            logger.error('Error finalizing book [%s]' % (str(e)), exc_info=e)
            raise e
