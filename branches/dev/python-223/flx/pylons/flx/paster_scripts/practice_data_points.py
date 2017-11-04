from subprocess import Popen, PIPE, STDOUT

from flx.lib.remoteapi import RemoteAPI
from flx.lib.unicode_util import UnicodeWriter

TAXONOMY_SERVER = "http://www.ck12.org/taxonomy"
CONCEPT_API = "/get/info/concepts/%s/%s"
MONGO_PARAMS = ['mongo', '--quiet', 'assessment']
OUTPUT_FILE = '/tmp/practice_data_points.csv'

queries = [
    "db.Questions.find({'encodedIDs': { '$in': ['@encodedID']}, 'isPublic': true, 'tags.level': 'easy'}).count()",
    "db.Questions.find({'encodedIDs': { '$in': ['@encodedID']}, 'isPublic': true, 'tags.level': 'normal'}).count()",
    "db.Questions.find({'encodedIDs': { '$in': ['@encodedID']}, 'isPublic': true, 'tags.level': 'hard'}).count()",
    "db.TestScoresFlattended.distinct('questionID', { 'encodedID': '@encodedID', 'answered': true }).length",
    "db.TestScores.aggregate([{'$match': {'encodedIDs': '@encodedID'}}, {'$project': {_id: 1, 'points': { '$divide': [ '$score', '$questionsCount'] }}}, {'$group': { _id: null, 'total': { '$avg': '$points'}}}])['result'][0]['total']",
    "db.TestScores.find({'encodedIDs': [ '@encodedID' ] }).count()/db.TestScores.aggregate([{'$match': {'encodedIDs': ['@encodedID'], 'studentID': {'$ne': null}}}, {'$project': {_id: 1, 'studentID': 1, 'points': { '$divide': [ '$score', '$questionsCount'] }}}, {'$match': { 'points': { '$gte': 0.84 }}}])['result'].length",
    "db.TestScoresFlattended.aggregate([{'$match': {'encodedID': '@encodedID', 'answered': true, 'questionID': { '$ne': null} }}, {'$project': { 'questionID':1, 'correct': 1}}, {'$group': { _id: '$questionID', 'correctCnt': {'$sum': {'$cond': [{ '$eq': [ '$correct', true]}, 1, 0 ]}}, 'totalCount': {'$sum': {'$cond': [{ '$eq': [ '$correct', true]}, 1, 1 ] }} }}, {'$project': { _id: 1, 'ratio': { '$divide': [ '$correctCnt', '$totalCount'] } }}, {'$match': {'ratio': { '$gte': 0.9}}}])['result'].length",
    "db.TestScoresFlattended.aggregate([{'$match': {'encodedID': '@encodedID', 'answered': true, 'questionID': { '$ne': null} }}, {'$project': { 'questionID':1, 'correct': 1}}, {'$group': { _id: '$questionID', 'correctCnt': {'$sum': {'$cond': [{ '$eq': [ '$correct', true]}, 1, 0 ]}}, 'totalCount': {'$sum': {'$cond': [{ '$eq': [ '$correct', true]}, 1, 1 ] }} }}, {'$project': { _id: 1, 'ratio': { '$divide': [ '$correctCnt', '$totalCount'] } }}, {'$match': {'ratio': { '$lte': 0.1}}}])['result'].length",
    "db.TestScoresFlattended.aggregate([{'$match': {'encodedID': '@encodedID', 'studentID': { '$ne': null}}}, {'$group': {_id: {'tsID': '$testScoreID', 'sID': '$studentID'}, 'skippedCount': {'$sum': { '$cond': [{'$eq': ['$correct', null]}, 1, 0] }}}}, {'$match': {'skippedCount': 0}}, {'$group': {'_id':'$_id.sID'}}])['result'].length",
    "db.TestScoresFlattended.aggregate([{'$match': {'encodedID': '@encodedID'}}, {'$group': {_id: {'tsID': '$testScoreID', 'submitted': '$submitted', 'created': '$created'}, 'skippedCount': {'$sum': { '$cond': [{'$eq': ['$correct', null]}, 1, 0] }}}}, {'$match': {'skippedCount': 0}}, {'$project': { 'timeTaken': { '$subtract': ['$_id.submitted', '$_id.created']}}}, {'$group': { _id: null, 'avgTimeTaken': {'$avg': '$timeTaken'}}}])['result'][0]['avgTimeTaken']",
    "db.TestScores.distinct('studentID', {'encodedIDs': ['@encodedID'], 'testOwnerID': ObjectId('51bfaef474c3947b1137d1a1')}).length",
    "db.TestScoresFlattended.aggregate([{'$match': {'encodedID': '@encodedID' }}, {'$project': { 'questionID':1, 'correct': 1}}, {'$group': { _id: '$questionID', 'skippedCnt': {'$sum': {'$cond': [{ '$eq': [ '$correct', null]}, 1, 0 ]}}, 'totalCount': {'$sum': {'$cond': [{ '$eq': [ '$correct', true]}, 1, 1 ] }} }}, {'$project': { _id: 1, 'ratio': { '$divide': [ '$skippedCnt', '$totalCount'] } }}])['result'].length",
]


def run(subject, branch):

    output_file = open(OUTPUT_FILE, 'w')
    writer = UnicodeWriter(output_file)

    remoteapi = RemoteAPI()
    concept_api = CONCEPT_API %(subject, branch)
    response = remoteapi._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':1000}, method='GET')
    concepts = response['response']['conceptNodes']
    if concepts:
        for each_concept in concepts:
            encodedID = each_concept['encodedID']
            concept_name = each_concept['name']
            print 'Processing encodedID: [%s]' %(encodedID)
            row = [encodedID, concept_name]
            all_output = []
            for each_query in queries:
                each_query = each_query.replace('@encodedID', encodedID)
                p = Popen(MONGO_PARAMS, stdout=PIPE, stdin=PIPE, stderr=STDOUT)
                output, error = p.communicate(input=each_query)
                if output.lower().find('error') >= 0:
                    output = 'error'
                all_output.append(output.strip())
            row.extend(all_output)
            writer.writerow(row)
    output_file.close()
