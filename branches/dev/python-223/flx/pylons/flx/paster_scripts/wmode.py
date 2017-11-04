import re

from flx.model import api
from flx.model import meta

def start():
    session = meta.Session()
    providerIDs = [1]
    iframe_re = re.compile('<iframe.*?>[ ]*</iframe>')
    src_re = re.compile('src="(.*?)"')
    for eachProvider in providerIDs:
        provider = api.getProviderByID(id=eachProvider)
        if provider.name == 'YouTube':
            embeddedObjects = api.getEmbeddedObjectsByProvider(provider=provider)
            for eachBmbeddedObject in embeddedObjects:
                id = eachBmbeddedObject.id
                oldEmbedCode = eachBmbeddedObject.code
                eoDict = {'id':id}
                iframeString = iframe_re.findall(oldEmbedCode)
                if not iframeString:
                    print 'Invalid embeddable for youtube. Skipping...'
                    continue
                iframeString = iframeString[0]
                if iframeString.find('wmode=transparent') <= 0:
                    newEmbedCode = src_re.sub("src=\"\\1?wmode=transparent\"", iframeString)
                    print 'Replacing oldEmbedCode: %s with embedcode: %s' %(oldEmbedCode, newEmbedCode)
                    eoDict['code'] = newEmbedCode
                    api.updateEmbeddedObject(**eoDict)
        elif provider.name == 'TeacherTube':
            embeddedObjects = api.getEmbeddedObjectsByProvider(provider=provider)
            for eachBmbeddedObject in embeddedObjects:
                id = eachBmbeddedObject.id
                oldEmbedCode = eachBmbeddedObject.code
                eoDict = {'id':id}
                if oldEmbedCode.startswith('<embed src=') and oldEmbedCode.find('wmode="true"') <= 0:
                    newEmbedCode = oldEmbedCode.replace('<embed ', '<embed wmode="true" ', 1)
                    print 'Replacing oldEmbedCode: %s with embedcode: %s' %(oldEmbedCode, newEmbedCode)
                    eoDict['code'] = newEmbedCode
                    api.updateEmbeddedObject(**eoDict)
        elif provider.name == 'Schooltube':
            print 'Coming soon for Schooltube'
            pass
