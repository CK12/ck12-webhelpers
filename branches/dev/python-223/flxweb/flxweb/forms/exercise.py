from flxweb.lib.ck12 import messages
import formencode
import logging
import re

log = logging.getLogger(__name__)


#################################################################
#                       IMPORTANT
# The validation rules in these forms need to kept in sync with 
# the JS/JQuery validation rules. 
#################################################################

 

class ErrorReportForm (formencode.Schema):
    """
    Form used on the Question Error Report page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
    email = formencode.All(formencode.validators.Email(strip=True, not_empty=True))
    reason = formencode.validators.String(strip=True, not_empty=True, messages={'empty':messages.EXERCISE_ERROR_REPORT_REASON_EMPTY})	

