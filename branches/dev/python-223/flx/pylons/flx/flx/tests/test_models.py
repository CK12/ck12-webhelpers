from flx.tests import *
from flx.model import meta
from flx.model import model

import logging

log = logging.getLogger(__name__)

class TestModels(TestController):

    def _init(self):
        self.session.begin()
        try:
            # Create a member.
            self.stephen = model.Member(login='stephen@ck12.org',
                                        defaultLogin='stephen@ck12.org',
                                        email='stephen@ck12.org',
                                        givenName='Stephen',
                                        surname='AuYeung',
                                        authID=10000,
                                        stateID=2,
                                        id=10000)
            self.session.add(self.stephen)
            self.session.commit()
        except Exception, e:
            self.session.rollback()
            log.exception('e[%s]' % e)

        # Retrive some artifact types.
        query = self.session.query(model.ArtifactType)
        self.aBook = query.filter_by(name='book').one()
        self.aChapter = query.filter_by(name='chapter').one()

        # Retrieve the newly created objects.
        query = self.session.query(model.Member)
        self.stephen = query.filter_by(login='stephen@ck12.org').one()

    def _cleanup(self):
        self.session.begin()
        try:
            self.session.delete(self.stephen)
            self.session.commit()
        except Exception, e:
            self.session.rollback()

    def setUp(self):
        super(TestModels, self).setUp()
        self.session = meta.Session()
        self._init()

    def tearDown(self):
        self._cleanup()
        super(TestModels, self).tearDown()

    def test_artifact(self):
        query = self.session.query(model.Artifact)
        artifacts = query.all()
        print 'There are %d artifacts.' % len(artifacts)
        assert len(artifacts) > 0
        for artifact in artifacts: 
            assert artifact.revisions is not None
            assert artifact.name is not None
            assert artifact.type is not None
            if artifact.browseTerms is not None:
                for browseTerm in artifact.browseTerms:
                    assert browseTerm.name is not None
                    assert browseTerm.type is not None

    def test_book(self):
        query = self.session.query(model.Artifact)
        query = query.filter_by(artifactTypeID=self.aBook.id)
        books = query.all()
        print 'There are %d books.' % len(books)
        assert len(books) > 0
        for book in books:
            assert book.type.name == 'book'
            assert book.browseTerms is not None
            assert book.revisions is not None
            for revision in book.revisions:
                assert len(revision.children) > 0
                assert len(revision.parents) == 0

    def test_chapter(self):
        self.session.begin()
        try:
            chap6 = model.Artifact(name='Chapter 6',
                                   description='The law of Newton',
                                   creatorID=self.stephen.id,
                                   artifactTypeID=self.aChapter.id)
            self.session.add(chap6)
            #self.session.flush()
            chap6Revision = model.ArtifactRevision(
                                    #artifactID=chap6.id,
                                    revision='1',
                                    downloads=0)
            chap6Revision.artifact = chap6
            self.session.add(chap6Revision)
            #self.session.flush()
            chap6RevisionResource = model.ArtifactRevisionHasResources(
                                        #artifactRevisionID=chap6Revision.id,
                                        resourceRevisionID=self.chap6ContentsRevision.id)
            chap6Revision.resources.append(chap6RevisionResource)
            self.session.add(chap6RevisionResource)
            self.session.flush()
            query = self.session.query(model.ArtifactHasBrowseTerms)
            terms = query.filter_by(artifactID=6).all()
            chap6BrowseTerms = []
            for term in terms:
                chap6BrowseTerm = model.ArtifactHasBrowseTerms(
                                        artifactID=chap6.id,
                                        browseTermID=term.browseTermID)
                self.session.add(chap6BrowseTerm)
                chap6BrowseTerms.append(chap6BrowseTerm)
            self.session.commit()
        except Exception, e:
            self.session.rollback()

        self.session.begin()
        query = self.session.query(model.Artifact)
        query = query.filter_by(artifactTypeID=self.aChapter.id)
        chapters = query.all()
        print 'There are %d chapters.' % len(chapters)
        assert len(chapters) > 0
        for chapter in chapters:
            assert chapter.type.name == 'chapter'
            #assert chapter.browseTerms is not None
            #assert len(chapter.browseTerms) > 0
            assert chapter.revisions is not None
            for revision in chapter.revisions:
                if revision.children:
                    for c in revision.children:
                        assert c.child.artifact.type.name in ['lesson', 'section']

        try:
            for chap6BrowseTerm in chap6BrowseTerms:
                self.session.delete(chap6BrowseTerm)
            self.session.delete(chap6RevisionResource)
            self.session.delete(chap6Revision)
            self.session.delete(chap6)
            self.session.commit()
        except Exception, e:
            self.session.rollback()

    def test_artifactRevision(self):
        query = self.session.query(model.ArtifactRevision)
        revisions = query.all()
        assert len(revisions) > 0
        for revision in revisions:
            assert revision.artifact is not None
            assert revision.children is not None

    def test_resource(self):
        query = self.session.query(model.Resource)
        resources = query.all()
        assert len(resources) > 0
        for resource in resources:
            assert resource.revisions is not None
            assert resource.name is not None
            assert resource.type is not None

    """
    def test_resourceRevision(self):
        query = self.session.query(model.ResourceRevision)
        resourceRevisions = query.all()
        assert len(resourceRevisions) > 0
        for resourceRevision in resourceRevisions:
            assert resourceRevision.revision is not None
            assert resourceRevision.resource is not None
            assert resourceRevision.artifactResource is not None
    """

    def test_resourceRevision(self):
        query = self.session.query(model.ResourceRevision)
        revisions = query.all()
        assert len(revisions) > 0
        for revision in revisions:
            assert revision.resource is not None

    def test_browseTerm(self):
        query = self.session.query(model.BrowseTerm)
        browseTerms = query.all()
        assert len(browseTerms) > 0
        for browseTerm in browseTerms:
            assert browseTerm.name is not None
            assert browseTerm.termTypeID is not None

    def test_standard(self):
        query = self.session.query(model.Standard)
        standards = query.all()
        assert len(standards) > 0
        for standard in standards:
            assert standard.standardBoardID is not None
            assert standard.subjectID is not None
            assert standard.section is not None

    def test_member(self):
        query = self.session.query(model.Member)
        members = query.all()
        assert len(members) > 0
        for member in members:
            assert member.fix().name is not None

    """
    def test_usAddress(self):
        query = self.session.query(model.USAddress)
        usAddresses = query.all()
        for usAddress in usAddresses:
            assert usAddress.streetNumber is not None
            assert usAddress.street1 is not None
            assert usAddress.city is not None
            assert usAddress.state is not None
            assert usAddress.zip is not None

    def test_address(self):
        query = self.session.query(model.Address)
        addresses = query.all()
        for address in addresses:
            assert address.country is not None
            assert address.addressID is not None
    """
