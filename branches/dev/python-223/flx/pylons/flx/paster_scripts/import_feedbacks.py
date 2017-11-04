from datetime import datetime
import logging

from flx.model import api
from flx.model import meta
#from flx.model.model import ArtifactFeedback
from flx.lib.unicode_util import UnicodeDictReader

LOG_FILENAME = "/tmp/import_feedbacks.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)
session = meta.Session()

def run(artifactID, feedbackFile):
    inf = open(feedbackFile, 'rb')
    csvReader = UnicodeDictReader(inf, sanitizeFieldNames=True)
    sequencesDict = {}
    for row in csvReader:
        sequence = row['sequence']
        feedbackDict = {}
        #feedbackDict['artifactID'] = row['artifactID']
        feedbackDict['memberID'] = row['memberID']
        feedbackDict['score'] = row['score']
        feedbackDict['type'] = row['type']
        feedbackDict['creationTime'] =  datetime.strptime(row['creationTime'], "%Y-%m-%d %H:%M:%S")
        feedbackDict['comments'] = row['comments']
        if sequencesDict.has_key(sequence):
            sequencesDict[sequence].append(feedbackDict)
        else:
            sequencesDict[sequence] = [feedbackDict]

    for eachSequence in  sequencesDict.keys():
        print eachSequence
        print sequencesDict[eachSequence]

    book = api.getArtifactByID(id=artifactID)
    if not book:
        raise Exception("No such book: %s" % artifactID)
    log.info('Processing book with artifactID: [%s]' %(book.id))
    if sequencesDict.has_key('0.0'):
        createFeedbacks(book.id, sequencesDict.get('0.0'))

    chapterSequence = 0
    for child in book.revisions[0].children:
        chapterSequence = chapterSequence + 1
        childA = child.child.artifact
        log.info('\tProcessing chapter with artifactID: [%s]'  %(childA.id))
        sectionSequence = 0
        if childA.type.name == 'chapter':
            for gc in childA.revisions[0].children:
                sectionSequence = sectionSequence + 1
                gcA = gc.child.artifact
                log.info('\t\tProcessing section with artifactID: [%s]' %(gcA.id))
                sequence = '%s.%s' %(chapterSequence, sectionSequence)
                if sequencesDict.has_key(sequence):
                    createFeedbacks(gcA.id, sequencesDict.get(sequence))
    log.info('Importing feedbacks to book with artifactID: [%s] is complete.' %(artifactID))


def createFeedbacks(artifactID, feedbacks):
    for eachFeedback in feedbacks:
        eachFeedback['artifactID'] = artifactID
        log.info('Creating Feedback with kwargs: [%s]' %(eachFeedback))
        #Create Feedback
        api.createFeedback(**eachFeedback)
