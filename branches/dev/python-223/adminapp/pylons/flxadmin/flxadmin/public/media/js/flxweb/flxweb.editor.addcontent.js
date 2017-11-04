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

(function($){
    
    function AddContentDialog() {
        var search_dlg = null;
        var search_form = null;
        var result_div = null;
        var loading_placeholder = null;
        
        var selection_revisionid = null;
        var selection_artifacttype = null;
        
        function artifactFetchSuccess(data){
            var fetched_artifact = new Artifact(data);
            $.flxweb.events.triggerEvent(document, 'flxweb.editor.addcontent.add_artifact',{
                'artifact': fetched_artifact
            });
        }
        
        function artifactFetchError(){
            search_dlg.close();
            $.flxweb.showDialog("Could not fetch "+ selection_artifacttype +" details.");
        }
        
        function artifactDetailsFetch(){
            if ( $('.js_results .selected').size() > 0){
                var artifact_revision_id = $('.js_results .selected').find('.listitemtitle').data('artifactrevisionid');
                $(search_dlg).find('.dialogcontent').addClass('hide');
                $(search_dlg).find('.js_dialog_loading').removeClass('hide');
                $(search_dlg).find('.js_dialog_loading .msg').html("Fetching "+ selection_artifacttype +" details");
                $.ajax( $.flxweb.settings.webroot_url + 'ajax/addcontent/getinfo/'+ artifact_revision_id + '/',{
                    'success': artifactFetchSuccess,
                    'error': artifactFetchError
                });
            } else {
                var nothing_selected_message = $(search_dlg).find('.js_dialog_error_nothing_selected').html();		
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
            selection_revisionid = $(this).find('.listitemtitle').data('artifactrevisionid');
            selection_artifacttype = $(this).find('.listitemtitle').data('artifacttype');
        }

        function bindSearchLinks() {
            $( search_dlg).find('.js_results a').click(searchLinkClick);
            $('.js_results .listitem').click(selectItem);
        }

        function searchLinkClick() {
            var url = $(this).attr('href');
            result_div.html(loading_placeholder);
            result_div.load(url, bindSearchLinks);
            return false;
        }

        function searchSuccess(data) {
            result_div.html(data);
            bindSearchLinks();
        }

        function search() {
            $.ajax({
                'url' : $(this).attr('action'),
                'type' : $(this).attr('method'),
                'data' : $(this).serialize(),
                'success' : searchSuccess
            });
            result_div.html(loading_placeholder);
            return false;
        }

        function onDialogOpen() {
            $('#frm_searchdialog').submit(search);
            $("#js_addartifact").click(artifactDetailsFetch);
            result_div = $( search_dlg).find('.js_results');
            loading_placeholder = $(search_dlg).find('.js_dialog_loading_placeholder').html();
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
    
})(jQuery);
