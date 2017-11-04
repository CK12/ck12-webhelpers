import urllib2, json

for brn in ["MAT.EM1", "MAT.EM2", "MAT.EM3", "MAT.EM4", "MAT.EM5", "MAT.ARI", "MAT.MEA", "MAT.ALG", "MAT.GEO", "MAT.TRG", "MAT.STA", "MAT.PRB", "MAT.ALY", "MAT.CAL" ]:
    url = "https://www.ck12.org/taxonomy/get/info/descendants/concepts/%s/1?pageSize=100" % brn
    r = urllib2.urlopen(url)
    dr = r.read()
    jr = json.loads(dr)
    if jr['responseHeader']['status'] == 0:
        for topic in jr['response']['branch']['children']:
            piu = topic['previewIconUrl']
            if not piu or piu == 'None':
                continue
            eid = topic['encodedID']

            print "SELECT id INTO @id FROM BrowseTerms WHERE encodedID='%s';" % eid
            print "UPDATE DomainUrls SET iconUrl = '%s' WHERE domainID = @id;" % piu


