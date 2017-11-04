from paster_scripts import create_solr_dictionary as c
from datetime import datetime
path = '/tmp/spellings.txt'
solr_spellings_path = '/opt/2.0/flx/search/solr/conf/spellings.txt'

print "Now: %s" % str(datetime.now())
c.run(filepath=path, solr_spellings_path=solr_spellings_path, copyFile=True)
print "Now: %s" % str(datetime.now())
