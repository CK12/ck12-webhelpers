from datetime import date, timedelta
import time
from urllib import quote

import pymongo
import inflect
from unicode_util import UnicodeWriter

from dexter.lib.remoteapi import RemoteAPI as remotecall

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
db_username = None
db_password = None
db_replica_set = None

search_threshold = 0.3
start_date = date(2014, 9, 21)
no_of_days = 30
artifact_types = ['lesson', 'section', 'book', 'tebook', 'workbook', 'labkit', 'quizbook', 'domain', 'rwa', 'lecture', 'enrichment', 'worksheet', 'lab', 'preread', 'postread', 'activity', 'cthink', 'prepostread', 'whileread', 'flashcard', 'studyguide', 'practice', 'asmtquiz', 'quiz', 'exerciseint', 'quizdemo', 'conceptmap', 'web', 'image', 'interactive', 'lessonplan', 'handout', 'presentation', 'simulationint', 'simulation', 'flexbook', 'answerkey']
branches = ['earthscience', 'lifescience', 'physicalscience', 'biology', 'chemistry', 'physics', 'arithmetic', 'measurement', 'algebra', 'geometry', 'probability', 'statistics', 'trigonometry', 'analysis', 'calculus', 'science', 'math', 'precalculus', 'mathematics']

def get_mongo_db():
    """Get mongodb.
    """
    # Get the collection from mongodb
    if db_replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                             replicaSet=db_replica_set,
                                             read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
    else:
        conn = pymongo.MongoClient(host=db_hostname, port=db_port)
    db = conn[db_name]
    if db_username and db_password:
        db.authenticate(db_username, db_password)
    return db

def consice_search_term(search_term):
    for ch in [ ' ', '-']:
        search_term = search_term.replace(ch, '')
    #if len(search_term) <= 2:
    #    search_term = ''
    return search_term

def get_search_score(search_term):
    search_term = unicode(search_term).encode('utf-8')
    api_server = 'http://astro.ck12.org'
    api_path = 'flx/search/modality/minimal/lesson,section,book,tebook,workbook,labkit,quizbook,domain,rwa,lecture,enrichment,worksheet,lab,preread,postread,activity,cthink,prepostread,whileread,flashcard,studyguide,asmtpractice,asmtquiz,quiz,exerciseint,quizdemo,conceptmap,web,image,interactive,lessonplan,handout,presentation,simulationint,simulation/%s' %(quote(search_term))
    params_dict = {'pageNum':1, 'specialSearch':'false', 'filters':'false', 'ck12only':'false', 'pageSize':1}
    api_response = remotecall.makeRemoteCall(api_path, api_server, params_dict=params_dict)
    if api_response['response']['Artifacts']['total'] <= 0:
        score = -1
    else:
        score = api_response['response']['Artifacts']['result'][0]['score']
    return score


def get_singular(word):
    p = inflect.engine()
    singular_word = p.singular_noun(word)
    if not singular_word:
        singular_word = word
    return singular_word

def run():
    stime = time.time()
    csv_headers = ['Date']
    for i in range(10):
        csv_headers.append('Top %s' %(i+1))
    fd = open("/tmp/regional_search_terms_3.csv", 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)

    db = get_mongo_db()

    for i in range(no_of_days):
        search_date = start_date - timedelta(days=i)
        search_date_bucket = search_date.strftime('%Y-%m-%d-day')
        main_filters = {"time_bucket": search_date_bucket, 'country':'united states', 'state':'california'}
        matchClause = {'$match': main_filters}
        groupClause = {'$group': {'total': {'$sum': 1}, '_id': '$searchTerm'}}
        sortClause = {"$sort": {"total": -1}}
        limitClause = {"$limit": 75}

        csv_row = [search_date.strftime('%Y-%m-%d')]

        print 'Generating search data for %s' %(search_date_bucket)

        # Prepare query
        query = []
        query.append(matchClause)
        query.append(groupClause)
        query.append(sortClause)
        query.append(limitClause)

        search_term_count = 0
        search_results = db.SearchAggregate.aggregate(query)
        results = search_results['result']
        for search_data in results:
            search_term = search_data['_id']
            concised_search_term = consice_search_term(search_term)
            if len(search_term.split()) <= 2:
                if get_singular(search_term) in artifact_types:
                    continue
                if get_singular(concised_search_term) in artifact_types:
                    continue
            if search_term in branches:
                continue
            if concised_search_term in branches:
                continue
            search_score = get_search_score(search_term)
            if search_score >= 0.3:
                csv_row.append('%s (%s) (%s)' %(search_data['_id'], search_data['total'], search_score))
                print csv_row[-1]
                search_term_count += 1
            if search_term_count >= 10:
                break

        csv_writer.writerow(csv_row)

    fd.close()
    print "Time taken:%s" % (time.time() - stime)

if __name__ == '__main__':
    run()
