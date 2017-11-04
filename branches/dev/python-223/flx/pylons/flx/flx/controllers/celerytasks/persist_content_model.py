import codecs
import logging
import os
import pickle
import traceback

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer

from flx.controllers.celerytasks.generictask import GenericTask
from flx.model import api
from flx.lib import helpers as h
from flx.lib.ml import utils as u
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

class PersistContentModel(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.skipIfRunning = False
        self.routing_key = 'ml'

        self.allowed_domains = ['MAT', 'SCI']
        self.allowed_sections = ['CK.MAT', 'CK.SCI']
        self.corpus_work_dir = self.config.get("ml.corpus_work_dir")
        logger.info(self.corpus_work_dir)
        if self.corpus_work_dir and not os.path.exists(self.corpus_work_dir):
            os.makedirs(self.corpus_work_dir, 0755)
        self.db = self.mongo_db

    def _safe_create_basedir(self, path):
        dir = os.path.dirname(path)
        if not os.path.exists(dir):
            os.makedirs(dir)
 
    def run(self, **kwargs):
        """
            Saves xhtml and text contents for ck-12 owned read modalities to directory with the filename format -
            domain_eid_artifactID_artifactRevisionID.xhtml and
            domain_eid_artifactID_artifactRevisionID.txt
        """
        logger.info("Arguments: %s" % kwargs)
        GenericTask.run(self, **kwargs)
        try:
            process_all_contents = self.config.get('ml.process_all_corpus', 'true').lower() == 'true'
            modality_types = ['lesson', 'section']
            #typeID = typeIDs[0]
            member_id = 3
            member = api.getMember(id=member_id)
            artifacts = api.getArtifactsByOwner(member, typeName=modality_types)
            logger.info('Total artifacts to process = %s' % len(artifacts))
            corpus = []
            corpus_sequence = []
            count = 0
            for artifact in artifacts:
                try:
                    domain_eid = None
                    if artifact.type.name == 'section':
                        domain_eid = 'section'
                        if not artifact.encodedID or artifact.encodedID[:6] not in self.allowed_sections:
                            logger.info("Skipped [%s] artifact[%s] with encodedID : [%s]" % (artifact.type.name, artifact.id, artifact.encodedID))
                            continue
                    elif artifact.type.name == 'lesson':
                        domain = artifact.getDomain()
                        if domain:
                            domain_eid = artifact.getDomain()['encodedID']
                        if not domain_eid or domain_eid[:3] not in self.allowed_domains:
                            logger.info("Skipped [%s] artifact[%s] with domain : [%s]" % (artifact.type.name, artifact.id, domain_eid))
                            continue
                    xhtml =  artifact.getXhtml(includeChildContent=True, includeChildHeaders=True)
                    if not xhtml:
                        continue
                    content_text = h.xhtml_to_text(xhtml)
                    if len(content_text.split()) <= 10:
                        continue
                    corpus.append(content_text)
                    corpus_sequence.append({'artifact_id':artifact.id, 'artifact_revision_id':artifact.revisions[0].id, 'domain_eid':domain_eid})
                    #if count == 100:
                    #    break
                    #count += 1

                    xhtml_filename = '%s_%s_%s.xhtml' % (domain_eid, artifact.id, artifact.revisions[0].id)
                    xhtml_filepath = '%s/%s' % (self.corpus_work_dir, xhtml_filename)
                    text_filename = '%s_%s_%s.txt' % (domain_eid, artifact.id, artifact.revisions[0].id)
                    text_filepath = '%s/%s' % (self.corpus_work_dir, text_filename)

                    if not os.path.isfile(xhtml_filepath) or process_all_contents:
                        #Save xhtml content
                        xhtml_write_path = codecs.open(xhtml_filepath, "w", encoding='utf-8')
                        logger.info("Saved artifact xhtml for artifact id: [%s] with name: [%s]" % (artifact.id, xhtml_filepath))
                        xhtml_write_path.write(xhtml)
                        xhtml_write_path.close()
                    
                    if not os.path.isfile(text_filepath) or process_all_contents:
                        #Save text content
                        text_write_path = codecs.open(text_filepath, "w", encoding='utf-8')
                        logger.info("Saved text content for artifact id: [%s] with name: [%s]" % (artifact.id, text_filepath))
                        text_write_path.write(content_text)
                        text_write_path.close()

                except Exception, e:
                    logger.error('Failed to save contents for artifact [%s] to external directory , Error:%s' % (artifact.id, e))
                    logger.error(traceback.format_exc(e))

            count_vectorizer = CountVectorizer(min_df=1)
            count_model = count_vectorizer.fit_transform(corpus)

            tfidf_vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_model = tfidf_vectorizer.fit(corpus)
            tfidf_model_location = self.config.get('ml.persist_tfidf_model_path')
            if tfidf_model_location:
                self._safe_create_basedir(tfidf_model_location)
                logger.info('Persisting TF-IDF model at: [%s]' %(tfidf_model_location))
                pickle.dump(tfidf_model, open(tfidf_model_location, 'wb'))

            tfidf_corpus = tfidf_model.transform(corpus)
            tfidf_corpus_location = self.config.get('ml.persist_tfidf_corpus_path')
            if tfidf_corpus_location:
                self._safe_create_basedir(tfidf_corpus_location)
                logger.info('Persisting TF-IDF vectors for CK-12 corpus at: [%s]' %(tfidf_corpus_location))
                pickle.dump(tfidf_corpus, open(tfidf_corpus_location, 'wb'))

            model_location = self.config.get('ml.persist_model_path')
            if model_location:
                self._safe_create_basedir(model_location)
                logger.info('Persisting CountVectorizer model at: [%s]' %(model_location))
                pickle.dump(count_model, open(model_location, 'wb'))

            features_location = self.config.get('ml.persist_features_path')
            if features_location:
                self._safe_create_basedir(features_location)
                logger.info('Persisting TF-IDF features at: [%s]' %(features_location))
                pickle.dump(count_vectorizer.vocabulary_, open(features_location, 'wb'))

            corpus_sequence_location = self.config.get('ml.persist_corpus_sequence')
            if corpus_sequence_location:
                self._safe_create_basedir(corpus_sequence_location)
                logger.info('Persisting corpus sequence at: [%s]' %(corpus_sequence_location))
                pickle.dump(corpus_sequence, open(corpus_sequence_location, 'wb'))

            #glove_model_location = self.config.get('ml.glove_model_path')
            #glove_model = u.get_glove_model(glove_model_location)
            #del tfidf_model
            vocabulary = count_vectorizer.vocabulary_
            del tfidf_vectorizer
            del count_model
            del corpus_sequence_location
            del count_vectorizer
            
            ck12_glove_model = dict()
            ids = []
            count = 0
            for word in vocabulary:
                result = self.db.Glove300d.find_one({"word":word})
                if result:
                    _id = ObjectId(result['_id'])
                    ids.append(_id)
                    count += 1                    
                    ck12_glove_model[word] = result.get('features', [])
                    if count % 1000 == 0:                        
                        # performing bulk update.
                        self.db.Glove300d.update({'_id':{'$in':ids}}, {'$set': {'inCK12': True}})
                        logger.info("Completed bulk update. Total Count: [%s]" %(count))
                        ids = []
            # Update the remaining ids
            if ids:
                self.db.Glove300d.update({'_id':{'$in':ids}}, {'$set': {'inCK12': True}})
                logger.info("Completed remaining bulk update. Object Count: [%s]" % len(ids))
                
            ck12_glove_model_location = self.config.get('ml.ck12_glove_model_path')
            pickle.dump(ck12_glove_model, open(ck12_glove_model_location, 'wb'))
                
            tfidf_glove_vecs = []
            for i, content_text in enumerate(corpus):
                content_tfidf_glove_vec = u.get_weighted_avg_tfidf_embedding(content_text, tfidf_model, ck12_glove_model, threshold=99.95, all_words=False)
                tfidf_glove_vecs.append(content_tfidf_glove_vec)
            tfidf_glove_vecs = np.vstack(tfidf_glove_vecs)
            tfidf_glove_corpus_location = self.config.get('ml.persist_tfidf_glove_corpus_path')
            if tfidf_glove_corpus_location:
                self._safe_create_basedir(tfidf_glove_corpus_location)
                logger.info('Persisting TF-IDF and Glove representational vectors for CK-12 corpus at: [%s]' %(tfidf_glove_corpus_location))
                pickle.dump(tfidf_glove_vecs, open(tfidf_glove_corpus_location, 'wb'))

        except Exception, e:
            logger.error('Unable to save modality content. Error: [%s]' % (e))
            logger.error(traceback.format_exc(e))
            raise e
