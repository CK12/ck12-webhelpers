import re
from flx.model import model, meta, api
from flx.controllers.common import ArtifactCache
# select * from Artifacts where handle regexp '\\.[\\.]+' limit 1;

# update  Artifacts set handle = CONCAT(replace(handle, '...', '.'), '-1') 
#    where id in (1825530, 1825531, 1825532, 1825533, 1825535, 1825536, 1825537, 2009109, 2064230, 2064232, 2064264, 2064686, 2064688, 2064937, 2064939, 2064975, 2065589, 2065593, 2065595, 2065627, 2065642, 2115558, 2138287, 2138288, 2138289, 2138290, 2138291, 2138292, 2138293, 2138294, 2138295, 2138296, 2328625, 2364332, 2514564, 2524976, 2607110, 2629483) and handle like '%...%';

# update  Artifacts set handle = CONCAT(replace(handle, '..', '.'), '-1') 
#    where id in (1825530, 1825531, 1825532, 1825533, 1825535, 1825536, 1825537, 2009109, 2064230, 2064232, 2064264, 2064686, 2064688, 2064937, 2064939, 2064975, 2065589, 2065593, 2065595, 2065627, 2065642, 2115558, 2138287, 2138288, 2138289, 2138290, 2138291, 2138292, 2138293, 2138294, 2138295, 2138296, 2328625, 2364332, 2514564, 2524976, 2607110, 2629483) and handle like '%..%';

def run(commit=False):
    session = meta.Session()
    session.begin()
    query = session.query(model.Artifact)
    query = query.filter(model.Artifact.handle.op('regexp')(r'\.[\.]+'))
    rows = query.all()
    session.commit()
    total = len(rows)
    cnt = 0
    errors = []
    ahErrors = []
    ids = []
    for r in rows:
        session = meta.Session()
        session.begin()
        cnt += 1
        id = r.id
        ids.append(id)
        oldhandle = r.handle
        handle = re.sub(r'\.(\.+)', '.', oldhandle)
        print "Updating: [%d/%d]: %d, [%s] to [%s]" % (cnt, total, r.id, oldhandle, handle)
        r.handle = handle
        session.add(r)
        data = {
            'artifactID': id,
            'handle': oldhandle,
            'artifactTypeID': r.artifactTypeID,
            'creatorID': r.creatorID
        }
        ah = model.ArtifactHandle(**data)
        try:
            session.flush()
            if commit:
                session.commit()
            else:
                session.rollback()
        except Exception, e:
            print "Could not update handle: %d [%s]" % (id, str(e))
            errors.append(id)
            session.rollback()

        session = meta.Session()
        session.begin()
        session.add(ah)
        try:
            session.flush()
            if commit:
                session.commit()
            else:
                session.rollback()
        except Exception, e:
            print "Could not add ArtifactHandle: %d [%s]" % (id, str(e))
            ahErrors.append(id)
            session.rollback()

    print len(errors), errors
    print len(ahErrors), ahErrors

    if commit:
        for id in ids:
            artifact = api.getArtifactByID(id=id)
            api.invalidateArtifact(ArtifactCache(), artifact)
        ArtifactCache().load(artifact.id)
