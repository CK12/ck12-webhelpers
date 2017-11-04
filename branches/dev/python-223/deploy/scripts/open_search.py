#!/usr/bin/python2.7
from xml.etree import ElementTree as et
import ConfigParser, os
import sys

baseDir= sys.argv[1]
configFile = os.path.join(baseDir, 'flxweb/development.ini')
openSearchXMLFile = os.path.join(baseDir, 'flxweb/flxweb/public/opensearch.xml')

config = ConfigParser.ConfigParser()

et.register_namespace('', 'http://a9.com/-/spec/opensearch/1.1/')
et.register_namespace('moz', 'http://www.mozilla.org/2006/browser/search/')

# getting config from development.ini
try:
    config.readfp(open(configFile))
    host = config.get('app:main','hosts')
except Exception, ex:
    print "could not read contents of %s" % configFile
    raise ex

# Reading and writing URL entries to opensearch.xml file
try:
    tree = et.parse(openSearchXMLFile)
    tree.find('{http://a9.com/-/spec/opensearch/1.1/}Url[@method="GET"]').set('template', 'https://' + host + '/search/?q={searchTerms}&referrer=opensearch')
    tree.find('{http://a9.com/-/spec/opensearch/1.1/}Image').text = 'https://' + host + '/favicon.ico'
    tree.find('{http://www.mozilla.org/2006/browser/search/}SearchForm').text = 'https://' + host + '/search/'
    tree.write(openSearchXMLFile, encoding='utf-8', xml_declaration=True)
except Exception, ex:
    print "could not read contents of %s" % openSearchXMLFile
    raise ex
