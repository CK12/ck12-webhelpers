import os
import time
import re
import logging
import logging.handlers
from flx.model import api

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.handlers.RotatingFileHandler('/tmp/generate_key_equations.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

html_template = """<html><head></head><title>%s</title><body>%s</body></html>"""
html_dir = "/tmp/key_equations"

def run():
    """
    """
    # Case when Guidance is in the BOX after Key Equations
    pat_1 = re.compile('(<h3.*?>[\s]*?Key Equations[\s]*?</h3>.*?)<div.*? class="x-ck12-element-box-header".*?>', re.M|re.S)
    # Case when Guidance is the title after Key Equations
    pat_2 = re.compile('(<h3.*?>[\s]*?Key Equations[\s]*?</h3>.*?)<h3.*?>[\s]*?Guidance[\s]*?</h3>', re.M|re.S)

    stime = time.time()
    
    branch_term =  api.getBrowseTermByEncodedID(encodedID='SCI.PHY')
    branch_descendants = api.getBrowseTermDescendants(branch_term.id)
    domain_ids = [branch_descendant.id for branch_descendant in branch_descendants]
    related_artifacts = api.getRelatedArtifactsForDomains(domainIDs=domain_ids, typeIDs=[3])
    total_count = len(related_artifacts)
    log.info("Total lesson modalities to process:%s" % total_count)
    counter = 0
    for related_artifact in related_artifacts:
        counter += 1
        log.info("Processing %s/%s" % (counter, total_count))
        artifact_id = related_artifact.id        
        revision_id = related_artifact.artifactRevisionID
        arft = api.getArtifactRevisionByID(revision_id)
        childs = arft.getChildren()
        for child in childs:
            eid = child.encodedID
            html = child.revisions[0].getXhtml()
            if html.find('Key Equations') >=0:
                results = pat_1.findall(html)
                result_html = ''
                if results:
                    result_html = results[0]
                else:
                    results = pat_2.findall(html)
                    if results:
                        result_html = results[0]
                if result_html:
                    createKeyEquationHtml(eid, revision_id, child.name, result_html)
                else:
                    log.info("Unable to extract Key Equations, %s/%s/%s" % (eid, revision_id, child.name))

def createKeyEquationHtml(eid, revision_id, name, key_eqn_html):
    """
    """
    file_name = '%s_%s.html' % (eid, revision_id)
    file_path = "%s/%s" % (html_dir, file_name)
    if os.path.exists(file_path):
        log.info("%s, file already exists." %(file_path))
        return
    title = "%s (EncodedID:%s/ArtifactID:%s)" % (name, eid, revision_id)
    html = html_template % (title, key_eqn_html)
    fp = open(file_path, "w", encoding='utf8')
    fp.write(html.encode('utf8'))
    fp.close()
