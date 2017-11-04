import logging

from dexter.lib import helpers as h

log = logging.getLogger(__name__)


class Assessment(object):
    """
    LMSInstall related Model APIs.
    """

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

    @h.trace
    def get_assessment_answered_count(self):
        """
        Get the total number of LMS Instals.
        """
        query = {"$and": [ {"appContext": {"$in" : ["edmPracticeMath", "edmPracticeScience"]}}, {"testScoreID_skipped":0}  ] }
        totalCount = self.db.Resolved_FBS_ASSESSMENT.find(query).count()
        return totalCount

