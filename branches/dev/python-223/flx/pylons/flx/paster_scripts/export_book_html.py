from flx.model import api
from flx.model import meta
from flx.lib import helpers as h
import os
import codecs
import shutil
import re

dir = "/tmp/"

MATH_SERVER = 'http://math-dev.ck12.org'
IMAGE_SERVER = 'http://astro.ck12.org'

ALG = 'CK.MAT.ENG.SE.2.Algebra-I'
GEO = 'CK.MAT.ENG.SE.2.Geometry'
GEO_PYTH = 'CK.MAT.ENG.SE.1.Geometry-Pythag.-Theorem'
TRIG = 'CK.MAT.ENG.SE.2.Trigonometry'
MATH_ANA = 'CK.MAT.ENG.SE.1.Math-Analysis'

BOOKS = [ ALG, GEO, GEO_PYTH, TRIG, MATH_ANA ]

def run(artifactID):
    session = meta.Session()
    book = api.getArtifactByEncodedID(encodedID=artifactID, typeName='book')
    if not book:
        raise Exception("No such book: %s" % artifactID)

    bookPath = os.path.join(dir, book.handle)
    if os.path.exists(bookPath):
        shutil.rmtree(bookPath)
    os.mkdir(bookPath)
    writeFile(bookPath, book.getTitle(), book.getXhtml())
    curDir = bookPath
    cnt = 1
    for child in book.revisions[0].children:
        seq = str(cnt).rjust(3, '0')
        childA = child.child.artifact
        if childA.type.name == 'chapter':
            curDir = os.path.join(curDir, '%s_Chapter_%s' % (seq, childA.getTitle().replace(' ', '_')))
            if not os.path.exists(curDir):
                os.mkdir(curDir)
            writeFile(curDir, 'Chapter_%s' % childA.getTitle(), childA.getXhtml())

            gseq = 1
            for gc in childA.revisions[0].children:
                gcA = gc.child.artifact
                writeFile(curDir, '%s_%s' % (str(gseq).rjust(3, '0'), gcA.getTitle()), gcA.getXhtml(includeChildContent=True))
                gseq += 1
        cnt += 1
        curDir = os.path.dirname(curDir)

mathRe = re.compile(r'<img [^<>]*src="/flx/math/[^"]*" alt="([^"]*)"[^<>]*/>', re.I)
imageRe = re.compile(r'<img [^<>]*src="(/flx/render/[^"]*)"[^<>]*/>', re.I)

def writeFile(dir, title, xhtml):

    ## Process xhtml
    def mathRepl(m):
        return '<em>{{ CK-12 Math: %s %s }}</em>' % (m.group(1), m.group(0))

    def imageRepl(m):
        return '<em>{{ CK-12 Image: %s%s %s }}</em>' % (IMAGE_SERVER, m.group(1), m.group(0))

    xhtml = h.safe_encode(xhtml)
    xhtml = mathRe.sub(mathRepl, xhtml)
    xhtml = imageRe.sub(imageRepl, xhtml)
    xhtml = h.safe_decode(xhtml)

    title = title.encode('ascii', 'ignore')
    path = os.path.join(dir, '%s.html' % (title.replace(' ', '_')))
    f = codecs.open(path, "wb", encoding='utf-8')
    f.write(xhtml)
    f.close()
    print "Wrote: %s" % path

def runAll():
    for b in BOOKS:
        try:
            run(b)
        except Exception as e:
            print traceback.format_exc(e)
