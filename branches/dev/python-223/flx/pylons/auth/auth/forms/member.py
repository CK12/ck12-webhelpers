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
# This file originally written by Ravi Gidwani
#
# $Id: member.py 13791 2011-11-22 00:42:38Z ravi $

from auth.lib.ck12 import messages
from auth.model import api
import formencode
import logging
import re
from datetime import datetime

log = logging.getLogger(__name__)


#################################################################
#                       IMPORTANT
# The validation rules in these forms need to kept in sync with
# the JS/JQuery validation rules.
#################################################################

# Username : min: 5 max: 127, only letters and digits
USERNAME_RE = re.compile(r'(?=.*\d)|(?=.*\w).*$', re.IGNORECASE)


class UniqueEmail(formencode.FancyValidator):
    def _to_python(self, value, state):
        if value is None:
            raise formencode.Invalid(messages.ACCOUNT_EMAIL_EMPTY, value, state)

        member = api.getMemberByEmail(email=value)
        if member:
            # is user exists, make sure his CK-12 profile does not exist.
            # A user may exist but he might not have registered e.g when he signed in using
            # facebook/google
            if member.stateID != 3:
                for e in member.ext:
                    if e.authType:
                        name = e.authType.name
                    else:
                        from pylons import app_globals as g

                        authTypeNames = g.getMemberAuthTypeNames()
                        name = authTypeNames[e.authTypeID]
                    if name == 'ck-12':
                        raise formencode.Invalid(messages.ACCOUNT_EMAIL_TAKEN, value, state)
        return value

class UniqueUsername(formencode.FancyValidator):
    def _to_python(self, value, state):
        if value is None:
            raise formencode.Invalid(messages.ACCOUNT_USERNAME_EMPTY, value, state)

        member = api.getMemberByLogin(login=value)
        if member is None:
            raise formencode.Invalid(messages.ACCOUNT_USERNAME_TAKEN, value, state)

        return value

class UnderageRequestForm(formencode.Schema):
    """
    Form used on the underage student requesting signup page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    name = formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.ACCOUNT_FULLNAME_EMPTY})
    birthday = formencode.All(formencode.validators.DateValidator(latest_date=datetime.now().date(), messages={'before':messages.ACCOUNT_DOB_BEFORE_TODAY}),
                              formencode.validators.DateConverter(month_style='mm/dd/yyyy', messages={'badFormat':messages.ACCOUNT_DOB_BAD_FORMAT}),
                              formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_DOB_EMPTY}))
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True))

class SignupUnderageForm(formencode.Schema):
    """
    Form used on the parent/teacher signing up for underage student page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    username = formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.ACCOUNT_FULLNAME_EMPTY})
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_PASSWORD_EMPTY_2})

class SignupStudentForm(formencode.Schema):
    """
    Form used on the sign up page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    name = formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.ACCOUNT_FULLNAME_EMPTY})
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), UniqueEmail())
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_PASSWORD_EMPTY_2})
    birthday = formencode.All(formencode.validators.DateValidator(latest_date=datetime.now().date(), messages={'before':messages.ACCOUNT_DOB_BEFORE_TODAY}),
                              formencode.validators.DateConverter(month_style='mm/dd/yyyy', messages={'badFormat':messages.ACCOUNT_DOB_BAD_FORMAT}),
                              formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_DOB_EMPTY}))

class SignupTeacherForm(formencode.Schema):
    """
    Form used on the sign up page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    name = formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.ACCOUNT_FULLNAME_EMPTY})
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), UniqueEmail())
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_PASSWORD_EMPTY_2})

class SignupForm(formencode.Schema):
    """
    Form used on the sign up page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    name = formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.ACCOUNT_FULLNAME_EMPTY})
    #firstName = formencode.validators.String(strip=True, not_empty=True)
    #lastName = formencode.validators.String(strip=True, not_empty=True)
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), UniqueEmail())
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_PASSWORD_EMPTY_2})
    #password_confirm = formencode.validators.String(not_empty=True)
    #chained_validators = [formencode.validators.FieldsMatch('password', 'password_confirm')]
    birthday = formencode.All(formencode.validators.DateValidator(latest_date=datetime.now().date(), messages={'before':messages.ACCOUNT_DOB_BEFORE_TODAY}),
                              formencode.validators.DateConverter(month_style='mm/dd/yyyy', messages={'badFormat':messages.ACCOUNT_DOB_BAD_FORMAT}),
                              formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_DOB_EMPTY}))

class SigninForm(formencode.Schema):
    """
    Form used on the signin page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    username = formencode.validators.String(not_empty=True, messages={'empty':messages.SIGNIN_USERNAME_EMPTY})
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.SIGNIN_PASSWORD_EMPTY})
    # user id will be filled in by the authentication form
    #user_id = formencode.validators.String(if_missing='-1')
    remember = formencode.validators.StringBoolean(if_missing=False)
    next = formencode.validators.String(if_missing='')
    authType = formencode.validators.String(if_missing='')

class ProfileForm(formencode.Schema):
    """
    Form used on the profile page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    firstName = formencode.All(formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.ACCOUNT_FIRSTNAME_HINT}),
                              formencode.validators.MaxLength(63, messages={'tooLong': messages.ACCOUNT_FIRSTNAME_MAXLENGTH }),
                              formencode.validators.Regex('^(?!.*[@\"]).*$', messages = {'invalid':messages.FIRSTNAME_CHARS_DISALLOWED}))
    lastName = formencode.All(formencode.validators.String(strip=True, not_empty=True, messages={'empty': messages.ACCOUNT_LASTNAME_HINT}),
                              formencode.validators.MaxLength(63, messages={'tooLong': messages.ACCOUNT_LASTNAME_MAXLENGTH }),
                              formencode.validators.Regex('^(?!.*[@\"]).*$', messages = {'invalid':messages.LASTNAME_CHARS_DISALLOWED}))
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), messages={'empty':messages.ACCOUNT_EMAIL_HINT})
    #gender = formencode.validators.String(if_missing='', messages={'empty': messages.ACCOUNT_GENDER_HINT})
    # note: login is same as username. The API side calls it login
    login = formencode.validators.Regex(USERNAME_RE,strip=True, messages={'invalid': messages.ACCOUNT_USERNAME_INVALID })
    website = formencode.All(formencode.validators.String(strip=True, not_empty=False),
                             formencode.validators.MaxLength(2084, messages={'tooLong': messages.ACCOUNT_WEBSITE_MAXLENGTH }))
    city = formencode.All(formencode.validators.String(strip=True, not_empty=False),
                          formencode.validators.MaxLength(63, messages={'tooLong': messages.ACCOUNT_CITY_MAXLENGTH }))
    zip = formencode.All(formencode.validators.Number(strip=True, not_empty=False),
                         formencode.validators.MaxLength(9, messages={'tooLong': messages.ACCOUNT_ZIP_MAXLENGTH }))
    province = formencode.All(formencode.validators.String(strip=True, not_empty=False),
                              formencode.validators.MaxLength(63, messages={'tooLong': messages.ACCOUNT_PROVINCE_MAXLENGTH }))
    postalCode = formencode.All(formencode.validators.String(strip=True, not_empty=False),
                                formencode.validators.MaxLength(10, messages={'tooLong': messages.ACCOUNT_POSTALCODE_MAXLENGTH }))
    phone = formencode.All(formencode.validators.Number(strip=True, not_empty=False),
                           formencode.validators.MaxLength(16, messages={'tooLong': messages.ACCOUNT_PHONE_MAXLENGTH }))
    fax = formencode.All(formencode.validators.Number(strip=True, not_empty=False),
                         formencode.validators.MaxLength(16, messages={'tooLong': messages.ACCOUNT_PHONE_MAXLENGTH }))
    birthday = formencode.All(formencode.validators.DateValidator(latest_date=datetime.now().date(), messages={'before':messages.ACCOUNT_DOB_BEFORE_TODAY}),
                              formencode.validators.DateConverter(month_style='mm/dd/yyyy', messages={'badFormat':messages.ACCOUNT_DOB_BAD_FORMAT}))

class ForgetPasswordForm(formencode.Schema):
    """
    Form used on the forget password page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), messages={'empty':messages.ACCOUNT_EMAIL_HINT})

class PasswordResetForm(formencode.Schema):
    """
    Form used on the reset password page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.ACCOUNT_PASSWORD_EMPTY_2})
    confirm_password = formencode.validators.String(not_empty=True, messages={'empty':messages.RESET_CONFIRM_PASSWORD_EMPTY})
    chained_validators = [formencode.validators.FieldsMatch('password', 'confirm_password')]

class PasswordChangeForm(formencode.Schema):
    """
    Form used on the password change page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    current_password = formencode.validators.String(not_empty=True)
    confirm_password = formencode.validators.String(not_empty=True, messages={'empty':messages.RESET_CONFIRM_PASSWORD_EMPTY})
    password = formencode.validators.String(not_empty=True, messages={'empty':messages.RESET_PASSWORD_EMPTY})
    chained_validators = [formencode.validators.FieldsMatch('password', 'confirm_password', messages={'invalidNoMatch':messages.RESET_PASSWORD_MATCH})]

class TwitterEmailForm(formencode.Schema):
    """
    Form used on the twitter email page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), messages={'empty':messages.ACCOUNT_EMAIL_HINT})

class TwitterEmailCompleteForm(formencode.Schema):
    """
    Form used on the twitter email complete page.
    """
    allow_extra_fields = True
    filter_extra_fields = True

class TwitterEmailVerifiedForm(formencode.Schema):
    """
    Form used on the twitter email complete page.
    """
    allow_extra_fields = True
    filter_extra_fields = True

class EmailVerifiedForm(formencode.Schema):
    """
    Form used on the email complete page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    
class FacebookEmailForm(formencode.Schema):
    """
    Form used on the facebook email page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True), messages={'empty':messages.ACCOUNT_EMAIL_HINT})
    
class FacebookEmailCompleteForm(formencode.Schema):
    """
    Form used on the facebook email complete page.
    """
    allow_extra_fields = True
    filter_extra_fields = True

class FacebookEmailVerifiedForm(formencode.Schema):
    """
    Form used on the facebook email complete page.
    """
    allow_extra_fields = True
    filter_extra_fields = True


