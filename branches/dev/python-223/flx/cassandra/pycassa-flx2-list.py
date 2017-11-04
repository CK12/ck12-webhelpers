#!/usr/bin/env python

import pycassa

client = pycassa.connect(['localhost:9160'])
client.login('flx2', { 'username':'stephen', 'password':'ck123' })

artifactTypes = pycassa.ColumnFamily(client, 'flx2', 'ArtifactTypes')
artifacts = pycassa.ColumnFamily(client, 'flx2', 'Artifacts')
books = pycassa.ColumnFamily(client, 'flx2', 'Books')
chapters = pycassa.ColumnFamily(client, 'flx2', 'Chapters')
titles = pycassa.ColumnFamily(client, 'flx2', 'Titles')

print 'artifactTypes --------------------------------------------------'
print list(artifactTypes.get_range())
print 'artifacts ------------------------------------------------------'
print list(artifacts.get_range())
print 'books ----------------------------------------------------------'
print list(books.get_range())
print 'chapters -------------------------------------------------------'
print list(chapters.get_range())
print 'titles ---------------------------------------------------------'
print list(titles.get_range())
