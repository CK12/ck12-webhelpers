from flx.tests import *
import logging
import json
import time

log = logging.getLogger(__name__)

class TestNotificationController(TestController):

    def test_get(self):
        response = self.app.get(url(controller='notification', action='getInfo', id=1))
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['id'] == 1
        assert j['response'].has_key('frequency')

    def test_createNotification(self):
        params = {
            'authors': 'Nimish P',
            'title': 'Test Book by Nimish',
            'handle': 'Test-Book-by-Nimish',
            'summary': 'Create dummy artifact to test notifications',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName='book'),
            params=params,
            headers={'Cookie': self.getLoginCookie(1)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating book"
        j = json.loads(response.normal_body)
        bookID = j['response']['book']['id']
        assert bookID, "Got invalid book id"

        ## Test failure - no address or subscriberID
        response = self.app.post(url(controller='notification', action='createNotification'), params={
                    'eventType': 'ARTIFACT_DELETED',
                    'notificationType': 'email',
                    'objectID': bookID,
                    'objectType': 'artifact',
                    'frequency': 'instant',
                } 
            )

        assert '"status": 0' not in response, "Unexpected success in creating notification"

        response = self.app.post(url(controller='notification', action='createNotification'), params={
                    'eventType': 'ARTIFACT_DELETED',
                    'notificationType': 'email',
                    'objectID': bookID,
                    'objectType': 'artifact',
                    'address': 'nosuch@ck12.org',
                    'frequency': 'instant',
                }, 
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )

        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['id']
        id = j['response']['id']

        print j['response']
        assert j['response']['lastSent'] == None
        assert j['response']['frequency'] == 'instant'

        ## Trigger the event
        response = self.app.post(url(controller='artifact', action='deleteArtifact', id=bookID),
                params={'notificationID': id},
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )
        assert '"status": 0' in response
        j = json.loads(response.normal_body)

        for i in [1, 2, 3, 4, 5]:
            ## Wait for the event to trigger
            time.sleep(15)

            response = self.app.get(url(controller='notification', action='getInfo', id=id),
                    headers={'Cookie': self.getLoginCookie(1)} ## Fake login
                )
            assert '"status": 0' in response
            j = json.loads(response.normal_body)
            if j['response']['lastSent']:
                print "Workingin attempt: %d" % i
                break
        assert j['response']['lastSent'] != None, "The event was not triggered"

        response = self.app.post(url(controller='notification', action='deleteNotification'),
                params={ 'id': id },
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )
        assert '"status": 0' in response

    def test_updateNotification(self):
        response = self.app.post(url(controller='notification', action='createNotification'), params={
                    'eventType': 'ARTIFACT_DELETED',
                    'notificationType': 'email',
                    'address': 'nosuch@ck12.org',
                    'frequency': 'once',
                }, 
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )

        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['id']
        id = j['response']['id']

        response = self.app.post(url(controller='notification', action='updateNotification'), params={
                    'eventType': 'ARTIFACT_IMPORT_FAILED',
                    'notificationType': 'email',
                    'address': 'nosuch@ck12.org',
                    'frequency': 'daily',
                }, 
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )
        assert '"status": 0' not in response, "Unexpected notification update success"

        response = self.app.post(url(controller='notification', action='updateNotification'), params={
                    'id': id,
                    'eventType': 'ARTIFACT_IMPORT_FAILED',
                    'notificationType': 'email',
                    'address': 'nosuch@ck12.org',
                    'frequency': 'daily',
                }, 
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )
        assert '"status": 0' in response, "Failed to update notification"

        j = json.loads(response.normal_body)
        assert j['response']['id'] == id
        assert j['response']['frequency'] == 'daily'

        response = self.app.post(url(controller='notification', action='deleteNotification'),
                params={ 'id': id },
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )
        assert '"status": 0' in response

    def test_getMyNotification(self):

        response = self.app.get(url(controller='notification', action='getMyNotification', 
            eventType='ARTIFACT_RELATED_MATERIAL_ADDED', 
            frequency='once'),
            params = { 'notificationType': 'email'},
            headers={'Cookie': self.getLoginCookie(1)}
            )
        assert '"status": 0' not in response

        response = self.app.post(url(controller='notification', action='createNotification'), params={
                    'eventType': 'ARTIFACT_RELATED_MATERIAL_ADDED',
                    'notificationType': 'email',
                    'frequency': 'once',
                }, 
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )

        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['id']
        id = j['response']['id']

        response = self.app.get(url(controller='notification', action='getMyNotification', 
            eventType='ARTIFACT_RELATED_MATERIAL_ADDED', 
            frequency='once'),
            headers={'Cookie': self.getLoginCookie(1)}
            )
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response'], "Could not get notification"
        assert j['response']['id'] == id
        assert j['response']['notificationType'] == 'email'

        response = self.app.get(url(controller='notification', action='getMyNotification', 
            eventType='ARTIFACT_RELATED_MATERIAL_ADDED', 
            frequency='instant'),
            headers={'Cookie': self.getLoginCookie(1)}
            )
        assert '"status": 0' not in response

        response = self.app.post(url(controller='notification', action='deleteNotification'),
                params={ 'id': id },
                headers={'Cookie': self.getLoginCookie(1)} ## Fake login
            )
        assert '"status": 0' in response

    def test_getEventTypes(self):
        response = self.app.get(url(controller='notification', action='getEventTypes'), 
                params = { 'pageNum': 1, 'pageSize': 2})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert len(j['response']['eventTypes']) == j['response']['limit']

    def test_getNotificationRules(self):
        response = self.app.get(url(controller='notification', action='getNotificationRules'), 
                params = { 'pageNum': 1, 'pageSize': 2})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert len(j['response']['notificationRules']) == j['response']['limit']

    def test_getNotifications(self):
        response = self.app.get(url(controller='notification', action='getNotifications'), 
                params = { 'pageNum': 1, 'pageSize': 2, 'filters': 'eventTypeID,8', 'sort': 'lastSent,desc'},
                headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert len(j['response']['notifications']) == j['response']['limit']

    def test_getEvents(self):
        response = self.app.get(url(controller='notification', action='getEvents'), 
            params = { 'pageNum': 1, 'pageSize': 2, 'filters': 'eventTypeID,8', 'sort': 'created,desc'},
            headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert len(j['response']['events']) == j['response']['limit']

