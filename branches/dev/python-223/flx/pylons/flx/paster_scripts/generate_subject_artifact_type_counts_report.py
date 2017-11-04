import sqlalchemy
import csv

from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy.orm import exc
from flx.model import meta, exceptions

VALID_SUBJECT_IDS = ['MAT', 'SCI', 'ELA']

SUBJECT_CANONICAL_COLLECTION_HANDLES_MAP = {
    'MAT': ['algebra', 'arithmetic', 'geometry', 'trigonometry', 'measurement', 'probability', 'statistics', 'calculus', 'analysis', 'elementary-math-grade-1', 'elementary-math-grade-2', 'elementary-math-grade-3', 'elementary-math-grade-4', 'elementary-math-grade-5'],
    'SCI': ['physics', 'biology', 'chemistry', 'physical-science', 'life-science', 'earth-science'],
    'ELA': ['spelling']
}
CANONICAL_COLLECTIONS_CREATOR_ID = 3

ARTIFACT_TYPES_TO_BE_REPORTED = [
            ('Read', 'lesson'),
            ('Activity', 'activity'),
            ('Attachment', 'attachment'),
            ('Audio', 'audio'),
            ('Critical Thinking', 'cthink'),
            ('Enrichment Video', 'enrichment'),
            ('Lecture Video', 'lecture'),
            ('Interactice Exercise', 'exerciseint'),
            ('Flashcard', 'flashcard'),
            ('Handout', 'handout'),
            ('Image', 'image'),
            ('Interactive Object', 'interactive'),
            ('Lab', 'lab'),
            ('Lab Answer Key', 'labans'),
            ('Lesson Plan', 'lessonplan'),
            ('Lesson Plan Answer Key', 'lessonplanans'),
            ('Lesson Plan (external)', 'lessonplanx'),
            ('PLIX', 'plix'),
            ('Practice', 'asmtpractice'),
            ('Pre-read', 'preread'),
            ('Pre-read Answer Key', 'prereadans'),
            ('Post-read', 'postread'),
            ('Post-read Answer Key', 'postreadans'),
            ('Pre/Post-read', 'prepostread'),
            ('Pre/Post-read Answer Key', 'prepostreadans'),
            ('While-read', 'whileread'),
            ('While-read Answer Key', 'whilereadans'),
            ('Presentation', 'presentation'),
            ('Downloadable Quiz', 'quiz'),
            ('Downloadable Quiz Answer Key', 'quizans'),
            ('Quiz Demo', 'quizdemo'),
            ('Rubric', 'rubric'),
            ('Real-World Application', 'rwa'),
            ('Real-World Application Answer Key', 'rwaans'),
            ('Simulation', 'simulation'),
            ('Study Guide', 'studyguide'),
            ('Web Link', 'web'),
            ('Worksheet', 'worksheet'),
            ('Worksheet Answer Keys', 'worksheetans'),
        ]

CK12_SUFFIX = ' (CK-12)'
COMMUNITY_SUFFIX = ' (Community)'

#Usage: $paster shell
#>>>from paster_scripts import generate_subject_artifact_type_counts_report
#>>>generate_subject_artifact_type_counts_report.run(subjectID='SCI')
def run(subjectID):
    if not subjectID or not isinstance(subjectID, basestring):
        raise Exception(u"Invalid 'subjectID' received. It should be a valid list of string one of "+str(VALID_SUBJECT_IDS))

    startTime = datetime.now()
    subjectCanonicalCollectionHandles = SUBJECT_CANONICAL_COLLECTION_HANDLES_MAP.get(subjectID)

    #ck12EditorID determination - to be used in computing the counts
    ck12EditorLogin = 'ck12editor'
    ck12EditorID  = None
    try:
        ck12EditorID = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == ck12EditorLogin).one()[0]
    except exc.NoResultFound:
        raise exceptions.SystemDataException(u"No member could be found with the ck12EditorLogin : [{ck12EditorLogin}] in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))   
    except exc.MultipleResultsFound:
        raise exceptions.SystemDataException(u"Multiple members are found with the ck12EditorLogin : [{ck12EditorLogin}] in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
    print "Determined ck12EditorID: "+str(ck12EditorID)
    print

    conceptCollectionHandleFilters = [meta.RelatedArtifacts.c.conceptCollectionHandle.like(subjectCanonicalCollectionHandle+"-::-%") for subjectCanonicalCollectionHandle in subjectCanonicalCollectionHandles]
    relatedArtifactInfosCount = meta.Session.query(func.count()).filter(sqlalchemy.or_(*conceptCollectionHandleFilters), meta.RelatedArtifacts.c.collectionCreatorID==CANONICAL_COLLECTIONS_CREATOR_ID).one()[0]
    print "Extracted relatedArtifactInfosCount: "+str(relatedArtifactInfosCount)
    print

    offset = 0
    domainArtifactInfosMap = {}
    while offset < relatedArtifactInfosCount:
        print "Started processing relatedArtifactInfos chunk with start = "+str(offset)+", end = "+str(offset+10000)

        relatedArtifactsSubQuery = meta.Session.query(meta.RelatedArtifacts).filter(sqlalchemy.or_(*conceptCollectionHandleFilters), meta.RelatedArtifacts.c.collectionCreatorID==CANONICAL_COLLECTIONS_CREATOR_ID)
        relatedArtifactsSubQuery = relatedArtifactsSubQuery.order_by(meta.RelatedArtifacts.c.domainID, meta.RelatedArtifacts.c.artifactID, meta.RelatedArtifacts.c.conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID).offset(offset).limit(10000).subquery("relatedArtifactsSubQuery")

        relatedArtifactInfos = meta.Session.query(relatedArtifactsSubQuery.c.domainID, meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.name, relatedArtifactsSubQuery.c.artifactID, meta.Artifacts.c.creatorID, meta.ArtifactTypes.c.name).filter(relatedArtifactsSubQuery.c.domainID == meta.BrowseTerms.c.id, relatedArtifactsSubQuery.c.artifactID == meta.Artifacts.c.id, meta.Artifacts.c.artifactTypeID == meta.ArtifactTypes.c.id).all()
        for relatedArtifactInfo in relatedArtifactInfos:
            domainEncodedID = relatedArtifactInfo[1]
            domainName = relatedArtifactInfo[2]
            artifactID = relatedArtifactInfo[3]
            artifactCreatorID = relatedArtifactInfo[4]
            artifactType = relatedArtifactInfo[5]
            
            #Repetetive code in the below section is intentional as this makes the code more easily understandable instead of looping on [domainEncodedId, '']
            if domainEncodedID not in domainArtifactInfosMap:
                domainArtifactInfosMap[domainEncodedID] = {}
                domainArtifactInfosMap[domainEncodedID]['name'] = domainName
                domainArtifactInfosMap[domainEncodedID]['artifactInfos'] = {}

            if '' not in domainArtifactInfosMap:
                domainArtifactInfosMap[''] = {}
                domainArtifactInfosMap['']['name'] = 'Total'
                domainArtifactInfosMap['']['artifactInfos'] = {}

            if artifactType not in domainArtifactInfosMap[domainEncodedID]['artifactInfos']:
                domainArtifactInfosMap[domainEncodedID]['artifactInfos'][artifactType] = {}
                domainArtifactInfosMap[domainEncodedID]['artifactInfos'][artifactType]['ck12Owned'] = set()
                domainArtifactInfosMap[domainEncodedID]['artifactInfos'][artifactType]['communityOwned'] = set()
            
            if artifactType not in domainArtifactInfosMap['']['artifactInfos']:
                domainArtifactInfosMap['']['artifactInfos'][artifactType] = {}
                domainArtifactInfosMap['']['artifactInfos'][artifactType]['ck12Owned'] = set()
                domainArtifactInfosMap['']['artifactInfos'][artifactType]['communityOwned'] = set()
            
            if artifactCreatorID == ck12EditorID:
                domainArtifactInfosMap[domainEncodedID]['artifactInfos'][artifactType]['ck12Owned'].add(artifactID)
                domainArtifactInfosMap['']['artifactInfos'][artifactType]['ck12Owned'].add(artifactID)
            else:
                domainArtifactInfosMap[domainEncodedID]['artifactInfos'][artifactType]['communityOwned'].add(artifactID)
                domainArtifactInfosMap['']['artifactInfos'][artifactType]['communityOwned'].add(artifactID)

        print "Completed processing relatedArtifactInfos chunk with start = "+str(offset)+", end = "+str(offset+10000)
        print 
        offset += 10000

    #Now prepare the file and write the report      
    print "Processed relatedArtifactInfos and prepared the domainArtifactInfosMap. Will generate the report now."
    print 

    #Though we extracted & computed the countss for all artifactTypes (with out any filtering), we'll generate the report only for the ARTIFACT_TYPES_TO_BE_REPORTED
    #File Initation & Headers row
    subjectArtifactTypeCountsReportCsvFilePath = '/tmp/'+subjectID+'-artifactTypeCounts.csv'
    subjectArtifactTypeCountsReportCsvFile = open(subjectArtifactTypeCountsReportCsvFilePath, 'w') 
    subjectArtifactTypeCountsReportCsvFileWriter = csv.writer(subjectArtifactTypeCountsReportCsvFile, delimiter=',', quotechar='"')
    subjectArtifactTypeCountsReportHeaderRow = ['EncodedID', 'Name']
    for ARTIFACT_TYPE_TO_BE_REPORTED in ARTIFACT_TYPES_TO_BE_REPORTED:
        ARTIFACT_TYPE_TO_BE_REPORTED_DISPLAY_NAME = ARTIFACT_TYPE_TO_BE_REPORTED[0]
        subjectArtifactTypeCountsReportHeaderRow.extend([ARTIFACT_TYPE_TO_BE_REPORTED_DISPLAY_NAME + CK12_SUFFIX, ARTIFACT_TYPE_TO_BE_REPORTED_DISPLAY_NAME + COMMUNITY_SUFFIX, ARTIFACT_TYPE_TO_BE_REPORTED_DISPLAY_NAME])
    subjectArtifactTypeCountsReportHeaderRow.extend(['Total' + CK12_SUFFIX, 'Total' + COMMUNITY_SUFFIX, 'Total'])
    subjectArtifactTypeCountsReportCsvFileWriter.writerow(subjectArtifactTypeCountsReportHeaderRow)

    #Actual Data Rows
    for encodedID in sorted(domainArtifactInfosMap):
        subjectArtifactTypeCountsReportRow = []
        encodedIDInfo = domainArtifactInfosMap[encodedID]
        encodedIDName = encodedIDInfo['name']
        encodedIDArtifactInfos = encodedIDInfo['artifactInfos']
        encodedIDTotalCK12OwnedCount = 0
        encodedIDTotalCommunityOwnedCount = 0            
        subjectArtifactTypeCountsReportRow.extend([encodedID, encodedIDName])
        
        for ARTIFACT_TYPE_TO_BE_REPORTED in ARTIFACT_TYPES_TO_BE_REPORTED:
            ARTIFACT_TYPE_TO_BE_REPORTED_DISPLAY_NAME = ARTIFACT_TYPE_TO_BE_REPORTED[0]
            ARTIFACT_TYPE_TO_BE_REPORTED_NAME = ARTIFACT_TYPE_TO_BE_REPORTED[1]
            encodedIDArtifactTypeCK12OwnedCount = 0
            encodedIDArtifactTypeCommunityOwnedCount = 0
            if ARTIFACT_TYPE_TO_BE_REPORTED_NAME in encodedIDArtifactInfos:
                encodedIDArtifactTypeCK12OwnedCount = len(encodedIDArtifactInfos[ARTIFACT_TYPE_TO_BE_REPORTED_NAME]['ck12Owned'])
                encodedIDArtifactTypeCommunityOwnedCount = len(encodedIDArtifactInfos[ARTIFACT_TYPE_TO_BE_REPORTED_NAME]['communityOwned'])
                #updating the totalCounts as well
                encodedIDTotalCK12OwnedCount += encodedIDArtifactTypeCK12OwnedCount
                encodedIDTotalCommunityOwnedCount += encodedIDArtifactTypeCommunityOwnedCount
            encodedIDArtifactTypeTotalCount = encodedIDArtifactTypeCK12OwnedCount + encodedIDArtifactTypeCommunityOwnedCount
            subjectArtifactTypeCountsReportRow.extend([encodedIDArtifactTypeCK12OwnedCount, encodedIDArtifactTypeCommunityOwnedCount, encodedIDArtifactTypeTotalCount])
        encodedIDTotalCount = encodedIDTotalCK12OwnedCount + encodedIDTotalCommunityOwnedCount
        subjectArtifactTypeCountsReportRow.extend([encodedIDTotalCK12OwnedCount, encodedIDTotalCommunityOwnedCount, encodedIDTotalCount])
        subjectArtifactTypeCountsReportCsvFileWriter.writerow(subjectArtifactTypeCountsReportRow)
    
    #Close the file
    subjectArtifactTypeCountsReportCsvFile.close()

    print "Successfully generated the report at: "+subjectArtifactTypeCountsReportCsvFilePath

    endTime = datetime.now()
    timeTaken = endTime - startTime
    print
    print "Total Time Taken: "+str(timeTaken.seconds)+" seconds."
    print "Total Time Taken: "+str(timeTaken.seconds/60)+" minutes, "+str(timeTaken.seconds%60)+" seconds."