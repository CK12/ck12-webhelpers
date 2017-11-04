import logging

from flx.model import api
from flx.model import meta
from flx.model.model import ArtifactFeedback
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/export_feedbacks.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)
session = meta.Session()

def run(artifactID):
    outputFile = open('/tmp/export_feedbacks_%s.csv' %(artifactID), 'w')
    writer = UnicodeWriter(outputFile)
    log.info('Exporting feedbacks to: [%s]' %(outputFile.name))
    writer.writerow(["sequence", "artifactID", "memberID", "score", "type", "creationTime", "comments"])
    book = api.getArtifactByID(id=artifactID)
    if not book:
        raise Exception("No such book: %s" % artifactID)
    log.info('Processing book with artifactID: [%s]' %(book.id))
    writeFeedbacks(writer, book.id, '0.0')

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
                writeFeedbacks(writer, gcA.id, '%s.%s' %(chapterSequence, sectionSequence))
    outputFile.close()
    log.info('Done exporting feedbacks to: [%s]' %(outputFile.name))


def writeFeedbacks(writer, artifactID, sequence):
    query = session.query(ArtifactFeedback).filter(ArtifactFeedback.artifactID == artifactID)
    artifactFeedbacks = query.all()
    for eachArtifactFeedback in artifactFeedbacks:
        comment = eachArtifactFeedback.comments
        if not comment:
            comment = ''
        writer.writerow([sequence, eachArtifactFeedback.artifactID, eachArtifactFeedback.memberID, eachArtifactFeedback.score, eachArtifactFeedback.type, eachArtifactFeedback.creationTime.strftime("%Y-%m-%d %H:%M:%S"), comment])
        #writer.writerow([sequence, 'artifactID_' + str(eachArtifactFeedback.artifactID), eachArtifactFeedback.memberID, eachArtifactFeedback.score, eachArtifactFeedback.type, eachArtifactFeedback.creationTime.strftime("%Y-%m-%d %H:%M:%S"), comment])

