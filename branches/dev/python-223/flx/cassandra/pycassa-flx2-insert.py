#!/usr/bin/env python

import pycassa
import uuid
from datetime import datetime

class ArtifactType(object):
    id = pycassa.String()
    name = pycassa.String()

    def __init__(self, id, name):
        self.key = id
        self.id = id
        self.name = name

class Artifact(object):
    id = pycassa.String()
    owner = pycassa.String()
    artifactType = pycassa.String()
    author = pycassa.String()
    title = pycassa.String()
    summary = pycassa.String()
    created = pycassa.DateTimeString(default=str(datetime.now()))
    modified = pycassa.DateTimeString(default=str(datetime.now()))
    foundationGrid = pycassa.String()
    standardGrid = pycassa.String()
    statistics = pycassa.String()
    rating = pycassa.String()
    file = pycassa.String()
    chapters = pycassa.String()

    def __init__(self, id, owner, artifactType, author, title, summary,
                 created, modified, foundationGrid, standardGrid,
                 statistics, rating, file='', chapters=[]):
        self.key = id
        self.id = id
        self.owner = owner
        self.artifactType = artifactType
        self.author = author
        self.title = title
        self.summary = summary
        self.created = created
        self.modified = modified
        self.foundationGrid = str(foundationGrid)
        self.standardGrid = str(standardGrid)
        self.statistics = str(statistics)
        self.rating = rating
        self.file = file
        self.chapters = str(chapters)

def remove(columnFamily):
        rows = list(columnFamily.get_range())
        for i, (key, column) in enumerate(rows):
            try:
                columnFamily.remove(key)
            except Exception, e:
                print e

client = pycassa.connect(['localhost:9160'])
client.login('flx2', { 'username':'stephen', 'password':'ck123' })

artifactTypes = pycassa.ColumnFamily(client, 'flx2', 'ArtifactTypes')
artifacts = pycassa.ColumnFamily(client, 'flx2', 'Artifacts')
books = pycassa.ColumnFamily(client, 'flx2', 'Books')
chapters = pycassa.ColumnFamily(client, 'flx2', 'Chapters')
titles = pycassa.ColumnFamily(client, 'flx2', 'Titles')

ArtifactType.objects = pycassa.ColumnFamilyMap(ArtifactType, artifactTypes)
Artifact.objects = pycassa.ColumnFamilyMap(Artifact, artifacts)

remove(titles)
remove(chapters)
remove(books)
remove(artifacts)
remove(artifactTypes)

id = str(uuid.uuid4())
bookType = ArtifactType(id, 'book')
ArtifactType.objects.insert(bookType)
id = str(uuid.uuid4())
chapterType = ArtifactType(id, 'chapter')
ArtifactType.objects.insert(chapterType)
chapterList = []

now = datetime.now()
id = str(uuid.uuid4())
chapter = Artifact(id,
                  '2',
                  chapterType.id,
                  'James Dann',
                  'Newton\'s Laws',
                  "Students learn about Newton's Law's through the study of motion, acceleration, and force.",
                  now,
                  now,
                  [
                    "Physics",
                    "Newton",
                    "pairs",
                    "earth gravitational force",
                    "unbalanced force",
                    "force acts",
                    "constant velocity",
                    "vectors",
                    "magnitude",
                    "state of motion",
                    "vector",
                    "accelerate",
                    "force of gravity",
                    "s2",
                    "acceleration due to gravity"
                  ],
                  [ 'CA', 'IX grade' ],
                  { 'downloads':'869' },
                  '4*',
                  '6.xhtml'
                 )
Artifact.objects.insert(chapter)
chapters.insert(id, { 'id':id })
titles.insert(chapter.title, { 'id':id })
chapterList.append(id)

id = str(uuid.uuid4())
chapter = Artifact(id,
                  '2',
                  chapterType.id,
                  'James Dann',
                  'Energy and Force',
                  "The law of conservation of energy and the law of conservation of momentum is introduced through the study of energy and force.",
                  now,
                  now,
                  [
                    "Physics",
                    "gained energy",
                    "graph",
                    "impulse",
                    "area under the curve",
                    "momentum",
                    "perion of time"
                  ],
                  [ 'CA', 'IX grade' ],
                  { 'downloads':'869' },
                  '4*',
                  '9.xhtml'
                 )
Artifact.objects.insert(chapter)
chapters.insert(id, { 'id':id })
titles.insert(chapter.title, { 'id':id })
chapterList.append(id)

id = str(uuid.uuid4())
chapter = Artifact(id,
                  '2',
                  chapterType.id,
                  'James Dann',
                  'Electricity',
                  "Students are introduced to electricity through the study of the conservation of charge. Other concepts such as electromagnetism, the Coulomb electric force, the law of gravity, charged objects, electric force, and potential energy are presented.",
                  now,
                  now,
                  [
                    "Physics",
                    "electric potential energy",
                    "ions",
                    "repulsive force",
                    "attractive force",
                    "positive charge",
                    "stripped",
                    "protons",
                    "orbits",
                    "atoms",
                    "magnitude",
                    "free electrons",
                    "volts",
                    "coulomb electric force",
                    "negative charges",
                    "negative charge",
                    "positively",
                    "electromagnetism"
                  ],
                  [ 'CA', 'IX grade' ],
                  { 'downloads':'869' },
                  '4*',
                  '13.xhtml'
                 )
Artifact.objects.insert(chapter)
chapters.insert(id, { 'id':id })
titles.insert(chapter.title, { 'id':id })
chapterList.append(id)

id = str(uuid.uuid4())
chapter = Artifact(id,
                  '2',
                  chapterType.id,
                  'James Dann',
                  "Magnetism",
                  "Magnetism is studied through the concepts of electromagnetic force, the Coulomb electric force, electric current, magnetic fields, electricity, the right and left hand rules.",
                  now,
                  now,
                  [
                    "Physics",
                    "charged particles",
                    "circles",
                    "electric power generators",
                    "magnetic",
                    "electron spin",
                    "magnetic field",
                    "electric current",
                    "atoms",
                    "magnetic forces",
                    "magnets",
                    "magnetic fields",
                    "negative charge",
                    "currents"
                  ],
                  [ 'CA', 'IX grade' ],
                  { 'downloads':'869' },
                  '4*',
                  '16.xhtml'
                 )
Artifact.objects.insert(chapter)
chapters.insert(id, { 'id':id })
titles.insert(chapter.title, { 'id':id })
chapterList.append(id)

id = str(uuid.uuid4())
chapter = Artifact(id,
                  '2',
                  chapterType.id,
                  'James Dann',
                  "Light",
                  "Light is studied through the concepts of light waves, electromagnetic radiation and fields, electrons, photons, Fermat's Principle, refraction, diffraction, scattering and color absorption, and dispersion.",
                  now,
                  now,
                  [
                    "Physics",
                    "visible colors",
                    "cones",
                    "brightness",
                    "wavelength",
                    "cells work",
                    "refraction",
                    "absence of light",
                    "transparent materials",
                    "light travels",
                    "sensitive cells",
                    "principle",
                    "electromagnetic radiation",
                    "violet",
                    "fermat",
                    "magnetic fields",
                    "law of reflection",
                    "light",
                    "optics",
                    "light wave",
                    "electromagnetic radiation",
                    "electron",
                    "photon",
                    "diffraction",
                    "scattering",
                    "color absorption",
                    "color dispersion"
                  ],
                  [ 'CA', 'IX grade' ],
                  { 'downloads':'869' },
                  '4*',
                  '18.xhtml'
                 )
Artifact.objects.insert(chapter)
chapters.insert(id, { 'id':id })
titles.insert(chapter.title, { 'id':id })
chapterList.append(id)

id = str(uuid.uuid4())
book = Artifact(id,
            '2',
            bookType.id,
            'James Dann',
            'Physics',
            "The Physics text book for grade 9.",
            now,
            now,
            [],
            [ 'CA', 'IX grade' ],
            { 'downloads':'869' },
            '4*',
            chapters=chapterList
           )
Artifact.objects.insert(book)
books.insert(id, { 'id':id })
titles.insert(book.title, { 'id':id })
