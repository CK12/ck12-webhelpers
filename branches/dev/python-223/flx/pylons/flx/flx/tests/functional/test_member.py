from flx.tests import TestController, url
from flx.model import api
from flx.controllers.errorCodes import ErrorCodes

import logging
import json

log = logging.getLogger(__name__)

class TestMemberController(TestController):

    def _test_activate(self):
        member = api.getMemberByLogin(login='guest')
        if member.state.name == 'activated':
            response = self.app.post(url(controller='member', action='deactivate', email=member.email), headers={'Cookie': self.getLoginCookie(1)})
            print response
            assert '"status": 0' in response, "Deactivate member failed"

        response = self.app.post(url(controller='member', action='activate', email=member.email), headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Activate member failed"

        response = self.app.post(url(controller='member', action='deactivate', email=member.email), headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Deactivate member failed"

        response = self.app.post(url(controller='member', action='activate'), params = { 'email': member.email }, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Activate member failed"

        response = self.app.post(url(controller='member', action='activate', email=member.email), headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' not in response, "Activate member does not get expected error"

    def _test_deactivate(self):
        member = api.getMemberByLogin(login='guest')
        if member.state.name == 'deactivated':
            response = self.app.post(url(controller='member', action='activate', email=member.email), headers={'Cookie': self.getLoginCookie(1)})
            assert '"status": 0' in response, "Activate member failed"

        response = self.app.post(url(controller='member', action='deactivate', email=member.email), headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Deactivate member failed"

        response = self.app.post(url(controller='member', action='deactivate'), params = { 'email': 'wrong@email' }, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": %d' % ErrorCodes.UNKNOWN_MEMBER in response, "Unexpected member"

    def _test_logout(self):
        member = api.getMemberByLogin(login='guest')
        response = self.app.get(url(controller='auth', action='logout'), params = {'sessionID': member.id, 'returnTo': '/flx/login/memberForm'}, headers={'Cookie': self.getLoginCookie(1)})
        #assert 'userID=None' in response.headers['Set-Cookie'], "logout failed"
        #assert '"status": 0' in response, "logout failed"
        print 'response[%s]' % response
        print 'headers[%s]' % response.headers
        assert '/flx/login/memberForm' in response.headers['Location'], "redirection after logout failed."

    def _test_login(self):
        self.logout()
        member = api.getMemberByLogin(login='guest')
        assert member, "Could not find a member by login 'guest'"
        response = self.app.post(url(controller='member', action='login'), params = {'login': member.login, 'authType': 'ck-12', 'token': '', 'returnTo': '/flx/get/info/artifact/1'})
        print response
        #assert 'userID=%s' % id in response.headers['Set-Cookie'], "login failed"
        assert '/flx/get/info/artifact/1' in response.headers['Location'], "Redirection after login failed."

        response = self.app.get(url(controller='member', action='login'), params = {'login': 'notexist', 'authType': 'ck-12', 'token': None})
        print response
        assert '"status": %d' % ErrorCodes.UNKNOWN_MEMBER in response, "Unexpected member"

        response = self.app.get(url(controller='member', action='login'), params = {'login': 'admin', 'authType': 'ck-12', 'token': 'incorrect'})
        print response
        assert '"status": %d' % ErrorCodes.UNKNOWN_MEMBER in response, "Unexpected member token"

    def test_getMember(self):
        member = api.getMemberByLogin(login='guest')
        id = member.id
        assert member, "Could not find a member by login 'guest'"
        response = self.app.post(url(controller='member', action='get', id=member.email), headers={'Cookie': self.getLoginCookie(1)})
        assert '"id": %d' % id in response, "Get member failed"

        response = self.app.post(url(controller='member', action='get', id=id), headers={'Cookie': self.getLoginCookie(1)})
        assert '"email": "%s"' % member.email in response, "Get member failed"

    def test_getMembers(self):
        members = api.getMembers(sorting='email,desc', filterDict={ 'adminOnly': False })
        assert members, "No member found"
        members = api.getMembers(searchDict={ 'firstName': 'CK12' })
        assert members, "No member found"

    def test_getMemberGroups(self):
        member = api.getMemberByLogin(login='guest')
        id = member.id

        response = self.app.post(
                        url(controller='member', action='getMemberGroups'),
                        params={ 'id': id },
                        headers={'Cookie': self.getLoginCookie(id)}
                    )
        print response
        assert '"status": 0' in response, "Error retrieving member groups."

        response = self.app.post(
            url(controller='member', action='getMemberGroups', id=id),
            headers={'Cookie': self.getLoginCookie(id)}
        )
        print response
        assert '"status": 0' in response, "Error retrieving member groups."

    def test_getMemberRoles(self):
        roles = api.getMemberRoles()
        assert roles

        roledict = {}
        for role in roles:
            roledict["%s" % role.id] = role.name

        response = self.app.get(url(controller='member', action='getMemberRoles'))
        assert '"status": 0' in response, "Error retrieving member roles."
        j = json.loads(response.normal_body)
        
        assert j['response'], "No roles retrieved"
        for key, val in j['response'].iteritems():
            assert roledict.has_key(key) and roledict[key] == val, "Mismatch in member roles"

    def _test_createMember(self):
        ## Pre-emptively delete member
        self._deleteMember('rogerrabbit@ck12.org')

        memberParams = {
                'firstName': 'Roger',
                'lastName': 'Rabbit',
                'suffix': 'Jr.',
                'title': 'Mr',
                'email': 'rogerrabbit@ck12.org',
                'login': 'rogerrabbit',
        }
        response = self.app.post(url(controller='member', action='create'), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": %d' % ErrorCodes.CANNOT_CREATE_MEMBER not in response, "Failed to create member"

        j = json.loads(response.normal_body)
        assert j['response']['id'], "No member id"

        memberParams = {
        }
        response = self.app.post(url(controller='member', action='create'), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' not in response, "Expect error with empty params"

        memberParams = {
            'email': '',
        }
        response = self.app.post(url(controller='member', action='create'), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' not in response, "Expect error with empty email"

    def _getMemberId(self, memberEmail):
        response = self.app.get(url(controller='member', action='get', id=memberEmail), headers={'Cookie': self.getLoginCookie(1)})
        assert response
        j = json.loads(response.normal_body)
        rabbitId = None
        try:
            rabbitId = j['response']['id']
        except:
            pass
        return rabbitId

    def _test_editMember(self):
        rabbitId = self._getMemberId('rogerrabbit@ck12.org')

        memberParams = {
                'firstName': 'Roger2',
                'lastName': 'Rabbit2',
                'suffix': 'Sr.',
                'title': 'Ms',
                'email': 'rogerrabbit@ck12.org',
        }
        response = self.app.post(url(controller='member', action='update', id=rabbitId), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        print 'rabbitId[%s]' % rabbitId
        print 'response[%s]' % response
        assert '"status": 0' in response, "Failed to update member"

        j = json.loads(response.normal_body)
        assert j['response']['id'] and j['response']['id'] == rabbitId, "No or incorrect member id"

        memberParams['login'] = 'admin'
        response = self.app.post(url(controller='member', action='update', id=rabbitId), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": %d' % ErrorCodes.LOGIN_BEING_USED_ALREADY in response, "Failed to update member"

        memberParams['login'] = 'rogerrabbit'
        response = self.app.post(url(controller='member', action='update', id=rabbitId), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Failed to update member"

    def _test_passwordChange(self):
        rabbitId = self._getMemberId('rogerrabbit@ck12.org')
        memberParams = {
                'stateID': 2,
        }
        response = self.app.post(url(controller='member', action='update', id=rabbitId), params = memberParams, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Failed to update member"

        memberParams = {
            'old password': '',
            'password': 'rogerrabbit',
        }
        response = self.app.post(url(controller='member', action='updatePassword', id=rabbitId), params=memberParams, headers={'Cookie': self.getLoginCookie(rabbitId)})
        assert '"status": 0' not in response, "Expect error without old password"
        memberParams = {
            'old password': 'tibbar',
            'password': 'rogerrabbit',
        }
        response = self.app.post(url(controller='member', action='updatePassword', id=rabbitId), params=memberParams, headers={'Cookie': self.getLoginCookie(rabbitId)})
        print response
        assert '"status": 0' in response, "Failed to update member password"
        j = json.loads(response.normal_body)
        print j
        assert j['response']['id'] and j['response']['id'] == rabbitId, "No or incorrect member id"

    def _deleteMember(self, email):
        response = self.app.get(url(controller='member', action='get', id=email, headers={'Cookie': self.getLoginCookie(1)}))
        j = json.loads(response.normal_body)
        if j['responseHeader']['status'] == 0:
            id = j['response']['id']
            response = self.app.post(url(controller='member', action='delete', id=id), headers={'Cookie': self.getLoginCookie(1)})

    def _test_removeMember(self):
        rabbitId = self._getMemberId('rogerrabbit@ck12.org')

        response = self.app.post(url(controller='member', action='delete', id=rabbitId), headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": %d' % ErrorCodes.UNKNOWN_MEMBER not in response, "Failed to delete member"

        assert self._getMemberId('rogerrabbit@ck12.org') is None, "The member was not deleted"

    def test_getFavorites(self):
        response = self.app.post(url(controller='member', action='getFavorites', type='None'), headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed to get member favorites"

    def test_getViewedArtifacts(self):
        response = self.app.post(url(controller='member', action='getViewedArtifacts', type='None'), headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed to get member viewed artifacts"
