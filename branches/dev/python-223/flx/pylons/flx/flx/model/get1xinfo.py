import logging

log = logging.getLogger(__name__)

class Model(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return str(self)

    def asDict(self):
        if not self.__dict__.has_key('_sa_instance_state'):
            return self.__dict__

        from copy import deepcopy

        d = deepcopy(self.__dict__)
        del d['_sa_instance_state']
        return d

class User(Model):
    pass

class Book(Model):
    pass

class Chapter(Model):
    pass

class BookChapter(Model):
    pass

class Flexr:
    def __init__(self, url):
        from sqlalchemy import create_engine, orm, MetaData

        self.db = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              bind=self.db)
        self.meta = MetaData()
        self.meta.Session = orm.scoped_session(sm)
        self.session = self.meta.Session()

        from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey

        Users = Table('auth_user', self.meta,
            Column('id', Integer(),  primary_key=True, nullable=False),
            Column('email', String(length=None, convert_unicode=False, assert_unicode=None, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
        )

        Books = Table('flexbook', self.meta,
            Column('flexbook_id', Integer(),  primary_key=True, nullable=False),
            Column('flexbook_userid', Integer(), nullable=False),
            Column('flexbook_created', DateTime(timezone=False),  nullable=False),
            Column('flexbook_updated', DateTime(timezone=False),  nullable=False),
            Column('flexbook_certified', Integer(), nullable=False),
            Column('flexbook_published', Integer(), nullable=False),
            Column('teacher_edition', Integer(), nullable=False),
            Column('flexbook_by_ck12', Integer(), nullable=False),
        )

        Chapters = Table('flexbook_chapter', self.meta,
            Column('chapter_id', Integer(),  primary_key=True, nullable=False),
            Column('chapter_userid', Integer(), nullable=False),
            Column('chapter_title', String(length=None, convert_unicode=False, assert_unicode=None, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
            Column('chapter_createdate', DateTime(timezone=False),  nullable=False),
            Column('chapter_updated', DateTime(timezone=False),  nullable=False),
            Column('chapter_certified', Integer(), nullable=False),
            Column('chapter_published', Integer(), nullable=False),
            Column('chapter_by_ck12', Integer(), nullable=False),
        )

        BookChapters = Table('flexbook_contents', self.meta,
            Column('id', Integer(),  primary_key=True, nullable=False),
            Column('flexbook_id', Integer(), ForeignKey('flexbook.flexbook_id'), nullable=False),
            Column('chapter_id', Integer(), ForeignKey('flexbook_chapter.chapter_id'), nullable=False),
            Column('zorder', Integer(), nullable=False),
        )

        orm.mapper(User, Users)     
        orm.mapper(Book, Books)    
        orm.mapper(Chapter, Chapters)  
        orm.mapper(BookChapter, BookChapters)

    def getBookChapters(self, fid=None):
        query = self.session.query(BookChapter)
        if fid:
            query = query.filter_by(flexbook_id=fid)
            query = query.order_by(BookChapter.zorder)
        return query.all()

    def getBookChapterDict(self):
        bookChapters = self.getBookChapters()
        bookChapterDict = {}
        for bookChapter in bookChapters:
            bookChapterDict[bookChapter.chapter_id] = bookChapter.flexbook_id
        return bookChapterDict

    def getBookChapterList(self, fid):
        bookChapters = self.getBookChapters(fid=fid)
        bookChapterList = []
        for bookChapter in bookChapters:
            bookChapterList.append(bookChapter.asDict())
        return bookChapterList

    def getUser(self, email):
        query = self.session.query(User)
        query = query.filter_by(email = email)
        try:
            return query.one()
        except:
            return None

    def getUsersWithBooks(self):
        userDict = {}
        query = self.session.query(Book)
        query = query.distinct(Book.flexbook_userid)
        books = query.all()
        print '%d books' % len(books)
        for book in books:
            userDict[book.flexbook_userid] = 1
        query = self.session.query(Chapter)
        query = query.distinct(Chapter.chapter_userid)
        chapters = query.all()
        print '%d chapters' % len(chapters)
        for chapter in chapters:
            userDict[chapter.chapter_userid] = 1
        userids = userDict.keys()
        print '%d potential users' % len(userids)
        query = self.session.query(User)
        query = query.filter(User.id.in_(userids))
        users = query.all()
        return users

    def getBookInfo(self, id=None, email=None):
        if id is None:
            user = self.getUser(email)
            if user is None:
                return []
            id = user.id

        bookList = []
        query = self.session.query(Book)
        query = query.filter_by(flexbook_userid = id)
        books = query.all()
        for book in books:
            bookList.append(book)
        return bookList

    def getChapterInfo(self, id=None, email=None):
        if id is None:
            user = self.getUser(email)
            if user is None:
                return []
            id = user.id

        chapterList = []
        query = self.session.query(Chapter)
        query = query.filter_by(chapter_userid = id)
        chapters = query.all()
        for chapter in chapters:
            chapterList.append(chapter)
        return chapterList


class FlexrUtil:

    def __init__(self, url=None):
        if url is None:
            url = 'mysql://dbadmin:D-coD#43@thejas-dev-2.ck12.org:3306/flexr?charset=utf8'
        self.flexr = Flexr(url)
        self.bookChapterDict = None

    def getFlexr(self):
        return self.flexr

    def getBookChapterDict(self):
        if self.bookChapterDict is None:
            self.bookChapterDict = self.flexr.getBookChapterDict()
        return self.bookChapterDict

    def getBookChapterList(self, fid):
        return self.flexr.getBookChapterList(fid=fid)

    def getBookInfo(self, id=None, email=None):
        books = self.flexr.getBookInfo(id=id, email=email)
        bList = []
        for book in books:
            bDict = book.asDict()
            bList.append(bDict)
        return bList

    def getChapterInfo(self, id=None, email=None, standaloneOnly=True):
        chapters = self.flexr.getChapterInfo(id=id, email=email)
        cList = []
        for chapter in chapters:
            cDict = chapter.asDict()
            if not standaloneOnly:
                cList.append(cDict)
            else:
                isStandalone = self.getBookChapterDict().get(chapter.chapter_id) is None
                if isStandalone:
                    cDict['standalone'] = True
                if isStandalone:
                    cList.append(cDict)
        return cList

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:ck123@skylab.ck12.org:3306/flexr?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-u', '--url', dest='url', default=url,
        help='The URL for connecting to the database. Defaults to %s' % url
    )
    parser.add_option(
        '-i', '--id', dest='id', default=None,
        help='The id of the user.'
    )
    parser.add_option(
        '-e', '--email', dest='email', default=None,
        help='The email of the user.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    id = options.id
    email = options.email
    url = options.url
    verbose = options.verbose

    if verbose:
        print 'Getting info for [%s, %s]' % (id, email)

    fu = FlexrUtil(url)
    l = fu.getBookInfo(id=id, email=email)
    print 'There are %d books for [%s, %s]' % (len(l), id, email)
    l = fu.getChapterInfo(id=id, email=email, standaloneOnly=False)
    print 'There are %d chapters for [%s, %s]' % (len(l), id, email)
    l = fu.getChapterInfo(id=id, email=email)
    print 'There are %d standalone chapters for [%s, %s]' % (len(l), id, email)
