import os
import urllib2
import sys
import json
import re
import codecs

taxonomy_server = 'http://nimish.ck12.in/taxonomy'
conceptRegex = re.compile(r'(<concept [^>?]*)label="([^"?]*)"/>')
delimiter = '&#xa;'

def updateName(name, oldname):
    positions = []
    oldname = oldname.replace(delimiter, ' %s' % delimiter)
    words = oldname.split(' ')
    i = 0
    while i < len(words):
        if not words[i].strip():
            words.pop(i)
            i -= 1
        i += 1

    print words
    i = 0
    while i < len(words):
        words[i] = words[i].strip()
        if delimiter in words[i]:
            if words[i].startswith(delimiter):
                words[i] = words[i].replace(delimiter, '')
                positions.append(i)
            elif words[i].endswith(delimiter):
                words[i] = words[i].replace(delimiter, '')
                positions.append(i+1)
            else:
                wordParts = words[i].split(delimiter)
                if len(wordParts) > 0:
                    words[i] = wordParts[0]
                    if len(wordParts) > 1:
                        if i == len(words)-1:
                            words.append(wordParts[1])
                            print "Appending %s, %s" % (wordParts[1], words)
                        else:
                            words.insert(i+1, wordParts[1])
                            print "Inserting %s, %s" % (wordParts[1], words)
                        positions.append(i+1)
                        i += 1
            print positions
        i += 1
    print positions
    if positions:
        words = name.split(' ')
        for pos in positions:
            if len(words) > pos:
                words[pos] = '%s%s' % (delimiter, words[pos])
        return ' '.join(words).replace(' %s' % delimiter, delimiter)
    return name
 
def replaceName(m):
    if m.group(2):
        str = m.group(2)
        parts = str.split('[')
        print len(parts)
        if len(parts) >= 2:
            oldname = parts[0]
               
            eid = parts[1]
            eid = eid.strip(']')
            r = urllib2.urlopen(taxonomy_server + '/get/info/concept/' + eid)
            resp = r.read()
            j = json.loads(resp)
            if j['responseHeader']['status'] == 0:
                name = j['response']['name']
                if True or name != oldname.replace(delimiter, ' '):
                    newName = updateName(name, oldname)
                    print "New name: %s" % newName
                    return m.group(1) + 'label="' + newName + '&#xa;[' + eid + ']' + '"/>'
            else:
                raise Exception('Cannot get information for: %s \n %s' % (eid, j))
    return m.group(0)

if __name__ == '__main__':
    
    cxlFile = sys.argv[1]
    if os.path.exists(cxlFile):
        xml = open(cxlFile, 'r').read()
        xml = conceptRegex.sub(replaceName, xml, count=0)
        print xml
        f = codecs.open('%s' % cxlFile, 'wb')
        f.write(xml)
        f.close()

