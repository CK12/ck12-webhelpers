#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Chetan Padhye
#
# $ID$
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.ck12model import CK12Model
from flxweb.lib.filters import ck12_date
import logging
from flxweb.model.user import UserManager
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException
from flxweb.lib.ck12.errorcodes import ErrorCodes
log = logging.getLogger(__name__)

class Review( CK12Model ):
    def __init__(self, dict_obj=None):
        CK12Model.__init__(self, dict_obj)
        #if 'creationTime' in dict_obj:
        #    self['creationTime'] = ck12_date(dict_obj['creationTime'])
        if 'memberName' in dict_obj:
            self['memberName'] = dict_obj['memberName'].title()
        elif 'reviewersMemberName' in dict_obj:
            self['reviewersMemberName'] = dict_obj['reviewersMemberName'].title()
        else:
            logedininfo = UserManager.getLoggedInUser()
            if logedininfo :
                self['memberName'] = logedininfo['fullName'].title()   
        if 'comments' in self:
            if self['comments'] is None or self['comments'] == 'null':
                self['comments'] = ''

class ReviewFeedbackManager():
    
    @staticmethod
    def create_feedback_review_for_artifact(artifactID, comments=None, vote=None):
        responce_info = None
        try:
            if not artifactID:
                raise Exception('No artifactID specified')
            api_endpoint = 'create/feedback'
            params = {}
            params['artifactID'] = artifactID
            if comments:
                params['comments']  = comments
            params['vote'] = vote
            log.debug(params) 
            data = RemoteAPI.makeCall(api_endpoint,params)
            log.debug(data)
            if 'response' in data and 'feedback' in data['response']:
                responce_info = Review(data['response']['feedback'])
        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
        return responce_info
    

    @staticmethod
    def sanitize_string(comments=None):
        responce_info = None
        try:
            api_endpoint = 'sanitize'
            params = {}
            if comments:
                params['string']  = comments
            log.debug(params) 
            data = RemoteAPI.makeCall(api_endpoint,params)
            if 'response' in data:
                responce_info = data['response']
        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
        return responce_info
     
    @staticmethod
    def getFeedbackReviewByArtifactID(artifactId,pageSize=5,pageNum=1):
        feedbackreviews = {} 
        try:
            api_url = 'get/feedback/comments'
            if artifactId:
                api_url = '%s/%s' % (api_url, artifactId)
                params = {}
                params['pageNum'] = pageNum
                params['pageSize']  = pageSize
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                total = 0
                if 'response' in data:
                    if 'result' in data['response']:
                        feedbackreviews['reviews'] = [Review(item) for item in data['response']['result']]

                    if 'total' in data['response']:
                        total = data['response']['total']

                feedbackreviews['total'] = total
        except Exception, e:
            log.exception(e)
        return feedbackreviews

    @staticmethod
    def getReplyForFeedbackReview(artifactId,memberId,feedbacktype):
        feedbackreviews = {} 
        try:
            api_url = 'get/feedbackreviews'
            if artifactId:
                params = {}
                params['artifactID'] = artifactId
                params['memberID']  = memberId
                params['type']  = feedbacktype
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                if 'response' in data:
                    if 'result' in data['response']:
                        feedbackreviews['replies'] = [Review(item) for item in data['response']['result']]

        except Exception, e:
            log.exception(e)
        return feedbackreviews

    @staticmethod
    def create_reply_reviewComment(artifactID, memberID, reviewersMemberID, reviewComment,feedbacktype):
        replycomments = {} 
        try:
            api_url = 'create/feedbackreview'
            if artifactID:
                params = {}
                params['reviewComment'] = reviewComment
                params['artifactID'] = artifactID
                params['memberID']  = memberID
                params['type']  = feedbacktype
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                if 'response' in data:
                    if 'feedbackReview' in data['response']:
                        replycomments = Review(data['response']['feedbackReview'])

        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
        return replycomments

    @staticmethod
    def update_reply_reviewComment(reviewComment, reviewID, reviewersMemberID, feedbacktype):
        replycomments = {} 
        try:
            api_url = 'update/feedbackreview'
            if reviewID:
                params = {}
                params['reviewComment'] = reviewComment
                params['reviewID'] = reviewID
                params['reviewersMemberID']  = reviewersMemberID
                params['type']  = feedbacktype
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                if 'response' in data:
                    if 'feedbackReview' in data['response']:
                        replycomments = Review(data['response']['feedbackReview'])

        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
        return replycomments
    
    
    @staticmethod
    def delete_reply_reviewComment(reviewID,reviewersMemberID, feedbacktype):
        reply = {} 
        try:
            api_url = 'delete/feedbackreview'
            if reviewID:
                params = {}
                params['reviewID'] = reviewID
                params['reviewersMemberID']  = reviewersMemberID
                params['type']  = feedbacktype
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                if 'response' in data:
                    if 'feedbackReview' in data['response']:
                        reply = Review(data['response']['feedbackReview'])
        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
            
        return reply
    
    @staticmethod
    def update_feedback_usability(artifactID, memberID, isHelpful, feedbacktype):
        replycomments = {} 
        try:
            api_url = 'create/feedbackhelpful'
            if artifactID:
                params = {}
                params['artifactID'] = artifactID
                params['memberID'] = memberID
                params['isHelpful']  = isHelpful
                params['type']  = feedbacktype
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                if 'response' in data:
                    if 'feedbackHelpful' in data['response']:
                        replycomments = Review(data['response']['feedbackHelpful'])

        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
            
        return replycomments
    

    @staticmethod
    def getRatingsByArtifactID(artifactId):
        artifactratings = {}
        try:
            api_url = 'get/feedback'
            if artifactId:
                api_url = '%s/%s' % (api_url, artifactId)
                data = RemoteAPI.makeGetCall(api_url)
                if 'response' in data and 'result' in data['response']:
                    artifactratings = data['response']['result']
            else:
                return artifactratings
        except Exception, e:
            log.exception(e)
        return artifactratings
    
        
    @staticmethod
    def getMyFeedbackByArtifactID(artifactId):
        myfeedback = {} 
        try:
            api_url = 'get/myfeedback'
            if artifactId:
                api_url = '%s/%s' % (api_url, artifactId)
                data = RemoteAPI.makeGetCall(api_url)
                if 'response' in data\
                    and 'result' in data['response']\
                    and 'vote' in data['response']['result']:
                    myfeedback= Review(data['response']['result']['vote'])
        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
        return myfeedback        
        

    @staticmethod    
    def removeMyFeedbackByArtifactID(artifactId,votetype):
        feedback_delete_status = {}
        try:
            api_url = 'delete/myfeedback'
            if artifactId:
                api_url = '%s/%s' % (api_url, artifactId)
                params = {}
                params['type'] = votetype
                data = RemoteAPI.makeGetCall(api=api_url,params_dict=params)
                if 'response' in data:
                    feedback_delete_status= data['response'][artifactId]
            else:
                return feedback_delete_status
        except RemoteAPIStatusException,e:
                        if e.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                            log.debug("Not authenticated user or Session is timed out")
                        else:
                            log.exception(e)
        except Exception, e:
            log.exception(e)
        return feedback_delete_status        
        
        
        
