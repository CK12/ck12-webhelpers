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
# $Id: messages.py 13796 2011-11-22 01:57:50Z ravi $

from pylons.i18n.translation import _

#######################################
# Profile 
#######################################
PROFILE_SAVE_SUCCESS = _( 'Your profile has been saved' )
PROFILE_SAVE_ERROR = _( 'There was an error saving your profile. Please try again later' )
PROFILE_PASSWORD_CHANGE_INVALID_OLD_PASSWORD = _( 'The old password you entered does match with our records' )
PROFILE_PASSWORD_CHANGE_SUCCESS = _('Your password has been changed')
PROFILE_PASSWORD_CHANGE_ERROR = _('There was a error changing your password')

#######################################
# Account (Registration,Login)
#######################################
ACCOUNT_EMAIL_HINT = _('This is used to contact you when there are changes to textbooks or new versions are available')
ACCOUNT_EMAIL_TAKEN = _( 'This email is already taken' )
ACCOUNT_EMAIL_EMPTY = _( 'Email cannot be empty' )
ACCOUNT_EMAIL_INVALID = _( 'Please enter a valid email' )
ACCOUNT_EMAIL_MAXLENGTH = _('Must be not more than 250 characters')

ACCOUNT_USERNAME_HINT = _("This will be used for signing in")
ACCOUNT_USERNAME_ONCE = _("The username can only be changed once")
ACCOUNT_USERNAME_TAKEN = _( 'This username is already taken' )
ACCOUNT_USERNAME_EMPTY = _( 'Username cannot be empty' )
ACCOUNT_USERNAME_INVALID = _( 'Username should have atleat one number or an alphabet')
ACCOUNT_USERNAME_MINLENGTH = _('Must be at least 3 characters ')
ACCOUNT_USERNAME_MAXLENGTH = _('Must be not more than 127 characters')

ACCOUNT_LOGIN_FAILED = _( 'Login Failed' )
ACCOUNT_LOGIN_INVALID = _( 'Invalid email address and password!' )

ACCOUNT_FIRSTNAME_HINT = _( 'This is used when you send messages to students or customize textbooks' )
ACCOUNT_FIRSTNAME_EMPTY = _( 'First name cannot be empty')
ACCOUNT_FIRSTNAME_MAXLENGTH = _( 'First name should be less than 63 characters')
FIRSTNAME_DOUBLE_QUOTES_DISALLOWED = _( 'Double quotes are not allowed in firstname')
LASTNAME_DOUBLE_QUOTES_DISALLOWED = _( 'Double quotes are not allowed in lastname')

ACCOUNT_LASTNAME_HINT = _( 'This is used when you send messages to students or customize textbook' )
ACCOUNT_LASTNAME_EMPTY = _( 'Last name cannot be empty')
ACCOUNT_LASTNAME_MAXLENGTH = _( 'Last name should be less than 63 characters')

ACCOUNT_ROLE_HINT = _('This is used to tell us how you will be using our site')

ACCOUNT_GENDER_HINT =_( 'Please select your gender' )

ACCOUNT_PASSWORD_HINT = _('Password must contain at least 6 characters, at least one of which must be a number')
ACCOUNT_PASSWORD_EMPTY = _('Password cannot be empty')
ACCOUNT_PASSWORD_MINLENGTH = _('Password should be at least 6 characters')
ACCOUNT_PASSWORD_INVALID = _('Password must contain at least 6 characters, at least one of which must be a number')

ACCOUNT_CONFIRM_PASSWORD_HINT = _('Enter the same password as above')
ACCOUNT_CONFIRM_PASSWORD_EMPTY = _('Password cannot be empty')
ACCOUNT_CONFIRM_PASSWORD_MINLENGTH = _('Password should be at least 6 characters')
ACCOUNT_CONFIRM_PASSWORD_NOTSAME = _('Passwords do not match. Please enter the same password as above')

ACCOUNT_WEBSITE_MAXLENGTH = _('Must be not more than 2084 characters')

ACCOUNT_CITY_MAXLENGTH = _('Must be not more than 63 characters')

ACCOUNT_ZIP_MAXLENGTH = _('Must be not more than 9 digits')

ACCOUNT_PHONE_MAXLENGTH = _('Must be between 10 and 16 digits')
ACCOUNT_PHONE_INFO = _("Enter numbers without '-'")

ACCOUNT_PROVINCE_MAXLENGTH = _('Must be not more than 63 characters')

ACCOUNT_POSTALCODE_MAXLENGTH = _('Must be not more than 10 characters')

# Change password page
ACCOUNT_CURRENT_PASSWORD_HINT = _('Enter your current password')
ACCOUNT_NEW_PASSWORD_HINT = _('Enter your new password')
ACCOUNT_NEW_CONFIRM_PASSWORD_HINT = _('Enter your new password again')

##################################
# Forgot password page
##################################
FORGOT_PASSWORD_EMAIL_HINT = _("This is used to email you the instructions for resetting your password.") 
