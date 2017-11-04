from auth.model import meta, model
from auth.model import exceptions
from sqlalchemy import orm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import exc
from datetime import datetime
from base64 import urlsafe_b64encode
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
import logging

class PartnerDataModel(object):
    def _generateMemberDict(self, memberDO):
        if not isinstance(memberDO, model.Member) or not memberDO.id:
            raise exceptions.InvalidArgumentException(u"Invalid memberDO : [{memberDO}] encountered while trying to generate memberDict.".format(memberDO=memberDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(memberDO):
            raise exceptions.InvalidArgumentException(u"Given memberDO with memberID : [{memberID}] is not attached to the current session.".format(memberDO=memberDO.id).encode('utf-8'))

        memberDict = {}
        memberDict[u'memberID'] = memberDO.id
        memberDict[u'memberEmail'] = memberDO.email
        return memberDict

    def _generateUniqueLoginFromMemberEmail(self, memberEmail):        
        if not memberEmail or not isinstance(memberEmail, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid memberEmail : [{memberEmail}] received for unique login generation.".format(memberEmail=memberEmail).encode('utf-8'))
        
        memberEmail = memberEmail.strip().lower()
        uniqueLogin = urlsafe_b64encode(memberEmail).replace('=', '.')
        seq = 1
        while True:
            memberMetaDOsWithThisLogin = meta.Session.query(meta.Members).filter_by(defaultLogin=uniqueLogin).all()
            if not memberMetaDOsWithThisLogin:
                break
            uniqueLogin = '%s-%d' % (uniqueLogin, seq)
            seq += 1
        return uniqueLogin

    def validatePartnerRequestOrigin(self, partnerName, requestSignature, requestData):
        meta.Session.begin()
        try:       
            #It is assumed that the partner authentication and / or request data integrity validation is done by now.
            try:
                (partnerID, ) = meta.Session.query(meta.MemberAuthTypes.c.id).filter(meta.MemberAuthTypes.c.name == partnerName).one()   
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Partner with the given partnerName : [{partnerName}] could not be found in the dataBase.".format(partnerName=partnerName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partners with the given partnerName : [{partnerName}] are found in the dataBase. Internal System data error.".format(partnerName=partnerName).encode('utf-8'))
            
            try:
                (partnerPublicKey, partnerPassPhrase) = meta.Session.query(meta.MemberAuthTypeKey.c.publicKey, meta.MemberAuthTypeKey.c.passPhrase).filter(meta.MemberAuthTypeKey.c.memberAuthTypeID == partnerID).one() 
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Partner with the given partnerName : [{partnerName}] doesn't have a key registered in the dataBase for request validation.".format(partnerName=partnerName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple keys are found for the partner with the given partnerName : [{partnerName}] in the dataBase. Internal System data error.".format(partnerName=partnerName).encode('utf-8'))
            
            try:
                partnerPublicKey = RSA.importKey(partnerPublicKey, passphrase=partnerPassPhrase)
                signatureVerifier = PKCS1_v1_5.new(partnerPublicKey)
            except Exception, e:
                raise exceptions.SystemInternalException(u"Unknown exception occured while trying to process the key registered for the partner with given partnerName : [{partnerName}] during the requestValidation - exceptionMessage : [{exceptionMessage}]. Internal System Error.".format(partnerName=partnerName, exceptionMessage=partnerPublicKey).encode('utf-8'))
            
            requestDataHash = SHA256.new(requestData)
            isRequestValid = signatureVerifier.verify(requestDataHash, requestSignature)
            return isRequestValid
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def loginMember(self, partnerName, loginDict):
        meta.Session.begin()
        atomicOperationTime = datetime.now()
        try:
            #It is assumed that the partner authentication and / or request data integrity validation is done by now.
            try:
                (partnerID, ) = meta.Session.query(meta.MemberAuthTypes.c.id).filter(meta.MemberAuthTypes.c.name == partnerName).one()   
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Partner with the given partnerName : [{partnerName}] could not be found in the dataBase.".format(partnerName=partnerName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partners with the given partnerName : [{partnerName}] are found in the dataBase. Internal System data error.".format(partnerName=partnerName).encode('utf-8'))

            memberDO = None
            partnerMemberID = loginDict.get('partnerMemberID')
            isMemberUpdated = False
            if partnerMemberID :
                memberIDs = meta.Session.query(meta.MemberExtData.c.memberID).filter(meta.MemberExtData.c.authTypeID == partnerID, meta.MemberExtData.c.externalID == partnerMemberID).all()
                if len(memberIDs)>1:
                    raise exceptions.SystemDataException(u"One or more members with the given partnerMemberID : [{partnerMemberID}] and partnerName : [{partnerName}] are found in the dataBase. Internal System Data error.".format(partnerMemberID=partnerMemberID, partnerName=partnerName).encode('utf-8'))
                
                if len(memberIDs) == 1:
                    #partnerMemberID is registered already. Just signIn.
                    memberID = memberIDs[0]
                    memberDO = meta.Session.query(model.Member).get(memberID)
            
            if memberDO is None:
                #partnerMemberID is either not passed in the request or the passed partnerMemberID is not registered with us.
                memberEmail = loginDict.get('memberEmail')
                if memberEmail:
                    memberIDsFromMemberEmail = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.email == memberEmail).all()
                    if len(memberIDsFromMemberEmail) >1:
                        raise exceptions.SystemDataException(u"One or more members with the given memberEmail : [{memberEmail}] are found in the dataBase. Internal System Data error.".format(memberEmail=memberEmail).encode('utf-8'))
                    if len(memberIDsFromMemberEmail) == 1:
                        memberIDFromMemberEmail = memberIDsFromMemberEmail[0]
                        memberDO = meta.Session.query(model.Member).get(memberIDFromMemberEmail)
                    if memberDO is None:
                        memberRoleNames = loginDict.get('memberRoleNames')
                        if memberRoleNames:
                            memberRoleMetaDOs = meta.Session.query(meta.MemberRoles).filter(meta.MemberRoles.c.name.in_(memberRoleNames)).all()
                            if len(memberRoleMetaDOs) != len(memberRoleNames):
                                raise exceptions.SystemDataException(u"One or more roles in the given memberRoleNames : [{memberRoleNames}] could not be found in the dataBase.".format(memberRoleNames=memberRoleNames).encode('utf-8')) 
                        else:
                            raise exceptions.InvalidArgumentException(u"Invalid memberRoleNames : [{memberRoleNames}] is received. memberRoleNames is mandatory while trying to log in the member for the first time.".format(memberRoleNames=memberRoleNames).encode('utf-8'))

                        login = defaultLogin = self._generateUniqueLoginFromMemberEmail(memberEmail)

                        memberFirstName = loginDict.get('memberFirstName')
                        if not memberFirstName:
                            raise exceptions.InvalidArgumentException(u"Invalid memberFirstName : [{memberFirstName}] is received. memberFirstName is mandatory while trying to login the member for first time.".format(memberFirstName=memberFirstName).encode('utf-8'))

                        memberLicenseAcceptedAt = loginDict.get('memberLicenseAcceptedAt')
                        if not memberLicenseAcceptedAt:
                            raise exceptions.InvalidArgumentException(u"Invalid memberLicenseAcceptedAt : [{memberLicenseAcceptedAt}] is received. memberLicenseAcceptedAt is mandatory while trying to login the member for first time.".format(memberLicenseAcceptedAt=memberLicenseAcceptedAt).encode('utf-8'))
                        
                        memberSharePermissionGrantedAt = loginDict.get('memberSharePermissionGrantedAt')
                        if not memberSharePermissionGrantedAt:
                            raise exceptions.InvalidArgumentException(u"Invalid memberSharePermissionGrantedAt : [{memberSharePermissionGrantedAt}] is received. memberSharePermissionGrantedAt is mandatory while trying to login the member for first time.".format(memberSharePermissionGrantedAt=memberSharePermissionGrantedAt).encode('utf-8'))
                        
                        memberDO = model.Member(stateID=2, email=memberEmail, givenName=memberFirstName, login=login, defaultLogin=defaultLogin, creationTime=atomicOperationTime, licenseAcceptedTime=memberLicenseAcceptedAt, isProfileUpdated=True)
                        memberDO.roles = []
                        memberDO.ext = []
                        isMemberUpdated = True
                else:
                    memberRoleNames = loginDict.get('memberRoleNames')
                    if memberRoleNames:
                        memberRoleMetaDOs = meta.Session.query(meta.MemberRoles).filter(meta.MemberRoles.c.name.in_(memberRoleNames)).all()
                        if len(memberRoleMetaDOs) != len(memberRoleNames):
                            raise exceptions.SystemDataException(u"One or more roles in the given memberRoleNames : [{memberRoleNames}] could not be found in the dataBase.".format(memberRoleNames=memberRoleNames).encode('utf-8')) 
                    else:
                        raise exceptions.InvalidArgumentException(u"Invalid memberRoleNames : [{memberRoleNames}] is received. memberRoleNames is mandatory while trying to log in the member for the first time.".format(memberRoleNames=memberRoleNames).encode('utf-8'))

                    if not partnerMemberID:
                        raise exceptions.InvalidArgumentException(u"Invalid partnerMemberID : [{partnerMemberID}] is received. partnerMemberID is mandatory while trying to login any member with out an email for the first time.".format(partnerMemberID=partnerMemberID).encode('utf-8'))
                    memberEmail = '%s-%s@partners.ck12.org' % (partnerName, partnerMemberID)
                    login = defaultLogin = self._generateUniqueLoginFromMemberEmail(memberEmail)
                    
                    memberFirstName = loginDict.get('memberFirstName')
                    if not memberFirstName:
                        raise exceptions.InvalidArgumentException(u"Invalid memberFirstName : [{memberFirstName}] is received. memberFirstName is mandatory while trying to login the member for first time.".format(memberFirstName=memberFirstName).encode('utf-8'))

                    memberLicenseAcceptedAt = loginDict.get('memberLicenseAcceptedAt')
                    if not memberLicenseAcceptedAt:
                        raise exceptions.InvalidArgumentException(u"Invalid memberLicenseAcceptedAt : [{memberLicenseAcceptedAt}] is received. memberLicenseAcceptedAt is mandatory while trying to login the member for first time.".format(memberLicenseAcceptedAt=memberLicenseAcceptedAt).encode('utf-8'))
                    
                    memberSharePermissionGrantedAt = loginDict.get('memberSharePermissionGrantedAt')
                    if not memberSharePermissionGrantedAt:
                        raise exceptions.InvalidArgumentException(u"Invalid memberSharePermissionGrantedAt : [{memberSharePermissionGrantedAt}] is received. memberSharePermissionGrantedAt is mandatory while trying to login the member for first time.".format(memberSharePermissionGrantedAt=memberSharePermissionGrantedAt).encode('utf-8'))
                    
                    memberDO = model.Member(stateID=2, email=memberEmail, givenName=memberFirstName, login=login, defaultLogin=defaultLogin, creationTime=atomicOperationTime, licenseAcceptedTime=memberLicenseAcceptedAt, isProfileUpdated=True)
                    memberDO.roles = []
                    memberDO.ext = []                                
                    isMemberUpdated = True 

            memberEmail = loginDict.get('memberEmail')
            if memberEmail is not None and memberDO.email != memberEmail:
                memberIDsFromMemberEmail = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.email == memberEmail).all()  
                if memberIDsFromMemberEmail:
                    raise exceptions.InvalidArgumentException(u"Current member profile can not be updated with the received memberEmail as another member with the given memberEmail : [{memberEmail}] is already found in the datBase.".format(memberEmail=memberEmail).encode('utf-8'))
                login = defaultLogin = self._generateUniqueLoginFromMemberEmail(memberEmail)
                memberDO.email = memberEmail
                memberDO.login = login
                isMemberUpdated = True

            memberFirstName = loginDict.get('memberFirstName')
            if memberFirstName is not None and memberDO.givenName != memberFirstName:
                memberDO.givenName = memberFirstName
                isMemberUpdated = True

            memberLastName = loginDict.get('memberLastName')
            if memberLastName is not None and memberDO.surname != memberLastName:
                memberDO.surname = memberLastName
                isMemberUpdated = True

            memberLicenseAcceptedAt = loginDict.get('memberLicenseAcceptedAt')
            if memberLicenseAcceptedAt is not None and memberDO.licenseAcceptedTime != memberLicenseAcceptedAt:
                memberDO.licenseAcceptedTime = memberLicenseAcceptedAt
                isMemberUpdated = True

            #validate memberRoleNames and then process
            memberRoleNames = loginDict.get('memberRoleNames')
            existingMemberRoleNames = [memberHasRole.role.name for memberHasRole in memberDO.roles]
            if memberRoleNames is not None and set(existingMemberRoleNames) != set(memberRoleNames):
                memberRoleMetaDOs = meta.Session.query(meta.MemberRoles).filter(meta.MemberRoles.c.name.in_(memberRoleNames)).all()
                if len(memberRoleMetaDOs) != len(memberRoleNames):
                    raise exceptions.InvalidArgumentException(u"One or more roles in the given memberRoleNames : [{memberRoleNames}] could not be found in the dataBase.".format(memberRoleNames=memberRoleNames).encode('utf-8'))
                memberDO.roles = []
                for memberRoleMetaDO in memberRoleMetaDOs:
                    memberDO.roles.append(model.MemberHasRole(roleID=memberRoleMetaDO.id))
                isMemberUpdated = True

            if isMemberUpdated:
                memberDO.updateTime = atomicOperationTime
            memberDO.loginTime = atomicOperationTime

            isPartnerInfoUpdated = False
            for memberExtData in memberDO.ext:
                if memberExtData.authTypeID == partnerID:
                    memberExtData.loginCount = memberExtData.loginCount+1
                    memberExtData.updateTime = atomicOperationTime

                    memberSharePermissionGrantedAt = loginDict.get('memberSharePermissionGrantedAt')
                    if memberSharePermissionGrantedAt is not None and memberExtData.sharePermissionGrantedTime != memberSharePermissionGrantedAt:
                        memberExtData.sharePermissionGrantedTime = memberSharePermissionGrantedAt
                    
                    if partnerMemberID is not None:
                        if memberExtData.externalID is None:
                            memberExtData.externalID = partnerMemberID
                        else:
                            if memberExtData.externalID != partnerMemberID:
                                raise exceptions.InvalidArgumentException(u"Current member profile can not be updated with received partnerMemberID : [{partnerMemberID}] as actual partnerMemberID :[{actualPartnerMemberID}] is already assigned to this member and partnerMemberID can not be changed once assigned.".format(partnerMemberID=partnerMemberID, actualPartnerMemberID=memberExtData.externalID).encode('utf-8'))
                    
                    isPartnerInfoUpdated = True
            
            if not isPartnerInfoUpdated:
                memberExtData = model.MemberExtData(authTypeID=partnerID, loginCount=1, updateTime=atomicOperationTime)
                if partnerMemberID:
                    memberExtData.externalID = partnerMemberID
                
                memberSharePermissionGrantedAt = loginDict.get('memberSharePermissionGrantedAt')
                if not memberSharePermissionGrantedAt:
                    raise exceptions.InvalidArgumentException(u"Invalid memberSharePermissionGrantedAt : [{memberSharePermissionGrantedAt}] is received. memberSharePermissionGrantedAt is mandatory while trying to login the member for first time.".format(memberSharePermissionGrantedAt=memberSharePermissionGrantedAt).encode('utf-8'))
                else:
                    memberExtData.sharePermissionGrantedTime = memberSharePermissionGrantedAt
                memberDO.ext.append(memberExtData)
            
            meta.Session.add(memberDO)
            meta.Session.flush()
            loginDict = self._generateMemberDict(memberDO)
            loginDict[u'partnerID'] = partnerID
            loginDict[u'partnerName'] = partnerName
            loginDict[u'partnerMemberID'] = partnerMemberID
            meta.Session.commit()
            return loginDict
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()
