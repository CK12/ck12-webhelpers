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

import simplejson
import urllib
from pylons import config, request, session, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import *
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.model.artifact import ArtifactManager as Manager
from flxadmin.forms.artifact import *
from flxadmin.forms.modality import UploadModalityForm
from flxadmin.forms.options import getviewmode
from datetime import datetime, timedelta

import logging
LOG = logging.getLogger( __name__ )


class ArtifactController(BaseController):
    """ for: Artifact listing, details, content, bulk uploads
    """
    
    @ajax_login_required()
    def artifacts_list(self):
        """ Artifacts list data, for ajax calls
        """
        template = '/artifact/artifacts_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))

        searchPath = 'get/info/artifacts'
        searchKey = 'artifacts'
        isAssignmentArtifacts = False
        pageSize = 10
        if params.has_key('filters') and params['filters']:
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'pageSize':
                    pageSize = int(filterVal)
                if filterFld == 'artifactType' and filterVal in ['assignment']:
                    isAssignmentArtifacts = True
                    searchPath = '/get/all/assignments'
                    searchKey = 'assignments'
                    template = '/artifact/assignment_artifacts_list.html'
                if filterFld in ['published', 'contribution_type'] and (filterVal == 'all' or filterVal == 'false'):
                    params['filters'] = params['filters'].replace('%s,%s;' % (filterFld, filterVal), '').replace('%s,%s' % (filterFld, filterVal), '')

            if isAssignmentArtifacts and params.has_key('searchAll') and params['searchAll']:
                params['filters'] += ";assignmentID,%s" % (params['searchAll'])
        if params and params.has_key('search') and params['search']:
            LOG.debug("Search param: %s" % params['search'])
            for searchType in params['search'].split(';'):
                try:
                    fld, term = searchType.split(',')
                    if fld not in ['fromDate', 'toDate']:
                        continue
                    if params.has_key('filters'):
                        params['filters'] = params['filters'] + ";" + fld + ',' + term
                    else:
                        params['filters'] = fld + ',' + term
                    params['search'] = params['search'].replace('%s;' % searchType, '').replace('%s' % searchType, '')
                except:
                    pass
        fieldsrch = params['search'].split(',')[1] if params.get('search') else False
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        if not isAssignmentArtifacts and not fieldsrch and h.int_in_search(params, 'get/info/', 'artifact',\
                                             altSearchPath=searchPath, pageSize=10, altSearchKey=searchKey, pageNum=pageNum, pageUrlKey=searchKey):
            return render(template)

        result, total = h.page_get(searchPath, params, searchKey)

        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @ajax_login_required()
    def revisions_list(self, id=None):
        """ Revisions list data, for ajax calls
        """
        template = '/artifact/revisions_list.html'
        params = dict(request.params)
        pageSize = 100 #showing 100 instead of 25 since not paginating 
        pageUrl = paginate.PageURL(h.url_('.'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/info/artifact/revisions/%s/desc'%id, params, 'revisions')

        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def artifacts(self):
        """ Artifact listing page, client should call artifacts_list() for data
        """
        template = '/artifact/artifacts.html'
        c.pagetitle = 'Artifacts'
        c.crumbs = h.htmlalist(['home'])
        c.form = ArtifactsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))
        return render(template)

    @ajax_login_required()
    def artifactfeedbackreview_list(self):
        """ Artifacts list data, for ajax calls
        """
        template = '/artifact/artifactfeedbackreview_list.html'
        params = dict(request.params)
        if params.has_key('search') and params['search']:
            for typeFilter in params['search'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'memberID':
                    if params.has_key('filters') and params['filters']:
                        params['filters'] = params['filters'] + ';' + filterFld + ',' + filterVal
                    else:
                        params['filters'] = filterFld + ',' + filterVal
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))
        searchPath = '/get/artifactfeedbackreviewdetails'
        searchKey = 'artifactFeedbackReviewDetails'
        pageSize = 50
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(searchPath, params, searchKey)
        c.paginator = paginate.Page(result, pageNum, pageSize, total,url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def artifactfeedbackreview(self):
        """ Artifact listing page, client should call artifacts_list() for data
        """
        template = '/artifact/artifactfeedbackreview.html'
        c.pagetitle = 'Artifact Feedback Review'
        c.crumbs = h.htmlalist(['home'])
        c.form = ArtifactFeedbackReviewForm()
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))
        return render(template)

    @login_required()
    def reviews_abuse_report(self):
        template = 'artifact/reviewsabusereport.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = ReviewAbuseReportForm()
        c.viewmode = request.params.get('viewmode', getviewmode('reviews_abuse_report'))
        c.pagetitle = 'Artifact Review Abuse Report'
        return render(template)

    @ajax_login_required()
    def reviews_abuse_report_list(self):
        """Artifact Feedback and Reviews abuse list data, for ajax calls
        """
        template = '/artifact/reviewabusereport_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('reviews_abuse_report'))
        searchPath = '/get/abused/feedback'
        searchKey = 'result'
        pageSize = 50
        commentType = 'feedback'
        filters = ''
        if params.has_key('search') and params['search']:
            for typeFilter in params['search'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'memberID' or filterFld == 'artifactID':
                    if params.has_key('filters') and params['filters']:
                        params['filters'] = params['filters'] + ';' + filterFld + ',' + filterVal
                    else:
                        params['filters'] = filterFld + ',' + filterVal
        if params.has_key('filters') and params['filters']:
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'commentType' and filterVal:
                    commentType = filterVal
                    continue
                else:
                    filters = '%s;%s,%s' %(filters,filterFld, filterVal)  if filters else '%s,%s' %(filterFld, filterVal)
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        params['filters'] = filters
        params['commentType'] = commentType
        result, total = h.page_get(searchPath, params, searchKey)
        c.paginator = paginate.Page(result, pageNum, pageSize, total,url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def ugc_artifacts(self):
        """ User generated content's count listing page.
        """
        template = '/artifact/ugc_artifacts.html'
        c.pagetitle = 'User Generated Artifacts'
        c.crumbs = h.htmlalist(['home'])
        c.form = ArtifactsForm()
        c.form.type_choices = [(name, lbl) for name, lbl in c.form.type_choices if name != 'concept']
        defaults = {}
        defaults['toDate'] = datetime.now().__format__('%m-%d-%Y')
        defaults['fromDate'] = (datetime.now()-timedelta(days=7)).__format__('%m-%d-%Y')
        defaults['contribution_type'] = 'original'
        c.contribution_choices = [('original', 'Original Content'), ('derived', 'CK-12 Content derived'), ('modified', 'Customized from other content'), ('not-specified', 'Not Specified')]
        c.post_data = None
        c.not_contents_found = False
        if request.method == 'GET':
            return htmlfill.render(render(template), defaults)
        elif request.method == 'POST':
            params = {}
            params['filters'] = ''
            #if not h.validate(request.params, c.form):
            #    return htmlfill.render(render(template), c.form_result)

            if request.params:
                c.params = {}
                for param in dict(request.params):
                    c.params[param] = request.params[param]
                    if param and request.params[param]:
                        if param == 'contribution_type' and request.params[param] == 'not-specified':
                            continue
                        value = request.params[param]
                        if param in ['toDate', 'fromDate']:
                            value = datetime.strptime(value, '%m-%d-%Y').__format__('%d-%m-%Y')
                        params['filters'] += "%s" % ';' if params['filters'] else ''
                        params['filters'] += "%s,%s" % (param, value)
            #Set page size to 0 to get all records
            params['pageSize'] = 0
            params['pageNum'] = 1
            try:
                post_data = h.makeGetCall('get/info/ugc/artifacts', params=params)
            except Exception, e:
                LOG.exception(e)
                h.set_error(e)
                post_data = {}
            defaults.update(dict(request.params))
            if post_data:
                c.post_data = {}
                ugc_contents = post_data.get('response').get('artifacts')
                ugc_contents_counts = {}
                for ugc_content in ugc_contents:
                    tmp_content = {}
                    tmp_content['count'] = ugc_content['count']
                    tmp_content['artifactType'] = ugc_content['artifactType']
                    tmp_content['artifactTypeName'] = ugc_content['artifactTypeName']
                    tmp_content['givenName'] = ugc_content['givenName']
                    tmp_content['surname'] = ugc_content['surname']
                    if not c.post_data.has_key(ugc_content['creatorID']):
                        c.post_data[ugc_content['creatorID']] = []
                        ugc_contents_counts[ugc_content['creatorID']] = tmp_content['count']
                    else:
                        ugc_contents_counts[ugc_content['creatorID']] += tmp_content['count']
                    c.post_data[ugc_content['creatorID']].append(tmp_content)
                import operator
                ugc_contents_counts = sorted(ugc_contents_counts.iteritems(), key=operator.itemgetter(1), reverse=True)
                c.ugc_contents_counts = ugc_contents_counts
                c.success = h.flash.pop_message()
                if not c.post_data:
                    c.not_contents_found = True
                return htmlfill.render(render(template), defaults)
        return redirect(request.url)

    @login_required()
    def assignments(self):
        """ Artifact listing page, client should call artifacts_list() for data
        """
        template = '/artifact/assignments.html'
        c.pagetitle = 'Assignments'
        c.crumbs = h.htmlalist(['home'])
        c.form = AssignmentsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))
        return render(template)
  
    def special_format(self, artifact, id, isRevision=False):
        """ Helper, Returns dict of selected attrs that needs special formatting
        @param artifact: artifact object or revision object converted using toArtifact()
        @param id: revisionID if isRevision, else artifactID

        Notes about children, parents (as data is returned currently):
         children list is found within revisions list.  It contains only revision
          ids if artifact passed isRevision. 
         parents list is also found within revisions list.  It contains revision
          ids if artifact passed is an artifact, and [] if it is isRevision.
        """ 
        na = 'N/A'
        revision = artifact.get('revisions', [None])[0]
        revisionID = id if isRevision else artifact.get('revision_id', revision.get('id'))
        artifactID = id if not isRevision else artifact.get('artifactID')
        revisionIdStr = str(revisionID)
        artifactIdStr = str(artifactID)
        authors, childs = [], []
        athrs, chlds = {}, {}
        athrs_sort = {'author': 1, 'editor': 2, 'contributor': 3}
        chlds_sort = {'book': 1, 'tebook': 2, 'studybuide': 3, 'workbook': 4,
         'labkit': 5, 'chapter': 6, 'lesson': 7, 'concept': 8, 'section': 9}

        # Authors
        for a in artifact.get_authors() or []:
            athrs.setdefault(a.get('role') or 'unknown roles', []).append(
             a.get('name', '(Anonymous)'))

        sorted_roles = sorted(athrs.keys(), key=lambda k: athrs_sort.get(k, 99)) 
        for role in sorted_roles:
            _author = [role.title()+'s']
            _author.append(',&nbsp; '.join(athrs.get(role)) or 'None')
            authors.append(_author)

        # Children 
        if not isRevision:  # revision's children list is just ints
            for a in artifact.getChildren() or []:
                if not isinstance(a, int):
                    _artifactID = a.get('artifactID', a['id'])
                    chlds.setdefault(a.get('artifactType') or 'Artifacts', []).append(
                     h.htmla_('/artifact/%d'%_artifactID, a.get('title', 'No Title')))

        #Bug 56982: Check if there are concepts associated with this assignment/study-track artifact 
        #Overwrite 'domain' key value from chlds dict with the concepts we have fetched
        artifactTypeName = artifact.get("type").get("name")
        if artifactTypeName in ('assignment', 'study-track') and "domain" in chlds:
            concepts = h.get_assignment_artifact_concepts(artifactID)
            if len(concepts)>0:
                chlds["domain"] = []
                for concept in concepts:
                    chlds["domain"].append(h.htmla_('/artifact/%d'%concept["id"], concept.get('name', 'No Title')))

        sorted_types = sorted(chlds.keys(), key=lambda k: chlds_sort.get(k, 99))
        for artifactType in sorted_types:
            label_links = ['Contains %ss' % artifactType.title()]
            label_links.append(' &nbsp;|&nbsp; '.join(chlds[artifactType]) or 'None')
            childs.append(label_links)

        # Parents
        parentRevIDs = [l[0] for l in (revision.get('parents') or []) if len(l) > 0]
        parents = [h.htmla_('/revision/%d'%i, str(i)) for i in parentRevIDs]
        parentsLinks = h.pprint(parents)
        parentsFmtd = '(Revision Ids) '+parentsLinks if parentsLinks else 'None'

        # Formats
        formats = h.formats_str(artifact, isRevision)
        fmt_url = '/format/%s/%s'%(artifactIdStr, revisionIdStr) if isRevision else \
                  '/format/'+artifactIdStr
        has_all = h.has_format('all', c.artifact, isRevision)
        linkTxt = '[Re-Generate Prints]' if has_all else '[Generate Prints]'
        genLink = h.htmla_(fmt_url, linkTxt)
        formatsFmtd = '%s &nbsp; %s' % (formats, genLink)

        # Content
        xhtml = artifact.getXHTML().strip()
        contentPath = '/content/revision/%s'%id if isRevision else '/content/artifact/%s'%id
        contentFmtd = h.htmla_(contentPath, '[View Content]') if xhtml else 'None'

        # Resources 
        resources = h.dict_to_valkey_str(artifact.get('resourceCounts', {}))
        resourcesLink = h.htmla_('/resources?search=artifactID,'+artifactIdStr, '[View Resources]')
        resourcesFmtd = '%s &nbsp; %s' % (resources, resourcesLink)

        # Cover Image
        cover = artifact.get('coverImage')
        coverLink = h.htmla(h.fix_link(cover), '[View Cover]', 'viewcover', '', 'Cover Image') if cover else na
        coverFmtd = coverLink if isRevision else '%s &nbsp; %s' % (coverLink, 
         h.htmla_('/newcover/artifact/'+artifactIdStr, '[Replace]'))

        # return dict
        formatted = {
         'authors': authors,
         'childs': childs,
         'content': contentFmtd,
         'formats': formatsFmtd,
         'coverimg': coverFmtd,
         'resources': resourcesFmtd,
         'parents': parentsFmtd,
         'noParents': not parentRevIDs,
        }

        # more 
        if isRevision:
            if artifactID:
                formatted['artifact'] = h.htmla_('/artifact/'+artifactIdStr, '[Artifact Details Page]')
        return formatted

    @login_required()
    def artifact(self, id=None):
        """ Artifact details
        """
        template = '/artifact/artifact.html'
        c.pagetitle = 'Artifact Details'
        prvlink = 'artifacts'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = ArtifactForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.all_states = self.getAllStates()
        c.all_states = sorted(c.all_states, key = lambda x: x[0].lower())
        c.schools_dropdown = [('', 'Select')]
        
        c.artifact = h.get_artifact(id, True)

        #Bug 56074 - Enhancement: Show collection(s) association for the artifact 
        artifactHandle = urllib.quote(h.safe_encode(c.artifact['handle']))
        artifactType = c.artifact.get("artifactType")

        if c.artifact.get("isModality", 0):
            if c.artifact.get("collections", None):
                collections = c.artifact.get("collections")
                artifactCreatorID = c.artifact['creatorID']
                artifactCreatorLogin = c.artifact['creatorLogin']
                for collection in collections:
                    collectionCreatorLogin = collection.get("collectionCreatorLogin", "")
                    collectionCreatorID = collection.get("collectionCreatorID", None)

                    collection['artifactCollectionURL'] = "{}/c/".format(config['flxweb_server_root']) + \
                    "{cUserLogin}".format(cUserLogin="user:"+collectionCreatorLogin + "/" \
                        if collectionCreatorID !=3 else "")+"{}/{}/{}/".format(collection['collectionHandle'], \
                        h.safe_encode(collection['conceptCollectionAbsoluteHandle']), artifactType) + \
                        "{login}".format(login="user:"+artifactCreatorLogin+"/" \
                            if artifactCreatorID!=3 else "") + artifactHandle

                    try:
                        collection['artifactCollectionURL'] = unicode(collection['artifactCollectionURL'], "utf-8")
                    except TypeError:
                        #Bug 56713 : Decoding will fail if the object is already a unicode object.
                        #In such case dont decode.
                        pass                    
                c.artifact["collections"] = collections
        ##

        c.artifactRevisionID = c.artifact.get_revision_id()
        user = session.get( 'user' )
        c.loggedInUserID = user['email']
        c.loggedInMemberID = user['id']
        if c.artifact:
            c.artifact['handle'] = urllib.unquote(c.artifact['handle'])
            c.fmtd = self.special_format(c.artifact, id)
            c.artifactID = c.artifact.get('id', None)
            c.hasFeaturedTag = False
            for tag in c.artifact['internalTagGrid']:
                if 'featured' in tag:
                    c.hasFeaturedTag = True

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            successMsg = "Artifact Updated Successfully!"

            if c.success is None:
                #Check if 'showSuccessMsg' has been passed as a url param. 
                if request.params.get("showSuccessMsg", None):
                    c.success = successMsg
            else:
                #Dont flash success message in case 'showSuccessMsg' is not present.
                if request.params.get("showSuccessMsg", None) is None:
                    c.success = None

            #14361 - udpate content page link to new modality url instead of using perma url
            if c.artifact :
                artifact = h.getNewModalityURLForArtifacts([c.artifact])[0]
                c.newModalityURL = artifact.get('newModalityURL')
            return htmlfill.render(render(template), c.artifact)

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            r_params = dict(request.params)
            if r_params.has_key('featured') and r_params['featured'].lower() == 'true' and not c.hasFeaturedTag:
                browseTerm = Manager.get_browse_term_info('featured')
                if browseTerm:
                    featuredBrowseTermID = browseTerm['id']
                    h.api_post('create/browseTerm/association', 
                                     {'artifactID': id, 'browseTermID': featuredBrowseTermID})
            elif c.hasFeaturedTag and not r_params.has_key('featured'):
                browseTerm = Manager.get_browse_term_info('featured')
                if browseTerm:
                    featuredBrowseTermID = browseTerm['id']
                    h.api_post('delete/browseTerm/association', 
                                     {'artifactID': id, 'browseTermID': featuredBrowseTermID})
            newTerms = {'level': c.form_result.get('level'),
                       'domain': c.form_result.get('conceptNode')}
            oldTerms = {'level': c.artifact.get('level'),
                       'domain': c.artifact.get('conceptNode')}
            browseTerms = h.browseTerms(newTerms, oldTerms, id)

            keep = 'title handle encodedID license summary'.split()
            params = h.keep_only(c.form_result, keep)
            params = h.rename_attrs(params, {'license': 'licenseName'})
            params['impersonateMemberID'] = c.artifact.get('creatorID')

            if browseTerms:
                LOG.info('Data for browseTerms: '+str(browseTerms))
                browseRespData = h.api_post('load/browseTerms', 
                 {'waitFor': True, 'data': simplejson.dumps(browseTerms)})
                LOG.info(browseRespData)

            if c.artifact['artifactType'] == 'chapter':
                revision = (c.artifact.get('revisions', [None])[0])
                if revision:
                    parentRevisionID = revision.get('parents')[0][0]
                    params['bookTitle'] = "CK-12 Chemistry - Intermediate"
                    parentTitle = h.get_revision(parentRevisionID)['title']
                    params['bookTitle'] = parentTitle
            params['handle'] = urllib.quote(params['handle'])
            post_data = h.api_post('update/'+id, params, 'Artifact Updated Successfully!')

            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)

            showSuccessMsg = False
            urlExtension = None

            if post_data and isinstance(post_data, dict):
                if "responseHeader" in post_data:
                    if "status" in post_data["responseHeader"]:
                        if int(post_data["responseHeader"]["status"]) == 0:
                            showSuccessMsg = True
                            urlExtension = "?showSuccessMsg=1"
            if showSuccessMsg:
                if urlExtension:
                    return redirect(request.url+urlExtension)
            return redirect(request.url)

    @login_required()
    def assignment(self, id=None):
        """ Artifact details
        """
        template = '/artifact/assignment.html'
        c.pagetitle = 'Assignment Details'
        prvlink = 'assignments'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = AssignmentForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)

        params={}
        params['filters'] = 'artifactType,assignment;assignmentID,%s'%id
        params['pageNum'] = 1
        params['pageSize'] = 1
        c.assignment = None
        try:
            c.assignment = Manager.getAssignments(id, params)
            if c.assignment is None:
                h.set_error('NO SUCH ASSIGNMENT OR BAD DATA')
            else :
                if c.assignment['assignmentType'] == 'assignment' and c.assignment['groupID']:
                    assignmentReport = Manager.getGroupAssignmentReport(c.assignment['groupID'], {'pageNum':0, 'pageSize':0})
                    if assignmentReport:
                        for assignment in assignmentReport['assignments']:
                            if int(assignment['assignmentID']) == int(id):
                                assignmentReport['assignments'] = assignment
                                break
                    c.assignmentReport = assignmentReport
                    c.assignmentID = id
                    c.assignment['creationTime'] = c.assignment['artifact']['created']
                    if c.assignment.has_key('origin') and c.assignment['origin'] == 'lms':
                        if c.assignment.has_key('lmsAssignment'):
                            c.assignment['providerID'] = c.assignment['lmsAssignment']['providerID']
                            c.assignment['providerAssignmentID'] = c.assignment['lmsAssignment']['providerAssignmentID']
                    conceptIDs = ''
                    memberIDs = ''
                    for concept in c.assignmentReport['assignments']['concepts']:
                        conceptIDs += (',' if conceptIDs else '') + concept.get('encodedID', '%s' % concept['id'])
                    for member in c.assignmentReport['groupMembers']:
                        memberIDs += (',' if memberIDs else '') + '%s'%member['id']
                    if conceptIDs and memberIDs:
                        assessmentReport = Manager.getMemberConceptScores({'studentIDs':memberIDs, 'testIDs':conceptIDs})
                        if assessmentReport and assessmentReport.has_key('tests'):
                            for test in assessmentReport['tests']:
                                isQuiz = test['testType']['name'] in ['quiz', 'asmtquiz']
                                for memberID in test['scores']:
                                    score = test['scores'][memberID]
                                    if isQuiz:
                                        artifactID = str(test['artifactID'])
                                    else:
                                        eid = test['encodedIDs'][0]
                                        artifactID = None
                                        for concept in c.assignmentReport['assignments']['concepts']:
                                            if concept.has_key('encodedID') and concept['encodedID'] == eid:
                                                artifactID = concept['id']
                                                break
                                    if artifactID:
                                        c.assignmentReport['member_assignment'][0]['%s-%s'%(memberID,id)][str(artifactID)]['recordedScore'] = \
                                                round(float(score['correctAnswers'])/float(score['goal']) * 100) if score['correctAnswers'] else 0
                                        c.assignmentReport['member_assignment'][0]['%s-%s'%(memberID,id)][str(artifactID)]['testScoreID'] = score['testScoreID']
                                        c.assignmentReport['member_assignment'][0]['%s-%s'%(memberID,id)][str(artifactID)]['groupID'] = c.assignment['groupID']
                                        c.assignmentReport['member_assignment'][0]['%s-%s'%(memberID,id)][str(artifactID)]['ownerID'] = test['owner']['uID']
                                        c.assignmentReport['member_assignment'][0]['%s-%s'%(memberID,id)][str(artifactID)]['eids'] = ','.join(test['encodedIDs'])
                                    
        except Exception as ex:
            LOG.error(ex)
            h.set_error(ex)
            c.assignment = None
        
        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), c.assignment)

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            keep = 'name description, due'.split()
            params = h.keep_only(c.form_result, keep)
            params['due'] = h.parseISODate(params['due']) if params['due'] else None
            params['impersonateMemberID'] = c.assignment['artifact']['creatorID']
            post_data = h.api_post('update/assignment/'+id, params, 'Assignment Updated Successfully!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.assignment)
        return redirect(request.url)

    @login_required()
    def revision(self, id=None):
        """ Artifact revision details
        """
        template = '/artifact/artifact.html'
        c.pagetitle = 'Revision Details'
        prvlink = 'artifacts'
        if request.referer and 'artifact/' in request.referer:
            prvlink = (request.referer, 'Artifact')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = RevisionForm()
        c.isRevision = True
        c.revisionID = id

        result = h.get_revision(id)
        if result:
            artifact = Manager.toArtifact(result)
            if artifact:
                artifact = h.getNewModalityURLForArtifacts([artifact])[0]
                c.artifact = artifact
                c.newModalityURL = c.artifact.get('newModalityURL')
                c.fmtd = self.special_format(c.artifact, id, True)
                c.artifactID = c.artifact.get('artifactID', None)
            else:
                h.set_error('REVISION HAS NO OR BAD DATA')

            rev0 = c.artifact['revisions'][0]
            result.setdefault('language', rev0.get('language', ''))
            result.setdefault('isFavorite', rev0.get('isFavorite', ''))
            result.setdefault('labels', rev0.get('labels', ''))
            result.setdefault('addedToLibrary', rev0.get('addedToLibrary', ''))
            result.setdefault('offset', rev0.get('offset', ''))
        return htmlfill.render(render(template), result)

    @login_required()
    def content(self, artifactOrRevision, id=None):
        """ Artifact xhtml display
        """
        template = '/artifact/content.html'
        c.pagetitle = 'Content'
        isArtifact = artifactOrRevision.lower() == 'artifact'
        prevlink = '/artifact/%s'%id if isArtifact else '/revision/%s'%id
        prevText = 'Artifact Details' if isArtifact else 'Revision Details'
        c.crumbs = h.htmlalist(['home', 'artifacts'])
        c.crumbs.append(h.htmla_(prevlink, prevText))
        c.backto = h.htmla_(prevlink, '[%s]' % prevText)
        c.isArtifact = isArtifact

        if request.method == 'POST':
            params = {}
            params['id'] = id
            params['xhtml'] = request.params.get('conceptText')
            params['xhtml'] = params['xhtml'].replace('contenteditable="false"', '')
            post_data = h.api_post('replace/content/revision/'+id, params, 'Revision Content Updated Successfully!')
            if post_data:
                c.success = h.flash.pop_message()
        if isArtifact:
            c.artifact = h.get_artifact(id, True)
        else:
            c.artifact = Manager.toArtifact(h.get_revision(id,for_update=True))

        if c.artifact:
            c.content = c.artifact.getXHTML().strip()

        return render(template)


    @login_required()
    def newcover(self, artifactOrRevision, id=None):
        """ Replaces Cover Image for artifact.
        Note: Ezra says replacing cover for revision is not needed, but url
         is routed so that artiactOrRevision is captured if requirement changes.
        """
        template = '/artifact/newcover.html'
        prvlink = '/artifact/'+id
        c.crumbs = h.htmlalist(['home', (prvlink, 'Artifact')])
        c.pagetitle = 'Replace Cover Image'
        c.sectiontitle = c.pagetitle
        c.form = CoverForm()
        c.cancel = h.url_(prvlink)

        artifact = h.get_artifact(id)
        if artifact:
            c.sectiontitle = 'Cover for '+h.type_title(artifact)

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template))

        elif request.method == 'POST':
            if not artifact:
                return htmlfill.render(render(template))
            elif not artifact.get('creatorID'):
                h.set_error('Artifact has no creatorID, it must be set to replace cover.')
                return htmlfill.render(render(template))

            creatorID = artifact.get('creatorID')
            params = dict(request.params)
            params['impersonateMemberID'] = creatorID
            params['type'] = 'cover page'
            params['description'] = 'image'

            if not params['resourceUri'] and params['resourcePath']=='':
                c.form_errors = {'resourceUri': 'Either URL or Upload is required'}
                return htmlfill.render(render(template), params)

            elif not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            create_resp = h.create_or_update_resource(params)
            if not create_resp:
                return htmlfill.render(render(template), c.form_result)
            elif create_resp['responseHeader']['status'] == ErrorCodes.RESOURCE_ALREADY_EXISTS:
                rsrcID = create_resp['response']['id']
                create_resp = h.create_or_update_resource(dict(params, **{'id': rsrcID}))
            if not create_resp:
                return htmlfill.render(render(template), c.form_result)

            associate_resp = h.api_post('create/resource/association', {
                'resourceID': h.traverse(create_resp, ['response', 'id']),
                'artifactID': id,
                'impersonateMemberID': creatorID,
                }, 'Cover Image Updated Successfully.')

            if not associate_resp:
                return htmlfill.render(render(template), c.form_result)

            return redirect(h.url_('/artifact/'+id))


    @ajax_login_required()
    @jsonify
    def formats_info(self, id=None, revisionID=None):
        """ Returns json of list of avail print formats and
        string of nicely labeled print formats links
        """
        artifact = h.get_revision(revisionID) if revisionID else h.get_artifact(id)
        isRevision = revisionID != None
        return {
            'list': h.has_format('as_list', artifact, isRevision),
            'str':  h.formats_str(artifact, isRevision),
        }


    @login_required()
    def format(self, id=None, revisionID=None):
        """ Trigger Artifact formats (pdf, epub, mobi)
        """
        template = '/task/formattrigger.html'
        c.pagetitle = 'Generate Print Formats'
        c.artifactID = id
        isRevision = revisionID != None
        prvlink = 'artifacts'
        if request.referer and 'artifact/' in request.referer:
            prvlink = (request.referer, 'Artifact')
        elif request.referer and 'artifacts' in request.referer:
            prvlink = (request.referer, 'Artifacts')
        c.crumbs = h.htmlalist(['home', prvlink])

        if revisionID:
            c.revisionID = revisionID
            c.artifact_link = 'Unknown Revision'
            artifact = h.get_revision(revisionID)
            if artifact:
                c.artifact_link = h.htmla_('/revision/'+revisionID, 
                 'Revision - %s' % artifact.get('title', '(No Title)'))
        else:
            c.artifact_link = 'Unknown Artifact'
            artifact = h.get_artifact(id)
            if artifact:
                c.artifact_link = h.htmla_('/artifact/'+id, 
                 '%s - %s' % (artifact.get('artifactType', 'Artifact').capitalize(), 
                              artifact.get('title', '(No Title)')) )

        if artifact:
            c.formats_str = h.formats_str(artifact, isRevision)
            c.urls = h.formats_urls(artifact, isRevision)
        return htmlfill.render(render(template))


    @login_required()
    def upload(self):
        """ Upload browse terms, etc.
        """
        template = '/artifact/upload.html'
        c.crumbs = h.htmlalist(['home'])

        url_tokens = request.url.split('/')
        upload_api = url_tokens[-1] if url_tokens[-1] else url_tokens[-2]
        if upload_api == 'browseTerms':
            c.upload_name = 'Browse Terms'
            c.task_name = 'BrowseTermLoaderTask'
            c.form = UploadBrowseTermsForm()
        elif upload_api == 'foundationGrid':
            c.upload_name = 'Foundation Grid'
            c.task_name = ''
            c.form = UploadFoundationGridForm()
        c.pagetitle = 'Upload '+c.upload_name
        c.input_id = upload_api

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template))

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            data = h.api_load(request.params, c.upload_name+' Uploaded Successfully')
            if not data:
                return htmlfill.render(render(template))

            return redirect(request.url)

    @login_required()
    def upload_standards(self):
        """ Uploads standard state or standard correlations by filename or by uploading file
        """
        template = '/artifact/upload_standards.html'
        c.crumbs = h.htmlalist(['home'])
        url_tokens = request.url.split('/')
        upload_api = url_tokens[-1] if url_tokens[-1] else url_tokens[-2]
        if upload_api == 'standardsCorrelation':
            c.pagetitle = 'Standards Correlation'
            c.task_filters = urllib.quote('name,StandardsCorrelationLoaderTask')
            c.no_upload_message = "No Recent Standards Correlation Upload found"            
            c.form = UploadStandardsCorrelationForm()
        elif upload_api == 'stateStandards':
            c.pagetitle = 'State Standards'
            c.task_filters = urllib.quote('name,StandardsLoaderTask;name,StandardsLoaderTaskMongo')
            c.no_upload_message = "No Recent State Standards Upload found"
            c.form = UploadStateStandardsForm()

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), defaults={'useMongo':True}, force_defaults=False)

        elif request.method == 'POST':
            params = dict(request.params)
            if not params['googleDocumentName'] and params['file']=='':
                c.form_errors = {'googleDocumentName': 'Either Google Spreadsheet Name or Upload is required'}
                return htmlfill.render(render(template), params)

            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            file_upload = params.has_key('file') and params['file'] != ''
            if file_upload:
                try:
                    cache_dir = config.get('cache_share_dir')
                    savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['csv'])
                    fileObject = open(savedFile , 'r')
                    params['file'] = fileObject
                    params['filename'] = savedFile
                except Exception, e:
                    LOG.error(e)
                    h.set_error(e)
                    return htmlfill.render(render(template))
            else:
                del params['file']
            data = h.api_post(('load/%s')%(upload_api), params, c.pagetitle + 'Uploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url) 

    @login_required()
    def upload_retrolation(self):
        """ Uploads retrolation by filename or by uploading file
        """
        template = '/artifact/upload_retrolation.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = UploadRetrolationForm()
        c.pagetitle = 'Upload Retrolation'

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template))
        elif request.method == 'POST':
            params = dict(request.params)
            if not params['googleDocumentName'] and params['file']=='':
                c.form_errors = {'googleDocumentName': 'Either Google Spreadsheet Name or Upload is required'}
                return htmlfill.render(render(template), params)

            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            file_upload = params.has_key('file') and params['file'] != ''
            if file_upload:
                try:
                    cache_dir = config.get('cache_share_dir')
                    savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['csv'])
                    fileObject = open(savedFile , 'r')
                    params['file'] = fileObject
                    params['filename'] = savedFile
                except Exception, e:
                    LOG.error(e)
                    h.set_error(e)
                    return htmlfill.render(render(template))
            else:
                del params['file']
            data = h.api_post('load/retrolations', params, 'Retrolation Uploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url) 

    @login_required()
    def upload_vocabulary(self):
        """ Uploads vocabulary by filename or by uploading file
        """
        template = '/artifact/upload_vocabulary.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = UploadVocabularyForm()
        c.pagetitle = 'Upload Vocabulary'

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template))

        elif request.method == 'POST':
            params = dict(request.params)
            if not params['googleDocumentName'] and params['file']=='':
                c.form_errors = {'googleDocumentName': 'Either Google Spreadsheet Name or Upload is required'}
                return htmlfill.render(render(template), params)

            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            file_upload = params.has_key('file') and params['file'] != ''
            if file_upload:
                try:
                    cache_dir = config.get('cache_share_dir')
                    savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['csv'])
                    fileObject = open(savedFile , 'r')
                    params['file'] = fileObject
                    params['filename'] = savedFile
                except Exception, e:
                    LOG.error(e)
                    h.set_error(e)
                    return htmlfill.render(render(template))
            else:
                del params['file']
            data = h.api_post('/load/vocabularies', params, 'Vocabulary Uploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url) 
    
    @login_required()
    def upload_seometadata(self):
        """ Uploads seometadata by filename or by uploading file
        """
        template = '/artifact/upload_seometadata.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = UploadModalityForm()
        c.pagetitle = 'Upload SEO Metadata'

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template))

        elif request.method == 'POST':
            params = dict(request.params)
            if not params['googleDocumentName'] and params['file']=='':
                c.form_errors = {'googleDocumentName': 'Either Google Spreadsheet Name or Upload is required'}
                return htmlfill.render(render(template), params)

            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            file_upload = params.has_key('file') and params['file'] != ''
            if file_upload:
                try:
                    cache_dir = config.get('cache_share_dir')
                    savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['csv'])
                    fileObject = open(savedFile , 'r')
                    params['file'] = fileObject
                    params['filename'] = savedFile
                except Exception, e:
                    LOG.error(e)
                    h.set_error(e)
                    return htmlfill.render(render(template))
            else:
                del params['file']
            data = h.api_post('/create/seometadata', params, 'SEO Metadata Uploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url) 


    # raw json or xhtml renderers, for url type-ins, not called in app
    @login_required()
    @jsonify
    def content_raw(self, artifactOrRevision, id=None):
        """ Raw Artifact xhtml
        """
        isArtifact = artifactOrRevision.lower() == 'artifact'
        if isArtifact:
            artifact = h.get_artifact(id, True)
        else:
            artifact = Manager.toArtifact(h.get_revision(id))
        if not artifact:
            return 'NO SUCH ARTIFACT/REVISION OR BAD DATA'
        return artifact.get('xhtml')

    @login_required()
    @jsonify
    def artifacts_raw(self):
        return h.api_raw('get/info/artifacts', 
            {'pageSize':10, 'sort':'updateTime,desc'})
        
    @login_required()
    @jsonify
    def artifact_raw(self, id=None):
        artifact = Manager.getArtifactById(id, details=True)
        if artifact:
            artifacts = h.getNewModalityURLForArtifacts([artifact])
            if artifacts and len(artifacts) > 0:
                artifact = artifacts[0]
        return artifact

    @login_required()
    @jsonify
    def revision_raw(self, id=None):
        return h.api_raw('get/detail/revision/%s' % id)
    
    @login_required()
    def feedbacks(self, id=None, reviewsByUser=False):
        """ Artifacts review details page
        """
        reviewsByUser = reviewsByUser.lower() == 'true'
        template = '/artifact/reviews.html'
        linkTxt = 'Artifact'
        if reviewsByUser:
            linkTxt = 'Artifacts'
            prvlink = '/aritfacts'
            c.pagetitle = "User Reviews"
        else:
            prvlink = '/artifact/'+id
            c.pagetitle = "Artifact Reviews"

        if request.referer and 'review/' in request.referer and not reviewsByUser:
            prvlink = (request.referer, 'Artifact')
        c.crumbs = h.htmlalist(['home', (prvlink, linkTxt)])
        c.artifactID = id
        c.reviewsByUser = reviewsByUser
        c.viewmode = request.params.get('viewmode', 'full')
        c.form = FeedbacksForm()
        return render(template)
    
    @login_required()
    def feedbacks_list(self, id=None):
        """ Get the artifact feedback list
        """
        template = '/artifact/feedbacks_list.html'
        params = dict(request.params)
        if id:
            pageSize=25
            pageUrl = paginate.PageURL(h.url_('/reviews_list/%s' % id), params)
            pageNum = h.modify_page_attrs(params, pageSize)
            result = h.api_raw('get/feedback/comments/%s'%id,params)
            total = result['response']['total']
            result = result['response']['result']
            c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        else:
            pageSize=25
            pageUrl = paginate.PageURL(h.url_('/reviews_list/'), params)
            if params.has_key('searchAll') and params['searchAll']:
                params['impersonateMemberID'] = params['searchAll']
                pageNum = h.modify_page_attrs(params, pageSize)
                result = h.api_raw('/get/allfeedbacks/member', params)
                total = result['response']['total']
                result = result['response']['result']
                c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                           url=pageUrl, presliced_list=True)
            else:
                c.paginator = paginate.Page([], 1, 1, 0, 
                           url=pageUrl, presliced_list=True)
        return render(template)
    
    @login_required()
    def getlistreply(self, artifactID,memberID=None,feedbacktype='vote'):
        """ Artifacts feedbacks reply
        """
        template = '/artifact/feedbacks_reply_list.html'
        params = {}
        params['artifactID'] = artifactID
        params['memberID']  = memberID
        params['type']  = feedbacktype
        
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('/json/reviews/reply/%s/%s' % (artifactID,memberID)), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        result = h.api_raw('get/feedbackreviews',params)
        total = result['response']['total']
        result = result['response']['result']
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    @jsonify
    def deleteArtifactFeedback(self):
        """ Delete Artifact Feedback
        """
        params = dict(request.params)
        api_endpoint = 'delete/myfeedback/%s'% params['artifactID']
        result = h.api_post(api_endpoint, params)
        return result

    @ajax_login_required()
    @jsonify
    def updateArtifactFeedback(self):
        """ Update Artifact Feedback
        """
        params = dict(request.params)
        api_endpoint = 'update/feedback'
        if params.has_key('commentType') and params['commentType'] == 'review' and params['reviewID']:
            api_endpoint = '/update/feedbackreview'
        result = h.api_post(api_endpoint, params)
        if result and result.has_key('responseHeader') and result['responseHeader']['status'] == 0:
            return {"success" : True}
        return {"success" : False}

    @login_required()
    @jsonify
    def deleteFeedbackReview(self):
        """ Delete Feedback Reviews
        """
        params = dict(request.params)
        api_endpoint = 'delete/feedbackreview'
        result = h.api_post(api_endpoint, params)
        return result

    @login_required()
    def get_real_contributions(self):
        """ Get all real contributions
        """
        template = '/artifact/get_real_contributions.html'
        c.pagetitle = 'Get Real Contributions'
        c.crumbs = h.htmlalist(['home'])
        c.form = GetRealContributions()
        return render(template)

    @ajax_login_required()
    def get_real_contributions_list(self):
        """ real contributions list, for ajax calls
        """
        template = '/artifact/get_real_contributions_list.html'
        params = dict(request.params)
       
        params['sort'] = 'totalscore'
        
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('/get-real-contributions-list'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/rwas', params,'artifacts')
        result = h.getNewModalityURLForArtifacts(result)
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def notify_users(self, revisionID, artifactID=None):
        """
            Allows the admin user to specify what contents changed in the book/artifact.
            and notify users
        """
        template = '/artifact/notify_users.html'
        c.pagetitle = 'Artifact Content Notification'
        prvlink = (h.url_('/revision/%s'%(revisionID)), 'Revision')

        c.cancel = h.url_('/revision/%s'%(revisionID))
        if artifactID:
            prvlink = (h.url_('/artifact/%s'%(artifactID)), 'Artifact')
            c.cancel = h.url_('/artifact/%s'%(artifactID))
        c.crumbs = h.htmlalist(['home', prvlink])

        if request.method == 'GET':
            result = h.get_revision(revisionID)
            if result:
                artifact = Manager.toArtifact(result)
                if artifact['artifactType'] in ['book', 'tebook', 'workbook' ,'studyguide', 'labkit', 'lesson']:
                    all_events = h.get_sel('/get/info/eventtypes', 'eventTypes', ('id', 'name'), 'name', 'eventTypeID,', ('', 'All'))
                    c.eventTypeID = [event[0].split(',')[1] for event in all_events if event[1] ==\
                                     'ARTIFACT_NEW_REVISION_AVAILABLE_WEB'][0]
                    params = {}
                    params['filters'] = "%s;%s%s" %("eventTypeID,%s"%(c.eventTypeID), "objectType,artifact;","objectID,%s"%artifact['id'])
                    params['pageNum'] = 1
                    params['pageSize'] = 25
                    result, total = h.page_get('get/info/notifications', params, 'notifications')
                    c.notification_users_count = total
                    c.artifactID = artifact['id']
                    artifact = h.getNewModalityURLForArtifacts([artifact])[0]
                    c.messageToUsers = artifact.getMessageToUsers()
                    c.newModalityURL = artifact.get('newModalityURL')
                    c.isBook = artifact['artifactType'] != 'lesson'
                    c.revision =  artifact['revisions'][0]
                    c.success = h.flash.pop_message()
                else:
                    h.set_error('Artifact Type not supported.')
            return render(template)

        elif request.method == 'POST':
            params = {}
            params['notifyUsers'] = 0
            params['sendEmailNotification'] = False
            params['messageToUsers'] = request.params.get('messageToUsers', None)
            params['artifact_url'] = request.params['artifact_url']
            artifactID = request.params['artifactID']
            if request.params.has_key('notify_users_flag') and request.params['notify_users_flag'].lower() == 'true':
                params['notifyUsers'] = 1
                if request.params.has_key('email_notification') and request.params['email_notification'].lower() == 'true':
                    params['sendEmailNotification'] = True
            params['isBook'] = request.params['isBook']
            post_data = h.api_post('update/artifact/usernotification/%s'%(artifactID), params, 'Artifact User Notification Updated Successfully!')
            if not post_data:
                if post_data:
                    c.success = h.flash.pop_message()
                return render(template)
            return redirect(request.url)

    '''
        RWEs related
    '''    
    @ajax_login_required()
    def rwes_list(self):
        """ RWEs list data, for ajax calls
        """
        template = '/artifact/rwes_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('rwes'))
        searchPath = 'get/info/rwe'
        searchKey = 'RWEs'
        pageSize = 10
        
        if params.has_key('filters') and params['filters']:
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'pageSize':
                    pageSize = int(filterVal)
        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'simID' in searchType:
                    params['simID'] = ','.join(searchType.split(',')[1:])
                if 'eids' in searchType:
                    params['eids'] = ','.join(searchType.split(',')[1:])
            params.pop('search', None)
        
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(searchPath, params, searchKey)
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)
        
    @login_required()
    def rwes(self):
        """ RWEs listing page, client should call rwes_list() for data
        """
        template = '/artifact/rwes.html'
        c.pagetitle = 'RWEs'
        c.crumbs = h.htmlalist(['home'])
        c.form = RwesForm()
        c.viewmode = request.params.get('viewmode', getviewmode('rwes'))
        return render(template)
    
    @login_required()
    def rwe(self, id):
        """ RWE details
        """
        template = '/artifact/rwe.html'
        c.pagetitle = 'RWE Details'
        prvlink = '/rwes'       
        c.crumbs = h.htmlalist(['home', prvlink])  
        c.form = RweForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.save_prefix = 'Update'

        data = h.api('/flx/get/info/rwe', params={'id':id})
        rwe = h.traverse(data, ['response', 'RWEs'])
        c.rwe = rwe[0]
        c.rwe['description'] = c.rwe['content']
        # Image link
        c.rwe['imageLink'] = "<a href=%s target='_blank'>%s</a>" %(c.rwe['imageUrl'], 'Image')
        del(c.rwe['content'])
        
        # Simulation link
        simID = c.rwe['simID']
        c.rwe['simLink'] = "<a href=%sartifact/%s target='_blank'>%s</a>" %(config.get('webroot_url','/flxadmin/'), simID, simID)
        
        if c.rwe.has_key('eids'):
            c.rwe['eids'] = ','.join(c.rwe['eids'])
        
        if request.method == 'GET':
            if c.rwe :
                return htmlfill.render(render(template), c.rwe)
            else:
                return htmlfill.render(render(template))
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.keep_only(c.form_result, {
                '_id' : 'id',
                'title': 'title',
                'simID': 'simID',
                'eids': 'eids',
                'description': 'content',
                'imageUrl': 'imageUrl',
                'level': 'level'
            })
            post_data = h.api_post('/flx/update/rwe', params, 
                                       'Rwe Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.rwe)
        return redirect(request.url)
        
    '''
        UrlMapping related
    '''    
    @ajax_login_required()
    def urlmaps_list(self):
        """  urlmaps list data, for ajax calls
        """
        template = '/artifact/urlmaps_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('urlmaps'))
        searchPath = '/browse/info/urlmaps'
        searchKey = 'urlMaps'
        pageSize = 10
        if params.has_key('filters') and params['filters']:
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'pageSize':
                    pageSize = int(filterVal)
        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'oldUrl' in searchType:
                    params['oldUrl'] = ','.join(searchType.split(',')[1:])
                if 'newUrl' in searchType:
                    params['newUrl'] = ','.join(searchType.split(',')[1:])
                
            params.pop('search', None)
            
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(searchPath, params, searchKey)
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
                        
        
        return render(template)
        
    @login_required()
    def urlmaps(self):
        """ urlmaps listing page, client should call mapurls_list() for data
        """
        template = '/artifact/urlmaps.html'
        c.pagetitle = 'URL Maps'
        c.crumbs = h.htmlalist(['home'])
        c.form = UrlmapsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('urlmaps'))
        return render(template)
    
    @login_required()
    def urlmap(self,id):
        """ urlmaps details
        """
        template = '/artifact/urlmap.html'
        c.pagetitle = 'URL Map Details'
        prvlink = '/urlmaps'
        prvcrumb = (prvlink, 'Urlmaps') 
        c.crumbs = h.htmlalist(['home', prvcrumb])
        c.form = UrlmapForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.save_prefix = 'Update'
        data = h.api('/flx/get/info/urlmap', params={'id':id})
        c.urlmap = h.traverse(data, ['response'])
        if request.method == 'GET':
            if c.urlmap :
                return htmlfill.render(render(template), c.urlmap)
            else:
                return htmlfill.render(render(template))
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.keep_only(c.form_result, {
                '_id' : 'id',
                'newUrl': 'newUrl',
                'oldUrl': 'oldUrl',
            })
            post_data = h.api_post('/flx/update/urlmap', params, 'Urlmap Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.urlmap)
        return redirect(request.url)
    
    @login_required()
    def create_school(self):
        template = '/artifact/school.html'
        c.pagetitle = 'Create School'
        prvlink = '/'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.crumbs = h.htmlalist(['home'])
        c.save_prefix = 'Create'
        return render(template)

    
    def getAllStates(self):
        params_dict = {}
        result, total = h.page_get('flx/get/school/counts',params_dict, 'schoolCounts')
        states = [('', 'Select')]
        for s in result:
            state = s['_id']
            states.append((state, state.title()))
        states = sorted(states, key = lambda x: x[0].lower())
        return states
                
