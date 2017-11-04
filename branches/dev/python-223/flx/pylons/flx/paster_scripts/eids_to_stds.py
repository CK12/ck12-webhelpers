from flx.model import model, meta
from flx.lib.unicode_util import UnicodeWriter

def run():

    session = meta.Session()
    query = session.query(model.BrowseTerm)
    query = query.filter(model.BrowseTerm.termTypeID == 4)
    query = query.filter(model.BrowseTerm.encodedID.like('%%.%%.%%'))
    query = query.order_by(model.BrowseTerm.encodedID)
    rows = query.all()
    eids = []
    for r in rows:
        eids.append((r.encodedID, r.name))

    query = session.query(model.ArtifactDomainAndStandard.boardName).distinct()
    query = query.order_by(model.ArtifactDomainAndStandard.boardName)
    rows = query.all()
    boards = []
    for r in rows:
        boards.append(r.boardName)

    mappings = []
    for eid, eidName in eids:
        query = session.query(model.ArtifactDomainAndStandard)
        query = query.filter(model.ArtifactDomainAndStandard.encodedID == eid)
        query = query.order_by(model.ArtifactDomainAndStandard.boardName, model.ArtifactDomainAndStandard.section)
        rows = query.all()
        mapping = {}
        mappings.append(mapping)
        for r in rows:
            if not mapping.has_key(r.boardName):
                mapping[r.boardName] = {}
            if '_' in r.section:
                section = r.section.split('_')[0]
            else:
                section = r.section
            mapping[r.boardName][section] = section
            
    f = open("/tmp/report.csv", "wb")
    writer = UnicodeWriter(f)
    headers = [ 'EID', 'Name', ]
    headers.extend(boards)
    writer.writerow(headers)
    for i in range(0, len(eids)):
        mapping = mappings[i]
        row = [eids[i][0], eids[i][1]]
        for bn in boards:
            row.append(','.join(mapping.get(bn, {}).keys()))
        print "Writing row: %s" % row
        writer.writerow(row)
    f.close()
    print "Wrote /tmp/report.csv"

