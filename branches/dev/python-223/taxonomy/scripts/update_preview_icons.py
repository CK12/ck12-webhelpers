import urllib2, urllib
import os, json
import traceback

## Gamma
server = "gamma.ck12.org"
auth = "auth-gamma=0606218acc8d779110440f9a9c2520f857bf569ac9d1e177862e4012b6b544f2ede09e1c"
sts = "sts=bcae5db154a0f5ee6f965c78ba7a221971e5eeef005ee83bedbc473d80a21f164cb6439a"

cnt = 0
err = 0
folderPrefix = 'science/'
print auth
for file in os.listdir("/Users/nimish/Downloads/Science"):
    if file.endswith(".svg"):
        try:
            print "File: [%s]" % file
            cnt += 1
            eid = file.split('_')[1]
            eid = eid.replace(".svg", "")
            url = "https://s3.amazonaws.com/concepts.ck12.org/icons/%s%s" % (folderPrefix, file)
            print "Processing eid[%s], previewIconUrl[%s]" % (eid, url)

            if True:
                data = urllib.urlencode( {"id": eid, "previewIconUrl": url })
                headers = {'Cookie': "%s;%s" % (auth, sts) }
                req = urllib2.Request("http://%s/taxonomy/update/concept" % server, data, headers)
                resp = urllib2.urlopen(req)
                d = resp.read()
                j = json.loads(d)
                if j['responseHeader']['status'] != 0:
                    print "Error: %s" % d 
                    err += 1
                else:
                    print "Updated EID[%s] with previewIconUrl[%s]" % (j['response']['encodedID'], j['response']['previewIconUrl'])
        except Exception, e:
            print "Error: %s" % str(e)
            traceback.print_exc(e)
            err += 1

print "Files: %d, Errors: %d" % (cnt, err)
