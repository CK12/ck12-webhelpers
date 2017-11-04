import re
import logging

from flx.model import api

PROVIDER_NAME = 'TDD'
PROVIDER_ID = 102

LOG_FILE_PATH = "/tmp/fix_embeddedobjects.log"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

def run():
    """
    This function will convert all the code objects to iframe.
    As code object does not work in mobile devices.
    """    
    # Get the list of embeddedobjects for the TDD provider
    provider = api.getProviderByID(PROVIDER_ID)
    results = api.getEmbeddedObjectsByProvider(provider)        
    
    link_pat = "<embed.*adKeys=(.*?;)" 
    src_url = "http://embed.ted.com"    
    iframe_html = """<iframe src="%s" width="560" height="315" frameborder="0" scrolling="no"
                     webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>"""

    for result in results:
        id = result.id
        embed_html = result.code
        # Process all the code objects.
        if embed_html.startswith('<object'):
            try:
                # Fetch the link from code and build the src for iframe.
                m = re.search(link_pat, embed_html)
                link = m.group(1)
                link = link.rstrip(';')
                if link.startswith('talk='):
                    link = link.replace('talk=', '')
                    src = "%s/talks/%s.html"% (src_url, link)
                else:
                    src = "%s/%s.html"% (src_url, link)
                iframe_code = iframe_html % src  
                api.updateEmbeddedObject(id=id, code=iframe_code)
                logger.info("Successfully update the code for EmbeddedObject:%s" % id)
            except Exception as e:
                import traceback
                traceback.print_exc()
                logger.error('Unable to update code for EmbeddedObject:%s, Exception:%s' % (id, str(e)))
