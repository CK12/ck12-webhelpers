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
# This file originally written by John Leung
# $Id:$

import re
import formencode
from formencode import validators
from pylons import config
from flxadmin.lib import helpers as h


book1x_path = 'flx/lib/wiki_importer_lib/support_files/books_1_x_configs/'

class WikiImportForm(formencode.Schema):
    splitter_select = [
     ('', 'None'),
     ('%sck12_advanced_prob_stats_2nd_edition.cfg' % book1x_path, 'Adv Prob Stats 2.ed'),
     ('%sck12_alg_I_2nd_edition.cfg' % book1x_path, 'Algebra I 2.ed'),
     ('%sck12_bio.cfg' % book1x_path, 'Biology'),
     ('%sck12_calculus.cfg' % book1x_path, 'Calculus'),
     ('%sck12_chem_2nd_edition.cfg' % book1x_path, 'Chem 2.ed'),
     ('%sck12_earth_science_high_school.cfg' % book1x_path, 'EarthSci (high school)'),
     ('%sck12_geo_2nd_edition.cfg' % book1x_path, 'Geo 2.ed'),
     ('%sck12_life_science_mid_school.cfg' % book1x_path, 'LifeSci (midle school)'),
     ('%sck12_trig_2nd_edition.cfg' % book1x_path, 'Trig 2.ed'),
    ]
    splitter_choices = [data[0] for data in splitter_select]
    defaults = {
     'wiki_url': '',
     'import_user_id': 3,
     'contentVersion': '2',
     'import_drill_mode': 'concept',
     'is_metadata_mode': 'false',
     'content_splitter_guide': '',
     'file':None
    }
    version_choices = ['3', '2', '1']
    mode_choices = ['concept', 'section']

    #wiki_url = validators.URL(add_http=True, check_exists=True, not_empty=True, messages={'empty':'Please enter a valid URL.'})
    file = validators.String()
    wiki_url = validators.String()
    import_user_id  = validators.Int()
    contentVersion = validators.OneOf(version_choices)
    import_drill_mode = validators.OneOf(mode_choices, if_missing=False)
    content_splitter_guide = validators.OneOf(splitter_choices, if_missing=False)
    is_metadata_mode = validators.StringBool(if_missing=False)
    allow_extra_fields = True

class RebuildCacheForm(formencode.Schema):
    cache_rebuild_urls = re.sub(',\s*', '\n', config.get('cache_rebuild_urls')).split('\n'),

class GDocsForm(formencode.Schema):
    listhead = [h.htmldiv(*vals) for vals in [
     ('Title', 'title'), 
     ('Import As', 'import_as'), 
     ('Open In', 'openin'), 
    ]]