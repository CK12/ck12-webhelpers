from flx.model import api
from urllib2 import urlopen
from flx.controllers.common import BrowseTermCache, RelatedArtifactCache
import json

concept_info_url = '/taxonomy/get/info/concept/'

def run(eidPrefix, taxonomyHostname):
    taxonomy_server_url = '%s%s' % (taxonomyHostname, concept_info_url)
    terms = api.getDomainTermsByEIDLike(eidLike=eidPrefix)
    total = len(terms)
    count = updated = 0
    for term in terms:
        count += 1
        eid = term.encodedID.upper()
        print "[%d/%d] Processing eid: [%s]" % (count, total, eid)
        url = '%s%s?format=json' % (taxonomy_server_url, eid)
        req = urlopen(url)
        data = req.read()
        if data:
            j = json.loads(data)
            resp = j.get('response', {})
            if resp:
                name = resp['name']
                handle = resp['handle']
                if name != term.name or handle != term.handle:
                    kwargs = {
                            'id': term.id,
                            'handle': handle,
                            'name': name
                            }
                    print "Updating name [%s] => [%s], handle [%s] => [%s]" % (term.name, name, term.handle, handle)
                    api.updateBrowseTerm(**kwargs)
                    print "[%d/%d] Updated browse term with id: [%d]" % (count, total, term.id)
                    api.invalidateBrowseTerm(BrowseTermCache(), term.id)
                    api.invalidateRelatedArtifacts(RelatedArtifactCache(), term.id)
                    updated += 1
                else:
                    print "[%d/%d] Skipped browse term with id: [%d]" % (count, total, term.id)
            else:
                print "Could not get info for [%s]" % eid
        else:
            print "Could not get response for [%s]" % url
    print "Updated [%d] terms." % updated
