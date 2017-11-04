import logging
from urllib import quote

from sqlalchemy import text

from flx.model import api
from flx.model import meta
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/ugc_books.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

server_url = 'http://www.ck12.org'
output_path = '/tmp/ugc_books.csv'

def run():
    session = meta.Session()
    get_books_query = "select id from Artifacts where artifactTypeID = 1 and creatorID not in (3,5111,98045,130505,142431,146834,608164,148273)"
    results = session.execute(text(get_books_query)).fetchall()
    artifact_ids = [x[0] for x in results]
    artifact_count = len(artifact_ids)

    fd = open(output_path, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_headers = ['Artifact Title', 'Artifact URL', 'Artifact ID', 'Artifact Creator', 'Artifact Creator Email', 'Artifact Creator ID', 'Published', 'Last Updated', 'Revision Count', 'Source Artifact', 'Source Artifact Creator']
    csv_writer.writerow(csv_headers)

    for i, each_artifact_id in enumerate(artifact_ids):
        artifact = api.getArtifactByID(id=each_artifact_id)
        log.info('Processing artifactID: [%d] [%d] of [%d]' %(artifact.id, i+1, artifact_count))

        if artifact.creator.email.endswith('@ck12.org'):
            continue

        perma_array = artifact.getPerma().split('/')
        artifact_permas = []
        for index, val in enumerate(perma_array):
            if index in [1, 2]:
                artifact_permas.append(val)
            if index == 3:
                artifact_permas = [val] + artifact_permas
        artifact_url = '%s/%s' % (server_url, quote('/'.join(artifact_permas).encode('utf-8')))

        revision_count = len(artifact.revisions)

        ancestor_id = artifact.ancestorID
        if ancestor_id:
            artifact_revision = api.getArtifactRevisionByID(id=ancestor_id)
            if artifact_revision:
                source_artifact_title = artifact_revision.artifact.name
                source_artifact_creator = artifact_revision.artifact.creator.email
            pass
        else:
            source_artifact_title = 'original'
            source_artifact_creator = 'original'

        if artifact.revisions[0].publishTime:
            published = 'yes'
        else:
            published = 'no'

        last_updated = artifact.updateTime

        rows = [artifact.name, artifact_url, artifact.id, artifact.creator.name, artifact.creator.email, artifact.creator.id, published, last_updated, revision_count, source_artifact_title, source_artifact_creator]
        csv_writer.writerow(rows)
