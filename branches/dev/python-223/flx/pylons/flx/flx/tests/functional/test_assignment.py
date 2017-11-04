from datetime import date, datetime, timedelta
from flx.tests import *
import json
import logging

log = logging.getLogger(__name__)

class TestAssignmentController(TestController):

   def _test_assignment(self):
        mid = 1
        today = date.today()
        now = datetime.now()
        #
        #  Creation class group.
        #
        response = self.app.post(
                        url(controller = 'groups', action = 'create'),
                        params={
                            'groupName': 'test group %s' % now,
                            'groupType': 'class',
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed create group"
        assert 'ERROR:' not in response, "Error creating group"
        j = json.loads(response.normal_body)
        print j
        a1Dict = j['response']['group']
        groupID = a1Dict['id']
        #
        #  Creation study-track.
        #
        response = self.app.post(
                        url(controller = 'assignment', action = 'createStudyTrack'),
                        params={
                            'name': 'test study track %s' % now,
                            'concepts': '24434,24435,24436,24437,24437,24439',
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed create assignment"
        assert 'ERROR:' not in response, "Error creating assignment"
        j = json.loads(response.normal_body)
        a1Dict = j['response']['assignment']
        id1 = a1Dict['id']
        #
        #  Creation test.
        #
        response = self.app.post(
                        url(controller = 'assignment', action = 'assignAssignmentToGroupMembers'),
                        params={
                            'groupID': groupID,
                            'assignmentID': id1,
                            'due': today + timedelta(days=3)
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        j = json.loads(response.normal_body)
        a1Dict = j['response']['assignment']
        assert '"status": 0' in response, "Failed create assignment"
        assert 'ERROR:' not in response, "Error creating assignment"
        id2 = a1Dict['id']
        #
        #  Get test.
        #
        response = self.app.get(
                        url(controller = 'assignment', action = 'get', id=id2),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed get assignment"
        assert 'ERROR:' not in response, "Error getting assignment"
        j = json.loads(response.normal_body)
        aList = j['response']['assignment']
        #
        #  Update test.
        #
        response = self.app.post(
                        url(controller = 'assignment', action = 'update', id=id2),
                        params={
                            'due': today + timedelta(days=20)
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed update assignment"
        assert 'ERROR:' not in response, "Error updating assignment"
        #
        #  Deletion test.
        #
        response = self.app.delete(
                        url(controller = 'assignment',
                            action = 'delete',
                            id = id2,
                            deleteStudyTrack = True),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed delete assignment"
        assert 'ERROR:' not in response, "Error deleting assignment"
        #
        #  Delete class group.
        #
        response = self.app.post(
                        url(controller = 'groups', action = 'delete'),
                        params={
                            'groupID': groupID,
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed delete group"
        assert 'ERROR:' not in response, "Error deleting group"
