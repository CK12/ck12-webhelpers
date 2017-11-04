from xml.dom import minidom
import re
import urllib2
import sys
import os, argparse
import logging
import requests
LOG_FILE_PATH = '/tmp/parse_error.log'

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr) 
logger.setLevel(logging.INFO)

# Requests request settings
requests_settings = { 'allow_redirects': True }

class StaticSiteMapXMLParser:
    """Update and Verify SiteMap URLs.    
    """             
    def __init__(self,staticSiteMapPath, is_dir=False):
        self.docElement = None
        self.urlElements = None
        self.staticSiteMapPath = staticSiteMapPath
        self.is_dir = is_dir
        self.loadStaticSiteMapXML(is_dir=self.is_dir)
    
    def setStaticSiteMapPath(self,path):
        self.staticSiteMapPath = path

    def loadStaticSiteMapXML(self, is_dir=False):
        if not is_dir:
            try:
                self.docElement = minidom.parse(self.staticSiteMapPath)
                self.urlElements = self.docElement.getElementsByTagName('url')
            except Exception,e:
                logger.error("In loadStaticSiteMapXML: Unable to load sitemap xml, %s" %e)
    
    def totalURLInStaticSiteMapXML(self):
        logger.info("Total Count of URL's = %s" % len(self.urlElements))
        print "Total Count of URL's = %s" % len(self.urlElements)
        return len(self.urlElements)
        
    def updateConceptURL(self):
        """
            1. Get all the url's having concept/ in the url
            2. Check for the response from server
            3. Update the concept url with the new url returned from server
        """
        logger.info("In updateConceptURL: URL updating started.")
        old_pattern_re = re.compile(r'http://(.*?)/concept/', re.I)
        total_count = len(old_pattern_re.findall(self.docElement.toxml("utf-8")))
        logger.info("In updateConceptURL: Count of old url pattern that need to be changed = %s"% total_count)
        current_item = 1
        for url in self.urlElements:                  
            locElement = url.getElementsByTagName('loc')[0]
            urlValue = locElement.firstChild.nodeValue
            matches = old_pattern_re.match(urlValue)
            # if url is old concept url
            if matches:
                logger.info("In updateConceptURL: Updating url (%s of %s ) for %s" % (current_item,total_count,urlValue))
                try:
                    response = urllib2.urlopen(urlValue)
                    newURL = response.geturl()
                        
                    if newURL and newURL != urlValue:
                        locElement.firstChild.nodeValue = newURL
                        logger.error("In updateConceptURL: Changed url for (%s), to (%s)" % (urlValue,newURL))
                except urllib2.HTTPError, e:
                    logger.error("In updateConceptURL: Updating url for %s, HTTPError = %s" % (urlValue,str(e.code)))
                except urllib2.URLError, e:
                    logger.error("In updateConceptURL: Updating url for %s, URLError = %s" % (urlValue, str(e.reason)))
                except Exception, e:
                    logger.error("In updateConceptURL: Updating url for %s, Error = %s " % (urlValue, str(e)))
                finally:
                    current_item += 1
        if total_count > 0 :
            logger.info(self.docElement.toxml("utf-8"))
            self.saveStaticSiteMapXML()
        logger.info("In updateConceptURL: URL updating finished.")
            
    def saveStaticSiteMapXML(self):
        """
            Write back xml object to file
        """
        try :
            logger.info("In saveStaticSiteMapXML: Save Sitemap started.")            
            f = open(self.staticSiteMapPath, 'w')
            self.docElement.writexml(f,encoding = 'UTF-8')
            f.close()
            logger.info("In saveStaticSiteMapXML: Save Sitemap finished.")
        except Exception, e:
            logger.info("Error writing to xml: %s" % (str(e)))        
            
    def verifyAllURLs(self):
        """
            1. Get all the url's
            2. Check for the response from server
            3. Log the error's in log file
            4. If new url returned from server if different, then log the information to log file
        """
        problem_urls = []
        successful_urls = 0
        failed_urls = 0
        redirect_urls = 0
        non_200_urls = 0
        url_error_urls = 0
        unknown_error_urls = 0
        logger.info("In verifyAllURLs: Verify URLs started.")
        total_count = self.totalURLInStaticSiteMapXML()
        logger.info("In verifyAllURLs: Count of URLs to be verified = %s"% total_count)
        print "In verifyAllURLs: Count of URLs to be verified = %s"% total_count
        current_item = 1
        for url in self.urlElements:
            locElement = url.getElementsByTagName('loc')[0]
            urlValue = locElement.firstChild.nodeValue
            try:
                logger.info("In verifyAllURLs: Verifing url (%s of %s ) for %s" % (current_item,total_count,urlValue))
                print "In verifyAllURLs: Verifing url (%s of %s ) for %s" % (current_item,total_count,urlValue)
                response = requests.get(urlValue, **requests_settings)#urllib2.urlopen(urlValue)
                newURL = response.url#geturl()
               
                #(301 in map(lambda x: x.status_code, r.history))
                if newURL and newURL != urlValue or (301 in map(lambda x: x.status_code, response.history)):
                        logger.info("In verifyAllURLs: Server return different url (%s) for %s" % (newURL,urlValue))
                        print "In verifyAllURLs: Server return different url (%s) for %s" % (newURL,urlValue)
                        redirect_urls += 1
                        problem_urls.append("[301] Redirect: %s"%urlValue)
                if not response.ok:
                    response.raise_for_status()
                else:
                    successful_urls += 1
            except urllib2.HTTPError, e:
                logger.error("In verifyAllURLs: Verifying url for %s, HTTPError = %s" % (urlValue,str(e.code)))
                print "In verifyAllURLs: Verifying url for %s, HTTPError = %s" % (urlValue,str(e.code))
                non_200_urls +=1
            except requests.exceptions.HTTPError, e:
                logger.error("In verifyAllURLs: Verifying url for %s, HTTPError = %s" % (urlValue,str(e)))
                print "In verifyAllURLs: Verifying url for %s, HTTPError = %s" % (urlValue,str(e))
                non_200_urls +=1
            except urllib2.URLError, e:
                logger.error("In verifyAllURLs: Verifying url for %s, URLError = %s" % (urlValue, str(e.reason)))
                print "In verifyAllURLs: Verifying url for %s, URLError = %s" % (urlValue, str(e.reason))
                url_error_urls +=1
            except Exception, e:
                logger.error("In verifyAllURLs: Verifying url for %s, Error = %s " % (urlValue, str(e)))
                print "In verifyAllURLs: Verifying url for %s, Error = %s " % (urlValue, str(e))
                unknown_error_urls +=1
            finally:
                current_item += 1
        failed_urls = redirect_urls + non_200_urls + url_error_urls + unknown_error_urls
        print "\n\n\n================================================\
               \nResults: %s success; %s failures \
               \nFailures: %s redirects; %s non 200 status; %s url error; %s exceptions \
               \n%s total urls \
               \n================================================\n\n" %(successful_urls,failed_urls,redirect_urls,non_200_urls,url_error_urls,unknown_error_urls,total_count)


def main (argv=None):
    if argv is None:
        argv = sys.argv[:1]
    parser = argparse.ArgumentParser(description="Script to update and validate static_sitemap.xml url's")
    parser.add_argument('-i','--input_sitemap_xml_path', metavar='<PATH>', dest='static_sitemap_xml_path', 
                        default='/opt/2.0/flxweb/flxweb/templates/sitemap/static_sitemap.xml', 
                        help="Location of static_sitemap.xml file")
    args  = parser.parse_args()
  
    static_sitemap_xml_path = args.static_sitemap_xml_path
    is_dir = False
    if not os.path.exists(static_sitemap_xml_path):
        print "In main: Invalid input path: %s" % static_sitemap_xml_path
        logger.error("In main: Invalid input path: %s" % static_sitemap_xml_path)
        sys.exit(0)
    if os.path.isdir(static_sitemap_xml_path):
        is_dir = True
    try:
        staticSiteMapXMLParser = StaticSiteMapXMLParser(static_sitemap_xml_path, is_dir=is_dir)
        while True:
            print "1. Modify Concept Url's"
            print "2. Verify the sitemap"
            print "3. Exit"
            input_var = input("Enter Option: ")
            if input_var == 1:
                staticSiteMapXMLParser.updateConceptURL()
            elif input_var == 2:
                if is_dir:
                    xml_files = [ os.path.join(static_sitemap_xml_path,f) for f in os.listdir(static_sitemap_xml_path) if os.path.isfile(os.path.join(static_sitemap_xml_path,f))]
                    for _file in xml_files:
                        staticSiteMapXMLParser.setStaticSiteMapPath(_file)
                        staticSiteMapXMLParser.loadStaticSiteMapXML(is_dir=False)
                        staticSiteMapXMLParser.verifyAllURLs()
                else:
                    staticSiteMapXMLParser.verifyAllURLs()
            elif input_var == 3:
                break
    except Exception, ex:
            print ex
            logger.error("In main: %s " % ex.message)

if __name__ == "__main__":
    main()
