import logging, traceback
from pylons import request, tmpl_context as c
from flx.lib.base import BaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes

from flx.guidance.grading import conceptGrade, bookGrade, bookGradeByConcepts, subjectGradeByBooks, subjectGradeByConcepts, masteryLevels
from flx.guidance.guiding import nextToLearn, improvements, nextSteps 

log = logging.getLogger(__name__)

class GuidanceController(BaseController):
    """Guidance controller.
    
    Technically this does not belong to ADS app, but this is convenient.
    """ 

    @d.jsonify()
    @d.trace(log)
    def mastery(self):
        """Fetch mastery data.
        
        POST Parameters:
        u -- student member ID
        s -- subject name
        b -- book artifact ID
        c -- concept artifact ID (ignored if parameter 'b' is present)
        gb -- if 1 return data grouped by concepts
              if 2 return data grouped by books
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subject = request.params.get('s')
            studentID = request.params.get('u')
            bookID = request.params.get('b')
            conceptID = request.params.get('c')
            groupBy = request.params.get('gb')
            
            if subject:
                grade = subjectGradeByBooks(studentID, subject) if groupBy == '2' else subjectGradeByConcepts(studentID, subject)
            elif bookID:
                grade = bookGradeByConcepts(studentID, bookID) if groupBy == '1' else bookGrade(studentID, bookID)
            else:
                grade = conceptGrade(studentID, conceptID)
            result['response']['result'] = grade
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_GUIDANCE_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result

    @d.jsonify()
    @d.trace(log)
    def levels(self):
        """Fetch mastery levels."""
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response']['result'] = masteryLevels()
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_GUIDANCE_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result

    @d.jsonify()
    @d.trace(log)
    def advice(self):
        """Fetch concepts to learn and improve next for a student.
        
        POST Parameters:
        s -- student member ID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            studentID = request.params.get('s')
            result['response']['learn'] = nextToLearn(studentID)
            result['response']['improve'] = improvements(studentID)
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_GUIDANCE_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result

    @d.jsonify()
    @d.trace(log)
    def nextsteps(self):
        """Fetch recommended next steps for a student.
        
        POST Parameters:
        s -- student member ID
        b -- book artifact ID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            studentID = request.params.get('s')
            bookID = request.params.get('b')
            result['response']['nextsteps'] = nextSteps(studentID, bookID)
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_GUIDANCE_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result
        