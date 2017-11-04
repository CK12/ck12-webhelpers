from flx.model import api
from flx.controllers.common import BrowseTermCache
from flx.lib.unicode_util import UnicodeWriter

ARTIFACT_TYPES = [
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

def run(subject='mat'):
    artifactTypesDict = {}
    artifctTypes = api.getArtifactTypes()
    for at in artifctTypes:
        if at.modality:
            artifactTypesDict[at.name] = at.asDict()

    outputFile = open('/tmp/modality_counts_%s.csv' % subject, 'w')
    writer = UnicodeWriter(outputFile)
    header = ['encodedID', 'name']

    domainType = api.getBrowseTermTypeByName(name="domain")
    domainTerms = api.getBrowseTerms(termType=domainType)
    domainEIDs = {}
    for t in domainTerms:
        if t and t.encodedID and t.encodedID.count('.') > 1 and t.encodedID.lower().startswith(subject):
            domainEIDs[t.encodedID.upper()] = t.asDict()

    print "Domain terms: %s" % len(domainEIDs.keys())

    sortedTypes = sorted(artifactTypesDict.keys())
    for displayType, atype in ARTIFACT_TYPES:
        header.append(atype + " (CK-12)")
        header.append(atype + " (Community)")
    writer.writerow(header)

    typeCounts = {}
    for k in sorted(domainEIDs.keys()):
        typeCounts[k] = {}
        row = [k, domainEIDs[k]['name']]
        for atname in sortedTypes:
            typeCounts[k][atname] = { 'ck12ModalityCount': 0, 'communityModalityCount': 0 }
        bt = BrowseTermCache().load(domainEIDs[k]['id'], memberID=None, level=None, prePost=None, ck12only=True)
        for countK in ['ck12ModalityCount', 'communityModalityCount']:
            if bt.get(countK):
                for tk in bt[countK].keys():
                    if bt[countK][tk]:
                        sum = 0
                        for lk in bt[countK][tk].keys():
                            sum += bt[countK][tk][lk]
                    typeCounts[k][tk][countK] = sum

        print bt['ck12ModalityCount']
        print bt['communityModalityCount']
        print typeCounts[k]
        for displayType, atype in ARTIFACT_TYPES:
            row.append(typeCounts[k][atype]['ck12ModalityCount'])
            row.append(typeCounts[k][atype]['communityModalityCount'])
        writer.writerow(row)
        #return

    outputFile.close()
    print "Wrote: %s" % outputFile.name
