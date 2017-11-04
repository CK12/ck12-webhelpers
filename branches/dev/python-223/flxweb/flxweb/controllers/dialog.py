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
# $Id$

from pylons.decorators import jsonify
from pylons import request,tmpl_context as c
from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib.ck12.json_response import JSONResponse
from flxweb.model.artifact import ArtifactManager
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException
from pylons.i18n.translation import _ 
from flxweb.lib.remoteapi import RemoteAPI

import logging

LOG = logging.getLogger( __name__ )

class DialogController( BaseController ):
    """
    Controller to handle generic dialogs.
    """
    @login_required()
    def dlg_publish_artifact(self):
        '''
        Displays the publish artifact request dialog
        '''
        return render_jinja2 ('/dialogs/publish_artifact.html')

    @login_required()
    @jsonify
    def ajax_publish_artifact(self,revision_id):
        try:
            comments = request.POST.get('comments','')
            website = request.POST.get('website','')
            contributionType = request.POST.get('contribution_type','')

            if contributionType not in ['original', 'derived', 'modified']:
                raise Exception((_(u'invalid contribution Type .')).encode("utf-8"))
            artifact=ArtifactManager.getArtifactByRevisionId(revision_id)
            api = 'create/artifactContributionType/%s/%s' % (artifact['id'], contributionType)
            data = RemoteAPI.makeGetCall(api)
            LOG.debug('ArtifactContributionType result %s' % data )

            ArtifactManager.publishArtifactRequest(revision_id,comments,website,contributionType)
            response_obj = JSONResponse(JSONResponse.STATUS_OK)
            return response_obj
        except RemoteAPIStatusException, e:
            if 'already made' in e.api_message:
                response_obj = JSONResponse("error", c.messages.ARTIFACT_PUBLISH_REQUEST_EXISTS)
            else:
                response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj
        except Exception,e:
            LOG.debug('Failed sending a publish request for revision id=%s by user=%s' % (revision_id,c.user.email))
            LOG.exception(e)
            response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj
