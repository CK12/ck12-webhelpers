from flx.tests import *
import logging
import json

log = logging.getLogger(__name__)

class TestModalityController(TestController):

    def __check_for_modality(self, j, handle, type, minimal=False):
        found = False
        for m in j['response']['domain']['modalities']:
            if minimal:
                assert not m.has_key('revisions'), "Revision data returned for minimal response"
            if m['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem' and m['artifactType'] == 'lesson':
                found = True
                break
        assert found, "Could not find the modality in response"

    def __check_modality_owner(self, j, ownerID=None, notOwnerID=None):
        if j['response'].get('domain') and j['response']['domain'].get('modalities'):
            for m in j['response']['domain']['modalities']:
                if ownerID:
                    assert m['creatorID'] == ownerID, "Found modality by owner: %s" % m['creatorID']
                elif notOwnerID:
                    assert m['creatorID'] != notOwnerID, "Found modality by owner: %s" % m['creatorID']

    def test_getModalitiesByPerma(self):
        for rtype in ['info', 'minimal']:
            ## Default realm
            response = self.app.get(
                            url(controller = 'modality', action = 'getModalitiesByPerma', 
                                rtype=rtype,
                                type='lesson', 
                                handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem',
                                realm=None),
                        )
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_for_modality(j, 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 'lesson', minimal=(rtype == 'minimal'))

            ## Only ck12
            response = self.app.get(
                            url(controller = 'modality', action = 'getModalitiesByPerma', 
                                rtype=rtype,
                                type='lesson', 
                                handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem',
                                realm=None),
                            params={'ownedBy': 'ck12'},
                        )
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_modality_owner(j, ownerID=3)

            ## Only community
            response = self.app.get(
                            url(controller = 'modality', action = 'getModalitiesByPerma', 
                                rtype=rtype,
                                type='lesson', 
                                handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem',
                                realm=None),
                            params={'ownedBy': 'community'},
                        )
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            self.__check_modality_owner(j, notOwnerID=3)

            ## not ck12/community - fail
            response = self.app.get(
                            url(controller = 'modality', action = 'getModalitiesByPerma', 
                                rtype=rtype,
                                type='lesson', 
                                handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem',
                                realm=None),
                            params={'ownedBy': 'any'},
                        )
            assert '"status": 0' not in response, "Unexpected success in getting modalities by perma"

            ## With realm and pagination
            response = self.app.get(
                            url(controller = 'modality', action = 'getModalitiesByPerma', 
                                rtype=rtype,
                                type='lesson', 
                                handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem',
                                realm='user:ck12editor'),
                            params={'pageSize': 1, 'pageNum': 1},
                        )
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_for_modality(j, 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 'lesson', minimal=(rtype == 'minimal'))
 
    def test_getModalitiesByDomain(self):
        for rtype in ['info', 'minimal']:
            response = self.app.get(url(controller='modality', action='getModalitiesByDomainName',
                rtype=rtype,
                level='at grade', sub='MAT', brn='TRG', term='Lengths of Triangle Sides Using the Pythagorean Theorem'),
                params={'pageSize': 1, 'pageNum': 1})
            assert '"status": 0' in response, "Failed to get modalities by domain name"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_for_modality(j, 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 'lesson', minimal=(rtype == 'minimal'))

            ## Only ck12
            response = self.app.get(url(controller='modality', action='getModalitiesByDomainName',
                rtype=rtype,
                level='at grade', sub='MAT', brn='TRG', term='Lengths of Triangle Sides Using the Pythagorean Theorem'),
                params={'pageSize': 1, 'pageNum': 1, 'ownedBy': 'ck12'})
            assert '"status": 0' in response, "Failed to get modalities by domain name"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_modality_owner(j, ownerID=3)
     
            ## Only community
            response = self.app.get(url(controller='modality', action='getModalitiesByDomainName',
                rtype=rtype,
                level='at grade', sub='MAT', brn='TRG', term='Lengths of Triangle Sides Using the Pythagorean Theorem'),
                params={'pageSize': 1, 'pageNum': 1, 'ownedBy': 'community'})
            assert '"status": 0' in response, "Failed to get modalities by domain name"
            j = json.loads(response.normal_body)
            self.__check_modality_owner(j, notOwnerID=3)

            ## Without the level
            response = self.app.get(url(controller='modality', action='getModalitiesByDomainName',
                rtype=rtype,
                sub='MAT', brn='TRG', term='Lengths of Triangle Sides Using the Pythagorean Theorem'),
                params={'pageSize': 1, 'pageNum': 1})
            assert '"status": 0' in response, "Failed to get modalities by domain name"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_for_modality(j, 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 'lesson', minimal=(rtype == 'minimal'))

            ## Error
            response = self.app.get(url(controller='modality', action='getModalitiesByDomainName',
                rtype=rtype,
                sub='SCI', brn='BIO', term='Lengths of Triangle Sides Using the Pythagorean Theorem'),
                params={'pageSize': 1, 'pageNum': 1})
            assert '"status": 0' not in response, "Unexpected success getting modalities by domain name"

    def test_getModalities(self):
        for rtype in ['info', 'minimal']:
            response = self.app.get(url(controller='modality', action='getModalities',
                rtype=rtype,
                level='at-grade', eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'),
                params={'pageSize': 1, 'pageNum': 1})
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_for_modality(j, 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 'lesson', minimal=(rtype == 'minimal'))
     
            ## Without the level
            response = self.app.get(url(controller='modality', action='getModalities',
                rtype=rtype,
                level=None, eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'),
                params={'pageSize': 1, 'pageNum': 1})
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_for_modality(j, 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 'lesson', minimal=(rtype == 'minimal'))

            ## ck12 only
            response = self.app.get(url(controller='modality', action='getModalities',
                rtype=rtype,
                level='at-grade', eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'),
                params={'pageSize': 1, 'pageNum': 1, 'ownedBy':'ck12'})
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['modalities'], "No modalities returned"
            self.__check_modality_owner(j, ownerID=3)

            ## community only
            response = self.app.get(url(controller='modality', action='getModalities',
                rtype=rtype,
                level='at-grade', eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'),
                params={'pageSize': 1, 'pageNum': 1, 'ownedBy':'community'})
            assert '"status": 0' in response, "Failed to get modalities by perma"
            j = json.loads(response.normal_body)
            self.__check_modality_owner(j, notOwnerID=3)

            ## Error
            response = self.app.get(url(controller='modality', action='getModalities',
                rtype=rtype,
                level=None, eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem-Fake'),
                params={'pageSize': 1, 'pageNum': 1})
            assert '"status": 0' not in response, "Unexpected success getting modalities"

    def test_getModality(self):
        response = self.app.get(url(controller='modality', action='get',
            type='lesson', handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 
            realm='user:ck12editor',
            eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'))
        assert '"status": 0' in response, "Failed to get modality by perma"
        j = json.loads(response.normal_body)
        assert j['response']['domain']['lesson'], "No modality returned"
        assert j['response']['domain']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'.lower()
        assert j['response']['domain']['lesson']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'

        ## No realm
        response = self.app.get(url(controller='modality', action='get',
            type='lesson', handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 
            eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'))
        assert '"status": 0' in response, "Failed to get modality by perma"
        j = json.loads(response.normal_body)
        assert j['response']['domain']['lesson'], "No modality returned"
        assert j['response']['domain']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'.lower()
        assert j['response']['domain']['lesson']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'
 
        ## Error
        response = self.app.get(url(controller='modality', action='get',
            type='lesson', handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem-Fake',
            eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'))
        assert '"status": 0' not in response, "Failed to get modality by perma"

        for rtype in ['detail', 'info', 'minimal']:
            response = self.app.get(url(controller='modality', action='get', rtype=rtype,
                type='lesson', handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 
                realm='user:ck12editor',
                eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'))
            assert '"status": 0' in response, "Failed to get modality by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['lesson'], "No modality returned"
            assert j['response']['domain']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'.lower()
            assert j['response']['domain']['lesson']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'

            ## No realm
            response = self.app.get(url(controller='modality', action='get', rtype=rtype,
                type='lesson', handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem', 
                eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'))
            assert '"status": 0' in response, "Failed to get modality by perma"
            j = json.loads(response.normal_body)
            assert j['response']['domain']['lesson'], "No modality returned"
            assert j['response']['domain']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'.lower()
            assert j['response']['domain']['lesson']['handle'] == 'Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'
     
            ## Error
            response = self.app.get(url(controller='modality', action='get', rtype=rtype,
                type='lesson', handle='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem-Fake',
                eid='Lengths-of-Triangle-Sides-Using-the-Pythagorean-Theorem'))
            assert '"status": 0' not in response, "Failed to get modality by perma"

    def test_browseModality(self):
        response = self.app.get(url(controller='modality', action='browseModalities',
            types='lesson,cthink', eid='MAT.TRG', all='all'),
            params={'pageSize': 10, 'pageNum': 1})
        assert '"status": 0' in response, "Failed to browse modalities"
        j = json.loads(response.normal_body)
        assert j['response']['results'], "No modality returned"
        for m in j['response']['results']:
            assert m['encodedID'].startswith('MAT.TRG'), "Invalid modality returned"

        response = self.app.get(url(controller='modality', action='browseModalities',
            types='lesson,cthink', eid='MAT.TRG.110'),
            params={'pageSize': 10, 'pageNum': 1})
        assert '"status": 0' in response, "Failed to browse modalities"
        j = json.loads(response.normal_body)
        assert j['response']['results'], "No modality returned"
        for m in j['response']['results']:
            assert m['encodedID'].startswith('MAT.TRG.11'), "Invalid modality returned"

    def test_browseModalitySummary(self):
        response = self.app.get(url(controller='modality', action='browseModalitiesSummary',
            types='artifact', brn='MAT.TRG'),
            params={'pageSize': 10, 'pageNum': 1})
        assert '"status": 0' in response, "Failed to browse modalities summary"

