from flx.model import api
from flx.lib import helpers as h
import json
from flx.lib.remoteapi import RemoteAPI

SERVER_URL = "http://www.ck12.org"
DEXTER_HOST = "http://www.ck12.org"
import logging

LOG_FILENAME = "/tmp/ads_formats_to_notifications.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

bookTypes = ['book', 'tebook', 'workbook' ,'studyguide', 'labkit']
def run(ownerID=3, typeName=None):
    #typeName not used, instead using artifact types as 'lesson' and 'book'
    owner = api.getMemberByID(id=ownerID)
    ownerID = owner.id
    if not owner:
        return False
    
    if not typeName:
        typeName = ['book', 'tebook', 'workbook', 'studyguide', 'labkit', 'lesson']
        
    if not isinstance(typeName, list):
        typeName = typeName.split(',')
    
    noArtifacts = 0
    notificationCount = 0
    artifactEventType = api.getEventTypeByName('ARTIFACT_NEW_REVISION_AVAILABLE_WEB')
    artifactEventTypeEmail = api.getEventTypeByName('ARTIFACT_NEW_REVISION_AVAILABLE')
    for artifactType in typeName:
        #Get all artifacts for each artifact type, owened if ck12
        print "Checking for artifacts of type [%s]" % (artifactType)
        log.info("Checking for artifacts of type [%s]" % (artifactType))
        artifacts = api.getArtifactsByOwner(owner=owner, typeName=artifactType)
        for artifact in artifacts:
            try:
                #Get member id's who has downloaded the formats for artifactID
                artifactID = artifact.id
                print "Checking Notifications for Artifact ID [%s]" % (artifactID)
                log.info("Checking Notifications for Artifact ID [%s]" % (artifactID))
                #construct new modality urls for artifact
                artifact_url = getNewModalityURLForArtifact(artifact)
                response = RemoteAPI._makeCall(DEXTER_HOST, 'dexter/get/info/fbsdownloads/%s'% artifactID, 90, method='GET')
                memberIDs = response['response']['memberIDs']
                log.info("memberIDs: %s" % len(memberIDs))
                memberCnt = 0
                for memberID in memberIDs:
                    try:
                        memberCnt += 1
                        log.info("[%d/%d] Checking/creating notifications for member: %s" % (memberCnt, len(memberIDs), memberID))
                        if isinstance(memberID, str) or isinstance(memberID, unicode):
                            memberID = int(memberID)
                        member = api.getMemberByID(id=memberID)
                        
                        if member:
                            if member.login == 'guest':
                                #Don't create notification for guest user login/donwloads
                                continue
                            #check if notification for the event type ARTIFACT_NEW_REVISION_AVAILABLE_WEB is already exist or not
                            notificationFilters = (('eventTypeID', artifactEventType.id), ('objectType', 'artifact'), ('type', 'web'), ('subscriberID', member.id), ('objectID', artifact.id))
                            notification = api.getNotificationsByFilter(filters=notificationFilters)
                            #notification doesn't exists, create new one 
                            if not notification:
                                """data = {
                                            'artifactRevision': artifact.revisions[0].id,
                                            'artifact': artifact.id,
                                            'isBook': artifact.getArtifactType() in bookTypes,
                                            'artifactType' : artifact.getArtifactType(),
                                            'artifactTypeName' : "FlexBook&#174; Textbook" if artifact.getArtifactType() in bookTypes else "Read Resource",
                                            'title': artifact.getTitle(),
                                            'handle': artifact.getHandle(),
                                            'message': '',
                                            'artifact_url': artifact_url,
                                            'cover_img': artifact.revisions[0].getCoverImageUri(returnWithID=False)
                                        }"""
                                log.info("Creating Notifications for MemberID[%s] for Artifact ID [%s]..." % (member.id, artifactID))
                                #log.info("Event Data %s" % data)

                                ## No need to create old events - events should be created only when notification is to be sent.
                                #e = api.createEventForType(typeName='ARTIFACT_NEW_REVISION_AVAILABLE', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=memberID, processInstant=False)
                                #web_event = api.createEventForType(typeName='ARTIFACT_NEW_REVISION_AVAILABLE_WEB', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=memberID, subscriberID=memberID, processInstant=False)
                                api.createNotification(eventTypeID=artifactEventTypeEmail.id, objectID=artifact.id, objectType='artifact', address=member.email, subscriberID=memberID, type='email', frequency='off')
                                api.createNotification(eventTypeID=artifactEventType.id, objectID=artifact.id, objectType='artifact', address=member.email, subscriberID=memberID, type='web', frequency='off')
                                notificationCount += 2
                    except Exception as ne:
                        log.error("Error creating notification for member: %s" % (memberID), exc_info=ne)
                noArtifacts += 1
            except Exception as e:
                log.error('Error in processing artifact information for id %s : Exception[%s]' % (artifactID,str(e)), exc_info=e)
    print "Processed [%s] Artifacts" % noArtifacts
    print "Created [%s] New Notifications" % notificationCount
    log.info("Processed [%s] Artifacts" % noArtifacts)
    log.info("Created [%s] New Notifications" % notificationCount)

def getNewModalityURLForArtifact(artifact):
    """
        1. Get List of distinct domain ecodedID's
        2. Get brach name for each encode ID,
        3. Consturct new modality url
        4. Return the artifact_url
    """
    artifact_domain = artifact.getDomain()
    allEIDS = ['.'.join( artifact_domain['encodedID'].split('.')[:2] )] if artifact_domain else []
    allEIDS = list(set(allEIDS)) # Get the distinct encodedID's from the ecodeedID list
    artifact_url = None
    try:
        eid_branch_dict = getBranchHandlesByEIDs(allEIDS)
    except Exception, e:
        log.error('Error in getting browse Term for %s : Exception[%s]' % (allEIDS,str(e)))
    if artifact_domain :
        browse_term_short = '.'.join( artifact_domain['encodedID'].split('.')[:2])
        browseTerm = {}
        browseTerm[browse_term_short] = eid_branch_dict[browse_term_short]
        artifact_url = getNewModalityURL(browseTerm,artifact)
    else:
        artifact_url = '%s/%s'%(SERVER_URL,artifact.getPerma())
    return artifact_url
    
def getNewModalityURL(browseTerm,artifact):
    """ Get New Modality url in for following format 
        http://<host>/<branch>/<concept-handle>/<modality-type>/<realm>/<modality-handle>"""
    artifactDict = artifact.asDict()
    if not browseTerm:
        return None
    if browseTerm.keys()[0].startswith('UGC'):
        branch = 'na'
    else:
        branch = browseTerm[browseTerm.keys()[0]]
    if branch is None:
        branch = ''    
    if artifactDict['artifactType'] in bookTypes:
        return "%s/%s" % (SERVER_URL, artifactDict['perma'])
    else:
        return "%s/%s/%s/%s/%s" % (SERVER_URL, branch.lower(), artifactDict['domain']['handle']\
                                        , artifactDict['artifactType'], artifactDict['handle'])

def getBranchHandlesByEIDs(eids=None):
    """
        Make flx API call to get the branch name from encodedID
    """
    if not eids:
        return None
    browseTerms =  api.getBrowseTermByEncodedIDs(encodedIDList=eids)
    result = {}
    for browseTerm in browseTerms:
        result[browseTerm.encodedID] = browseTerm.handle
    return result
