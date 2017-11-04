from __future__ import print_function
import json
import os

first = True
s = open('/tmp/data.json')
d = json.load(s)
s.close()

s = open('/tmp/data-pretty.json', 'w')
json.dump(d, s, indent=4)
s.close()

er = {}
mod = {}
for key in d.keys():
    if first:
        first = False
    else:
        print(', ', end='')
    print('%s' % key, end='')

    item = d[key]
    item['EID'] = key
    url = item.get('url')
    if url:
        item['url'] = url.lower()
    #
    #  Reduce and separate modalities.
    #
    modalities = item.get('modalities', None)
    if modalities:
        if modalities and len(modalities) > 2:
            modalities = modalities[0:2]
            item['modalities'] = modalities
        if modalities:
            for modality in modalities:
                if 'creator' in modality:
                    del modality['creator']
        mod[key] = modalities
        del item['modalities']
    #
    #  Reduce and separate related.
    #
    related = item.get('related', None)
    if related:
        """
        if len(related) > 20:
            math = []
            sci = []
            for r in related:
                if r['EID'].lower().startswith('sci.'):
                    sci.append(r)
                else:
                    math.append(r)
            math = math[0:6]
            sci = sci[0:6]
            item['related'] = math + sci
        """
        for r in related:
            similarity = r.get('similarity', None)
            if similarity:
                r['score'] = similarity
                del r['similarity']
            prerequires = r.get('prerequires', None)
            if prerequires:
                r['p'] = True
                del r['prerequires']
        er[key] = related
        del item['related']
print('')

s = open('subjects.json', 'w')
json.dump(d, s)
s.close()
s = open('subjects-pretty.json', 'w')
json.dump(d, s, indent=4)
s.close()

r = open('related.json', 'w')
json.dump(er, r)
r.close()
r = open('related-pretty.json', 'w')
json.dump(er, r, indent=4)
r.close()

m = open('modalities.json', 'w')
json.dump(mod, m)
m.close()
m = open('modalities-pretty.json', 'w')
json.dump(mod, m, indent=4)
m.close()
