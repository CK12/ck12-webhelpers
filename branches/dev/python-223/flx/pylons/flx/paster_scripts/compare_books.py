# -*- coding: utf-8 -*-
import logging
import hashlib
import traceback

from flx.model import meta
from flx.model import model
from flx.model import api
from flx.controllers.common import ArtifactCache

import flx.lib.helpers as h

LOG_FILENAME = "/tmp/compare_books.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

MATH_BOOKS = [
                    'CK-12-Precalculus-Concepts',
                    'CK-12-Calculus-Concepts',
                    'CK-12-Middle-School-Math-Concepts-Grade-6',
                    'CK-12-Middle-School-Math-Concepts-Grade-7',
                    'CK-12-Middle-School-Math-Concepts-Grade-8',
                    'Algebra-Explorations-Concepts-Pre-K-through-Grade-7',
                    'CK-12-Basic-Algebra-Concepts',
                    'CK-12-Algebra-I-Concepts',
                    'CK-12-Algebra-I-Concepts-Honors',
                    'CK-12-Algebra-II-with-Trigonometry-Concepts',
                    'CK-12-Basic-Probability-and-Statistics-Concepts',
                    'CK-12-Probability-and-Statistics-Concepts',
                    'CK-12-Advanced-Probability-and-Statistics-Concepts',
                    'CK-12-Trigonometry-Concepts',
                    'CK-12-Math-Analysis-Concepts',
                    'CK-12-Geometry-Concepts-Honors',
                    'CK-12-Basic-Geometry-Concepts',
                    'CK-12-Elementary-and-Intermediate-College-Algebra',
                    'CK-12-College-Precalculus',

                    'CK-12-Conceptos-Escuela-de-Matemáticas-Medio-Grado-6',
                    'CK-12-Conceptos-Escuela-de-Matemáticas-Medio-Grado-7',
                    'CK-12-Conceptos-Escuela-de-Matemáticas-Medio-Grado-8',
                    'CK-12-Conceptos-Básicos-de-Álgebra',
                    'CK-12-Conceptos-de-Exploraciones-de-Álgebra-Grados-0-7',
                    'CK-12-Conceptos-de-Álgebra-I',
                    'CK-12-Conceptos-de-Álgebra-I-Nivel-Superior-en-Español',
                    'CK-12-Conceptos-de-Álgebra-II-con-Trigonometría-en-Español',
]

SCIENCE_BOOKS = [
                    'CK-12-Earth-Science-Concepts-For-Middle-School',
                    'CK-12-Life-Science-Concepts-For-Middle-School',
                    'CK-12-Physical-Science-Concepts-For-Middle-School',
                    'CK-12-Earth-Science-Concepts-For-High-School',
                    'CK-12-Biology-Concepts',
                    'CK-12-Biology-Advanced-Concepts',
                    'CK-12-Chemistry-Concepts-Intermediate',
                    'CK-12-Physics-Concepts-Intermediate',
                    'CK-12-Physics-Concepts-Intermediate',
]
        

def get_lesson_concept_hash(chapter_count, lesson_count, artifact_rev):
    log.info("Processing lesson [%d.%d]: [%s, %s]" %(chapter_count, lesson_count, artifact_rev.artifact.id, artifact_rev.id))
    lesson_content = artifact_rev.getXhtml()
    lesson_hash = ''
    if lesson_content:
        lesson_hash = hashlib.md5(lesson_content).hexdigest()

    concept_hash = ''
    #try:
    #    concept_rev = artifact_rev.children[0].child
    #    concept_content = concept_rev.getXhtml()
    #    if concept_content:
    #        concept_hash = hashlib.md5(concept_content).hexdigest()
    #except Exception as e:
    #    log.info("Unable to compute concept hash for lesson with artifactID: [%s]" %(artifact_rev.artifact.id))
    #    log.info(traceback.format_exc(e))
    return lesson_hash, concept_hash

def get_book_fingerprint(book):
    log.info("Processing book with handle: [%s]" % (book.handle))
    fingerprint = {}
    chapter_count = lesson_count = 0
    for child in book.revisions[0].children:
        child_artifact = child.child.artifact
        child_ar = child.child
        artifact_type = child_artifact.type.name
        if artifact_type == 'chapter':
            chapter_count += 1
            lesson_count = 0
            fingerprint[chapter_count] = []
            for artifact_rev in child_ar.children:
                lesson_rev = artifact_rev.child
                artifact = lesson_rev.artifact
                if artifact.type.name == 'lesson':
                    lesson_count += 1
                    lesson_hash, concept_hash = get_lesson_concept_hash(chapter_count, lesson_count, lesson_rev)
                    fingerprint[chapter_count].append('%s-%s' %(lesson_hash, concept_hash))
        elif artifact_type == 'lesson':
            chapter_count += 1
            lesson_count = 0
            fingerprint[chapter_count] = []
            lesson_hash, concept_hash = get_lesson_concept_hash(chapter_count, lesson_count, child_ar)
            fingerprint[chapter_count].append('%s-%s' %(lesson_hash, concept_hash))
    return fingerprint


def run(book_handle, member_id1, member_id2, book_type_id=1):
    member = api.getMemberByID(member_id1)
    if not member:
        log.info("Member does not exist for memberID: [%s]" %(member_id1))
        return
    member = api.getMemberByID(member_id2)
    if not member:
        log.info("Member does not exist for memberID: [%s]" %(member_id2))
        return

    print "Processing book with handle: [%s]" % (book_handle)
    log.info("Processing book with handle: [%s]" % (book_handle))
    book1 = api.getArtifactByHandle(handle=book_handle, typeID=book_type_id, creatorID=member_id1)
    if not book1:
        print u'Book with handle: [%s] does not exist in the account of memberID: [%s]' %(book_handle, member_id1)
        log.info('Book with handle: [%s] does not exist in the account of memberID: [%s]' %(book_handle, member_id1))
    book2 = api.getArtifactByHandle(handle=book_handle, typeID=book_type_id, creatorID=member_id2)
    if not book2:
        print u'Book with handle: [%s] does not exist in the account of memberID: [%s]' %(book_handle, member_id2)
        log.info('Book with handle: [%s] does not exist in the account of memberID: [%s]' %(book_handle, member_id2))

    if not (book1 and book2):
        return

    fingerprint1 =  get_book_fingerprint(book1)
    fingerprint2 =  get_book_fingerprint(book2)

    chapter_counts1 = len(fingerprint1.keys())
    chapter_counts2 = len(fingerprint2.keys())

    error = False
    if chapter_counts1 != chapter_counts2:
        log.info('Book with artifactID: [%s] of memberID: [%s] has [%d] chapters' %(book1.id, member_id1, chapter_counts1))
        log.info('Book with artifactID: [%s] of memberID: [%s] has [%d] chapters' %(book2.id, member_id2, chapter_counts2))
        print "Chapter counts do not match. memberID[%s] Count[%d], memberID[%s] Count[%d]" % (member_id1, chapter_counts1, member_id2, chapter_counts2)
        error = True
        return

    chapters = fingerprint1.keys()
    chapters = sorted(chapters)
    for each_chapter in chapters:
        log.info('Analyzing chapter: [%d]' %(each_chapter))
        chapter1_hashes = fingerprint1[each_chapter]
        chapter2_hashes = fingerprint2[each_chapter]
        lesson_counts1 = len(chapter1_hashes)
        lesson_counts2 = len(chapter2_hashes)
        if lesson_counts1 != lesson_counts2:
            log.info('Chapter [%d] of book with artifactID: [%d] has [%d] lessons' %(each_chapter, book1.id, lesson_counts1))
            log.info('Chapter [%d] of book with artifactID: [%d] has [%d] lessons' %(each_chapter, book2.id, lesson_counts2))
            print "Lesson counts for chapter[%d] do not match. memberID[%s] lessons[%d], memberID[%s] lessons[%d]" % (each_chapter, member_id1, lesson_counts1, member_id2, lesson_counts2)
            error = True
            continue
        else:
            for i in range(lesson_counts1):
                log.info('Content for chapter: [%d] lesson: [%s] match? [%s] == [%s], [%s]' %(each_chapter, i+1, fingerprint1[each_chapter][i], fingerprint2[each_chapter][i], str(fingerprint1[each_chapter][i] == fingerprint2[each_chapter][i])))
                if fingerprint1[each_chapter][i] != fingerprint2[each_chapter][i]:
                    log.info('Content for chapter: [%d] lesson: [%d] in both the books do not match' %(each_chapter, i+1))
                    print 'Content for chapter: [%d] lesson: [%d] in both the books do not match' %(each_chapter, i+1)
                    error = True
    if not error:
        print 'All good!'
    else:
        print 'The books do not match. Please look at the logs at: [%s] for details' %(LOG_FILENAME)

