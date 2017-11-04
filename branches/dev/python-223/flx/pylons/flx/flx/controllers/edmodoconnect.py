import logging
import json

from pylons import session,request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.model import model
from flx.model import api
from flx.model import exceptions as ex
from flx.lib.base import BaseController
from flx.model import exceptions as ex
from flx.lib.search import solrclient
import flx.controllers.user as u
import flx.lib.helpers as h
from flx.lib.lms.edmodo_connect import EdmodoConnect as edmodoconnect
from flx.lib.lms.edmodo_connect import accesTokenChecker as eatc

from flx.controllers.errorCodes import ErrorCodes
from pylons import request

log = logging.getLogger(__name__)

class EdmodoconnectController(BaseController):

    """
        Edmodo Connect related APIs.
    """

    def _accessTokenError(self, msg):
        error_message = "External access token not found or expired"
        if msg:
            error_message = str(msg)
        result = BaseController.getResponseTemplate(self, ErrorCodes.EXTERNAL_API_FAILURE, 0)
        result['response']['error'] = error_message
        return result

    @d.jsonify()
    @d.trace(log)
    @eatc()
    def getUserEdmodoInfo(self, **kwargs):
        log.debug("getUserEdmodoInfo: begin");
	result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        try: 
	    access_token = kwargs['access_token']
	    log.debug("getUserEdmodoInfo: access_token [%s]"%access_token);

	    edmodoconn = edmodoconnect(access_token=access_token)
	    info = edmodoconn.getUserEdmodoInfo()

	    result['response']['result'] = json.loads(info)
	    return result
        except Exception, e:
	    if type(e).__name__ == "AccessTokenCredentialsError":
		log.error("Access token could not be redeemed")
                return self._accessTokenError(str(e))
            log.error("getUserEdmodoGroups unknown error [%s]"%str(e))
	    c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    @eatc()
    def getUserEdmodoGroups(self, **kwargs):
        log.debug("getUserEdmodoGroups: begin");
        log.debug("getUserEdmodoGroups: kwargs[access_token] = %s" %kwargs);
	result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        try: 
	    access_token = kwargs['access_token']
	    log.debug("getUserEdmodoGroups: access_token [%s]"%access_token);

	    edmodoconn = edmodoconnect(access_token=access_token)
	    groups = edmodoconn.getUserEdmodoGroups()
            log.debug("getUserEdmodoGroups: groups [%s]" % groups)
            if groups:
                group_list = json.loads(groups)
                for group in group_list:
                    _providerInfo = []
                    log.debug("getUserEdmodoGroups: group [%s]" % group)
                    _providerInfo = api.getLMSProviderGroups(providerGroupID=group['id'])
                    if _providerInfo:
                        ck12_groups = []
                        for info in _providerInfo:
                            ck12_group = {}
                            log.debug("getUserEdmodoGroups: info [%s]" % info)
                            log.debug("getUserEdmodoGroups: info.asDict() [%s]" % info.asDict())
                            ck12_group['groupID'] = info.groupID
                            ck12_group['providerGroupID'] = info.providerGroupID
                            ck12_group['title'] = info.title
                            ck12_groups.append(ck12_group)
                            #_providerInfo = [ json.loads(str(x.asDict())) for x in  _providerInfo]
                        group['ck12'] = ck12_groups
                    log.debug("getUserEdmodoGroups: _providerGroupInfo [%s]" % _providerInfo)
                    #group['ck12'] = _providerInfo

                #groups = json.loads(groups)
	    result['response']['result'] = group_list
	    return result
        except Exception, e:
	    if type(e).__name__ == "AccessTokenCredentialsError":
		log.error("Access token could not be redeemed")
                return self._accessTokenError(str(e))
            log.error("getUserEdmodoGroups unknown error [%s]"%str(e), exc_info=e)
	    c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.trace(log)
    @eatc()
    def getUserEdmodoAssignments(self, **kwargs):
        log.debug("getUserEdmodoAssignments: begin");
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        try:
	    access_token = kwargs['access_token']

            user_ids = request.params.get("user_ids", None)
            group_ids = request.params.get("group_ids", None)

	    edmodoconn = edmodoconnect(access_token=access_token)
	    assignments = edmodoconn.getAssignments(user_ids, group_ids)

	    result['response']['result'] = json.loads(assignments)
	    return result
        except Exception, e:
	    if type(e).__name__ == "AccessTokenCredentialsError":
		log.error("Access token could not be redeemed")
                return self._accessTokenError(str(e))
            log.error("getUserEdmodoAssignments unknown error [%s]"%str(e))
	    c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    @eatc()
    def createUserEdmodoAssignment(self, **kwargs):
        log.debug("createUserEdmodoAssignment: begin");
        try:
	    access_token = kwargs['access_token']
	    log.debug("createUserEdmodoAssignment: access_token [%s]"%access_token)

	    result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

	    log.debug("createUserEdmodoAssignment: request body [%s]"% request.body)
            recipients = None
            attachment = None
            params = json.loads(request.body) 
            title = params.get("title",None)
            due_date = params.get("due_date", "2016-12-12")
            groupID = params.get("groupID", None)
            assignmentUrl = params.get("assignmentUrl", None)
            
            if groupID:
                recipients = {'groups':[{'id': str(groupID)}]}
            if assignmentUrl:
                attachment = {'links':[{'title': title, 'url': assignmentUrl, 'link_url': assignmentUrl}]}
	    edmodoconn = edmodoconnect(access_token=access_token)
	    assignment = edmodoconn.createAssignment(title, due_date, recipients, title, attachment)

	    result['response']['result'] = json.loads(assignment)
	    return result
	except ex.MissingArgumentException, e:
            log.error("Failed to create assignment: %s"% str(e), exc_info=e)
	    c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(e))

        except Exception, e:
            log.error("Failed to create assignment unknown exception: %s"% str(e), exc_info=e)
            c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    @eatc()
    def turninUserEdmodoAssignment(self, **kwargs):
	try:
	    access_token = kwargs['access_token']
	    log.debug("turninUserEdmodoAssignment access_token [%s]" %access_token) 
	    result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)


	    log.debug("turninUserEdmodoAssignment request params [%s]" %request.params) 
	    log.debug("turninUserEdmodoAssignment request body [%s]" %request.body)
            params = json.loads(request.body) 
            assignment_id = params.get("assignment_id", None)
            content = params.get("content", None)
            attachments = params.get("attachments", None)

	    edmodoconn = edmodoconnect(access_token=access_token)
	    assignment = edmodoconn.turninAssignment(assignment_id, content, attachments)

            result['response']['result'] = json.loads(assignment)
            return result
 
        except Exception, e:
            log.error("Failed to create assignment unknown exception: %s"% str(e), exc_info=e)
            c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    @eatc()
    def submitUserEdmodoGrade(self, **kwargs):
        log.debug("submitUserEdmodoGrade: begin");
        try:
            access_token = kwargs['access_token']
	    log.debug("submitUserEdmodoGrade: access_token [%s]"%access_token);

	    result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

	    log.debug("submitUserEdmodoGrade: request body [%s]"% request.body);
            params = json.loads(request.body) 
            submitter_id = params.get("submitter_id", None)
            entity_id = params.get("entity_id", None)
            entity_type = params.get("entity_type", "assignment")
            grade_score = params.get("grade_score", None)
            grade_total = params.get("grade_total", None)

            # submitter_id, entity_id, entity_type, grade_score=None, grade_total=None
	    edmodoconn = edmodoconnect(access_token=access_token)
	    assignment = edmodoconn.submitGrade(int(submitter_id), 
						int(entity_id),
						entity_type,
						grade_score,
						grade_total)

	    result['response']['result'] = json.loads(assignment)
	    return result
	except ex.MissingArgumentException, e:
            log.error("Failed to create assignment: %s"% str(e), exc_info=e)
	    c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(e))

        except Exception, e:
            log.error("Failed to create assignment unknown exception: %s"% str(e), exc_info=e)
	    c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

