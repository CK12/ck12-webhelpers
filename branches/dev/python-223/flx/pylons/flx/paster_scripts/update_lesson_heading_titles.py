import time
import re
import logging
import logging.handlers
from flx.model import api
from flx.controllers.common import ArtifactCache

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/update_leasson_headings.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

title_mappings = {}
title_mappings["Explore More"] = "Practice"
title_mappings["Explore More I"] = "Practice I"
title_mappings["Explore More II"] = "Practice II"
title_mappings["Explore More III"] = "Practice III"
title_mappings["Review"] = "Explore More"

# The keys order with highest length key first, this order will be considered when replacing the headings
#mapping_keys = sorted(title_mappings, key=lambda x:len(x), reverse=True)

def run():
    """
    """
    stime = time.time()
    # Patterns to search the headings to be replaced.
    h3_pat = re.compile('<h3.*?>*?</h3>', re.DOTALL)
    h4_pat = re.compile('<h4.*?>*?</h4>', re.DOTALL)
    # Fetch all the read modalities
    #lessons = api.getArtifacts(typeName='lesson', idList=[1980216], sorting='id,desc', pageNum=1, pageSize=1)
    lessons = api.getArtifacts(typeName='lesson', sorting='id,desc', pageNum=1, pageSize=1)
    total_count = len(lessons)
    log.info("Total %s read modalities to be processed" % total_count)
    count = 0
    for lesson in lessons:
        log.info("Processing artifactID:%s" % lesson.id)
        count += 1
        if (count % 100) == 0:
            log.info("Till now %s/%s modalities processed, Time taken:%s" % (count, total_count, (time.time() - stime)))

        childs = lesson.getChildren()
        for child in childs:
            artifact_id = str(child.id)
            revision_id = str(child.revisions[0].id)
            log.info("Processing artifactRevisionID:%s" % revision_id)
            old_xhtml = child.revisions[0].getXhtml()
            if not old_xhtml:
                continue

            # Get the new headings for Explore More
            headings_1 = h3_pat.findall(old_xhtml)
            mapping_keys = ["Explore More"]
            updated_headings_1 = get_updated_headings(headings_1, mapping_keys)      

            headings_2 = h4_pat.findall(old_xhtml)
            mapping_keys = ["Explore More III", "Explore More II", "Explore More I"]
            updated_headings_2 = get_updated_headings(headings_2, mapping_keys)
            
            # Get the new headings for Review
            mapping_keys = ["Review"]
            updated_headings_3 = get_updated_headings(headings_1, mapping_keys)      

            # Prepare the updated XHTML
            replace_headings = updated_headings_1 + updated_headings_2 + updated_headings_3
            for replace_heading in replace_headings:
                old_heading, new_heading = replace_heading
                old_xhtml = old_xhtml.replace(old_heading, new_heading)

            # Replace the actual XHTML
            api.replaceRevisionContent(revision_id, old_xhtml)
            try:
                api.invalidateArtifact(ArtifactCache(), artifact=child)
                ArtifactCache().load(id=artifact_id) 
                log.info("Invalidated cache for artifact: %s"%(artifact_id))
            except:
                log.info("Could not invalidate cache for artifact: %s"%(artifact_id))

def get_updated_headings(headings, mapping_keys):
    """Returns the headings that need to be replaced
    """
    updated_headings = []
    for heading in headings:
        for mapping_key in mapping_keys:
            if mapping_key in heading:
                updated_heading = heading.replace(mapping_key, title_mappings[mapping_key])
                updated_headings.append((heading, updated_heading))
                break
    return updated_headings
