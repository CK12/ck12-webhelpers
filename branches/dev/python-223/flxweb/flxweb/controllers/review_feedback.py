#;
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
from pylons.decorators import jsonify
from pylons import request 
from flxweb.model.review_feedback import ReviewFeedbackManager
from flxweb.lib.base import BaseController
import logging
import simplejson
from pylons import tmpl_context as c

log = logging.getLogger(__name__)

class ReviewFeedbackController(BaseController):

    @jsonify
    def save_myreview(self, artifactID):
        result = {}
        try:
            data = request.body
            if data:
                json = simplejson.loads(data)
                artifactID = json['artifactID']
                comments = json['comments']
                vote = json['score']
                log.debug(comments)
                log.debug(vote)
                result = self.sanitize_string(comments)
                if not result or not result['isProfane']:
                    result = ReviewFeedbackManager.create_feedback_review_for_artifact(artifactID, comments, vote)
        except Exception,e:
            log.exception(e)
        return result 
   
    def sanitize_string(self,string):
        result = {}
        try:
            if string:
                result = ReviewFeedbackManager.sanitize_string(string)
        except Exception,e:
            log.exception(e)
        return result 

    @jsonify
    def list(self,artifactID,pageNum=None):
        reviews = {} 
        try:
            if artifactID:
                reviews = ReviewFeedbackManager.getFeedbackReviewByArtifactID(artifactID,pageSize=5,pageNum=pageNum)
        except Exception,e:
            log.exception(e)
        return reviews
    
    @jsonify
    def listreply(self,artifactID,memberID=None,feedbacktype='vote'):
        listreply = {}
        try:
            if artifactID:
                listreply = ReviewFeedbackManager.getReplyForFeedbackReview(artifactID,memberID,feedbacktype)
        except Exception,e:
            log.exception(e)
        return listreply

    @jsonify
    def save_reply(self,feedbacktype='vote'):
        result = {}
        try:
            data = request.body
            if data:
                json = simplejson.loads(data)
                reviewComment = json['reviewComment']
                artifactID = json['artifactID']
                memberID = json['memberID']
                reviewersMemberID = json['reviewersMemberID']
                result = self.sanitize_string(reviewComment)
                if not result or not result['isProfane']:
                    result = ReviewFeedbackManager.create_reply_reviewComment(artifactID, memberID, reviewersMemberID, reviewComment,feedbacktype)
        except Exception,e:
            log.exception(e)
        return result 

    @jsonify
    def update_reply(self,feedbacktype='vote'):
        result = {}
        try:
            data = request.body
            if data:
                json = simplejson.loads(data)
                reviewComment = json['reviewComment']
                reviewID = json['reviewID']
                reviewersMemberID = json['reviewersMemberID']
                result = self.sanitize_string(reviewComment)
                if not result or not result['isProfane']:
                    result = ReviewFeedbackManager.update_reply_reviewComment(reviewComment, reviewID, reviewersMemberID, feedbacktype)
        except Exception,e:
            log.exception(e)
        return result
    
    @jsonify
    def delete_reply(self,reviewID,reviewersMemberID, feedbacktype='vote'):
        result = {}
        try:
            if reviewID and reviewersMemberID:
                result = ReviewFeedbackManager.delete_reply_reviewComment(reviewID,reviewersMemberID,feedbacktype)
        except Exception,e:
            log.exception(e)
        return result
    
    @jsonify
    def update_feedback_usability(self,feedbacktype='vote'):
        result = {}
        try:
            data = request.body
            if data:
                json = simplejson.loads(data)
                artifactID = json['artifactID']
                memberID = json['memberID']
                isHelpful = json['isHelpful']
                result = ReviewFeedbackManager.update_feedback_usability(artifactID, memberID, isHelpful, feedbacktype)
        except Exception,e:
            log.exception(e)
        return result    
    
    @jsonify
    def summary(self,artifactID):
        rating = {}
        review = {}
        try:
            if artifactID:
                rating = ReviewFeedbackManager.getRatingsByArtifactID(artifactID)
                if artifactID in rating:
                    rating = rating[artifactID]
        except Exception,e:
            log.exception(e)
        try:
            if artifactID and c.user:
                review = ReviewFeedbackManager.getMyFeedbackByArtifactID(artifactID)
        except Exception,e:
            log.exception(e)
        rating.update(review)
        return rating             
 

    @jsonify
    def get_myreview(self,artifactID):
        review = {}
        try:
            if artifactID:
                review = ReviewFeedbackManager.getMyFeedbackByArtifactID(artifactID)
        except Exception,e:
            log.exception(e)
        return review
    
    @jsonify
    def remove_myreview(self, artifactID):
        result = {}
        votetype = 'vote'
        try:
            if artifactID:
                result = ReviewFeedbackManager.removeMyFeedbackByArtifactID(artifactID,votetype)
        except Exception,e:
            log.exception(e)
        return result
