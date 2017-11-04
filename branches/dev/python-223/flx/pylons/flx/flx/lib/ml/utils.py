import pickle

import numpy as np
import scipy.spatial.distance as spd

from pylons import config

from flx.model.mongo import getDB as getMongoDB

def get_glove_model(model_file):
    fd = open(model_file, 'r')
    model = {}
    for line in fd:
        split_line = line.split()
        word = split_line[0]
        embedding = [float(val) for val in split_line[1:]]
        model[word] = embedding
    return model

def get_tail(vector, threshold_per, min_num=1):
    threshold = np.percentile(vector, threshold_per)
    if threshold_per > 50:
        indices = np.argwhere(vector >= threshold).squeeze()
        if indices.ndim == 0:
            indices = np.expand_dims(indices,0)
        if len(indices) < min_num:
            indices = np.argsort(vector)[-min_num:]
        elif len(indices) > len(vector)/10:
            indices = np.argwhere(vector > vector.mean()+10*vector.std()).squeeze()
    else:
        indices = np.argwhere(vector <= threshold).squeeze()
        if indices.ndim == 0:
            indices = np.expand_dims(indices,0)
        if len(indices) < min_num:
            indices = np.argsort(vector)[:min_num]
        elif len(indices) > len(vector)/10:
            indices = np.argwhere(vector < vector.mean()-10*vector.std()).squeeze()
    return indices

def get_weighted_avg_tfidf_embedding(text, tfidf, embedding, threshold=99.99, all_words=False):
    tfidf_vector = tfidf.transform([text])
    tfidf_vector = tfidf_vector.toarray()
    tfidf_vector = np.squeeze(tfidf_vector)
    if tfidf_vector.sum() == 0:
        return np.array([0])
    if all_words:
        indices = np.argwhere(tfidf_vector > 0).squeeze()
    else:
        indices = get_tail(tfidf_vector, threshold, min_num=min(20, len(tfidf_vector)))
    if indices.ndim == 0:
        indices = np.expand_dims(indices, 0)
    vocab = np.array(tfidf.get_feature_names())
    words = vocab[indices]
    weights = tfidf_vector[indices]
    indices2rem = []
    word_vectors = []
    for i in range(len(words)):
        word_vector = embedding.find_one({"word": words[i]})
        if word_vector:
            word_vector = word_vector['features']
            word_vectors.append(word_vector)
        else:
            indices2rem.append(i)
    if len(indices2rem) > 0:
        weights = np.delete(weights,indices2rem)
    word_vectors = np.vstack(word_vectors)
    vector = np.average(word_vectors, weights=weights, axis=0)
    return vector


def get_content_matches(text, branches, page_size = 30, tfidf_glove_corpus=None, tfidf_model=None, glove_model=None, corpus_sequence=None):
    if not tfidf_glove_corpus:
        tfidf_glove_corpus_location = config.get('ml.persist_tfidf_glove_corpus_path')
        with open(tfidf_glove_corpus_location, 'r') as fd:
            corpus_tfidf_glove_vecs = pickle.load(fd)

    if not tfidf_model:
        tfidf_model_location = config.get('ml.persist_tfidf_model_path')
        with open(tfidf_model_location, 'r') as fd:
            tfidf_model = pickle.load(fd)

    #if not glove_model:
    #    glove_model_location = config.get('ml.ck12_glove_model_path')
    #    with open(glove_model_location, 'r') as fd:
    #        glove_model = pickle.load(fd)
    mongo_db = getMongoDB(config)

    if not corpus_sequence:
        corpus_sequence_location = config.get('ml.persist_corpus_sequence')
        with open(corpus_sequence_location, 'r') as fd:
            corpus_sequence = pickle.load(fd)

    split_branches = {}
    for i, each_document in enumerate(corpus_sequence):
        branch = ".".join(each_document['domain_eid'].split('.')[:2])
        if branch in split_branches:
            split_branches[branch].append(i)
        else:
            split_branches[branch] = [i]

    search_branches = []
    [search_branches.extend(split_branches[each_branch]) for each_branch in branches]
    sub_corpus = corpus_tfidf_glove_vecs[search_branches]

    text_vecs = get_weighted_avg_tfidf_embedding(text, tfidf_model, mongo_db.Glove300d, all_words=True)
    text_vecs = np.expand_dims(text_vecs, 0)
    dists = spd.cdist(text_vecs, sub_corpus, 'cosine')[0]
    indices = np.argsort(dists)[:page_size]

    indices = [search_branches[i] for i in indices]
    content_matches = [corpus_sequence[i] for i in indices]

    return content_matches
