# -*- coding: utf-8 -*-
import logging

from flx.model import meta
from flx.model import model
from flx.model import api
from flx.controllers.common import ArtifactCache

import flx.lib.helpers as h

LOG_FILENAME = "/tmp/fix_lesson_concept_handles.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

class FixLessonConceptHandle:

    def __init__(self, url):
        config = h.load_pylons_config()
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.engine = meta.engine
        #self.initCache(config)

    def initCache(self, config):
        keys = config.keys()
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = config[key]

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))

    def fix(self, memberID, run=False, verbose=True):
        self.session.begin()

    def processLessons(self, artifact, suffix, member_id, changedIDs):
        changed = 0
        log.info("Processing lesson: [%s]" %(artifact))
        lesson_name = artifact.name
        lesson_handle_old = artifact.handle
        lesson_handle = "%s-%s" % (model.title2Handle(lesson_name), suffix)
        log.info("Lesson artifactID: [%s]" %(artifact.id))
        log.info("Lesson Name: [%s]" % (lesson_name))
        log.info("Lesson Handle OLD: [%s]" %(lesson_handle_old))

        if lesson_handle_old != lesson_handle:
            update_query = "update Artifacts set handle = '%s' where id = %s" %(lesson_handle, artifact.id)
            results = self.engine.execute(update_query)
            log.info("Lesson Handle NEW: [%s]" %(lesson_handle))
            changed += 1
            changedIDs.append(artifact.id)
            if member_id == 3:
                try:
                    existing = api._getArtifactHandles(self.session, handle=lesson_handle_old, typeID=artifact.type.id, creatorID=member_id)
                    if not existing:
                        api._archiveArtifactHandle(self.session, artifact.id, lesson_handle_old, artifact.type.id, member_id)
                except Exception, ee:
                    log.warn("Error inserting old handle: %s" % str(ee))
        #resp = api.updateArtifact(**new_kwargs)
        try:
            concept = artifact.getChildren()[0]
        except:
            log.warn("Concept does not exist for lesson with artifactID: [%s]" %(artifact.id))
            return changed
        log.info("Processing concept: [%s]" %(concept))
        concept_name = concept.name
        concept_handle = concept.handle
        log.info("Concept artifactID: [%s]" %(concept.id))
        log.info("Concept Name: [%s]" %(concept_name))
        log.info("Concept Handle OLD: [%s]" %(concept_handle))
        if lesson_handle != concept_handle:
            update_query = "update Artifacts set handle = '%s' where id = %s" %(lesson_handle, concept.id)
            results = self.engine.execute(update_query)
            log.info("Concept Handle NEW: [%s]" %(lesson_handle))
            changed += 1
        return changed

    def main(self, member_id, subject, book_handles=[], book_type_id=1):
        suffix_mapping = {
                'MATH': {
                    u'CK-12-Precalculus-Concepts': 'PCALC',
                    u'CK-12-Calculus-Concepts': 'CALC',
                    u'CK-12-Middle-School-Math-Concepts-Grade-6': 'MSM6',
                    u'CK-12-Middle-School-Math-Concepts-Grade-7': 'MSM7',
                    u'CK-12-Middle-School-Math-Concepts-Grade-8': 'MSM8',
                    u'Algebra-Explorations-Concepts-Pre-K-through-Grade-7': 'ALG-EXPL',
                    u'CK-12-Basic-Algebra-Concepts': 'BSC-ALG',
                    u'CK-12-Algebra-I-Concepts': 'ALG-I',
                    u'CK-12-Algebra-I-Concepts-Honors': 'ALG-I-HNRS',
                    u'CK-12-Algebra-II-with-Trigonometry-Concepts': 'ALG-II',
                    u'CK-12-Basic-Probability-and-Statistics-Concepts': 'BSC-PST',
                    u'CK-12-Probability-and-Statistics-Concepts': 'PST',
                    u'CK-12-Advanced-Probability-and-Statistics-Concepts': 'ADV-PST',
                    u'CK-12-Trigonometry-Concepts': 'TRIG',
                    u'CK-12-Math-Analysis-Concepts': 'MAT-ALY',
                    u'CK-12-Geometry-Concepts-Honors': 'GEOM-HNRS',
                    u'CK-12-Basic-Geometry-Concepts': 'BSC-GEOM',
                    u'CK-12-Geometry-Concepts': 'GEOM',
                    u'CK-12-College-Precalculus': 'C-PRECALC',
                    u'CK-12-Elementary-and-Intermediate-College-Algebra': 'C-ALG',
                    u'CK-12-Interactive-Geometry-Concepts': 'GEOINT',

                    u'CK-12-Conceptos-Escuela-de-Matemáticas-Medio-Grado-6': 'MSM6-SPN',
                    u'CK-12-Conceptos-Escuela-de-Matemáticas-Medio-Grado-7': 'MSM7-SPN',
                    u'CK-12-Conceptos-Escuela-de-Matemáticas-Medio-Grado-8': 'MSM8-SPN',
                    u'CK-12-Conceptos-Básicos-de-Álgebra': 'BSC-ALG-SPN',
                    u'CK-12-Conceptos-de-Exploraciones-de-Álgebra-Grados-0-7': 'ALG-EXPL-SPN',
                    u'CK-12-Conceptos-de-Álgebra-I': 'ALG-I-SPN',
                    u'CK-12-Conceptos-de-Álgebra-I-Nivel-Superior-en-Español': 'ALG-I-HNRS-SPN',
                    u'CK-12-Conceptos-de-Álgebra-II-con-Trigonometría-en-Español': 'ALG-II-SPN',
                    u'CK-12-Conceptos-de-Cálculo-en-Español': 'CALC-SPN',

                    u'CK-12-Interactive-Geometry-for-CCSS': 'GEO-CCSS',
                    u'CK-12-Interactive-Geometry-for-CCSS-Teachers-Guide': 'GEO-CCSS-TE',
                    u'CK-12-Interactive-Algebra-I-for-CCSS': 'ALGI-CCSS',
                    u'CK-12-Interactive-CCSS-Algebra-I-Teachers-Guide': 'ALGI-CCSS-TE',
                },
                'SCIENCE': {
                    u'CK-12-Earth-Science-Concepts-For-Middle-School': 'MS-ES',
                    u'CK-12-Life-Science-Concepts-For-Middle-School': 'MS-LS',
                    u'CK-12-Physical-Science-Concepts-For-Middle-School': 'MS-PS',

                    u'CK-12-Earth-Science-Concepts-For-High-School': 'HS-ES',
                    u'CK-12-Biology-Concepts': 'BIO',
                    u'CK-12-Biology-Advanced-Concepts': 'BIO-ADV',
                    u'CK-12-Chemistry-Concepts-Intermediate': 'CHEM',
                    u'CK-12-Physics-Concepts-Intermediate': 'PHYS',
                    u'Peoples-Physics-Concepts': 'PPC',
                    u'Adventures-in-Physics-Open-Problems': 'APOP',

                    u'CK-12-Physics-Intermediate-Quizzes-and-Tests': 'PHYS-INT-Q',
                    u'CK-12-Physics-Intermediate-Workbook': 'PHYS-INT-W',

                    'CBSE-Chemistry-Book-Class-X': 'CHEM-CBSE-X',
                    'CK-12-First-Grade-Science': 'SCIGR1',
                    'CK-12-Second-Grade-Science': 'SCIGR2',
                    'CK-12-Third-Grade-Science': 'SCIGR3',
                    'CK-12-Fourth-Grade-Science': 'SCIGR4',
                    'CK-12-Fifth-Grade-Science': 'SCIGR5',

                    ## Community colelge
                    'CK-12-College-Human-Biology': 'CHUMBIO',

                    ## Health
                    'HealthCorps-You-Skills-For-A-Healthy-You': 'HCYOU-TE',
                    #'HealthCorps-You': 'HCYOU-TE',
                    'HealthCorps-You-Skills-For-A-Healthy-You-Student-Edition': 'HCYOU',
                },
            }
        try:
            changedIDs = []
            self.session.begin()
            member = api._getMemberByID(self.session, member_id)
            if not member:
                log.info("Member does not exist for memberID: [%s]" %(member_id))
                return
            for sub in suffix_mapping:
                if sub != subject.upper():
                    continue
                for book_handle in suffix_mapping[sub]:
                    if book_handles and book_handle not in book_handles:
                        continue
                    suffix = suffix_mapping[sub][book_handle]
                    log.info("Processing book with handle: [%s]" % (book_handle))
                    print "Processing book with handle: [%s]" % (book_handle)
                    print "Using suffix: [%s]" % (suffix)
                    changed = 0
                    book = api._getArtifactByHandle(self.session, handle=book_handle, typeID=book_type_id, creatorID=member_id)
                    if not book:
                        continue
                    for child in book.revisions[0].children:
                        child_artifact = child.child.artifact
                        artifact_type = child_artifact.type.name
                        if artifact_type == 'chapter':
                            for artifact_rev in child_artifact.revisions[0].children:
                                artifact = artifact_rev.child.artifact
                                if artifact.type.name == 'lesson':
                                    changed += self.processLessons(artifact, suffix, member_id, changedIDs)
                        elif artifact_type == 'lesson':
                            changed += self.processLessons(child_artifact, suffix, member_id, changedIDs)

                    print "Changed: %d" % changed
                    log.info("Changed: %d" % changed)
            self.session.commit()
            if changedIDs:
                print "Invalidting %d" % len(changedIDs)
                for aid in changedIDs:
                    log.info("Invalidting %d" % aid)
                    artifact = api.getArtifactByID(id=aid)
                    api.invalidateArtifact(ArtifactCache(), artifact, revision=artifact.revisions[0], recursive=True)
                    ArtifactCache().load(id=aid)
        except Exception as e:
            log.error("Error: %s" % str(e), exc_info=e)
            try:
                self.session.rollback()
            except:
                pass
            raise e
        print "Done"
        log.info("Done!")


"""
    Required params: 
        member_id: owner id of the book
        subject: 'MATH' or 'SCIENCE'
    Optional params:
        book_handles: Optional list of book handles. Processes all books in a subject if empty.
"""
def run(member_id, subject, book_handles=[], book_type_id=1):
    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    fix = FixLessonConceptHandle(url)
    fix.main(member_id, subject, book_handles, book_type_id)
