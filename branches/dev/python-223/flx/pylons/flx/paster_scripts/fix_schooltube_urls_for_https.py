import re
from flx.model import meta, model

def run(commit=False):
    session = meta.Session()
    q = session.query(model.EmbeddedObject)
    q = q.filter(model.EmbeddedObject.code.op('regexp')(r'src="http://www.schooltube.com/embed/[a-f0-9]+"'))
    rows = q.all()
    session = meta.Session()
    session.begin()
    cnt = 0
    total = len(rows)
    for r in rows:
        print "Processing %d, %s" % (r.id, r.code)
        r.code = re.sub(r'^(.*) src="http://www.schooltube.com/embed/([0-9a-f]+)"(.*)$', r'\1 src="https://www.schooltube.com/embed/\2/"\3', r.code, re.MULTILINE)
        r.uri = r.uri.replace('http://', 'https://')
        print "Changed code to [%s]" % r.code
        session.add(r)
        session.flush()
        cnt += 1

    if commit:
        session.commit()
    else:
        session.rollback()
    print "Processed: %d/%d" % (cnt, total)

