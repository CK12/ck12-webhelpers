from flx.model import model, meta, migrated_concepts as mc
from flx.model.mongo.standard  import Standard
from flx.model.mongo import getDB as getMongoDB
from flx.lib import helpers as h
from pylons import config
from sqlalchemy.sql import and_


#>>>from paster_scripts import migrate_standard_alignment
#>>>migrate_standard_alignment.run()
def run():
    ## Get all mappings
    mappings = {}
    mappingDomainIDs = {}
    session = meta.Session()
    query = session.query(model.MigratedConcept)
    for r in query.all():
        if r.originalEID not in mappings:
            mappings[r.originalEID] = []
        mappings[r.originalEID].append(h.getCanonicalEncodedID(r.newEID))

        originalDomain = None
        for eid in [r.originalEID, '%s0' % r.originalEID]:
            originalDomain = session.query(model.BrowseTerm).filter(and_(
                model.BrowseTerm.encodedID == eid,
                model.BrowseTerm.termTypeID == 4)).first()
            if originalDomain:
                if originalDomain.id not in mappingDomainIDs:
                    mappingDomainIDs[originalDomain.id] = []
                    break
            else:
                print "Cannot find: %s. Trying again." % r.originalEID
        if originalDomain:
            newDomain = session.query(model.BrowseTerm).filter(and_(
                model.BrowseTerm.encodedID == r.newEID,
                model.BrowseTerm.termTypeID == 4)).first()
            if newDomain:
                mappingDomainIDs[originalDomain.id].append(newDomain.id)
            else:
                print "Cannot find new: %s" % r.newEID

    total = len(mappings.keys())
    print "Total: %d" % total
    mongodb = getMongoDB(config)
    s = Standard(mongodb)

    stds = s.db.Standards.find({'conceptEids': {'$exists': True}, 'conceptEidsOld': {'$exists': False}})
    for std in stds:
        eids = std['conceptEids']
        s.db.Standards.update({'_id': std['_id']}, {'$set': {'conceptEidsOld': eids}})

    stds = s.db.Standards.find({'conceptEids': {'$exists': True}, 'conceptEidsOld': {'$exists': True}})
    for std in stds:
        eids = std['conceptEidsOld']
        replacementEids = set()
        for eid in eids:
            newEids = mappings.get(eid, [eid])
            if newEids:
                for newEid in newEids:
                    replacementEids.add(newEid)
        print "Replacing %s with %s" % (str(eids), str(list(replacementEids)))
        s.db.Standards.update({'_id': std['_id']}, {'$set': {'conceptEids': list(replacementEids)}})

    ## Make the conceptEids a unique list
    stds = s.db.Standards.find({'conceptEids': {'$exists': True}})
    for std in stds:
        eids = std['conceptEids']
        print "Original list: %d" % len(eids)
        eidsUniq = list(set(eids))
        print "Unique list: %d" % len(eidsUniq)
        s.db.Standards.update({'_id': std['_id']}, {'$set': {'conceptEids': eidsUniq}})

    session = meta.Session()
    session.begin()
    try:
        for origDomainID in mappingDomainIDs.keys():
            if mappingDomainIDs[origDomainID]:
                print "len: %d" % len(mappingDomainIDs[origDomainID])
                newDomainID = mappingDomainIDs[origDomainID][0]
                query = 'UPDATE IGNORE DomainHasStandards SET domainID = %d WHERE domainID = %d' % (newDomainID, origDomainID)
                print "Running %s" % query
                session.execute(query)
        session.commit()
    except Exception, e:
        print str(e)
        session.rollback()
