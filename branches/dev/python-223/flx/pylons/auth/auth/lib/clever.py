import json
import logging

from pylons import config
from auth.model import api
from auth.model import utils
from auth.lib.base import BaseController

log = logging.getLogger(__name__)

class CleverPartner(BaseController):

    def __init__(self, **kwargs):
        self._userdata = None
        self.config = kwargs.get('config', config)
        self.logLevel = kwargs.get('logLevel', 'debug')

    def logMessage(self, message):
        """ Default is debug.
            info level is required to log messages when triggered from celery
        """
        if self.logLevel.lower() == 'debug':
            log.debug(message)
        if self.logLevel.lower() == 'info':
            log.info(message)

    def _init(self, **kwargs):
        self.logMessage("Parameters : %s" % kwargs)
        siteID = kwargs.get('siteID')
        partnerDistrictID = kwargs.get('partnerDistrictID')
        partnerSchoolID = kwargs.get('partnerSchoolID')
        memberID = kwargs.get('memberID')
        roleID = kwargs.get('roleID')

        data = self.updateCleverPartnerSchoolDistricts(siteID, partnerDistrictID)
        self._userdata = json.dumps(data) 
        
        data = self.updateCleverPartnerSchools(siteID, partnerSchoolID)
        self._userdata = "%s %s" % (self._userdata, json.dumps(data))

        data = self.updateCleverMemberSchools(memberID, roleID, siteID)
        self._userdata = "%s %s" % (self._userdata, json.dumps(data))

        return self._userdata

    def _call(self, url, headers, params=None, method='GET'):
        """Can not import auth.lib.http library to call clever api:
            when method called from celery pylons session objects conflicts with sqlalchemy session object
        """
        import requests
        r = requests.get(url, params=params, headers=headers, allow_redirects=False)
        self.logMessage('call: status[%s]' % r.status_code)
        self.logMessage("call: r.url[%s]" % r.url)
        self.logMessage("call: r.headers[%s]" % r.headers)
        self.logMessage("call: r.encoding[%s]" % r.encoding)
        data = r.text
        log.info("call: data[%s]" % data)
        return json.loads(data)

    def isSchoolDistrictExists(self, txSession, districtName):
        return api._getSchoolDistrictbyName(txSession, districtName)

    def updateCleverPartnerSchoolDistricts(self, siteID=None, partnerDistrictID=None, **kwargs):
        try:
            allPartnerDistricts = api.getPartnerSchoolDistrict(siteID, partnerDistrictID)
            partnerDistricts = []
            for partnerDistrict in allPartnerDistricts:
                if not partnerDistrict.districtID:
                    partnerDistricts.append(partnerDistrict)
            totalRecords = len(partnerDistricts)
            index = 1
            failed = 0
            log_data = "[%s] Partner School District Records to Update" % totalRecords
            self.logMessage(log_data)
            for partnerDistrict in partnerDistricts:
                try:
                    if not partnerDistrict.tokenID:
                        self.logMessage("updateCleverPartnerSchoolDistricts: oAuth2 token not present for districtID [%s]" % partnerDistrict.partnerDistrictID)
                        continue
                    log_data = "Updating [%s] of [%s] Partner School District Records" % (index, totalRecords)
                    self.logMessage(log_data)
                    authorization = 'Bearer %s ' % partnerDistrict.tokenID
                    headers = { 'Authorization': authorization }

                    partnerDistrictsUrl = "%s/v1.1/districts/%s" % (self.config.get('clever_get_url'), partnerDistrict.partnerDistrictID)
                    data = self._call(partnerDistrictsUrl, headers, method='GET')
                    data = data.get('data')
                    self.logMessage("CleverPartnerSchoolDistrictsUpdator: district data[%s]" % data)
                    if data:
                        districtName = data.get('name', None)
                        if districtName:
                            tx = utils.transaction(self.getFuncName())
                            with tx as txSession:
                                if self.isSchoolDistrictExists(txSession, districtName) is None:
                                    newSchoolDistrict = api._createSchoolDistrict(txSession, name=districtName)
                                    self.logMessage("CleverPartnerSchoolDistrictsUpdator: Create new school district[%s] with ID [%s]" \
                                            % (districtName, newSchoolDistrict.id))
                                    if newSchoolDistrict:
                                        txSession.flush()
                                        self.logMessage("Updating PartnerSchoolDistrict[%s] with districtID [%s]" \
                                                % (partnerDistrict.partnerDistrictID, newSchoolDistrict.id))
                                        api._updatePartnerSchoolDistrict(txSession, siteID=partnerDistrict.siteID,
                                                                         partnerDistrictID=partnerDistrict.partnerDistrictID,
                                                                         districtID=newSchoolDistrict.id)
                except Exception as ex:
                    failed += 1
                    log.error(ex)
                index += 1
        except Exception as ex:
            log.error(ex)
        log_data = {'messages': "Updated [%s] Partner School Districts: Success : [%s], Failed: [%s]" %(totalRecords, (totalRecords-failed), failed)}
        self.logMessage(log_data)
        return log_data

    def getUSSchool(self, txSession, ncesID):
        filters = [('nces_id', ncesID)]
        return api._getUSSchoolByFilters(txSession, filters, pageNum=1, pageSize=1).results

    def updateCleverPartnerSchools(self, siteID=None, partnerSchoolID=None, **kwargs):
        """
        1. From the PartnerSchools table, call the clever /v1.1/schools/{id} API, and
        2. Insert into/Update the USSchoolsMaster table based on nces_id.
        3. Populate the DistrictHasSchools table.
        """
        try:
            self.logMessage("Partner School ID : %s " % partnerSchoolID)
            allPartnerSchools = api.getPartnerSchool(siteID, partnerSchoolID)
            
            partnerSchools = []
            for partnerSchool in allPartnerSchools:
                if not partnerSchool.schoolID:
                    partnerSchools.append(partnerSchool)
            totalRecords = len(partnerSchools)
            index = 1
            failed = 0
            log_data = "[%s] Partner School Records to Update" % totalRecords
            self.logMessage(log_data)

            for partnerSchool in partnerSchools:
                try:
                    partnerDistrict = api.getPartnerSchoolDistrict(partnerSchool.siteID, partnerSchool.partnerDistrictID)
                    if not partnerDistrict or not partnerDistrict[0].tokenID:
                        self.logMessage("updateCleverPartnerSchools: oAuth2 token not present for districtID [%s]" % \
                                 partnerDistrict[0].partnerDistrictID if len(partnerDistrict) > 0 else None)
                        continue
                    log_data = "Updating [%s] of [%s] Partner School Records" % (index, totalRecords)
                    self.logMessage(log_data)
                    authorization = 'Bearer %s ' % partnerDistrict[0].tokenID
                    headers = { 'Authorization': authorization }
                    partnerSchoolsUrl = "%s/v1.1/schools/%s" % (self.config.get('clever_get_url'), partnerSchool.partnerSchoolID)
                    data = self._call(partnerSchoolsUrl, headers, method='GET')
                    data = data.get('data')

                    self.logMessage("Data : [%s]" % data)
                    if data:
                        ncesID = data.get('nces_id', None)
                        if ncesID:
                            tx = utils.transaction(self.getFuncName())
                            with tx as txSession:
                                USSchool = self.getUSSchool(txSession, ncesID)
                                if USSchool is None or len(USSchool) == 0:
                                    name = data.get('name', None)
                                    location = data.get('location')
                                    address = city = state = zipcode = None
                                    if location:
                                        address = location.get('address')
                                        city = location.get('city')
                                        state = location.get('state')
                                        zipcode = location.get('zip')
                                    USSchool = api._addUSSchoolsMaster(session=txSession,
                                                                       name=name,
                                                                       nces_id=ncesID,
                                                                       address=address,
                                                                       city=city,
                                                                       state=state,
                                                                       zipcode=zipcode,
                                                                       county='United States')
                                else:
                                    USSchool = USSchool[0]
                                    self.logMessage("CleverPartnerSchoolsUpdator: USSchool already exists for ncesID: [%s] with ID [%s]" % (ncesID, USSchool.id))
                                #
                                #  From partnerSchool.partnerDistrictID get PartnerSchoolDistricts
                                #
                                partnerSchoolDistrict = api._getPartnerSchoolDistrict(session=txSession, partnerDistrictID=partnerSchool.partnerDistrictID)
                                if partnerSchoolDistrict and partnerSchoolDistrict.districtID and USSchool and USSchool.id:
                                    partnerSchoolDistrict = partnerSchoolDistrict[0]
                                    districtHasSchool = api._getDistrictHasSchools(txSession, partnerSchoolDistrict.districtID, USSchool.id)
                                    if not districtHasSchool:
                                        self.logMessage("CleverPartnerSchoolsUpdator: Create new DistrictHasSchool entry for districtID[%s] and schoolID [%s]" \
                                                 % (partnerSchoolDistrict.districtID, USSchool.id))
                                        api._createDistrictHasSchool(session=txSession, 
                                                                     districtID=partnerSchoolDistrict.districtID,
                                                                     schoolID=USSchool.id)
                                #
                                #  Update schoolID in PartnerSchools
                                #
                                if USSchool and USSchool.id:
                                    api._updatePartnerSchool(session=txSession,
                                                             siteID=partnerSchool.siteID,
                                                             partnerSchoolID=partnerSchool.partnerSchoolID,
                                                             schoolID=USSchool.id)
                except Exception as ex:
                    failed += 1
                    log.error(ex)
                index += 1
        except Exception as ex:
            log.error(ex)
        log_data = {'messages': "Updated [%s] Partner Schools: Success : [%s], Failed: [%s]" %(totalRecords, (totalRecords-failed), failed)}
        self.logMessage(log_data)
        return log_data

    def updateCleverMemberSchools(self, memberID=None, roleID=None, siteID=None, **kwargs):
        """
        1. From the PartnerSchoolHasMembers table, call either the clever /v1.1/teachers/{id} API or the clever /v1.1/students/{id} API,
        depending on the role, to update the MemberSchools table.
        """
        try:
            allPartnerSchoolSchoolHasMembers = api.getPartnerSchoolHasMember(memberID, roleID, siteID)
            
            totalRecords = len(allPartnerSchoolSchoolHasMembers)
            index = 1
            newEntry = 0
            failed = 0
            log_data = "[%s] Partner Member School Records to Update" % totalRecords
            self.logMessage(log_data)

            for schoolMember in allPartnerSchoolSchoolHasMembers:
                try:
                    log_data = "Updating [%s] of [%s] Partner Member School Records" % (index, totalRecords)
                    self.logMessage(log_data)
                    schoolID = schoolMember.partnerSchoolID
                    if schoolID:
                        tx = utils.transaction(self.getFuncName())
                        with tx as txSession:
                            #
                            #Check if entry present or not in MemberSchools for memberID and schoolID
                            #
                            memberSchool = api._getMemberSchool(session=txSession, memberID = schoolMember.memberID)
                            
                            if not memberSchool:
                                partnerSchool = api._getPartnerSchool(session=txSession, partnerSchoolID= schoolID)
                                if partnerSchool and partnerSchool[0].schoolID:
                                    partnerSchool = partnerSchool[0]
                                    self.logMessage("CleverMemberSchoolsUpdator: Create new MemberSchool entry for memberID[%s] and schoolID [%s]" \
                                             % (schoolMember.memberID, partnerSchool.schoolID))
                                    newMemberSchool = api._newMemberSchool(session=txSession,
                                                                           memberID= schoolMember.memberID,
                                                                           schoolID=partnerSchool.schoolID,
                                                                           schoolType='usmaster')
                                    self.logMessage("CleverMemberSchoolsUpdator: Created new MemberSchool entry :")
                                    self.logMessage(newMemberSchool)
                                    newEntry += 1;
                except Exception as ex:
                    failed += 1
                    log.error(ex)
                index += 1
        except Exception as ex:
            log.error(ex)
        log_data = {'messages': "Updated [%s] Member Schools: Success : [%s], Failed: [%s], New Entry [%s] " \
                %(totalRecords, (totalRecords-failed), failed, newEntry)}
        self.logMessage(log_data)
        return log_data
