from flx.model import model, utils
from sqlalchemy.sql import and_, or_
import logging

log = logging.getLogger(__name__)

class MemberDataManager(object):
    """
        All Member related model level code in this class
    """
    @staticmethod
    def getMemberbyID(session, memberID):
        return utils.queryOne(session.query(model.Member).filter(model.Member.id == memberID))
    
    @staticmethod
    def getMemberbyLogin(session, login):
        return utils.queryOne(session.query(model.Member).filter(model.Member.login == login))
        
    @staticmethod
    def isGroupAdmin(session, memberDO, groupID):
        """
            Returns true if the member is an admin of the specified Group
        """
        if groupID is None or memberDO is None:
            return False
        query = session.query(model.GroupHasMembers)
        query = query.filter(and_(model.GroupHasMembers.groupID==groupID, model.GroupHasMembers.memberID==memberDO.id, 
                                  or_(model.GroupHasMembers.roleID==15, model.GroupHasMembers.roleID==1)))
        groupAdmins = query.all()
        return True if groupAdmins else False
    
