import logging

from flx.tests import *
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib import helpers as h

log = logging.getLogger(__name__)

groupName = 'My Test Group'
groupDescription = "This is my test group"
groupType = "study"

class TestAPIs(TestController):

    def setUp(self):
        super(TestAPIs, self).setUp()
        self.useImageSatellite, self.imageSatelliteServer, self.iamImageSatellite = h.getImageSatelliteOptions()

        # Delete user if exists in case something went wrong the last time.
        api.deleteMemberByLogin('testuser1')
        self.member1 = api.createMember(gender='male',
                                       login='testuser1',
                                       defaultLogin='testuser1',
                                       stateID=2,
                                       authTypeID=1,
                                       token='youguessit',
                                       email='testuser1@ck12.org',
                                       givenName='Test',
                                       surname='User1',
                                       roleID=5,
                                       emailVerified=True,
                                       authID=1001
                                      )
        # This is required since moving auth separate
        self.member1.authID = self.member1.id
        self.member1 = api.updateMember(self.member1)

        # Delete user if exists in case something went wrong the last time.
        api.deleteMemberByLogin('testuser2')
        self.member2 = api.createMember(gender='male',
                                       login='testuser2',
                                       defaultLogin='testuser2',
                                       stateID=2,
                                       authTypeID=1,
                                       token='youguessit',
                                       email='testuser2@ck12.org',
                                       givenName='Test',
                                       surname='User2',
                                       roleID=5,
                                       emailVerified=True,
                                       authID=1002
                                      )
        # This is required since moving auth separate
        self.member2.authID = self.member2.id
        self.member2 = api.updateMember(self.member2)

        self.group = None

    def tearDown(self):
        super(TestAPIs, self).tearDown()

        # If a group was created, delete it
        if self.group:
            api.deleteGroup(group=self.group, memberID=self.member1.id)

        # Delete test users
        api.deleteMemberByLogin('testuser1')
        api.deleteMemberByLogin('testuser2')

    def test_crudGroup(self):
        # Delete group if exists in case something went wrong the last time.
        group = api.getGroupByNameAndCreator(groupName, self.member1.id)
        api.deleteGroup(group=group, memberID=self.member1.id)

        # Create group
        response = self.app.post(
                        url(controller='groups', action='create'),
                        params={
                            'groupName': groupName,
                            'groupDescription': groupDescription,
                            'gropuType': groupType,
                        },
                        headers={'Cookie': self.getLoginCookie(self.member1.id)}
                    )
        log.info(response)
        self.group = api.getGroupByNameAndCreator(groupName, self.member1.id)

        assert '"status": 0' in response, "Failed create feedback"
        assert 'ERROR:' not in response, "Error creating feedback"
