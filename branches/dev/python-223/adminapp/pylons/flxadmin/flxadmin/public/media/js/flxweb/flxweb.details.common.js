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
 * $id$
 */
(function($) {

    function renderSuccess(evt) {
        var download_url = evt.task_status.userdata.downloadUri;
        var render_link_id = evt.task_type + ((evt.render_template) ? evt.render_template : '' ) + "download";
        var render_link = $("#" + render_link_id);
        render_link.show();
        render_link.next().addClass('hide');
        var task_type = evt.task_type;
        var download_link = $("#" + task_type + "download");
        download_link.attr('href', download_url).attr('target', '_blank').unbind('click');
        var artifact_id = evt.artifact_id;
        var revision_id = evt.revision_id;
        //ADS log download event
        $.flxweb.logADS('fbs_download', 'downloaded', 1, [artifact_id, revision_id, ads_userid], [task_type]); 
        window.open(download_url, 'downloadwindow');
    }

    function renderError(evt) {
        var render_link_id = evt.task_type + ((evt.render_template) ? evt.render_template : '' ) + "download";
        var render_link = $("#" + render_link_id);
        render_link.show();
        render_link.next().addClass('hide');
        if(evt.error_info.error == "Unauthorized") {
            $.flxweb.showDialog('You need to be signed in to perform this action.',{
                'title' : "Authentication Required",
                'buttons' : {
                    'Sign In' : function() {
                        $(this).dialog('close');
                        $.flxweb.showSigninDialog();
                    },
                    'Cancel' : function() {
                        $(this).dialog('close');
                    }
                }
            });
        } else {
            $.flxweb.showDialog("Error generating " + evt.task_type,{
                'title' : "Error generating " + evt.task_type
            });
        }
    }

    function startRenderTask() {
        if($(this).attr('href') == '#') {
            var task_type = $(this).data('rendertype');
            var artifact_id = $(this).data('artifactid');
            var revision_id = $(this).data('artifactrevisionid');
            var render_template = $(this).data('rendertemplatetype');
            var nocache = $(this).data('rendercache') == 'nocache';
            var task_processor = $.flxweb.RenderTaskProcessor(task_type, artifact_id, revision_id, render_template, nocache);
            task_processor.then(renderSuccess, renderError);
            var render_link_id = task_type + ((render_template) ? render_template : '' ) + "download";
            var render_link = $("#" + render_link_id);
            render_link.hide();
            render_link.next().removeClass('hide');
            return false;
        } else {
            var task_type = $(this).data('rendertype');
            var artifact_id = $(this).data('artifactid');
            var revision_id = $(this).data('artifactrevisionid');
            //ADS log download event
            $.flxweb.logADS('fbs_download', 'downloaded', 1, [artifact_id, revision_id, ads_userid], [task_type]); 
        }
    }
    
    function toggleCollapsible(){
        var container = $(this).parent();
        $(container).find('.js_arrow').toggleClass('arrow').toggleClass('arrow_right');
        $(container).find('.js_collapsible_content').toggleClass('hide');
    }

    function showMoreMeta() {
        $(this).hide();
        $(".js_more_keywords", $(this).parent()).removeClass('hide');
        return false;
    }
    
    function shareLinkTxtClick(){
        $(this).select();
    }

    function socialShareClick(){
        var socialNetworkName = $(this).data('name');
        $.flxweb.logADS('fbs_share', 'shared', 1, [artifactID, artifactRevisionID, ads_userid], [socialNetworkName]);
    }

    function openReader() {
        window.location.href= $('#readerlink').attr('data-readerurl');
        return false;
    }

    function showAddToLibrary() {
        //Create LibraryItem from current artifact in the details page
        var currentArtifact = new LibraryItem({artifactRevisionID:artifactRevisionID});
        //loop through current library labels associated with the artifact
        //and set the selectedLabels dictionary. Note, 1 mean selected 
        var selectedLabels = {};
        for (var i = 0; i < artifactLabels.length; i++) {
            var label = artifactLabels[i];
            selectedLabels[label]=1;
        }
        window.labelsChooser.open([currentArtifact],selectedLabels);
        return false;
    }

    function onAddedToLibrary(event,data) {
        if (data && data.artifactRevisionID == artifactRevisionID) {
        
            $('#addtolibrary').addClass('hide');
            $('#addtolibraryaction').addClass('hide');
            $('#addedtolibrary').removeClass('hide');
            //Log with ADS
            $.flxweb.logADS('fbs_bookmark', 'bookmarked', 1, [data.artifactID, data.artifactRevisionID, ads_userid], []);
        }
    }

    function onRemovedFromLibrary(event,data) {
        if (data && data.artifactRevisionID == artifactRevisionID) {
            $('#addtolibrary').removeClass('hide');
            $('#addtolibraryaction').removeClass('hide');
            $('#addedtolibrary').addClass('hide');
        }
    }

    
    function navigateToSection(){
        var url = window.location;
        var hash = url.hash;
        var section = null;
        if (hash !== '') {
            hash = Url.decode(hash);
            var anchor = Base64.jqSafe(Base64.encode(hash.substring(1)));
            section = $('#x-ck12-' + anchor);
            if(!section.size()) {
                section = $('#' + anchor);
                if (!section.size()){
                    if (hash == '#view_videos') {
                        section = $('iframe').first();
                    } else {
                        section = $(hash);
                    }
                }
            }
            if(section.size()){
                if (section.hasClass('js_viewtab')){
                    $(document).scrollTop(0);
                } else {
                    $(document).scrollTo(section);
                }
            }
        }
    }
    
    function editLinkClick(){
        var edit_url = $('#personalize_link').attr('href');
        window.location = edit_url;
        return false;
    }
    
    function removeAttachment(e, data){
        //remove the row
        var resource_row = null;
        $('.js_resource_row').each(function(){
           if ($(this).data('resource-id') == data.resource_id) {
               resource_row = $(this);
               return false;
           }
        });
        if ( resource_row && resource_row.size() ){
            resource_row.hide(500, function(){$(this).remove();});
        }
    }

    function domReady() {
        
        var startTime = new Date();
        
        $('.js_downloadlink').click(startRenderTask);
        $('.js_lnk_show_meta').click(showMoreMeta);
        $('.js_detailstabs').tabs({
            'select' : function (evt, ui){
                if (ui.tab && ui.tab.hash){
                    window.location.hash = ui.tab.hash;
                }
            },
            'create': function(){
                $('.js_detailstabs').find('ul').removeClass('hide');
                $('.js_viewtab').removeClass('hide');
            }
        });
        $(window).bind('hashchange', navigateToSection);
        $('.js_collapsible_toggle').click(toggleCollapsible);
        $('.js_txt_sharelink').click(shareLinkTxtClick);
        $('#sharetwitter,#sharefacebook,#shareemail').click(socialShareClick);
        window.labelsChooser = new LabelsChooser({parent:$('#addtolibrary').parent()});
        // handler for starring aka fav/add-to-library
        $('#addtolibraryaction').click(function() {
            var currentArtifact = new LibraryItem({artifactRevisionID:artifactRevisionID});
            window.labelsChooser.addToLibrary([currentArtifact]);
            return false;
        });
        // handler for un-starring 
        $('#addedtolibrary').click(function() {
            var currentArtifact = new LibraryItem({artifactRevisionID:artifactRevisionID});
            window.labelsChooser.removeFromLibrary([currentArtifact]);
            return false;
        });

        window.bookbuilderAppView = new BookbuilderView({
                                                el:$('#dialog_add_to_book'),
                                                target: $('#add_to_book')
                                                });
        $('#addtolibrary').click(showAddToLibrary);
        $('#readerlink').click(openReader);
        // Star aka (Add-To-Library) listeners
        $(document).bind('flxweb.library.label.applied',onAddedToLibrary);
        $(document).bind('flxweb.library.item.added',onAddedToLibrary);
        $(document).bind('flxweb.library.item.removed',onRemovedFromLibrary);
      
        //ADS logging
        $.flxweb.logADS('fbs_visit', 'visited', 1 , [artifactID,artifactRevisionID,ads_userid], ['details']);

        // Fire ADS time_spent event periodically
        var interval = 30; // seconds
        window.setInterval(function() { $.flxweb.logADS('fbs_time_spent','duration', interval, [artifactID, artifactRevisionID, ads_userid], []); }, interval*1000);
        
        navigateToSection();
        $('.js_editlink').click(editLinkClick);
        $(document).bind('flxweb.editor.attachments.remove_attachment', removeAttachment);
        
        $(document).bind('scroll', function(){
            var bottom_buffer = 120;
            var scrollTop = $(document).scrollTop();
            var contentHeight = $(".contentarea").height() - bottom_buffer;
            if ( scrollTop < contentHeight ){
                $("#scrible_toolbar").css({'top': scrollTop });
            }
        });
    }

    $(document).ready(domReady);
})(jQuery);
