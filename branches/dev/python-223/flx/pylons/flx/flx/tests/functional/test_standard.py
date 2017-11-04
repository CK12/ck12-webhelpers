from flx.tests import *
import os
import json
import logging

log = logging.getLogger(__name__)

class TestStandardController(TestController):

    def test_loadStateStandardsFromCSV(self):
        dataDir = os.path.join(os.path.dirname(__file__), "..", 'data')
        filenames = [os.path.join(dataDir, 'CA_ALG_standards.csv'), os.path.join(dataDir, 'OR_EARTHSCI_standards.csv')]
        for filename in filenames:
            file = open(filename, 'rb')
            contents = file.read()
            file.close()
            files = [('file', os.path.basename(filename), contents)]
            response = self.app.post(url(controller='standard', action='loadStateStandardsDataFromCSV'), upload_files=files, params={'waitFor': 'true'}, headers={'Cookie': self.getLoginCookie(1)})
            assert '"status": 1005' not in response, "Failed to upload standards data."
            assert "ERROR:" not in response, "Failed to process one or more rows in the CSV file %s." % filename

    def _test_loadStandardsCorrelationsFromCSV(self):
        dataDir = os.path.join(os.path.dirname(__file__), "..", 'data')
        filenames = [os.path.join(dataDir, 'CK_ALG1_CA.csv')]
        for filename in filenames:
            file = open(filename, 'rb')
            contents = file.read()
            file.close()
            files = [('file', os.path.basename(filename), contents)]
            response = self.app.post(url(controller='standards', action='loadStandardsCorrelations'), upload_files=files, params={'waitFor': 'true'}, headers={'Cookie': self.getLoginCookie(1)})
            print response
            assert '"status": 1006' not in response, "Failed to upload standards data."
            assert "ERROR:" not in response, "Failed to process one or more rows in the CSV file."

    def test_getInfo(self):
        response = self.app.get(url(controller='standard', action='getInfo', id='1'))
        assert '"status": 0' in response, 'Failed to get info'

    def test_getStandardInfo(self):
        response = self.app.get(url(controller='standard', action='getStandardInfo', state='us.ca', subject='biology', section='2'))
        assert '"status": 0' in response, 'Failed to get standard info'

    def test_getArtifactInfo(self):
        response = self.app.get(url(controller='standard', action='getArtifactInfo', type='artifact', state='us.ca', id='2'))
        assert '"status": 0' in response, 'Failed to get artifact info'

    def test_getArtifactDetail(self):
        response = self.app.get(url(controller='standard', action='getArtifactDetail', type='artifact', state='us.ca', id='2'))
        assert '"status": 0' in response, 'Failed to get artifact detail'

    def test_getSubjectsWithCorrelations(self):
        response = self.app.get(url(controller='standard', action='getSubjectsWithCorrelations'))
        assert '"status": 0' in response, 'Failed to get subjects with correlations'

    def test_getGradesWithCorrelations(self):
        response = self.app.get(url(controller='standard', action='getGradesWithCorrelations'))
        assert '"status": 0' in response, 'Failed to get grades with correlations'

        response = self.app.get(url(controller='standard', action='getGradesWithCorrelations', subject='algebra'))
        assert '"status": 0' in response, 'Failed to get grades with correlations'

        response = self.app.get(url(controller='standard', action='getGradesWithCorrelations', subject='algebra', standardBoardID='7'))
        assert '"status": 0' in response, 'Failed to get grades with correlations'

        response = self.app.get(url(controller='standard', action='getGradesWithCorrelations', standardBoardID='7'))
        assert '"status": 0' in response, 'Failed to get grades with correlations'

    def test_getStandardBoardsWithCorrelations(self):
        response = self.app.get(url(controller='standard', action='getStandardBoardsWithCorrelations'))
        assert '"status": 0' in response, 'Failed to get standard boards with correlations'

        response = self.app.get(url(controller='standard', action='getStandardBoardsWithCorrelations', subject='algebra'))
        assert '"status": 0' in response, 'Failed to get standard boards with correlations'

        response = self.app.get(url(controller='standard', action='getStandardBoardsWithCorrelations', subject='algebra', grade='9'))
        assert '"status": 0' in response, 'Failed to get standard boards with correlations'

        response = self.app.get(url(controller='standard', action='getStandardBoardsWithCorrelations', grade='9'))
        assert '"status": 0' in response, 'Failed to get standard boards with correlations'

    def test_getSubjectsWithStandards(self):
        response = self.app.get(url(controller='standard', action='getStandardSubjects'))
        assert '"status": 0' in response, 'Failed to get subjects with standards'
        j = json.loads(response.normal_body)
        assert j['response']['subjects'], "No subjects retrieved"

        response = self.app.get(url(controller='standard', action='getStandardSubjects', standardBoardIDs='7,8'))
        assert '"status": 0' in response, 'Failed to get subjects with standards'
        j = json.loads(response.normal_body)
        assert j['response']['subjects'], "No subjects retrieved"

        response = self.app.get(url(controller='standard', action='getStandardSubjects', standardBoardIDs='7,8', grades='9,10,11,12'))
        assert '"status": 0' in response, 'Failed to get subjects with standards'
        j = json.loads(response.normal_body)
        assert j['response']['subjects'], "No subjects retrieved"

    def test_getStandardBoardsWithStandards(self):
        response = self.app.get(url(controller='standard', action='getStandardStandardBoards'))
        assert '"status": 0' in response, 'Failed to get boards with standards'
        j = json.loads(response.normal_body)
        assert j['response']['standardBoards'], "No boards retrieved"

        response = self.app.get(url(controller='standard', action='getStandardStandardBoards', subjects='algebra,mathematics'))
        assert '"status": 0' in response, 'Failed to get boards with standards'
        j = json.loads(response.normal_body)
        assert j['response']['standardBoards'], "No boards retrieved"

        response = self.app.get(url(controller='standard', action='getStandardStandardBoards', subjects='algebra,mathematics', grades='9,10,11,12'))
        assert '"status": 0' in response, 'Failed to get boards with standards'
        j = json.loads(response.normal_body)
        assert j['response']['standardBoards'], "No boards retrieved"

    def test_getGradesWithStandards(self):
        response = self.app.get(url(controller='standard', action='getStandardGrades'))
        assert '"status": 0' in response, 'Failed to get grades with standards'
        j = json.loads(response.normal_body)
        assert j['response']['grades'], "No grades retrieved"

        response = self.app.get(url(controller='standard', action='getStandardGrades', subjects='algebra,mathematics'))
        assert '"status": 0' in response, 'Failed to get grades with standards'
        j = json.loads(response.normal_body)
        assert j['response']['grades'], "No grades retrieved"

        response = self.app.get(url(controller='standard', action='getStandardGrades', subjects='algebra,mathematics', standardBoardIDs='7,8'))
        assert '"status": 0' in response, 'Failed to get grades with standards'
        j = json.loads(response.normal_body)
        assert j['response']['grades'], "No grades retrieved"

    def test_browseStandards(self):
        ## No params
        response = self.app.get(url(controller='standard', action='browseStandards'), 
                params={'pageSize':5, 'pageNum':1, 'nocache':'true'})
        assert '"status": 0' in response, "Failed to browse standards"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "No standards returned"

        ## Standard boards 
        response = self.app.get(url(controller='standard', action='browseStandards'), 
                params={'pageSize':5, 'pageNum':1, 'standardBoardIDs':'7,44', 'nocache':'true'})
        assert '"status": 0' in response, "Failed to browse standards"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "No standards returned"
        for s in j['response']['standards']:
            assert s['standardBoard']['id'] in [7, 44], "Invalid standard board returned"

        ## subjects
        response = self.app.get(url(controller='standard', action='browseStandards'), 
                params={'pageSize':5, 'pageNum':1, 'standardBoardIDs':'7,44', 'subjects':'mathematics,algebra', 'nocache':'true'})
        assert '"status": 0' in response, "Failed to browse standards"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "No standards returned"
        for s in j['response']['standards']:
            assert s['standardBoard']['id'] in [7, 44], "Invalid standard board returned"
            assert s['subject'].lower() in ['mathematics', 'algebra'], "Invalid subject returned"

        ## Fail
        response = self.app.get(url(controller='standard', action='browseStandards'), 
                params={'pageSize':5, 'pageNum':1, 'standardBoardIDs':'7,44', 'subjects':'mathematics,algebra,nosuchsubject', 
                    'nocache':'true'})
        assert '"status": 0' not in response, "Unexpected success"

        ## grades
        response = self.app.get(url(controller='standard', action='browseStandards'), 
                params={'pageSize':5, 'pageNum':1, 'standardBoardIDs':'7,44', 'subjects':'mathematics,algebra', 
                    'grades':'9,10,11,12', 'nocache':'true'})
        assert '"status": 0' in response, "Failed to browse standards"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "No standards returned"
        for s in j['response']['standards']:
            assert s['standardBoard']['id'] in [7, 44], "Invalid standard board returned"
            assert s['subject'].lower() in ['mathematics', 'algebra'], "Invalid subject returned"
            matched = False
            for g in s['grades']:
                if g in ["9", "10", "11", "12"]:
                    matched = True
                    break
            assert matched, "Invalid grade returned"

        ## title part
        response = self.app.get(url(controller='standard', action='browseStandards'), 
                params={'pageSize':5, 'pageNum':1, 'standardBoardIDs':'7,44', 'subjects':'mathematics,algebra', 
                    'grades':'9,10,11,12', 'title':'rational', 'nocache':'true'})
        assert '"status": 0' in response, "Failed to browse standards"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "No standards returned"
        for s in j['response']['standards']:
            assert s['standardBoard']['id'] in [7, 44], "Invalid standard board returned"
            assert s['subject'].lower() in ['mathematics', 'algebra'], "Invalid subject returned"
            matched = False
            for g in s['grades']:
                if g in ["9", "10", "11", "12"]:
                    matched = True
                    break
            assert matched, "Invalid grade returned"
