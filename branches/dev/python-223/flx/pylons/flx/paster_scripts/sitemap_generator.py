
"""
    This file is use to generate Sitemap with considering url's for branch,concepts,modalitites,books
    we need to execute run method with passing arguments are Branch EID, ChangeFreqDef,Priority,OutputFilename
"""
import os
import datetime
import time
import logging
from flx.lib.remoteapi import RemoteAPI
from flx.model import api
from flx.model import meta
import requests

remoteapi = RemoteAPI()
SERVER_URL = "https://www.ck12.org"
TAXONOMY_SERVER = SERVER_URL + "/taxonomy"
FILEPATH = "/opt/2.0/flxweb/flxweb/public/sitemaps/"
CONCEPT_API = "/get/info/concepts/%s/%s"

LOG_FILENAME = "/tmp/sitemap_generator.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

UPUB_LOG_FILENAME = "/tmp/sitemap_generator_unpublished.log"
publog = logging.getLogger('sitemapgenunpublished')
publog.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(UPUB_LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
publog.addHandler(handler)

SITEMAP_HEADER    = \
                  '<?xml version="1.0" encoding="UTF-8"?>\n'\
                  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
SITEMAP_FOOTER     = '</urlset>\n'
Template_Tag = """
<url>
    <loc>%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>%s</priority>
</url>\n"""
Comment_Tag = """<!-- %s  --> \n"""
Result = """
*** Summary for %s ***
Concepts :   (Success= %s, Failed= %s, Total= %s , Success with 0 modality = %s)
Modalities : (Success= %s, Failed= %s, Total= %s)
Books :      (Success= %s, Failed= %s, Total= %s)
Total URLS: %s
Total Broken URLS: %s
Broken URLS: %s
Total time taken : %s
*** End Summary ***
         """
# Modality types that should get their own xml file.
# {modality_name : file_name}
SEPARATE_MODALITIES = {'flexbook': 'flexbooks',
                        'read': 'reads',
                        'video': 'videos',
                        'practice': 'practice',
                        'concept': 'concepts',
                        'modality': 'modalities'}
# Get a common  group name for atifact types. i.e read vs lesson
# For our purpose they are the same and labled as read
ALT_TYPE_NAMES = {'read': 'read', 'lesson':'read', 'practice': 'practice', 'asmtpractice':'practice', 'enrichment': 'video', 'lecture':'video'}
# Exlcude any modality types here. Plix was removed because there is a separate sitemap for it.
# You should also remove it from ALT_TYPE_NAMES and SEPARATE_MODALITIES
# Note: from:thejaswi@ck12.org to:team@ck12.org ancillary
# Some ancillary modality types where removed 5.19.2016
# web links, pre read, while read, post read, prepost read, ILOS, flashcards
EXCLUDE_MODALITY_TYPES = ['plix','web','preread','prereadans','whileread','whilereadans','postread','postreadans','prepostread','prepostreadans','exerciseint', 'flashcard']

# Book type names i.e book, tebook, workbook
# The type names used here determine what books are returned.
# At the very least 'book' should be here
BOOK_TYPE_NAMES = ['book','tebook','workbook']

# Some FlexBooks are used across mupltiple subjects.
# We only need the url once. Store book urls in a list to check
USED_BOOK_URLS = []

# Assesment url prefix assessment/ui/?test/detail/practice
ASMT_URL_PREFIX = "assessment/ui/?test/detail/practice"
# Assement browse url prefix assessment/ui/browse/practice
ASMT_BROWSE_URL_PREFIX = "assessment/ui/browse/practice"

def checkURL(url):
    # Do not follow redirects. Timeout after x seconds
    timeout = 6
    try:
        r = requests.head(url, timeout=timeout)
        if r.ok:
            return True, r.status_code
        if r.status_code in [400,404,500,301]:
            return False, r.status_code
    except requests.exceptions.Timeout:
        return False, "%ssec timeout"%timeout
    except Exception as e:
        return False, "Exception [%s]"%str(e)

def cleanupEmptyFiles(all_filenames, non_empty_filenames):
    clean_filname_list =[]
    if all_filenames and non_empty_filenames:
        for name in all_filenames:
            if name not in non_empty_filenames:
                print "Removing empty file %s"%name
                log.info("Removing empty file %s"%name)
                os.remove(name)
            else:
                clean_filname_list.append(name[name.index("sitemap-"):])

    return clean_filname_list

def getPracticeDetailUrl(branchName, modality_url):
    return "%s/%s/%s/%s&isPageView=true"%(SERVER_URL,ASMT_URL_PREFIX,branchName,modality_url)


def run(BranchEID=None,otherBranchName=None,ChangeFreqDef="monthly",Priority=0.8,OutputFileName=None, debug=False, checkURLS=True):
    """
    Create sitemap for Branch BranchEID='MAT.ARI'
    """
    # take parameters
    if not BranchEID and not otherBranchName:
        print "Please provide required parameter, BranchEID or otherBranchName"
        script_execution_message = """
***USAGE***
    Please sequentially pass value of parameters to run method as 
    BranchEID,ChangeFreqDef(Default monthly),Priority(Default 0.8),OutputFileName(Default autocreate)
            """
        print script_execution_message
        return

    #create output filename
    startTime = datetime.datetime.now()
    #create directory if not exist
    try:
        if not os.path.exists(FILEPATH):
            os.makedirs(FILEPATH)
    except Exception:
        raise Exception("Not able to create directory: %s \nPlease create the directory and execute the script again"%(FILEPATH))
        
    data_list = getSiteMapData(BranchEID,otherBranchName, debug=debug, checkURLS=checkURLS)
    summary = data_list['summary']
    log.info("Values are:  %s"%(data_list['values']))
    
    if sum([summary['concepts'][0],summary['modalities'][0],summary['books'][0]])==0:
        log.error("No data found for BranchEID %s"%(data_list['branch']))
        return False
    
    if not OutputFileName:
        #timestr = time.strftime("%Y%m%d-%H%M%S")
        OutputFileName = 'sitemap-' + data_list['branch'].lower().replace(' ','-') +".xml"
        log.info("New Sitemap XML file %s is creating." % (OutputFileName))
    
    OutputFile = FILEPATH + OutputFileName
    OutputFile_prefix = OutputFile[:OutputFile.index(".xml")]
    OutputFile_postfix = OutputFile[OutputFile.index(".xml"):]

    OtherOutputFiles = {}
    OutputFileNames = set([OutputFileName])
    AllOtherFiles = [OutputFileName]

    # create and open file in write mode 
    xmlfile = open(OutputFile, 'wt')
    xmlfile.write(SITEMAP_HEADER)

    for modality, filedesc in SEPARATE_MODALITIES.items():
        filename = "%s_%s%s" %(OutputFile_prefix, filedesc.strip(), OutputFile_postfix)
        modality_xmlfile = open(filename, 'wt')
        modality_xmlfile.write(SITEMAP_HEADER)
        OtherOutputFiles[modality.strip()] = modality_xmlfile  
        AllOtherFiles.append(filename)
  
    for data_dict in data_list['values']:
        target_file = 'default'
        if data_dict.has_key('entry_type'):
            target_file = data_dict['entry_type']
        #print "Target file is:%s"%target_file
        if data_dict.has_key('comment'):
            urlTag = Comment_Tag % (data_dict['comment'])
            xmlfile.write(urlTag.encode('utf8'))
            continue
        urlTag = Template_Tag % (data_dict['loc'],data_dict['lastmod'],ChangeFreqDef,Priority)
        if target_file == 'default' or target_file not in SEPARATE_MODALITIES.keys():
            #print "Writing to default xml"
            xmlfile.write(urlTag.encode('utf8'))
        else:
            #print "Writing to %s xml" %target_file
            OtherOutputFiles[target_file].write(urlTag.encode('utf8'))
            OutputFileNames.add(OtherOutputFiles[target_file].name)
            
    xmlfile.write(SITEMAP_FOOTER)
    for modality_name, _file in OtherOutputFiles.items():
        _file.write(SITEMAP_FOOTER)

    endTime = datetime.datetime.now()
    executionTime = endTime- startTime
    
    message = Result % (data_list['branch'],
                        summary['concepts'][0],summary['concepts'][1],summary['concepts'][2],summary['concepts'][3],
                        summary['modalities'][0],summary['modalities'][1],summary['modalities'][2],
                        summary['books'][0],summary['books'][1],summary['books'][2],
                        summary['total_urls'],
                        summary['total_broken_urls'],
                        summary['broken_urls'],
                        executionTime
                       )
    
    log.info(message)
    print message
    log.info("Sitemap file %s is created." % (OutputFile))
    OutputFileNames = cleanupEmptyFiles(AllOtherFiles, list(OutputFileNames))
    return OutputFileNames
    
    
def getSession():
    if meta.engine is None:
        from sqlalchemy import create_engine, orm, MetaData
    
        meta.engine = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                            autocommit=True,
                            bind=meta.engine)
        meta.meta = MetaData()
        meta.Session = orm.scoped_session(sm)
    session = meta.Session()
    return session

def getSiteMapData(BranchEID,otherBranchName, debug=False, checkURLS=True):
    """
    fetching data for loc and lastmod from API and create list with dictionary
    values = [{'loc':loc,'lastmod':lastmod}]
    summary = { 'concepts':[success,failed,total,success_with_zeromodalities],
                'modalities':[success,failed,total],
                'books':[success,failed,total]}
    """
    
    summary = {'concepts':[0,0,0,0],'modalities':[0,0,0],'books':[0,0,0],'total_urls':0,'total_broken_urls':0,'broken_urls':[]}
    values = []
    conceptNodes =[]
    concept_api = False
    
    session = getSession()
    branchName = otherBranchName and otherBranchName[1]
    if BranchEID:
        branchName = BranchEID
        try:    
            concept_api = CONCEPT_API % tuple(BranchEID.split('.'))
            log.info("concept_api:: %s." % (concept_api))
            
            if concept_api:
                response = remoteapi._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':1000}, method='GET')
                conceptNodes = response['response']['conceptNodes']
                if conceptNodes:
                    # Skip soft deleted concecpt nodes from collections updates
                    if conceptNodes[0]['status'] == 'deleted':
                        continue
                    #creating branch url 
                    branchName = ((conceptNodes[0]['branch']['name']).replace('&','&amp;'))
                    BranchURL = SERVER_URL + '/c/'+branchName.lower().replace(' ','-') + '/'
                    log.info("BranchURL:: %s." % (BranchURL))
                    #putting branch url data into list
                    summary['total_urls'] +=1
                    values.append({'comment':'Branch URL starts'})
                    values.append({
                                   'loc':BranchURL,
                                   'lastmod': time.strftime("%Y-%m-%d"),
                                   'entry_type': 'branch'
                                   })
                   
                    values.append({'comment':'Concept URL starts'})
                    # Felix
                    #passed, status_code = checkURL(BranchURL)
                    
        except Exception as e:
            log.error('Unable to get concept api,Please check Branch EID, Exception:%s' % (str(e)))
            
        try:
            
            modality_values = []
            #flexbooks_values = []
            #read_values = []
            #practice_values = []
            #video_values = []
            #sims_values = []
            #plix_values = []
            
            conceptHandleERR = 'not getting concept'
            modalityHandleERR = 'not getting modality'
            #creating concept and modality urls
            newArtifactTypesDict = api._getArtifactTypesDictByID(session)
            for conceptRec in conceptNodes:
                if conceptRec.has_key('handle'):
                    conceptHandleERR = conceptRec['handle']
                    eid = conceptRec['encodedID']
                    btypes = api._getBrowseTermTypes(session)
                    domain = api._getBrowseTermByEncodedID(session,encodedID=eid)
                    if not domain:
                        domain = api._getBrowseTermByHandle(session,handle=eid, typeID=btypes['domain'])
                    if not domain:
                        summary['concepts'][1] += 1
                        continue
    #                        raise Exception('No such concept node by EID or handle: %s' % eid)
    
                    try:
                        modalities = api._getRelatedArtifactsForDomains(session,domainIDs=[domain.id], ownedBy='ck12')
                        if len(modalities)>0:
                            #putting concept url data into list
                            conceptLastmod = conceptRec['updated']
                            if not conceptLastmod:
                                conceptLastmod = conceptRec['created']
                            conceptHandle = (conceptRec['handle']).replace('&','&amp;')
                            summary['total_urls'] +=1
                            values.append({
                               'loc': BranchURL + conceptHandle +'/',
                               'lastmod': conceptLastmod[:10],
                               'entry_type':'concept'
                               })
                            if checkURLS:
                                passed, status_code = checkURL(BranchURL + conceptHandle +'/')
                                if not passed:
                                    _Url = BranchURL + conceptHandle +'/'
                                    print "Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code)
                                    log.error("Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code))
                                    summary['total_broken_urls'] += 1
                                    summary['broken_urls'].append("[%s]; %s"%(status_code, _Url))
                    
                            
                            #log.info('Concept %s added into count successfully' % (conceptHandle))
                            summary['concepts'][0] += 1
                            
                            for rec in modalities.results:
                                if rec.artifactTypeID in newArtifactTypesDict:
                                    if not rec.publishTime:
                                        print "Modality id[%s] - revisionID [%s] is not published" %(rec.id, rec.artifactRevisionID)
                                        log.error("Modality id[%s] - revisionID [%s] is not published" %(rec.id, rec.artifactRevisionID))
                                        publog.error("Modality id[%s] - revisionID [%s] is not published" %(rec.id, rec.artifactRevisionID))
                                        if not debug:
                                          continue
                                        
                                    #putting modality url data into list
                                    modalityHandleERR = modality_handle = (rec.handle).replace('&','&amp;')
                                    modality_url = newArtifactTypesDict[rec.artifactTypeID].name + '/' + modality_handle +'/'
                                    modality_type = newArtifactTypesDict[rec.artifactTypeID].name
                                    if modality_type not in EXCLUDE_MODALITY_TYPES:
                                        #Set entry type based on type
                                        entry_type = 'modality'
                                        if ALT_TYPE_NAMES.has_key(modality_type):
                                            # Get a common name like read, video, etc.
                                            entry_type = ALT_TYPE_NAMES[modality_type]

                                        _url = BranchURL + conceptHandle +'/' + modality_url
                                        if entry_type == 'practice':
                                            _url = getPracticeDetailUrl(branchName.lower().replace(' ','-'), modality_handle)
                                        summary['total_urls'] +=1
                                        modality_values.append({
                                                                'loc': _url,
                                                                'lastmod': rec.updateTime.date(),
                                                                'entry_type':entry_type
                                                                })
        
                                        summary['modalities'][0] += 1
                                        if checkURLS:
                                            passed, status_code = checkURL(_url)
                                            if not passed:
                                                print "Modality url [%s] returned a non 200 status of [%s]" %(_url, status_code)
                                                log.error("Modality url [%s] returned a non 200 status of [%s]" %(_url, status_code))
                                                summary['total_broken_urls'] += 1
                                                summary['broken_urls'].append("[%s]; %s"%(status_code, _url))
                                        #log.info('Modality %s added into count successfully' % (modality_handle))
                        else:
                            summary['concepts'][3] += 1
                            
                    except Exception as e:
                        summary['modalities'][1] += 1
                        log.error("Can not fetch details regarding modality '%s', Exception %s"%(modalityHandleERR,str(e)))
            
            values.append({'comment':'Modality URL starts'})                
            values.extend(modality_values)          # appending main list with modality list
                        
        except Exception as e:
            summary['concepts'][1] += 1
            log.error("Can not fetch details regarding concept '%s', Exception %s" % (conceptHandleERR,str(e)))
        
    else:
        #putting branch url data into list
        BranchURL = SERVER_URL + '/'+otherBranchName[0].lower().replace(' ','-') + '/'
        
        summary['total_urls'] +=1
        values.append({'comment':'Branch URL starts'})
        values.append({
                       'loc':BranchURL,
                       'lastmod': time.strftime("%Y-%m-%d")
                       })
                   
    #creating book url 
    try:
        bookHandleERR = 'not getting book'
        term = [branchName]
        typeNames = BOOK_TYPE_NAMES
        data = api.browseArtifacts(term, typeNames,browseAll=True, ck12only=True,idsOnly=True, termTypes=['subjects'],
                                      includeDescendants=False,extendedArtifacts=True)
        #log.info("Data:: %s." % (data))

        values.append({'comment':'Book URL starts'})
        
        artifactIDList = data['artifactList']
        log.info("artifactIDList:: %s." % (artifactIDList))
        
        Artifacts = api._getArtifactsByIDs(session,artifactIDList, pageNum=0, pageSize=0)
        log.info("Book Artifacts:: %s." % (Artifacts))
        if Artifacts:
            for artifact in Artifacts.results:
                #putting book data into list
                if not artifact.revisions[0].publishTime:
                    print "Artifact id[%s] - revisionID [%s] is not published" %(artifact.id, artifact.revisions[0].id)
                    log.error("Artifact id[%s] - revisionID [%s] is not published" %(artifact.id, artifact.revisions[0].id))
                    publog.error("Artifact id[%s] - revisionID [%s] is not published" %(artifact.id, artifact.revisions[0].id))
                    if not debug:
                      continue
                bookHandleERR = book_handle = (artifact.handle).replace('&','&amp;')
                if book_handle in USED_BOOK_URLS:
                    print "Book handle already used: ", book_handle
                    log.info("Book handle [%s] is already used"%book_handle)
                    continue
                # Keep track of book urls, we don't want duplicates
                USED_BOOK_URLS.append(book_handle)
                summary['total_urls'] +=1
                values.append({
                               'loc': SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/',
                               'lastmod': artifact.updateTime.date(),
                               'entry_type': 'flexbook'
                               })
                if checkURLS:
                    passed, status_code = checkURL(SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/')
                    if not passed:
                        _Url = SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/'
                        print "Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code)
                        log.error("Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code))
                        summary['total_broken_urls'] += 1
                        summary['broken_urls'].append("[%s]; %s"%(status_code, _Url))
                #Get chapters
                chapters = artifact.getChildren()
                if chapters:
                    for cn, chapter in enumerate(chapters):
                        if not chapter.revisions[0].publishTime:
                            print "Chapter id[%s] - revisionID [%s] is not published" %(chapter.id, chapter.revisions[0].id)
                            log.error("Chapter id[%s] - revisionID [%s] is not published" %(chapter.id, chapter.revisions[0].id))
                            publog.error("Chapter id[%s] - revisionID [%s] is not published" %(chapter.id, chapter.revisions[0].id))
                            if not debug:
                              continue
                        cn+=1
                        summary['total_urls'] +=1
                        values.append({
                                       'loc': SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/section/%s.0/'%(cn),
                                       'lastmod': chapter.updateTime.date(),
                                       'entry_type': 'flexbook'
                                       })
                        if checkURLS:
                            passed, status_code = checkURL(SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/section/%s.0/'%(cn))
                            if not passed:
                                _Url = SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/section/%s.0/'%(cn)
                                print "Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code)
                                log.error("Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code))
                                summary['total_broken_urls'] += 1
                                summary['broken_urls'].append("[%s]; %s"%(status_code, _Url))
                        sections = chapter.getChildren()
                        if sections:
                            for sn, section in enumerate(sections):
                                if not section.revisions[0].publishTime:
                                    print "Section id[%s] - revisionID [%s] is not published" %(section.id, section.revisions[0].id)
                                    log.error("Chapter id[%s] - revisionID [%s] is not published" %(section.id, section.revisions[0].id))
                                    publog.error("Chapter id[%s] - revisionID [%s] is not published" %(section.id, section.revisions[0].id))
                                    if not debug:
                                      continue
                                sn+=1
                                summary['total_urls'] +=1
                                values.append({
                                               'loc': SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/section/%s.%s/'%(cn,sn),
                                               'lastmod': section.updateTime.date(),
                                               'entry_type': 'flexbook'
                                               })
                                if checkURLS:
                                    passed, status_code = checkURL(SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/section/%s.%s/'%(cn,sn))
                                    if not passed:
                                        _Url = SERVER_URL + '/'+ artifact.type.name +'/' + book_handle +'/section/%s.%s/'%(cn,sn)
                                        print "Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code)
                                        log.error("Modality url [%s] returned a non 200 status of [%s]" %(_Url, status_code))
                                        summary['total_broken_urls'] += 1
                                        summary['broken_urls'].append("[%s]; %s"%(status_code, _Url))

                
                #log.info('Book %s added into count successfully' % (book_handle))
                summary['books'][0] += 1
            
    except Exception as e:
        summary['books'][1] += 1
        log.error("Can not fetch details for book '%s' , Exception:%s" % (bookHandleERR,str(e)))
        
    summary['concepts'][2] = sum(summary['concepts']) - summary['concepts'][3]
    summary['modalities'][2] = sum(summary['modalities'])
    summary['books'][2] = sum(summary['books'])
    
    if otherBranchName:
        branchName = otherBranchName[0]
        
    results = {
               'branch': branchName,
               'values': values,
               'summary': summary
               }
        
    return results
