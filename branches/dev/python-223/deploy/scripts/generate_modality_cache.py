import sys
import urllib2, json
import traceback

if len(sys.argv) > 1:
    SERVER_URL = sys.argv[1]
else:
    raise Exception("Please specify a server url. eg. 'http://gamma.ck12.org'")

def getJson(api):
    url = '%s%s' % (SERVER_URL, api)
    req = urllib2.Request(url)
    resp = urllib2.urlopen(req)
    j = json.loads(resp.read())
    if j['responseHeader']['status'] == 0:
        return j
    else:
        raise Exception("API return error status: %s, output: %s" % (j['responseHeader']['status'], j))

subjects = [ 'MAT', 'SCI', 'ENG' ]
for sub in subjects:
    try:
        print("Processing subject %s" % sub)
        subApi = '/taxonomy/get/info/branches/%s?pageSize=100' % sub
        subj = getJson(subApi)
        bcnt = 0
        blen = len(subj['response']['branches'])
        for brn in subj['response']['branches']:
            try:
                bcnt += 1
                print("[%d/%d] Processing branch: %s" % (bcnt, blen, brn['shortname']))
                brnApi = '/taxonomy/get/info/concepts/%s/%s?pageSize=5000' % (sub, brn['shortname'])
                brnj = getJson(brnApi)
                mcnt = 0
                mlen = len(brnj['response']['conceptNodes'])
                for cn in brnj['response']['conceptNodes']:
                    mcnt += 1
                    print("[%d/%d] Fetching modalities for %s" % (mcnt, mlen, cn['encodedID']))
                    try:
                        modalityApi = '/flx/get/minimal/modalities/%s?pageSize=100&pageNum=0&ownedBy=ck12&modalities=&level=' % (cn['encodedID'])
                        mj = getJson(modalityApi)
                        print("Got %d modalities" % mj['response']['limit'])
                    except Exception as me:
                        print("Exception: %s" % str(e))
                        traceback.print_exc()
            except Exception as be:
                print("Exception: %s" % str(be))
                traceback.print_exc()
    except Exception as se:
        print("Exception: %s" % str(se))
        traceback.print_exc()

