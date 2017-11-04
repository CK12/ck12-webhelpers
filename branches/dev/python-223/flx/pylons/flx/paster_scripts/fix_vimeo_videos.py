from flx.model import api

import re, hashlib

clipIDRegex = re.compile(r'.*moogaloop.swf\?clip_id=([0-9]*)\&.*', re.I)

def run():
    pageSize = 20
    pageNum = 1
    changed = 0
    while True:
        eos = api.getEmbeddedObjects(type='vimeo', pageNum=pageNum, pageSize=pageSize)
        if not eos:
            break

        for eo in eos:
            code = eo.code
            m = clipIDRegex.search(code)
            if m:
                videoID = m.group(1)
                embeddable = '<iframe src="http://player.vimeo.com/video/%s?badge=0" width="500" height="281" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' % videoID
                hash = hashlib.md5(embeddable).hexdigest()
                eoUpd = { 'id': eo.id, 'code': embeddable, 'hash': hash }
                eo = api.updateEmbeddedObject(**eoUpd)
                if eo and '<iframe' in eo.code:
                    changed += 1
                    print "Updated vimeo EO: %s %s" % (eo.id, eo.code)
                else:
                    print "Error updating EO"
            else:
                print "Could not find videoID: %s, code: %s" % (eo.id, eo.code)

        pageNum += 1

    print "Changed embedded objects: %d" % changed

