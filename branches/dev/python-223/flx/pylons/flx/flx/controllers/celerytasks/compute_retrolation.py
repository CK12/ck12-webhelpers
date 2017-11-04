import logging
import os
import pickle
import traceback
import datetime

from paste.deploy.converters import asbool

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import linear_kernel

from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.model import api
from flx.lib import helpers as h
from flx.model.mongo.artifactsimilarity import ArtifactSimilarity

logger = logging.getLogger(__name__)

class ComputeRetrolation(PeriodicTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize PeriodicTask
        PeriodicTask.__init__(self, **kwargs)
        self.skipIfRunning = False
        self.maxWaitMinutes = 60
        self.routing_key = 'ml'
        self.db = self.mongo_db
        self.top_n = 3

        self.persist_tfidf_corpus_path = self.config.get("ml.persist_tfidf_corpus_path")
        logger.info('ml.persist_features_path: [%s]' %(self.persist_tfidf_corpus_path))
        if not self.persist_tfidf_corpus_path and not os.path.exists(self.persist_tfidf_corpus_path):
            raise Exception('self.persist_tfidf_corpus_path config not set or directory does not exists. Exiting')

        self.persist_corpus_sequence = self.config.get("ml.persist_corpus_sequence")
        logger.info('ml.persist_corpus_sequence: [%s]' %(self.persist_corpus_sequence))
        if not self.persist_corpus_sequence and not os.path.exists(self.persist_corpus_sequence):
            raise Exception('ml.persist_corpus_sequence config not set or directory does not exists. Exiting')


    def run(self, **kwargs):
        """
            Computes content similarity between published UGC read modalities and CK-12 read modalities
        """
        logger.info("Arguments: %s" % kwargs)
        PeriodicTask.run(self, **kwargs)
        try:
            tfidf_corpus = pickle.load(open(self.persist_tfidf_corpus_path, 'rb'))
            #tfidf_corpus = tfidf_corpus.toarray()
            cosine_distances = linear_kernel(tfidf_corpus, tfidf_corpus)

            corpus_sequence = pickle.load(open(self.persist_corpus_sequence, 'rb'))

            branch_info = {}
            for i, each_document in enumerate(corpus_sequence):
                logger.info('Processing document: [%s]' %(each_document))
                domain = each_document['domain_eid']
                section_artifact_id = each_document['artifact_id']
                section = api.getArtifactByID(id=section_artifact_id)
                matches = []
                if domain == 'section':
                    #cosine_distances = linear_kernel(tfidf_corpus[i:i+1], tfidf_corpus).flatten()
                    indices = np.argsort(cosine_distances[i])[::-1]
                    match_indices = []
                    for index in indices:
                        match = corpus_sequence[index]
                        if match['domain_eid'] != 'section' and match['domain_eid'] not in matches:
                            matches.append(match['domain_eid'])
                            match_indices.append(index)
                        if len(match_indices) == self.top_n:
                            break
                    unique_matches = []
                    for index in match_indices:
                        lesson_artifact_id = corpus_sequence[index]['artifact_id']
                        lesson_eid = corpus_sequence[index]['domain_eid']
                        branch_eid = lesson_eid[:7]
                        if branch_eid in branch_info:
                            branch = branch_info[branch_eid]
                        else:
                            branch = api.getBrowseTermByEncodedID(encodedID=branch_eid)
                            branch_info[branch_eid] = branch
                        concept = api.getBrowseTermByEncodedID(encodedID=lesson_eid)
                        lesson = api.getArtifactByID(id=lesson_artifact_id)
                        unique_matches.append({'concept_eid': lesson_eid, \
                                        'concept_name': concept.name, \
                                        'concept_handle': concept.handle, \
                                        'branch_handle': branch.handle.lower(), \
                                        'lesson_handle': lesson.handle.lower(), \
                                        })
                        logger.info('Found matching document with: EID [%s] lesson title [%s] for section title [%s]' \
                                                                                            %(corpus_sequence[index]['domain_eid'], \
                                                                                            lesson.getTitle(), \
                                                                                            section.getTitle()))
                    self.db.Retrolation.update({'section_artifact_id': section_artifact_id},
                                                {'$set': {'concepts': unique_matches}},
                                                upsert = True)

        except Exception, e:
            logger.error('Unable to get retrolation. Error: [%s]' % (e))
            logger.error(traceback.format_exc(e))
            raise e
