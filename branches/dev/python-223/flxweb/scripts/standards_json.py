from flxweb.lib.remoteapi import RemoteAPI
import logging

LOG_FILENAME = "/tmp/standards_json.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

SERVER_NAME = "http://www.ck12.org/flx"
remoteapi = RemoteAPI()

GRADES = {
            'K': 'Kindergarten',
            '1': '1st Grade',
            '2': '2nd Grade',
            '3': '3rd Grade',
            '4': '4th Grade',
            '5': '5th Grade',
            '6': '6th Grade',
            '7': '7th Grade',
            '8': '8th Grade',
            '9': '9th Grade',
            '10': '10th Grade',
            '11': '11th Grade',
            '12': '12th Grade'
        }

def run(json_file_path='/opt/2.0/flxweb/flxweb/public/media/js/models/standards.json', server_name=None):
    """
        Script to go create standards, subject and grades json data.
    """
    if server_name:
        SERVER_NAME = server_name

    result = {}
    result['response'] = {}
    result['response']['standards'] = []
    standard_board = getCorrelatedStandardboards(params={'nocache':'true'})
    for standard in standard_board:
        try:
            standardDict = {}
            standardDict['name'] = standard['name']
            standardDict['id'] = standard['id']
            standardDict['countryCode'] = standard['countryCode']
            standardDict['longname'] = standard['longname']
            standardDict['subjects'] = []
            log.info("Getting Subjects for standardID: %s" % standard['id'])
            print "Getting Subjects for standardID: %s" % standard['id']
            standard_subjects = getCorrelatedSubjects(standardboard=standard['id'], params={'nocache':'true'})
            for subject in standard_subjects:
                try:
                    subject['grades'] = []
                    log.info("Getting Grades for standardID: %s, subject: %s" % (standard['id'], subject['name']))
                    print "Getting Grades for standardID: %s, subject: %s" % (standard['id'], subject['name'])
                    _grades = getCorrelatedGrades(subject['name'], standard['id'], params={'nocache':'true'})
                    if _grades:
                        subject['grades'] = _grades
                        standardDict['subjects'].append(subject)
                        continue
                    log.info("Getting Alternate Grades for standardID: %s, subject: %s" % (standard['id'], subject['name']))
                    print "Getting Alternate Grades for standardID: %s, subject: %s" % (standard['id'], subject['name'])
                    _grades = getAlternateCorrelatedGrades(subject=subject['name'],standardboard=standard['id'], params={'nocache':'true'})
                    subject['grades'] = _grades['grades']
                    subject['standardboardLongname'] = _grades['standardboardLongname']
                    subject['standardboard'] = _grades['standardboard']
                    subject['standardboardID'] = _grades['standardboardID']
                    subject['message'] = _grades['message']
                    standardDict['subjects'].append(subject)
                except Exception as ex:
                    log.error('Error in getting subjects : %s' % ex)
            result['response']['standards'].append(standardDict)
        except Exception as ex:
            log.error('Error in getting standard : %s' % ex)
    create_json_file(json_file_path, result)
    print "Updated standards json : %s" % json_file_path

def create_json_file(file_path, data):
    try:
        import json
        log.info("Standards json : %s" % data)
        with open(file_path, 'w') as outfile:
            json.dump(data, outfile, sort_keys = False, indent = 4, ensure_ascii=True)
    except Exception as ex:
        log.error('Error creating json file : %s' % ex)

def getCorrelatedSubjects(standardboard=None, grade=None, params=None):
    subjects = []
    try:
        api_url = 'get/info/subjects/correlated'
        if standardboard:
            api_url = '%s/%s' % (api_url,standardboard)
        data = RemoteAPI._makeCall(SERVER_NAME, api_url, 500, params_dict=params, method='GET')
        if 'response' in data and\
           'subjects' in data['response']:
            subjects = data['response']['subjects']
            #subjects.append({'id':12114, 'name':'physical science'})
    except Exception, e:
        log.exception( e )
    return subjects

def getCorrelatedGrades(subject=None,standardboard=None, params=None ):
    gradesList = []
    message = ''
    try:
        api_url = 'get/info/grades/correlated'
        if subject:
            api_url = '%s/%s' % (api_url,subject)

        if standardboard:
            api_url = '%s/%s' % (api_url,standardboard)

        data = RemoteAPI._makeCall(SERVER_NAME, api_url, 500, params_dict=params, method='GET')
        if 'response' in data and 'grades' in data['response']:
            _grades = data['response']['grades']
            for index,grade in enumerate(_grades):
                if grade['name'] in GRADES:
                    grade['longname'] = GRADES[grade['name']]
                    gradesList.append(grade)
        data['response']['grades'] = gradesList
    except Exception, e:
        log.exception( e )
    return data['response']['grades']

def getCorrelatedStandardboards(subject=None,grade=None, params=None):
    standardBoards = []
    try:
        api_url = 'get/info/standardboards/correlated'
        if subject:
            api_url = '%s/%s' % (api_url,subject)

        if grade:
            api_url = '%s/%s' % (api_url,grade)

        data = RemoteAPI._makeCall(SERVER_NAME, api_url, 500, params_dict=params, method='GET')
        if 'response' in data and\
           'standardBoards' in data['response']:
            standardBoards= data['response']['standardBoards']
    except Exception, e:
        log.exception( e )
    return standardBoards

def getAlternateCorrelatedGrades(subject=None,standardboard=None, params=None ):
    gradesList = []
    message = ''
    try:
        api_url = 'get/info/grades/correlated_alternate'
        
        if subject:
            api_url = '%s/%s' % (api_url,subject)
        
        if standardboard:
            api_url = '%s/%s' % (api_url,standardboard)
            
        data = RemoteAPI._makeCall(SERVER_NAME, api_url, 500, params_dict=params, method='GET')
        if 'response' in data and 'grades' in data['response']:
            gradesList = data['response']['grades']
            for index,grade in enumerate(gradesList):
                if grade['name'] in GRADES:
                    grade['longname'] = GRADES[grade['name']]
                    gradesList[index] = grade
        data['response']['grades'] = gradesList
    except Exception, e:
            log.exception(e)
    return data['response']
