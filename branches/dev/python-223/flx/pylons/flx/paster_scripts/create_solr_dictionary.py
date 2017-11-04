import re
import codecs
import os, shutil
import urllib2

from flx.model import api

solr_speller_reload_url = "http://localhost:8080/solr/select?q=sid:zzz&spellcheck=true&spellcheck.reload=true"

def run(filepath='/tmp/spellings.txt', solr_spellings_path='/opt/2.0/flx/search/solr/conf/spellings.txt', copyFile=False):
    words = {}

    typesDict = api.getBrowseTermTypesDict()
    btTypes = [ 'state', 'grade level', 'subject', 'domain', 'level', 'search' ]
    for btType in btTypes:
        terms = api.getBrowseTermsByType(termTypeID=typesDict[btType].id)
        for term in terms:
            word = term.name
            word = word.lower()
            for w in word.split():
                w = w.strip()
                if w:
                    w = re.sub('[^A-Za-z0-9-]*', '', w)
                    w = re.sub('^[0-9 -]*$', '', w)
                    if len(w) <= 2:
                        continue
                    if w.endswith('--'):
                        continue
                    if not words.has_key(w):
                        words[w] = True
    wordlist = sorted(words.keys())
    f = codecs.open(filepath, "w", "utf-8")
    for word in wordlist:
        f.write("%s\n" % word)
    f.close()
    print "Wrote %s" % filepath

    if copyFile:
        if not os.path.exists(filepath): raise Exception("!!! No such file: %s" % filepath)
        if not os.path.getsize(filepath): raise Exception("!!! Zero-size file: %s" % filepath)
        #if not os.path.exists(solr_spellings_path): raise "!!! No such file: %s" % solr_spellings_path

        if not os.path.exists(solr_spellings_path) or os.path.getmtime(filepath) > os.path.getmtime(solr_spellings_path):
            print "%s is newer. Copying to %s ..." % (filepath, solr_spellings_path)
            shutil.copyfile(filepath, solr_spellings_path)
            print "Opening %s" % solr_speller_reload_url
            resp = urllib2.urlopen(solr_speller_reload_url, timeout=30)
            code = resp.getcode()
            if code != 200:
                raise Exception("!!! Error reloading spellchecker: %s" % code)
            print resp.read()

