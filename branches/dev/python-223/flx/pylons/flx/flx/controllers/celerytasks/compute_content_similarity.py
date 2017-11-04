import logging
import os
import pickle
import traceback
import datetime

from paste.deploy.converters import asbool

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import linear_kernel

from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.model import api
from flx.lib import helpers as h
from flx.model.mongo.artifactsimilarity import ArtifactSimilarity

logger = logging.getLogger(__name__)

class ComputeContentSimilarity(PeriodicTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize PeriodicTask
        PeriodicTask.__init__(self, **kwargs)
        self.skipIfRunning = False
        self.maxWaitMinutes = 60
        self.routing_key = 'ml'
        self.db = self.mongo_db

        self.corpus_work_dir = self.config.get("ml.corpus_work_dir")
        logger.info('ml.corpus_work_dir: [%s]' %(self.corpus_work_dir))
        if not self.corpus_work_dir and not os.path.exists(self.corpus_work_dir):
            raise Exception('ml.corpus_work_dir config not set or directory does not exists. Exiting')

        self.persist_features_path = self.config.get("ml.persist_features_path")
        logger.info('ml.persist_features_path: [%s]' %(self.persist_features_path))
        if not self.persist_features_path and not os.path.exists(self.persist_features_path):
            raise Exception('ml.persist_features_path config not set or directory does not exists. Exiting')

        self.persist_model_path = self.config.get("ml.persist_model_path")
        logger.info('ml.persist_model_path: [%s]' %(self.persist_model_path))
        if not self.persist_model_path and not os.path.exists(self.persist_model_path):
            raise Exception('ml.persist_model_path config not set or directory does not exists. Exiting')

        self.persist_corpus_sequence = self.config.get("ml.persist_corpus_sequence")
        logger.info('ml.persist_corpus_sequence: [%s]' %(self.persist_corpus_sequence))
        if not self.persist_corpus_sequence and not os.path.exists(self.persist_corpus_sequence):
            raise Exception('ml.persist_corpus_sequence config not set or directory does not exists. Exiting')

        self.compute_all_artifact_similarity = self.config.get("ml.compute_all_artifact_similarity", "false").strip()
        self.compute_all_artifact_similarity = False
        try:
            self.compute_all_artifact_similarity = asbool(self.compute_all_artifact_similarity) 
        except:
            pass


    def run(self, **kwargs):
        """
            Computes content similarity between published UGC read modalities and CK-12 read modalities
        """
        logger.info("Arguments: %s" % kwargs)
        PeriodicTask.run(self, **kwargs)
        pageNum = 1
        pageSize = 256
        try:
            tfidf_transformer = TfidfTransformer()
            count_model = pickle.load(open(self.persist_model_path, 'rb'))

            count_vectorizer = CountVectorizer(decode_error="replace", vocabulary=pickle.load(open(self.persist_features_path, "rb")))
            tfidf_model = tfidf_transformer.fit_transform(count_model)

            corpus_sequence = pickle.load(open(self.persist_corpus_sequence, 'rb'))

            def _compute_similarity(text):
                new_count_vectorizer = count_vectorizer.fit_transform([text])
                new_tfidf_vector = tfidf_transformer.fit_transform(new_count_vectorizer)

                cosine_similarities = linear_kernel(new_tfidf_vector, tfidf_model).flatten()
                index = cosine_similarities.argsort()[-1]
                similarity = cosine_similarities[index]
                return index, similarity

            def get_pairwise_similarity(document1, document2):
                paired_data_set = [document1, document2]
                vectorizer = CountVectorizer(stop_words='english')
                train_vectorizer_array = vectorizer.fit_transform(paired_data_set).toarray()
                transformer = TfidfTransformer()
                tfidf =  transformer.fit_transform(train_vectorizer_array).toarray()
                cosine_similarities = linear_kernel(tfidf[0], tfidf[1]).flatten()
                return cosine_similarities[0]

            count = 1
            #artifact_similarity = ArtifactSimilarity(self.db)
            sinceUpdateTime = None
            untilUpdateTime = None
            if not self.compute_all_artifact_similarity:
                today = datetime.date.today()
                yesterday = today - datetime.timedelta(days = 1)
                sinceUpdateTime = datetime.datetime(yesterday.year, yesterday.month, yesterday.day)
                untilUpdateTime = datetime.datetime(today.year, today.month, today.day) - datetime.timedelta(seconds = 1)
            logger.info('sinceUpdateTime: [%s], untilUpdateTime: [%s]' %(sinceUpdateTime, untilUpdateTime))
            while True:
                artifacts = api.getPublishedArtifacts(typeNames=['lesson'], \
                                                      skipCreatorIDs=[3], \
                                                      sinceUpdateTime=sinceUpdateTime, \
                                                      untilUpdateTime=untilUpdateTime, \
                                                      pageNum=pageNum, \
                                                      pageSize=pageSize)
                total_artifacts = artifacts.getTotal()

                if not artifacts:
                    break
                for each_published_artifact in artifacts:
                    try:
                        logger.info('Processing artifactID: [%s]. [%d/%d]' %(each_published_artifact.id, count, total_artifacts))
                        kwargs = {'artifactID':each_published_artifact.id}

                        artifact = api.getArtifactByID(id=each_published_artifact.id)
                        xhtml = artifact.getXhtml(includeChildContent=True, includeChildHeaders=True)
                        if not xhtml:
                            continue
                        text = h.xhtml_to_text(xhtml)
                        kwargs['artifactRevisionID'] = artifact.revisions[0].id

                        index, similarity = _compute_similarity(text)
                        logger.info('Similarity: [%s]' %(similarity))
                        base_document_info = corpus_sequence[index]
                        base_document_path = self.corpus_work_dir + '/' + '%s_%s_%s.txt' %(base_document_info['domain_eid'], \
                                                                                       base_document_info['artifact_id'], \
                                                                                       base_document_info['artifact_revision_id'])
                        kwargs['sourceArtifactID'] = base_document_info['artifact_id']
                        kwargs['sourceArtifactRevisionID'] = base_document_info['artifact_revision_id']
                        kwargs['sourceEncodedID'] = base_document_info['domain_eid']

                        if not os.path.exists(base_document_path):
                            logger.info('Base document not found at: [%s]. Skipping artifact with artifctID: [%s]' %(base_document_path, artifact.id))
                            continue
                        base_content = open(base_document_path).read()
                        base_index, base_similarity = _compute_similarity(base_content)
                        logger.info('Base Similarity: [%s]' %(base_similarity))
                        pairwise_similarity = get_pairwise_similarity(text, base_content)
                        logger.info('Pairwise Similarity: [%s]' %(pairwise_similarity))
                        restricted_similarity = min((1 - base_similarity + similarity), 1)
                        actual_similarity = (pairwise_similarity + restricted_similarity) / 2
                        logger.info('Actual Similarity: [%s]' %(actual_similarity))
                        kwargs['similarity'] = actual_similarity

                        logger.info('Saving artifact similarity: [%s]' %(kwargs))
                        ArtifactSimilarity(self.db).createArtifactSimilarity(**kwargs)
                    except Exception, similarity_ex:
                        logger.error('Exception while computing similarity for artifactID: [%s]' %(artifact.id))
                        logger.error(traceback.format_exc(similarity_ex))

                    count += 1

                pageNum += 1

        except Exception, e:
            logger.error('Unable to process artifact similarity. Error: [%s]' % (e))
            logger.error(traceback.format_exc(e))
            raise e
