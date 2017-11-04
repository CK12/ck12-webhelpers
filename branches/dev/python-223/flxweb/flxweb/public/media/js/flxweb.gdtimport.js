/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
define('flxweb.gdtimport',
['jquery','jquery-ui','flxweb.global','flxweb.models.artifact', 'common/utils/utils'],
function($,UI,Global, Artifact, Util) {
    
    var gdt_dlg = null;
    
    var _loading = null;
    var _content = null;
    var _auth_lnk = null;
    var _gdoc_cnt = null;
    var _gdoc_lst = null;
    var _txt_title = null;
    var gauth_win = null;
    
    var gdoc_id = null;
    var imported_artifact_type = 'lesson';
    var task_id = null;
    var artifact=null;
    var _gdoc_name=null;

    /**
     * UI related
     */

    function reposition_dialog(){
        $(gdt_dlg).dialog('option', 'position', 'center');
    }
    
    function loadGdtPage() {
        var _page = $(this).data('page_url');
        _gdoc_lst.html( _loading.html() );
        _gdoc_lst.load(_page, onDocListLoad);
        return false;
    }
    
    function listTypeClick(){
        $(this).siblings().removeClass('selected');
        $(this).addClass('selected');
        $(_gdoc_cnt).find('.js_help_text').addClass('hide');
        if ($(this).hasClass('js_list_type_docs')){
            $(_gdoc_cnt).find('.js_help_text_docs').removeClass('hide');
            imported_artifact_type = 'lesson';
            $('#modality_type_select').removeClass('hide');
        } else {
            $(_gdoc_cnt).find('.js_help_text_cols').removeClass('hide');
            imported_artifact_type = 'book';
            $('#modality_type_select').addClass('hide');
        }
    }

    function selectDocument() {
        var _gdoc = $(this);
        var title = _gdoc.data('doctitle');
        gdoc_id = _gdoc.data('docid');
        _gdoc_name = title;
        if (_gdoc.data('doctype') == 'document'){
            imported_artifact_type = 'lesson';
        } else {
            imported_artifact_type = 'book';
        }
        $( _gdoc_lst).find('a').removeClass('selected');
        _gdoc.addClass('selected');
        if (! $( _txt_title).data('modified_by_user') ){
            _txt_title.val(title);
        }
        return false;
    }

    function onDocListLoad() {
        $( _gdoc_lst).find('.js_gdoc_paginator a').click(loadGdtPage);
        $( _gdoc_lst).find('.js_gdoc').click(selectDocument);
    }
    
    function showLoading(msg){
        _loading.removeClass('hide');
        _content.addClass('hide');
        _auth_lnk.addClass('hide');
        _gdoc_cnt.addClass('hide');
        if (msg){
            $( _loading).find(".msg").html(msg);
        }
        reposition_dialog();
    }

    function showGoogleAuthLink() {
        _loading.addClass('hide');
        _content.removeClass('hide');
        _auth_lnk.removeClass('hide');
        _gdoc_cnt.addClass('hide');
        reposition_dialog();
    }

    function showDocList(load_list) {
        _loading.addClass('hide');
        _content.removeClass('hide');
        _auth_lnk.addClass('hide');
        _gdoc_cnt.removeClass('hide');
        $(_gdoc_cnt).find('.js_list_type').click(listTypeClick);
        $(_gdoc_cnt).find('.js_list_type').click(loadGdtPage);
        if (load_list){
            _gdoc_lst.load($.flxweb.settings.webroot_url + 'gdt/get/doclist/', onDocListLoad);
        }
        reposition_dialog();
    }

    /**
     *  gauth related
     */
    function handleGAuth() {
        var gauth_link = $(this).attr('href');
        gauth_win = window.open(gauth_link, 'gauth_win', 'status=no,titlebar=no,scrollbars=no, menubar=no, location=no, width=500, height=450, resizable=no');
        return false;
    }

    function authStatusCheckSuccess(data) {
        if(data.gdt_authenticated) {
            $.flxweb.events.triggerEvent(document, 'flxweb.gdtimport.auth_success');
        } else {
            $.flxweb.events.triggerEvent(document, 'flxweb.gdtimport.auth_error');
        }
    }

    function authStatusCheckError() {
        $.flxweb.events.triggerEvent(document, 'flxweb.gdt.auth_error');
    }

    function checkAuthStatus() {
        $.ajax({
            'url' : $.flxweb.settings.webroot_url + 'gdt/auth/status/',
            'dataType' : 'json',
            'success' : authStatusCheckSuccess,
            'error' : authStatusCheckError
        });
    }

    function onGDTAuthSuccess() {
        showDocList(true);
    }

    function onGDTAuthError() {
        showGoogleAuthLink();
    }
    
    /**
     * Import related
     */

    function artifactFetchSuccess(artifact, response) {
        artifact.set({'dirty':false}, {'silent':true});
        $.flxweb.events.triggerEvent(document, 'flxweb.gdtimport.success', {
            'artifact' : artifact,
            'doc_name':_gdoc_name
        });
    }

    function importSuccess(json_status) {
        var userdata = json_status.userdata;
        if(userdata) {
            artifact = new Artifact({
                'artifactType' : userdata.artifactType,
                'realm' : userdata.realm,
                'handle' : userdata.handle,
                'id' : userdata.id
            });
            artifact.fetch({
                'success' : artifactFetchSuccess
            });
        }
    }

    function importError(error_info) {
        //TODO: display import error
        var result = error_info.result;
        var duplicate_re =  /(.*?)\[(.*?)\]\s+from\[(.*?)\]\s+exists already/g;
        var is_duplicate = false;
        if (result){
            var re_info = duplicate_re.exec(result);
            if (re_info){
                is_duplicate = true;
                showDocList(false);
                var artifact_type = re_info[1];
                if (artifact_type.toLowerCase() == "book" || artifact_type.toLowerCase() == 'flexbook'){
                    artifact_type = 'FlexBook';
                } else {
                    artifact_type = 'concept';
                }
                var artifact_title = re_info[2];
                $.flxweb.showDialog(
                    $.flxweb.gettext("The <%=artifact_type %> with title <strong><%= _.escape(artifact_title) %> already exists</strong> in your library. Please use a different title",{
                        'artifact_type' : artifact_type,
                        'artifact_title' : artifact_title
                    })
                );
            }
        }
        if (!is_duplicate){
            gdt_dlg.close();
            $.flxweb.showDialog("There was a problem while importing selected Google Document.");
        }
    }

    function importStartSuccess(data) {
        task_id = data.taskID;
        $.flxweb.TaskProcessor({
            'task_id' : task_id
        }).then(importSuccess, importError);
    }

    function importStartError(error_info) {
        //TODO: display import error
        gdt_dlg.close();
        $.flxweb.showDialog("Error creating import task for selected Google Document.");
    }
    
    function validateTitle() {
        var artifactTitle = $(_txt_title).val();
        var msg = null;
        if( $.trim(artifactTitle) === '') {
            msg = "Title cannot be blank.";
        }
        if (msg){
            $.flxweb.showDialog(msg,{
                'title' : 'Invalid Title',
                'buttons' : {
                    'Edit Title': function(){
                        $(_txt_title).focus().select();
                        $(this).dialog('close');
                    },
                    'Cancel': function(){
                        $(this).dialog('close');
                    }
                }
            });
            return false;
        }
        return true;
    }

    function startGDTImport() {
        var id = gdoc_id;
        var title = _txt_title.val();
        if($("#import_modality_select").size() && imported_artifact_type === 'lesson'){
        	imported_artifact_type = $.trim($('#import_modality_select').val());
        }
        
        if ( ! id ){
            var list_type = 'documents';
            if ( $(gdt_dlg).find('.js_list_type_cols').hasClass('selected')  ){
                $.flxweb.showDialog("Please select a collection to import.");
            } else {
                $.flxweb.showDialog("Please select a document to import.");
            }
            return false;
        }
        if ( (! Util.validateResourceTitle(title, 'concept', _txt_title)) ||
        	(imported_artifact_type == 'book' && ! Util.validateResourceTitle(title, 'artifact', _txt_title)) ){
            return false;
        }
        
        $.ajax({
            'url' : $.flxweb.settings.webroot_url + 'gdt/import/task/',
            'type' : 'GET',
            'data' : {
                'docID' : id,
                'title' : title,
                'artifactType' : imported_artifact_type
            },
            'success' : importStartSuccess,
            'error' : importStartError
        });
        
        _gdoc_name = Artifact.htmlEscapArtifactTitle(_gdoc_name).display_title;
        if ($(gdt_dlg).find('.js_list_type_cols').hasClass('selected') ){
        	//showLoading("Importing Google Collection: <br>" + _gdoc_name, 1);
            gdt_dlg.close();
            $.flxweb.showDialog("Thank you! The book you requested is being imported. We will email you when it is imported.");
        } else {
        	showLoading("Importing Google Document: <br>" + _gdoc_name);
        }
    }
    
    /**
     * Initializations and event handling
     */

    function onDialogClose() {
        //reset variables
        gdoc_id = null;
        artifact = null;
        task_id = null;
        _gdoc_name = null;
        //Bug 9004 redirect the user to "Edit" tab on add Chapter.
        $('.js_editortabs').tabs( "select" , '#edit_content' );
    }
    
    function onTitleChange(){
        if ( $.trim( $(this).val() ) ){
            $(this).data('modified_by_user',true);
        } else {
            $(this).data('modified_by_user',false);
        }
    }

    function onDialogOpen() {
        _loading = $(gdt_dlg).find('.js_dialog_loading');
        _content = $(gdt_dlg).find('.js_dialog_content');
        _auth_lnk = $(_content).find('.js_gdoc_login_container');
        _gdoc_cnt = $(_content).find('.js_gdoc_list_container');
        _gdoc_lst = $(_gdoc_cnt).find('.js_gdoc_list');
        _txt_title = $(_gdoc_cnt).find('#txt_gdoc_title');
        $('.js_gdoc_auth_link').click(handleGAuth);
        $("#js_addfromgdocs_confirm").click(startGDTImport);
        $(_txt_title).change(onTitleChange);
        checkAuthStatus();
    }


    function domReady() {
        // GDT Dialog must be opened with http only
        elm = $('#js_dialog_addfromgdocs');
        console.log('Before Url' + dialogurl)
        var dialogurl = elm.data('dialogurl');
        elm.data('dialogurl', dialogurl.replace('https://', 'http://'));
        console.log('After Url' + elm.data('dialogurl'));
        gdt_dlg = $.flxweb.createDialog('#js_dialog_addfromgdocs', {
            'width': 550
        });
        gdt_dlg.bind('flxweb.dialog.open', onDialogOpen);
        gdt_dlg.bind('flxweb.dialog.close', onDialogClose);
        $(document).bind('flxweb.gdtimport.auth_success', onGDTAuthSuccess);
        $(document).bind('flxweb.gdtimport.auth_error', onGDTAuthError);
        $.extend(true, $.flxweb, {
            'gdtimport' : gdt_dlg
        });
    }
    $(document).ready(domReady);
});
