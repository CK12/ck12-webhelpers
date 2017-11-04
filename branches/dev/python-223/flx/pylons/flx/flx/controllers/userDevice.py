import logging
import traceback
import json,re
from gcm import GCM

from pylons import request, tmpl_context as c, config
from flx.controllers.mongo.base import MongoBaseController
import flx.controllers.user as u
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
import flx.lib.helpers as h
from flx.model.userdata import appuserdata

from flx.model.mongo import user_devices
from flx.lib.base import render
from flx.model import api
from apns import APNs, Payload
import time


log = logging.getLogger(__name__)

class UserdeviceController(MongoBaseController):
    """
    User Device(real world examples) related API's
    """
    
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    @d.jsonify()
    @d.trace(log)
    def registerDevice(self):
        result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            params = request.params
            member = u.getCurrentUser(request, anonymousOkay=False)
            uuid = params['uuid']
            platform = params['platform']
            timezone = params.get('timezone', None)
            if timezone:
                timezone = int(timezone)
            appCode = params.get('appCode', None)
            if not appCode:
                appCode = 'ck12app' # Default to practice app

            appVersion = params.get('appVersion', None)
            if platform.lower() not in ['android','ios']:
                raise Exception("Not a valid device platform: %s" % platform) 
            version = params.get('version')
            model = params.get('model')
            pushIdentifier = params.get('pushIdentifier')
            loggedInUserID = None
            if member and member.id:
                loggedInUserID = member.id
            ud = user_devices.UserDevices(self.db).registerUserDevice(uuid,platform,version,model,pushIdentifier,loggedInUserID, timezone=timezone, appVersion=appVersion, appCode=appCode)
            result['response'] = ud
            return result
        except Exception, e:
            log.error('Error registering device [%s]' %(str(e)), exc_info=e)
            if not hasattr(c,'errorCode') or c.errorCode == 0 :
                c.errorCode = ErrorCodes.CANNOT_REGISTER_DEVICE
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def pushANotification(self):
        result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            isAdmin = u.isMemberAdmin(member)
            if not isAdmin:
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Permission denied: admin access only')
            params = request.params
            res = self._push_a_notification(params)
            result['response'] = res
            return result
        except Exception,e:
            log.error('push_a_notification: %s' % h.safe_encode(unicode(e)), exc_info=e)
            if not hasattr(c,'errorCode') or c.errorCode == 0:
                c.errorCode = ErrorCodes.CANNOT_PUSH_THE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, h.safe_encode(unicode(e)))

    def _push_a_notification(self, params):
        result = {}

        loginOrEmail = params.get("to","").strip()

        appCode = params['appCode']   

        payload = json.loads(params.get("payload","{}") or "{}")
        collapse_key = params.get("collapse_key","show_only_the_latest_message")
        minAppVersion = params.get("minAppVersion","")
        if minAppVersion:
            minAppVersion = int(minAppVersion)

        #if not collapse_key:
        #    collapse_key = "show_only_the_latest_message"

        ttl = 0
        if params.get("ttl"): 
            ttl = int(params.get("ttl", 0))
        if not ttl:
           ttl = 24*60*60
        required_fields = ['type', 'title', 'action', 'actionLabel', 'dismissLabel', 'sound']
        if not payload:
            payload = {"type":"SAMPLE", "title":"CK-12 Test Message", "message":"Lets start practice!", "action":"www/ui/practiceapp/index.html", "actionLabel":"Let's Go","dismissLabel":"Dismiss", "sound": None}
        payload_keys = payload.keys()
        for each in required_fields:
            if each not in payload_keys:
                raise Exception('Missing "%s" in payload' % each)

        #member = member_model.Member(self.request.db).getMemberByLoginOrEmail(loginOrEmail)
        member = api.getMember(id=loginOrEmail)
        if member:
           member = member.asDict()
        if not member:
            raise Exception("No such user %s" % loginOrEmail)

        inAppNotification = True
        #ud = lmsuserdata.LMSUserData(self.db).getLMSUserData(memberID=member['id'], lmsAppName=appCode)
        ud = appuserdata.UserData(self.db).getUserData(memberID=member['id'], appName=appCode)
        if ud and ud.get("userdata"):
            inAppNotification = ud.get("userdata").get("inAppNotification", True)
        log.info("Allow inAppNotification? %s" % inAppNotification)
         
        if inAppNotification:
            devices = user_devices.UserDevices(self.db).getDevicesForUser(member["id"], appCode=appCode)
            #devices = [{'platform':'android', 'pushIdentifier': 'fddOvR_gkek:APA91bEmzNVCSH91i5wbGTfHIm8I5NfXI7XOhWsyxHuLT7D-YKheyVtuQ4LxAwjZWcrlN4IX26lvkni1tTknwIZLuqb-DAjcC4QGS3vDFm5DpgcsrLAKdqAXgCYOcyEL31ueRITTHyBE'}]
            #devices = [{'platform':'ios', 'pushIdentifier': 'de5c4016387d892332e6dda6f36e44f15130c00dc2aad3458545c01030f8e119'}]
            droids = []
            apples = [] 
            versionPat = re.compile("\d+\.\d+\.\d+\.(\d+)")
            for device in devices:
                if minAppVersion:
                   appVersion = device.get("appVersion", None)
                   svnNumber = None
                   if appVersion:
                       out = versionPat.findall(appVersion)
                       if out:
                          svnNumber = int(out[0])
                          if svnNumber < minAppVersion:
                              log.info("Skipping the device %s as the appVersion %s does not match with the minimum app version %s" % (device, svnNumber, minAppVersion))
                              continue
                   else:
                       log.info("Skipping the device %s as it is not having the appVersion info" % (device))
                       continue
                if device["platform"].lower() == "android":
                    droids.append(device.get("pushIdentifier"))
                elif device["platform"].lower() == "ios":
                    apples.append(device)
            if droids:
                api_key = "AIzaSyDBeOqTlrG7tb_gCGqvdW83ocV73N18MdY"
                gcm = GCM(api_key)
                log.info("Pushing the gcm notification to the following devices %s, payload %s" % (droids, payload))
                gcm_response = gcm.json_request(registration_ids=droids,data=payload, collapse_key=collapse_key, delay_while_idle=True, time_to_live=ttl)
                if gcm_response.has_key("errors"):
                    errors = gcm_response['errors']
                    # Removed the device details if user has unregistered the account.
                    if errors.has_key("NotRegistered"):
                        log.error("Removed the following device(android) identifiers from our database as they are not having our app currently %s" % errors['NotRegistered'])
                        user_devices.UserDevices(self.db).delete(pushIdentifiers=errors['NotRegistered'], platform="android")

                if gcm_response.has_key("canonical"):
                    # Change the pushIdentifier if it is changed by gcm.
                    canonical_response = gcm_response["canonical"]
                    for old_reference_key in canonical_response.keys():
                        new_key = canonical_response[old_reference_key]
                        kwargs = {'pushIdentifier':new_key, 'platform':'android'}
                        log.error("Changing the push identifier(android) of %s to %s" % (old_reference_key, new_key))
                        user_devices.UserDevices(self.db).update(pushIdentifier=old_reference_key, platform="android", kwargs = kwargs)
                result["gcm_response"] = gcm_response
            if apples:
                #in production sandbox should be false
                useApnSandbox = h.toBool(params.get('useApnSandbox',True))
                deleteInvalidAPNTokens = h.toBool(params.get('deleteInvalidAPNTokens',False))
                log.info("useApnSandbox: [%s]" % str(useApnSandbox))
                cert_file = config.get('apns_dev_cert_file')
                key_file = config.get('apns_dev_pkey_file')
                if not useApnSandbox:
                    cert_file = config.get('apns_prod_cert_file')
                    key_file = config.get('apns_prod_pkey_file')
                apns = APNs(use_sandbox=useApnSandbox, cert_file=cert_file, key_file=key_file, enhanced=True)
                def apn_response_listener(error_response):
                    log.error("APN ERROR: " + str(error_response))
                    if error_response.has_key('status'):
                        if error_response['status'] == 8:
                           if deleteInvalidAPNTokens:
                               log.error("Removed the following device(ios) identifiers from our database as it is not having our app currently %s" % error_response['identifier'])
                               user_devices.UserDevices(self.db).delete(identifiers=[error_response['identifier']], platform="ios")
                           log.info("Invalid sender %s" % error_response['identifier'])

                apns.gateway_server.register_response_listener(apn_response_listener)
                #frame = Frame()
                expiry = 0
                if ttl > 0:
                    expiry = time.time()+ttl
                    expiry = int(expiry)
                #priority = 10
                badge = params.get('badge', None)
                if badge != None:
                    badge = int(badge)
                apns_response = None
                for i, apple in enumerate(apples):
                    if not apple.get("pushIdentifier"):
                        log.info("Skipping...The apple push identifier is empty for the device %s" % apple)
                        continue
                    identifier = apple.get("identifier",i)
                    push_key=apple['pushIdentifier']
                    apn_payload = Payload(alert=payload.get("message","Touch to open app"),
                            sound=payload.get("sound","default"),
                            badge=badge,custom=payload)
                    log.info("Pushing the apn notification to %s %s" % (identifier,apple))
                    #frame.add_item(apple, apn_payload,identifier, expiry, priority)
                    apns_response = apns.gateway_server.send_notification(push_key, apn_payload, identifier=identifier, expiry=expiry)
                #apns_response = apns.gateway_server.send_notification_multiple(frame)
                result["apns_response"] = str(apns_response)
        return result

    @d.trace(log)
    def pushANotificationForm(self):
        sample = {"type":"SAMPLE", "title":"CK-12 Test Message", "message":"Lets start practice!", "action":"www/ui/practiceapp/index.html", "actionLabel":"Let's Go","dismissLabel":"Dismiss", "sound": None}
        c.payload = json.dumps(sample)
        return render('/flx/pushNotification/push_notification_form.html')
 
