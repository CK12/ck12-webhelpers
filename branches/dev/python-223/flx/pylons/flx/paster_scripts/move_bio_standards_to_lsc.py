from flx.model import model, meta
from sqlalchemy.sql import and_
import traceback

def run():
    iqs = 'INSERT INTO DomainHasStandards (domainID, standardID) VALUES (%d, %s)'
    session = meta.Session()
    standardIDs = {}
    bioEids = {}
    for r in session.query(model.BrowseTerm).filter(model.BrowseTerm.encodedID.ilike('SCI.BIO.%')).all():
        bioEids[r.id] = r.encodedID

    print "Found %d biology eids" % len(bioEids.keys())
    pageSize = 256
    pageNum = 1
    while True:
        offset = (pageNum-1)*pageSize
        query = session.query(model.DomainHasStandard)
        query = query.filter(model.DomainHasStandard.domainID.in_(bioEids.keys())).offset(offset).limit(pageSize)
        if not query.all():
            break
        for r in query.all():
            bioEID = bioEids[r.domainID]
            if not standardIDs.has_key(bioEID):
                print "EID: %s" % bioEID
                standardIDs[bioEID] = set()
            standardIDs[bioEID].add(r.standardID)
        pageNum += 1

    totalAsso = 0
    print "Mapped eids: %d" % len(standardIDs.keys())
    for k in standardIDs.keys():
        print "Bio EID[%s], Associations[%d]: %s" % (k, len(standardIDs[k]), str(standardIDs[k]))
        lscEid = k.replace('SCI.BIO', 'SCI.LSC')
        if lscEid:
            asso = 0
            print "Processing %s" % lscEid
            bt = session.query(model.BrowseTerm).filter(model.BrowseTerm.encodedID == lscEid).first()
            if bt:
                try:
                    for sid in standardIDs[k]:
                        q = session.query(model.DomainHasStandard).filter(and_(model.DomainHasStandard.domainID == bt.id, model.DomainHasStandard.standardID == sid)).first()
                        if q:
                            print "Association exists for domain [%s], sid[%s]" % (lscEid, sid)
                            asso += 1
                            continue
                        print "Adding association for domain[%s], sid[%s]" % (lscEid, sid)
                        ret = session.execute(iqs % (bt.id, sid))
                        asso += 1
                        totalAsso += 1
                        #print ret
                except Exception as e:
                    print "Error: %s" % str(e)
                    print traceback.format_exc()
                print "Bio EID[%s], Associations[%d]: %s" % (k, len(standardIDs[k]), str(standardIDs[k]))
                print "LSC EID[%s], Associations[%d]" % (lscEid, asso)
            else:
                print "No such life science EID: %s" % lscEid
    print "Total association added: %d" % totalAsso

