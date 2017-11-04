# This script copies the metadata from ck-12 book to the spanish translataed version 
import logging
from flx.lib.helpers import reindexArtifacts
from flx.model import api
from flx.model import meta
from flx.model import model
from flx.controllers.common import ArtifactCache, BrowseTermCache

LOG_FILENAME = "/opt/2.0/log/copy_artifact_metadata.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

coppied_dict = {}
reindexIdList = []

def printToLog(message):
    print message
    log.debug(message)

def copy_metadata_for_artifact(fromArtifact, toArtifact, includeEncodedID=False):
    printToLog("Copying Metadata from artifactID[%s] to artifactID[%s]" %( fromArtifact.id, toArtifact.id))
    coppied_dict[int(fromArtifact.id)] = int(toArtifact.id)
    browseTerms = fromArtifact.getBrowseTerms()
    for browseTerm in browseTerms:
        try:
            if browseTerm['type'].lower() not in  ["domain"]:
                api.createArtifactHasBrowseTerm(artifactID=toArtifact.id, browseTermID=browseTerm['id'])
                api.invalidateBrowseTerm(BrowseTermCache(), browseTerm['id'], toArtifact.creatorID)
        except Exception as ex:
            printToLog("Exception while copying artifact [%s] : [%s], Skipped...." % (toArtifact.id, ex))
    
    searchTerms = fromArtifact.getSearchTerms()
    for searchTerm in searchTerms:
        api.createArtifactHasSearchTerm(artifactID=toArtifact.id, searchTermID=searchTerm['id'])
    
    tagTerms = fromArtifact.getTagTerms()
    for tagTerm in tagTerms:
        api.createArtifactHasTagTerm(artifactID=toArtifact.id, tagTermID=tagTerm['id'])

    try:
        #Copy encodedID and license info
        if includeEncodedID:
            toArtifact.encodedID = fromArtifact.encodedID.replace("ENG", "ESP") if fromArtifact.encodedID else None
        toArtifact.licenseID = fromArtifact.licenseID
        session = meta.Session()
        session.begin()
        session.merge(fromArtifact)
        session.commit()
    except Exception as ex:
            printToLog("Exception while copying artifact encodedID from [%s] to [%s], Error: [%s]" % (fromArtifact.id, toArtifact.id, ex))

    try:
        session = meta.Session()
        session.begin()
        #Delete existing authors information
        for author in toArtifact.authors:
            session.delete(author)
        session.commit()

        session = meta.Session()
        session.begin()
        #new authors for artifact
        for author in fromArtifact.authors:
            artifactAuthor = model.ArtifactAuthor(artifactID=toArtifact.id,
                                                      name=author.name,
                                                      roleID=author.roleID,
                                                      sequence=author.sequence)
            session.add(artifactAuthor)
        session.commit()
    except Exception as ex:
            printToLog("Exception while copying artifact authors info from [%s] to [%s], Error: [%s]" % (fromArtifact.id, toArtifact.id, ex))
    api.invalidateArtifact(ArtifactCache(), toArtifact, memberID=toArtifact.creatorID)
    reindexIdList.append(int(toArtifact.id))


def metadata_for_artifact_childrens(fromArtifact, copyToArtifact):
    for (index, child) in enumerate(fromArtifact.revisions[0].children):
        try:
            fromChildArtifact = api.getArtifactByID(child.child.artifactID)
            copyToChildArtifact = api.getArtifactByID(copyToArtifact.revisions[0].children[index].child.artifactID)
            copy_metadata_for_artifact(fromChildArtifact, copyToChildArtifact)
            metadata_for_artifact_childrens(fromChildArtifact, copyToChildArtifact)

        except Exception as ex:
            printToLog("Exception while copying artifact [%s] : [%s], Skipped...." % (fromChildArtifact.id, ex))

def run(originalArtifactID, translatedArtifactID):
    orgArtifact = api.getArtifactByID(originalArtifactID)
    transArtifact = api.getArtifactByID(translatedArtifactID)

    if not orgArtifact or not transArtifact:
        printToLog("Artifact(s) Does not exists")
        return 

    copy_metadata_for_artifact(orgArtifact, transArtifact, includeEncodedID=True)
    
    metadata_for_artifact_childrens(orgArtifact, transArtifact)

    api.invalidateArtifact(ArtifactCache(), transArtifact, memberID=transArtifact.creatorID, recursive=True)
    
    reindexArtifacts(artifactIds=reindexIdList)
    
    printToLog(coppied_dict)
    printToLog("Done...")
    
