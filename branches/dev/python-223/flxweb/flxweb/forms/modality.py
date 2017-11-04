#
# Copyright 2011-201x CK-12 Foundation
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
# This file originally written by Girish Vispute
# $Id:$

import formencode
import logging
from flxweb.lib import helpers as h

log = logging.getLogger(__name__)

class ModalityConfigurationForm(formencode.Schema):
    """
    Form used on the modality configuration page
    """
    modalities_listhead = [h.htmldiv(*vals) for vals in [
     ('Artifact Type', 'artifact_type'),
     ('Display Label','display_label'),
     ('Weight Teacher', 'weight_teacher'),
     ('Weight Student', 'weight_student'),
     ('Student Show','student_show'),
     ('Operation','operation')
    ]]
    
    groups_listhead = [h.htmldiv(*vals) for vals in [
     ('Group Name', 'group_name'),
     ('Group Classname', 'group_classname'),
     ('Display Text', 'display_text'),
     ('Artifact Types','artifact_types'),
     ('Sequence', 'sequence'),
     ('Show Text Label','show_text_label'),
     ('Default Thumbnail','default_thumb'),
     ('Operation','operation')
    ]]
    
