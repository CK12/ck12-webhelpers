import logging
from datetime import datetime

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.exceptions import AlreadyExistsException, \
                                    InvalidArgumentException, \
                                    NotFoundException

log = logging.getLogger(__name__)


class FlxadminUserRoleAcl(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['user_role', 'allowed_routes']
        self.field_dependecies = {
                                    'user_role': {'type': str},
                                    'allowed_routes': {'type': list}
                                    }

    def get_user_role_acl(self, **kwargs):
        """
            Get flxadmin user role acl
        """
        result = None
        try:
            result = list(self.db.FlxadminUserRoleAcl.find().sort('user_role', -1))
        except Exception as e:
            log.error('Error getting flxadmin user roles: %s',
                      (str(e)), exc_info=e)
            raise e
        return result

    def update_flxadmin_user_role_acl(self, **kwargs):
        """
            Update the allowed routes for specified user_role
        """
        self.before_update(**kwargs)
        user_role = kwargs['user_role']
        del kwargs['user_role']

        kwargs['updated'] = datetime.now()
        result = self.db.FlxadminUserRoleAcl.update({'user_role': user_role},
                                                {"$set": kwargs}, upsert=True)
        return result
