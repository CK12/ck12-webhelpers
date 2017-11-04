import logging
import urllib
import json
from flx.lib.unicode_util import UnicodeWriter
from flx.model import api
from BeautifulSoup import BeautifulSoup

log_filename = "/tmp/generate_images_csv.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
#handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

artifact_api = 'http://gamma.ck12.org/flx/get/detail/%s?format=json'
server_url = 'http://gamma.ck12.org'
csv_file = '/tmp/artifact_images.csv'

output_file = open (csv_file, 'w')
csvwriter = UnicodeWriter(output_file)
csvwriter.writerow(["ArtifactID","Book Url","Image Url"])


def _writecsvrows(chapter_number,section_number,artifact, base_url):
    """
    """ 
    artifact_id = artifact.id
    section = "%s.%s"%(chapter_number,section_number)    
    log.info("Processing artifact: %s" % artifact_id)
    
    book_url = '%s/%s/section/%s/' % (server_url, base_url, section) 
    log.info("Book Url: %s" % book_url)  
    # Get the artifact XHTML
    api = artifact_api % artifact_id
    log.info("Artifact API: %s" % api)      
    response = urllib.urlopen(api)
    response = json.loads(response.read())
    xhtml = response.get('response', {}).get('artifact', {}).get('xhtml_prime', '')
    if not xhtml:
        log.info("Unable to get XHTML")
        return
    
    # Parse XHTML to get all the images
    soup = BeautifulSoup(xhtml)
    images = soup.findAll('img')
    for img in images:
        src = img.get('src', '')
        if src.startswith('/flx/show/'):
            log.info("Image src: %s" % src )
            csvwriter.writerow([artifact_id, book_url, src])

def _run(artifact_id):
    """
    """
    artifact = api.getArtifactByID(artifact_id)
    if not artifact:
      log.info("Could not get artifact. Check artifactID: %s"%(artifact_id))
      return
    else:
      # Get chapters
      chapters = artifact.getChildren()
      # setions of chapter
      if not chapters:
          log.info("Could not get artifact chapters. Check artifactID: %s"%(artifact_id))
          return

    perma = artifact.getPerma()
    if not perma:
      log.info("Could not get artifact perma. Check artifactID: %s"%(artifact_id))
      return

    # Build the book base url
    base_url = '/'.join([perma.split('/')[-1]] + perma.split('/')[:-1])
    # Process each sections of the book
    for i,chapter in enumerate(chapters):
      i+=1
      if chapter.artifactTypeID != 3:
        for v,section in enumerate(chapter.getChildren()):
          _writecsvrows(i,v+1,section, base_url)
          
def run(artifact_ids):
    """
    """    
    for artifact_id in artifact_ids:
        _run(artifact_id)
    output_file.close()
