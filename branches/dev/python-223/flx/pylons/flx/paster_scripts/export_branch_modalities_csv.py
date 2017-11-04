import logging

from flx.model import api
from flx.lib.remoteapi import RemoteAPI
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/export_branch_modalities_csv.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

taxonomy_server = 'http://gamma.ck12.org/taxonomy'
remoteapi = RemoteAPI()
# Artifact Types 
# Read, Video, PLIX, SIM, RWA, Book, Practice
typeIDs = [1,3,13,15,16,53,60,62]
viewStandards = ['US.CCSS','US.NGSS']
altTypeNames = {'rwa':'real world applications', 'read': 'read', 'lesson':'read', 'asmtpractice': 'adaptive practice', 'plix': 'plix interactives', 'enrichment': 'video', 'lecture':'video'}
pageNum = 1
pageSize = 20
noIframe = ['plix','simulations']

def alternateName(name):
    name = name.lower()
    if name in altTypeNames:
        return altTypeNames[name]
    else:
        return name.lower()

def createHandle(branch,cn_handle,artifact_type,handle):
    branch = branch.replace(" ","-")
    return "http://www.ck12.org/%s/%s/%s/%s"%(branch,cn_handle,artifact_type,handle)

def getModalityEmbedURL(branchHandle,conceptHandle,modalityType,modalityHandle):
    embed_template = 'http://www.ck12.org/embed/#module=modality&handle=$modalityHandle$&mtype=$modalityType$&context=$conceptHandle$&branch=$branchHandle$&view_mode=embed'
    url = embed_template.replace("$branchHandle$",branchHandle).replace("$conceptHandle$",conceptHandle).replace("$modalityType$",modalityType).replace("$modalityHandle$", modalityHandle)
    return url

def getIframe(url):
    iframe_template = '<iframe width="550" height="450" frameborder="0" src="$URL$"></iframe>'
    return iframe_template.replace("$URL$", url)

def run(subject, branch):
    outputFile = open ("%s_export_branch_modalities.csv"%branch,'w')
    csvwriter = UnicodeWriter(outputFile)
    #csvwriter.writerow(["Asset ID", "Type", "Thumbnail URL", "Title","Publish Date", "SKU","Length", "Copyright","Publisher","Description","Audiences","Subjects","Keywords","Standards","URL","License"])
    csvwriter.writerow(["Asset ID", "Type", "Concepts Covered", "Thumbnail URL", "Title","Publish Date", "Publisher", "Publisher URL", "Description", "Grades", "Subjects", "Keywords", "Standards", "Iframe","URL (open in full page)", "License", "Langauge"])
    taxonomy_api = '/get/info/concepts/%s/%s' %(subject.lower(), branch.lower())
    data = remoteapi._makeCall(taxonomy_server, taxonomy_api, 500, params_dict={'pageSize':1000}, method='GET')
    concept_nodes = data['response']['conceptNodes']
    total = len(concept_nodes)
    i = 2
    for each_concept_node in concept_nodes:
        encodedID = each_concept_node['encodedID']
        cn_handle = each_concept_node['handle'].lower()
        cn_branch = each_concept_node['branch']['name'].lower()
        cn_name = each_concept_node['name']
        #print 'Processing encodedID: [%s] - [%s/%s]' %(encodedID, i, total)
        log.info('Processing encodedID: [%s] - [%s/%s]' %(encodedID, i, total))
        browse_term = api.getBrowseTermByEncodedID(encodedID=encodedID)
        if not browse_term:
            log.info('\tSkipping encodedID: [%s]' %(encodedID))
            continue
        domainIDs = [browse_term.id]
        artifacts = api.getRelatedArtifactsForDomains(domainIDs, typeIDs=typeIDs, ownedBy='ck12', pageNum=pageNum, pageSize=pageSize)
        if not artifacts:
            log.info('\tNo lessons for encodedID: [%s]' %(encodedID))
            continue
        for each_artifact in artifacts:
            artifactID = each_artifact.id
            artifact = api.getArtifactByID(id=artifactID)
            a_id =  "CK-12_%s" %(each_artifact.id)
            a_type = artifact.type.name.upper()
            a_updateTime = artifact.updateTime.strftime('%x')
            a_thumbnail = ""
            a_thumbnail = artifact.getCoverImageUri()
            if ( a_thumbnail and a_thumbnail.find('http') == -1):
                a_thumbnail = "http://www.ck12.org%s" %(a_thumbnail)
            a_title = artifact.name
            a_desc = artifact.description
            a_url = createHandle(cn_branch,cn_handle,a_type.lower(),artifact.handle)
            embed_url = a_url
            if a_type.lower() not in noIframe:
                embed_url = getModalityEmbedURL(cn_branch.replace(" ","-"), cn_handle, a_type.lower(), artifact.handle)
            a_iframe = getIframe( embed_url)
            grades_list = artifact.getGradeLevelGrid()
            standards = artifact.getStandardGrid()
            a_standards = ""
            a_grades = ""
            if standards:
                for state in viewStandards:
                    if state in standards:
                        a_standards += ", ".join([ x['title'] for x in standards[state]])
            if grades_list:
                a_grades = ", ".join([ str(x[1]) for x in grades_list])
            a_keywords = ", ".join([x.name for x in artifact.tagTerms])
            a_type = alternateName(a_type.lower())
            #print a_id, a_type, a_thumbnail, a_title, a_desc, a_grade, cn_branch, a_standards, a_url
            log.info("%s,%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s" %(a_id, a_type,a_updateTime, a_thumbnail, a_title, a_desc, a_grades, cn_branch, a_keywords, a_standards, a_url, a_iframe))
            csvwriter.writerow([a_id, a_type, cn_name, a_thumbnail, a_title, a_updateTime, "CK-12 Foundation","www.ck12.org", a_desc, a_grades, cn_branch, a_keywords, a_standards, a_iframe, a_url, "CC-BY-NC"])
        i = i + 1
    outputFile.close()

