import logging

from dexter.lib import helpers as h

log = logging.getLogger(__name__)


class FBSDownload(object):
    """
    FBSDownload related Model APIs.
    """

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

    @h.trace
    def getFBSDownloads(self, artifactID):
        """
        Get the list of members who downloaded artifactID in the past days.
        """
        memberIDs = self.db.Resolved_FBS_DOWNLOAD.find({"artifactID":artifactID}).distinct('memberID')
        return memberIDs
