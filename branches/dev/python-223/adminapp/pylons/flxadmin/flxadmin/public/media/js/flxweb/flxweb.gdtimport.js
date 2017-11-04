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
(function($) {
    
    var gdt_dlg = null;
    
    var _loading = null;
    var _content = null;
    var _auth_lnk = null;
    var _gdoc_cnt = null;
    var _gdoc_lst = null;
    var _txt_title = null;
    var gauth_win = null;
    
    var gdoc_id = null;
    var task_id = null;
    var artifact=null;

    /**
     * UI related
     */

    function loadGdtPage() {
        var _page = $(this).attr('href');
        _gdoc_lst.load(_page, onDocListLoad);
        return false;
    }

    function selectDocument() {
        var _gdoc = $(this);
        var title = _gdoc.data('doctitle');
        gdoc_id = _gdoc.data('docid');
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
    }

    function showGoogleAuthLink() {
        _loading.addClass('hide');
        _content.removeClass('hide');
        _auth_lnk.removeClass('hide');
        _gdoc_cnt.addClass('hide');
    }

    function showDocList() {
        _loading.addClass('hide');
        _content.removeClass('hide');
        _auth_lnk.addClass('hide');
        _gdoc_cnt.removeClass('hide');
        _gdoc_lst.load($.flxweb.settings.webroot_url + 'gdt/get/doclist/', onDocListLoad);
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
        showDocList();
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
            'artifact' : artifact
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
        gdt_dlg.close();
        $.flxweb.showDialog("There was a problem while importing selected Google Document.")
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
        if ( ! id ){
            $.flxweb.showDialog("Please select a document to import.");
            return false;
        }
        if ( ! validateTitle() ){
            return false;
        }
        $.ajax({
            'url' : $.flxweb.settings.webroot_url + 'gdt/import/task/',
            'type' : 'GET',
            'data' : {
                'docID' : id,
                'title' : title,
                'artifactTpe' : 'lesson'
            },
            'success' : importStartSuccess,
            'error' : importStartError
        });
        showLoading("Importing Google Document: <br>" + title);
    }
    
    /**
     * Initializations and event handling
     */

    function onDialogClose() {
        //reset variables
        gdoc_id = null;
        artifact = null;
        task_id = null;
    }
    
    function onTitleChange(){
        $(this).data('modified_by_user',true);
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
        gdt_dlg = $.flxweb.createDialog('#js_dialog_addfromgdocs', {
            'width': 550,
            'height': 560
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
})(jQuery);
