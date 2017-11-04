import logging
import os
import sys
import datetime
import time

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)
    
from flx.model import api
from flx.lib.remoteapi import RemoteAPI
#import sitemap_generator
import collections_sitemap_generator

remoteapi = RemoteAPI()


LOG_FILENAME = "/tmp/sitemap_generator.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

#SERVER_URL = sitemap_generator.SERVER_URL
#TAXONOMY_SERVER = sitemap_generator.TAXONOMY_SERVER
SERVER_URL = collections_sitemap_generator.SERVER_URL
TAXONOMY_SERVER = collections_sitemap_generator.TAXONOMY_SERVER
BRANCH_API = "/get/info/branches"
COLLECTIONS_API = "/collections/published"
SITEMAP_INDEX_FILEPATH = "/opt/2.0/flxweb/flxweb/public/"
SITEMAP_INDEX_FILENAME = 'sitemap_subjects_index.xml'
SITEMAP_HEADER    = \
                  '<?xml version="1.0" encoding="UTF-8"?>\n'\
                  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
SITEMAP_FOOTER     = '</sitemapindex>\n'
Template_Tag = """
<sitemap>
    <loc>%s</loc>
    <lastmod>%s</lastmod>
</sitemap>\n"""

class CreateSitemap(object):

    def getSubjectBranches(self,debug=False, checkURLS=False):
        """Get the list all branches and create sitemap xml file for each branch.
        """
        startTime = datetime.datetime.now()
        sitemapFileNames = []
        #create sitemap xml file for each branch
        response = remoteapi._makeCall(TAXONOMY_SERVER, COLLECTIONS_API, 500, params_dict={'pageSize':1000}, method='GET')
        #for rec in response['response']['branches']:
        for rec in response['response']['collections']:
            #branchEID = rec['subjectID']+'.'+rec['shortname']
            collectionHandle = rec['handle']
            sitemapFileName = collections_sitemap_generator.run(CollectionHandle=collectionHandle,debug=debug,checkURLS=checkURLS)
            if sitemapFileName:
                sitemapFileNames.extend(sitemapFileName)
        
        otherBranches = [('SAT Exam Prep','exam preparation'),('Engineering','engineering'),
                         ('Technology','technology'),('English','english'),
                         ('History','history')]
        
        log.info("otherBranches ----loop starts---")
        for otherBranch in otherBranches:
            sitemapFileName = collections_sitemap_generator.run(otherBranchName=otherBranch,debug=debug,checkURLS=checkURLS)
            if sitemapFileName:
                sitemapFileNames.extend(sitemapFileName)
        
        sitemap_index_file = SITEMAP_INDEX_FILEPATH + SITEMAP_INDEX_FILENAME
        #create sitemap index xml file
        xmlfile = open(sitemap_index_file, 'wt')
        xmlfile.write(SITEMAP_HEADER)
        
        for sitemapFileName in sitemapFileNames:
            loc = SERVER_URL + '/' + sitemapFileName
            urlTag = Template_Tag % (loc,time.strftime("%Y-%m-%d"))
            xmlfile.write(urlTag.encode('utf8'))
                
        xmlfile.write(SITEMAP_FOOTER)
        log.info("Sitemap Index file %s is created on path %s." % (SITEMAP_INDEX_FILENAME,SITEMAP_INDEX_FILEPATH))
        
        endTime = datetime.datetime.now()
        executionTime = endTime- startTime
        print "================================================================"
        print "Total time taken create sitemap to all branches: ",executionTime
        return True

if __name__ == "__main__":
    c = CreateSitemap()
    c.getSubjectBranches()
