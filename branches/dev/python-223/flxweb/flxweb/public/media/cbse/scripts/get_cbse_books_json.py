import os, json, urllib2, sys, re

def  read_url(url):
    req = urllib2.urlopen(url)
    data = req.read()
    j = json.loads(data)
    if j['responseHeader']['status'] != 0:
        raise Exception("Error in API response: %s" % j)
    return j['response']['artifact']

BOOK_ARTIFACTS = [
    "2428833", "2429476", "2425453", "2423954",
    "2425838", "2427138", "2427323", "2427288",
    "2428497", "2428579", "2429861", "2428694",
    "2414018", "2429045", "2429622", "2430441"
    ]

mydir = os.path.dirname(sys.argv[0])
hostname = sys.argv[1] if len(sys.argv) > 1 else None
artifacts = sys.argv[2].split(',') if len(sys.argv) > 2 else BOOK_ARTIFACTS

if not hostname:
    print "Usage: %s <hostname> [<artifacts>]" % (sys.argv[0])
    sys.exit(1)


print "Processing artifacts: %s" % str(artifacts)

booksjson = os.path.join(mydir, "..", "js/json")
artifactList = {'Maths':[],
                'Biology':[],
                'Physics':[],
                'Chemistry':[]
                }

for artifactID in artifacts:
    print "Fetching cbse json for %s ..." % (artifactID)
    url = "http://%s/flx/get/info/artifact/%s?nocache=true&format=json" % (hostname, artifactID)
    print "Reading %s" % url
    artifactData = read_url(url)
    #pick only required attributes
    artifactData = dict( (k, artifactData[k]) for k in ['perma','title','handle','coverImage'] )
    #use correct size for cover image (THUMB_LARGE)
    artifactData['coverImage'] = artifactData['coverImage'].replace('/flx/show','/flx/show/THUMB_LARGE')
    if "Maths" in artifactData['title']:
        artifactList['Maths'].append(artifactData)
    elif "Biology" in artifactData['title']:
        artifactList['Biology'].append(artifactData)
    elif "Chemistry" in artifactData['title']:
        artifactList['Chemistry'].append(artifactData)
    elif "Physics" in artifactData['title']:
        artifactList['Physics'].append(artifactData)
f = open(os.path.join(booksjson, "cbse_books.json"), "w")
f.write(json.dumps(artifactList, indent=4))
f.close()
print "Wrote: %s" % os.path.abspath(f.name)
