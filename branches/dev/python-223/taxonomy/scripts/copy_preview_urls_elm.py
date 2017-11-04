import urllib2, urllib, json

## Gamma
server = "gamma.ck12.org"
auth = "auth-gamma=<cookie-value>"
sts = "sts=<cookie-value>"

err = cnt = 0
print auth
for i in [1, 2, 3, 4, 5]:
    url = "https://www.ck12.org/taxonomy/get/info/descendants/concepts/MAT.EM%d/1?pageSize=100" % i
    r = urllib2.urlopen(url)
    dr = r.read()
    jr = json.loads(dr)
    if jr['responseHeader']['status'] == 0:
        for topic in jr['response']['branch']['children']:
            try:
                piu = topic['previewImageUrl']
                if piu:
                    cnt += 1
                    piconu = piu.replace("http://concepts.ck12.org/", "https://s3.amazonaws.com/concepts.ck12.org/")
                    if piconu == piu:
                        print "Both urls match. Skipping ..."
                        continue
                    eid = topic['encodedID']
                    print "Processing eid[%s], previewIconUrl[%s]" % (eid, piconu)

                    if True:
                        data = urllib.urlencode( {"id": eid, "previewIconUrl": piconu, "previewImageUrl": piconu })
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
                err += 1

print "Files: %d, Errors: %d" % (cnt, err)
