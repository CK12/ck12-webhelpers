from flx.model import api

import os
import urllib

imgdir = '/tmp/cover_images'
server_prefix = 'http://nimish.ck12.org'

def run():
    if not os.path.exists(imgdir):
        os.mkdir(imgdir)

    ck12editor = api.getMemberByLogin(login='ck12editor')
    books = api.getArtifactsByOwner(owner=ck12editor, typeName='book')
    if not books:
        print "No books found"

    missing_covers = []
    cnt = 1
    for book in books:
        print "[%d/%d] Processing book: %s" % (cnt, len(books), book.encodedID)
        coverImageUri = book.getCoverImageUri()
        encodedID = book.encodedID
        if coverImageUri and encodedID:
            coverImageUri = '%s%s' % (server_prefix, coverImageUri)
            ext = coverImageUri.split('.')[-1]
            filePath = os.path.join(imgdir, '%s.%s' % (encodedID, ext))
            print "Getting file: %s" % coverImageUri
            urllib.urlretrieve(coverImageUri, filePath)
            print "Wrote: %s" % filePath
        else:
            missing_covers.append((book.id, book.getTitle()))
            print "Empty coverImageUri [%s] or encodedID [%s]. Title: %s" % (coverImageUri, encodedID, book.getTitle())
        cnt += 1

    print "Missing cover images: %s" % missing_covers


if __name__ == '__main__':
    run()
