#!/usr/bin/env python

import os, json, urllib2, sys

def  read_url(url):
    req = urllib2.urlopen(url)
    data = req.read()
    j = json.loads(data)
    if j['responseHeader']['status'] != 0:
        raise Exception("Error in API response: %s" % j)
    return j

site_map_str = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
"""
siteMapSnippet = """
    <url>
        <loc>@@LOCATION@@</loc>
        <image:image>
            <image:loc>@@IMG_LOCATION@@</image:loc>
        </image:image>
        <lastmod>@@LAST_MOD@@</lastmod>
        <changefreq>monthly</changefreq>
    </url>"""
siteMapAddedCnt = 0

def add_to_sitemap(modalityData):
    global site_map_str, siteMapSnippet, siteMapAddedCnt
    ## Add to sitemap
    for modality in modalityData['response']['%s.' % brn]:
        try:
            modalityUrl = "https://%s/%s/%s/%s/%s/" % (hostname, modality['domain']['branchInfo']['handle'].lower(), modality['domain']['handle'], modality['artifactType'], modality['handle'])
            snippet = siteMapSnippet.replace("@@LOCATION@@", modalityUrl)
            snippet = snippet.replace("@@LAST_MOD@@", modality['modified'].split('T', 1)[0])
            if modality.get('coverImage'):
                snippet = snippet.replace("@@IMG_LOCATION@@", "https://%s%s" % (hostname, modality['coverImage']))
            else:
                print "!!! WARNING: No cover image for %s" % modalityUrl
            site_map_str += snippet
            siteMapAddedCnt += 1
        except Exception, e:
            print "Error appending to site map[%s]" % e

ALL_BRANCHES = [
    "MAT.ALG", "MAT.GEO", 
    "SCI.ESC", "SCI.BIO", "SCI.PHY"
    ]
mydir = os.path.dirname(sys.argv[0])
hostname = sys.argv[1] if len(sys.argv) > 1 else None
branches = sys.argv[2].split(',') if len(sys.argv) > 2 else ALL_BRANCHES

if not hostname:
    print "Usage: %s <hostname> [<branches>]" % (sys.argv[0])
    sys.exit(1)


print "Processing branches: %s" % str(branches)
modalityCount = 0
#stdjson = os.path.join(mydir, "..", "json", "standards", "ALL.json")
#if os.path.exists(stdjson):
#    os.remove(stdjson)

sitemapxml = os.path.join(mydir, "..", "sitemap.xml")

brnjson = os.path.join(mydir, "..", "json")
allstds = {}
for brn in branches:
    print "Fetching Study Guides for %s ..." % (brn)
    url = "https://%s/flx/browse/minimal/studyguide/%s.?format=json&termAsPrefix=true&ck12only=true&pageSize=5000&termTypes=domainIDs" % (hostname, brn)
    print "Reading %s" % url
    modalityData = read_url(url)
    print "Total Study Guides for %s: [%s]" % (brn, modalityData['response']['total'])
    modalityCount += modalityData['response']['total']

    add_to_sitemap(modalityData)

    """
    ## No need to save jsons for browse or standards - we are using CDN APIs to fetch them
    orig_json = os.path.join(brnjson, "%s.json.orig" % brn)
    if os.path.exists(orig_json):
        os.remove(orig_json)
    f = open(os.path.join(brnjson, "%s.json" % brn), "w")
    f.write(json.dumps(modalityData))
    f.close()
    print "Wrote: %s" % os.path.abspath(f.name)

    print "Fetching standards json for %s ..." % brn
    if brn.startswith('MAT.'):
        set="CCSS"
    else:
        set="NGSS"

    url = "https://%s/flx/get/branch/standards?set=%s&branch=%s&format=json&nocache=true" % (hostname, set, brn)
    print "Reading %s" % url 
    stdData = read_url(url)
    if not allstds:
        allstds = stdData
    else:
        allstds['response']['concepts'].update(stdData['response']['concepts'])
        allstds['response']['standards'].update(stdData['response']['standards'])
    """


## Write standards
#orig_json = os.path.join("%s.orig" % stdjson)
#if os.path.exists(orig_json):
#    os.remove(orig_json)
#f = open(stdjson, "w")
#f.write(json.dumps(allstds))
#f.close()

## Write SiteMap
site_map_str += "\n</urlset>"
f = open(sitemapxml, "w")
f.write(site_map_str)
f.close()
print "Wrote [%d] urls to sitemap: [%s]" % (siteMapAddedCnt, sitemapxml)

#print "Standards: %s, Concepts: %s" % (len(allstds['response']['standards'].keys()), len(allstds['response']['concepts'].keys()))
#print "Wrote: %s" % os.path.abspath(stdjson)
print "Total Study Guides: %s" % modalityCount


