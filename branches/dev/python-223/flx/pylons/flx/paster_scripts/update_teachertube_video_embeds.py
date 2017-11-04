from flx.model import api
import re

def run(providerDomain='teachertube.com'):
    iframeCnt = 0
    embedCnt = 0
    provider = api.getProviderByDomain(domain=providerDomain, create=False)
    if not provider:
        raise Exception("No provider for domain: [%s]" % providerDomain)
    objects = api.getEmbeddedObjectsByProvider(provider=provider)
    for eo in objects:
        if '/embed/video/' not in eo.code:
            code = eo.code
            uri = eo.uri
            ## Need to fix
            if '<iframe ' in eo.code:
                parts = eo.code.split(" ")
                for i in range(0, len(parts)):
                    if parts[i].startswith('src='):
                        parts[i] = re.sub(r'src="(.*)/embed\.php\?pg=video_([0-9]*).*"$', r'src="\1/embed/video/\2"', parts[i])
                        break
                code = " ".join(parts)
                if 'embed.php?' in eo.uri:
                    uri = re.sub(r'^(.*)/embed\.php\?pg=video_([0-9]*)\&(.*)$', r'\1/embed/video/\2?\3', eo.uri)
                if eo.code != code or eo.uri != uri:
                    print eo.id, code, uri
                    api.updateEmbeddedObject(id=eo.id, code=code, uri=uri)
                    iframeCnt += 1
            elif eo.code.startswith('<embed '):
                vid = None
                m = re.match(r'^.*\?pg=video_([0-9]*).*$', uri, re.I)
                if m:
                    vid = m.group(1)
                else:
                    m = re.match(r'^.*\?video_id=([0-9]*).*$', uri, re.I)
                    if m:
                        vid = m.group(1)
                    else:
                        m = re.match(r'^.*\?pg=video_([0-9]*).*$', code, re.I)
                        if m:
                            vid = m.group(1)
                if vid:
                    code = '<iframe width="560" height="315" src="https://www.teachertube.com/embed/video/' + vid + '" frameborder="0" allowfullscreen/></iframe>'
                    if eo.code != code:
                        print eo.id, code, uri
                        api.updateEmbeddedObject(id=eo.id, code=code, uri=uri)
                        embedCnt += 1

    print "iFrame changed: %d" % iframeCnt
    print "Embeds changed: %d" % embedCnt
