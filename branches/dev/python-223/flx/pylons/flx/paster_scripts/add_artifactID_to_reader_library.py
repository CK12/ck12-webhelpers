from flx.model import api
from flx.model.mongo import getDB as getMongoDB
from flx.model.userdata.appuserdata import UserData

from pylons import config


def run(memberIDs=[]):
    updated = 0
    failed = 0
    db = getMongoDB(config)
    allData = UserData(db).getUserDataForAllUsers(appName='reader_library')
    print "Processing %d users" % len(allData)
    for data in allData:
        try:
            update = False
            memberID = data.get('memberID', -1)
            if memberIDs and not memberID in memberIDs:
                continue
            print "Processing memberID: [%d]" % memberID
            #for key in ['contents', 'lastRead']:
            for key in ['contents']:
                for a in data.get('userdata', {}).get(key, []):
                    try:
                        if a.has_key('artifactRevisionID') and not a.has_key('artifactID'):
                            ar = api.getArtifactRevisionByID(id=a['artifactRevisionID'])
                            if not ar:
                                raise Exception("Cannot find artifactRevision by id: %s" % a['artifactRevisionID'])
                            a[u'artifactID'] = ar.artifactID
                            update = True
                    except Exception, e:
                        print e
                        failed += 1
            if update:
                print "Going to update: %s" % str(data)
                UserData(db).saveUserData(**data)
                updated += 1
        except Exception, ee:
            print ee

    print "Updated: %d, Failed: %d" % (updated, failed)
