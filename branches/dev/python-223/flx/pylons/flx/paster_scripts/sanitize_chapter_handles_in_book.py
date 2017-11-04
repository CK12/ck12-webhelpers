from flx.model import api, model, meta
from flx.controllers.common import ArtifactCache
from flx.lib import helpers as h

def run(bookID, commit=True):
    try:
        chCount = 0
        updated = 0
        session = meta.Session()
        session.begin()
        book = api._getArtifactByID(session, id=bookID)
        print "Got book: [%s]" % book.handle
        for chapterRev in book.revisions[0].children:
            chCount += 1
            print "Processing chapter: %d" % chCount
            chapter = chapterRev.child.artifact
            chHandle = chapter.handle.split(model.getChapterSeparator(), 1)[0]
            chHandle = '%s%s%s' % (chHandle, model.getChapterSeparator(), book.handle)
            print "[%s] --> [%s]" % (chapter.handle, chHandle)
            if chHandle != chapter.handle:
                try:
                    print "Updating %d" % chapter.id
                    chapter.handle = chHandle
                    session.add(chapter)
                    session.flush()
                    updated += 1
                except Exception, e:
                    print "Exception: [%s]" % str(e)

        if updated > 0 and commit:
            session.commit()

    finally:
        session.rollback()

    print "Chapters [%d], Updated [%d]" % (chCount, updated)

    if updated and commit:
        book = api.getArtifactByID(id=bookID)
        print "Invalidating book cache ..."
        api.invalidateArtifact(ArtifactCache(), book, revision=book.revisions[0], recursive=True, clearPrePost=True)
        print "Scheduling reindex for book ..."
        h.reindexArtifacts([book.id], recursive=True)
