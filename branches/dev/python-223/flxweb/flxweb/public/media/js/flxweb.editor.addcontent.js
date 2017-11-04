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

define('flxweb.editor.addcontent',[
    'jquery',
    'jquery-ui',
    'common/utils/utils',
    'common/views/modal.view',
    'flxweb.global',
    'flxweb.models.artifact'
],
function($, ui, Util, ModalView, global, Artifact){
    
    function AddContentDialog() {
        var search_dlg = null;
        var search_form = null;
        var result_div = null;
        var loading_placeholder = null;
        var empty_input_message = null;
        
        var selection_artifacttype = null;
        
        function artifactFetchSuccess(data) {
            var fetched_artifact = new Artifact(data);
            if (Artifact.isBookType(fetched_artifact.get('artifactType'))) {
                var book_children = fetched_artifact.getChildren();
        
                //Bug 8527 User must be alerted while adding empty book.
                if (book_children.length == 0) {
                    var empty_book_message = "Selected " + selection_artifacttype + " is Empty.";
                    $.flxweb.showDialog(empty_book_message, {
                        buttons: [{
                            'text': 'Ok',
                            'click': function () {
                                $(this).dialog('close');
                            }
                        }]
                    });
                } else {
                    var book_child = null;
                    for (var i = 0; i < book_children.length; i++) {
                        book_child = book_children[i];
                    }
                    fetched_artifact.setChildren(book_children);
                }
            }
            $.flxweb.events.triggerEvent(document, 'flxweb.editor.addcontent.add_artifact', {
                'artifact': fetched_artifact
            });
        }
        
        function artifactFetchError(){
            search_dlg.close();
            $.flxweb.showDialog("Could not fetch "+ selection_artifacttype +" details.");
        }
        
        function getartifactDetails(artifactID) {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/get/minimal/' + artifactID),
                cache: false,
                isPageDisable: false,
                isShowLoading: false,
                success: function(data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }
        
        function artifactDetailsFetch(){
            var artifactID, artifact_revision_id, nothing_selected_message;
            if ( $('.js_results .selected').size() > 0){
                artifactID = $('.js_results .selected').find('.listitemtitle').data('artifactid');
                $(search_dlg).find('.dialogcontent').addClass('hide');
                $(search_dlg).find('.js_dialog_loading').removeClass('hide');
                $(search_dlg).find('.js_dialog_loading .msg').html("Fetching "+ selection_artifacttype +" details");
                getartifactDetails(artifactID).done(function(data) {
                    if (data && data.artifact && data.artifact.artifactRevisionID) {
                        artifact_revision_id = data.artifact.artifactRevisionID;
                        $.ajax( $.flxweb.settings.webroot_url + 'ajax/addcontent/getinfo/'+ artifact_revision_id + '/',{
                            'success': artifactFetchSuccess,
                            'error': artifactFetchError
                        });
                    } else {
                        ModalView.alert('unable to get' + selection_artifacttype + ' details. Please try again later');
                    }
                }).fail(function() {
                    ModalView.alert('unable to get' + selection_artifacttype + ' details. Please try again later');
                });
            } else {
                nothing_selected_message = $(search_dlg).find('.js_dialog_error_nothing_selected').html();		
                $.flxweb.showDialog(nothing_selected_message, {
                    buttons:[{
                        'text': 'Ok',
                        'click': function(){
                            $(search_dlg).find("#q").focus();
                            $(this).dialog('close');
                        }
                    }]
                });
            }
        }
        
        function selectItem(){
            $('.js_results .selected').removeClass('selected');
            $(this).addClass('selected');
            selection_artifacttype = $(this).find('.listitemtitle').data('artifacttype');
        }

        function bindSearchLinks() {
            $( search_dlg).find('.js_results a').click(searchLinkClick);
            $('.js_results .listitem').click(selectItem);
        }

        function searchLinkClick() {
            var url = $(this).data('page_url');
            // dynamic message for no selection while adding item to FlxBook.
            var message = "";
            
            if(url.indexOf("at=book") != -1){
                message = "Please select a FlexBook&#174; textbook to add.";
            }else if(url.indexOf("at=concept") != -1){
                message = "Please select a Concept to add.";
            }else if(url.indexOf("at=tebook") != -1){
                message = "Please select a Teacher Edition to add.";
            }else if(url.indexOf("at=workbook") != -1){
                message = "Please select a Workbook to add.";
            }else if(url.indexOf("at=labkit") != -1){
                message = "Please select a Lab Kit to add.";
            }else if(url.indexOf("at=quizbook") != -1){
                message = "Please select a Quizzes and Tests book to add.";
            }
            if(message != ""){
                $(".js_dialog_error_nothing_selected").html(message);
            }
            
            result_div.html(loading_placeholder);
            result_div.load(url, bindSearchLinks);
            return false;
        }

        function searchSuccess(data) {
            result_div.html(data);
            bindSearchLinks();
        }

        function search() {
            var search_term = $.trim($('#q').val());
            $('#q').val(search_term);
            if (search_term){
                $.ajax({
                    'url' : $(this).attr('action'),
                    'type' : $(this).attr('method'),
                    'data' : $(this).serialize(),
                    'success' : searchSuccess
                });
                result_div.html(loading_placeholder);
            }else{
                result_div.html(empty_input_message);
            }
            return false;
        }

        function onDialogOpen() {
            $('#frm_searchdialog').submit(search);
            $("#js_addartifact").click(artifactDetailsFetch);
            result_div = $( search_dlg).find('.js_results');
            loading_placeholder = $(search_dlg).find('.js_dialog_loading_placeholder').html();
            empty_input_message = $(search_dlg).find('.js_empty_input_message').html();
            return false;
        }

        function init() {
            search_dlg = $.flxweb.createDialog($('#js_dialog_addcontent'),{
                'width' : '550px'
            });
            search_dlg.bind('flxweb.dialog.open', onDialogOpen);
            return search_dlg;
        }

        return init();
    }
    
    function domReady(){
        $.extend(true, $.flxweb, {
            'editor':{
                'AddContentDialog': AddContentDialog()
            }
        });
    }
    
    $(document).ready(domReady);
    
});
