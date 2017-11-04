from flxadmin.forms.options import getviewmode
from flxadmin.lib.base import BaseController
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib import helpers as h
from webhelpers import paginate
from pylons.templating import render_jinja2 as render
from pylons import config, request, tmpl_context as c
from pylons.controllers.util import redirect
from flxadmin.forms.modality import *
from formencode import htmlfill
    
import logging
LOG = logging.getLogger( __name__ )


class ModalityController(BaseController):    
    @login_required()
    def modalities(self):
        """Modalities listing page, client should call modalities_list() for data
        """
        template = 'artifact/modalities.html'
        c.pagetitle = 'Manage Modalities'
        c.crumbs = h.htmlalist(['home'])
        c.form = ModalitiesForm()
        if c.form.select_all_checkbox not in c.form.listhead:
            c.form.listhead.insert(0,c.form.select_all_checkbox)
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))
        return render(template)
    
    @ajax_login_required()
    def modalities_list(self):
        """ Modalities list data, for ajax calls
        """
        template = '/artifact/modalities_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('modalities'))

        api = 'get/info/modalities'
        pageSize = 20
        pageNum = 1
        returnAll = False

        if "filters" in params:
            filters = params.get("filters")
            if "pageSize" in filters:
                allFilters = filters.split(";")
                for fltr in allFilters:
                    fld,val = fltr.split(",")
                    if fld.lower() == "pagesize":
                        pageSize = int(val)
                        
        params_dict = {}
        params_dict['includeAllUnpublished'] = True
        if params.has_key('search') and (str(params.get('search',',').split(',')[1])).strip():
            if params.has_key('filters') and params['filters']:
                for typeFilter in params['filters'].split(';'):
                    filterFld, filterVal = typeFilter.split(',')
                    if filterFld == 'level' and filterVal:
                        api += '/' + filterVal
                    if filterFld == 'origin' and filterVal:
                        params_dict['ownedBy'] = filterVal
                    if filterFld == 'modalities' and filterVal:
                        params_dict['modalities'] = filterVal
                    if filterFld == 'course' and filterVal:
                        params_dict['course'] = filterVal

                    #US 148539925 : Add filter for - 'collectionHandle' and 'creatorID' 
                    # if applicable
                    if filterFld == 'collection' and filterVal:
                        if "_" in filterVal:
                            params_dict['collectionHandle'] = filterVal.split("_")[0]
                            params_dict['collectionCreatorID'] = filterVal.split("_")[1]

                    if filterFld == 'returnAll' and filterVal:
                        if filterVal == "False":
                            returnAll = False
                        elif filterVal == "True":
                            returnAll = True
                        returnAll = filterVal
                        params_dict['returnAll'] = filterVal

            api += '/' + params.get('search').split(',')[1]
            params_dict['pageSize'] = pageSize
            params_dict['pageNum'] = params['page']
            data = h.api(api, params_dict)
            pageUrl = paginate.PageURL(h.url_('modalities'), dict(params))
            pageNum = h.modify_page_attrs(params, pageSize)
            resp = data.get('response') or {}
            result = resp.get('domain', {}).get('modalities') or []
            total  = resp.get('total') or len(result)
            limit = resp.get('limit') or 0
            if returnAll and total == limit and total < 50:
                pageSize = total
            if result:
                for modality in result:
                    collectionCountsDict = dict()
                    if "collections" in modality:
                        for collection in modality["collections"]:
                            collectionHandle = collection["collectionHandle"]
                            if collectionHandle in collectionCountsDict:
                                collectionCountsDict[collectionHandle] += 1  
                            else:
                                collectionCountsDict[collectionHandle] = 1
                    modality["collectionWithCounts"] = collectionCountsDict.items()
        else:
            result, total = {},0
            pageUrl = paginate.PageURL(h.url_('modalities'), dict(params))

        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)
    
    
    @login_required()
    def upload_modality_course(self):
        """ Uploads modality courses by filename or by uploading file
        """
        template = '/artifact/upload_modality_courses.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = UploadModalityForm()
        c.pagetitle = 'Upload Modality Course'

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
            data = h.api_post('load/courseArtifact', params, 'Modality CoursesUploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url)     
    
    
    @login_required()
    def upload_modality(self):
        """ Uploads modality by filename or by uploading file
        """
        template = '/artifact/upload_modality.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = UploadModalityForm()
        c.pagetitle = 'Upload Modality'

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template))

        elif request.method == 'POST':
            params = dict(request.params)
            if not params['googleDocumentName'] and params['file']=='':
                c.form_errors = {'googleDocumentName': 'Either Google Spreadsheet Name or Upload is required'}
                return htmlfill.render(render(template), params)

            if not params.has_key('publishOnImport'):
                params['publishOnImport'] = 'false'

            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            publishOnImport = str(params.get('publishOnImport')).lower() == 'true'
            if publishOnImport:
                params['autoPublish'] = True

            if params.has_key('publishOnImport'):
                del params['publishOnImport']

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
            data = h.api_post('load/modalities', params, 'Modality Uploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url) 
    
    
