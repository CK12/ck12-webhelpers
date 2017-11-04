#!/usr/bin/python -O
# -*- coding: utf-8 -*-

"""
    This script uploads the standards data or correlation data to 
    flx application using the APIs on server specified in SERVER
"""

from MultipartPostHandler import MultipartPostHandler
import urllib2, json, os, sys

SERVER = "http://localhost"
CSV_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "output"))
uploads = {
        'standards': 0,
        'correlations': 0,
        }

def upload(file, type, token):
    global uploads

    opener = urllib2.build_opener(MultipartPostHandler)

    params = {"file" : open(file, "rb") }
    params['submit'] = "Upload"
    params['waitFor'] = 'true'

    urllib2.install_opener(opener)
    if type == 'standards':
        url = "%s/flx/load/stateStandards" % SERVER
        uploads['standards'] += 1
    else:
        url = "%s/flx/load/standardsCorrelation" % SERVER
        uploads['correlations'] += 1
        params['reindex'] = 'true'

    req = urllib2.Request(url, params)
    req.add_header('Cookie', '%s'% str(token))

    #self.log.info("Params: "+ str(req.headers))
    print "Uploading: %s to %s" % (file, url)
    res = urllib2.urlopen(req)
    resource_upload_response = res.read()
    resource_upload_response = json.loads(resource_upload_response)
    print "Status: %d" % resource_upload_response['responseHeader']['status']
    if resource_upload_response['responseHeader']['status'] != 0:
        print "ERROR: unable to upload file"
        print "Response: %s" % resource_upload_response
    else:
        ## Success - but may have some errors
        for msg in resource_upload_response['response']['messages']:
            if 'ERROR' in msg:
                print "%s" % msg
    print "Uploaded: %s" % str(uploads)

def getFiles(dir, prefix, suffix):
    chosenFiles = []
    for root, dirs, files in os.walk(dir):
        for file in files:
            if prefix and not file.startswith('%s' % prefix):
                continue
            if suffix and not file.endswith('%s' % suffix):
                continue
            if not file.startswith('._'):
                filename = os.path.abspath(os.path.join(root, file))
                chosenFiles.append(filename)
    return chosenFiles

def doUploadStandards(subject, token):
    files = getFiles(CSV_DIR, None, '_standards.csv')
    for file in files:
        if subject and '%s' % subject not in os.path.basename(file):
            continue
        upload(file, 'standards', token)

def doUploadCorrelations(subject, token):
    files = getFiles(CSV_DIR, 'CK_', '.csv')
    for file in files:
        if subject and '%s' % subject not in os.path.basename(file):
            continue
        upload(file, 'correlations', token)

def usage():
    print "Usage: %s <server> <subject> <type> <token>" % __file__
    print "   where "
    print "         server is the base url to flx core server (eg: 'http://prime.ck12.org')"
    print "         subject is a short subject name like 'ALG', 'BIO', 'CHEM', etc. OR 'all' for all subjects"
    print "         type can be "
    print "              'standards' to upload only standards data"
    print "              'correlations' to upload only correlations data"
    print "              'both' to upload both"
    print "         token is the auth token taken from the logged in user's cookie (auth) in form 'cookieName=value'"

if __name__ == '__main__':

    uploadStandards = False
    uploadCorrelations = False
    cnt = 0
    if len(sys.argv) < 5:
        usage()
        sys.exit(1)

    server = sys.argv[1]
    SERVER = server

    subject = sys.argv[2]
    if subject == 'all':
        subject = None

    type = sys.argv[3]
    if type == 'standards':
        uploadStandards = True
    elif type == 'correlations':
        uploadCorrelations = True
    elif type == 'both':
        uploadStandards = True
        uploadCorrelations = True

    token = sys.argv[4]

    if uploadStandards:
        doUploadStandards(subject, token)
    if uploadCorrelations:
        doUploadCorrelations(subject, token)

    if not uploadStandards and not uploadCorrelations:
        print "Nothing to do"
        print "Please specify one or both of 'standards' and 'correlations' as arguments!"

