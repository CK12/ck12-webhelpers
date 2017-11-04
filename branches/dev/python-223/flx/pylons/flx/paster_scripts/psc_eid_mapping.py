from flx.model import api

def run():
    eids = api.getDomainTermsByEIDLike('SCI.PSC.')
    output = open('/tmp/psc-mapping.csv', 'w')
    prefixes = ['SCI.CHE.', 'SCI.PHY.']
    for eid in eids:
        term = None
        for prefix in prefixes:
            term = api.getDomainTermByName(eid.name, eidPrefix=prefix)
            if term:
                break
        if term:
            output.write('"%s","%s","%s","%s"\n' % (eid.encodedID, eid.name, term.encodedID, term.name))
        else:
            output.write('"%s","%s","",""\n' % (eid.encodedID, eid.name))
    output.close()

