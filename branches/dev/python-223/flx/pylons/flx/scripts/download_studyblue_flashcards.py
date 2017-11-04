import urllib2
import re
from BeautifulSoup import BeautifulSoup
import logging

from flx.model import api
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/get_studyblue_flashcards.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run():
    ck12editor = api.getMemberByAuthID(id=3)
    flashcards = api.getArtifactsByOwner(ck12editor, typeName='flashcard')
    count = 0
    outputFile = open('/tmp/flashcards.csv', 'w')
    csvwriter = UnicodeWriter(outputFile)
    reObj = re.compile('window\.location = "(.*)";')
    for eachFlashcard in flashcards:
        domains = eachFlashcard.getDomains()
        eids = [x.encodedID for x in domains]
        eids = ','.join(eids)
        uri = eachFlashcard.revisions[0].resourceRevisions[0].resource.uri
        if 's.tudy' in uri:
            pageContent = urllib2.urlopen(uri).read()
            reSearch = re.search(reObj, pageContent)
            if reSearch:
                studyblueURL = reSearch.group(1)
                log.info('Extracting flashcard from: [%s] for artifactID: [%s]' %(studyblueURL, eachFlashcard.id))
                pageContent = urllib2.urlopen(studyblueURL).read()
                soup = BeautifulSoup(pageContent)
                for eachCard in soup.findAll('div', {'class': 'card'}):
                    card = eachCard.findAll('div', {'class':'text text-small'})
                    if len(card) != 2:
                        log.info('Some flashcards in [%s] does not match the format' %(studyblueURL))
                        continue
                    front, back = card[0].text, card[1].text
                    csvwriter.writerow([eachFlashcard.id, eids, front, back])
                count += 1
            else:
                log.info('No redirect URL found for uri: [%s], artifactID: [%s]. Skipping...' %(uri, eachFlashcard.id))
    print count
    outputFile.close()

run()
