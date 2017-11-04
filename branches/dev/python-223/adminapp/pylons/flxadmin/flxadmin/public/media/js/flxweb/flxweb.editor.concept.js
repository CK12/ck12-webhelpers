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
 * $Id: flxweb.details.flexbook.js 12422 2011-08-19 22:51:58Z ravi $
 */
(function($) {
    var artifact = null;
    var save_in_progress = false;

    /**
     * getContentHtml()
     * returns HTML content, excludes any emenents (eg: section edit links  )
     * that are introduced only as a part of editor functionality
     */
    function getContentHtml() {
        var content = $('#artifact_content').html();
        var contentObj = $('<div></div>').html(content);
        $( contentObj).find('.ck12-editor-discard').remove();
        content = contentObj.html();
        return content;
    }
    
     /**
     * Click handler for section edit links
     */
    function sectionEditClick() {
        var headElm = $(this).parent();
        $.flxweb.editor.tinymce.initSection(headElm);
        return false;
    }

    /**
     * Insert edit links next to section headings in content
     */
    function insertContentEditLinks() {
        var edit_link_template = $('#ck12_template_editlink').html();
        $("#artifact_content :header").each(function() {
            if(!$('.ck12_editor_editlink', $(this)).size()) {//add the link if its not already there.
                var edit_link = $(edit_link_template).addClass('ck12_editor_editlink');
                $(this).append(edit_link);
                edit_link.click(sectionEditClick);
            }
        });
    }
    
    function artifactSaveSuccess(data, response) {
        if(response) {
            if (!(response.status && response.status=='error') ){
                save_in_progress = false;
                $.flxweb.hideLoading();
                artifact.set(response);
                window.skipUnsavedWarning = true;
                if (response.context && response.position){
                    var redirect_url = $.flxweb.settings.webroot_url;
                    redirect_url += response.context.perma;
                    redirect_url += 'r'+response.context.latestRevision;
                    redirect_url += '/section/';
                    redirect_url += '' + response.position + '/';
                    redirect_url += artifact.get('handle') + '/';
                    window.location = redirect_url;
                } else {
                    window.location = $.flxweb.settings.webroot_url + artifact.get('perma');
                }
                
            } else {
                save_in_progress = false;
                $.flxweb.showDialog('Could not save concept. <br /> ' + response.message);
            }
            $(".js_loadingplaceholder").addClass('hide');
        }
    }

    function artifactSaveError(model,xhr) {
        save_in_progress = false;
        $.flxweb.hideLoading();
        var message = "Failed to save your content. Please try again later";
        $.flxweb.showDialog(message);
    }
    
    function validateArtifactTitle() {
        var artifactTitle = $('#txt_artifacttitle').val();
        var msg = null;
        //Rule#1: Check for "Untitled FlexBook"
        if( $.trim(artifactTitle) === '') {
            msg = "Concept title cannot be blank.";
        } else if ($.trim(artifactTitle).toLowerCase() == "untitled concept"){
            msg = "Concept title cannot be Untitled Concept.";
        } else if ($.trim(artifactTitle).toLowerCase().indexOf('/')!= -1) {
            msg = "Slash ( / ) is not a valid character in concept title.";
        }
        if (msg){
            $.flxweb.showDialog(msg,{
                'title' : 'Invalid Title',
                'buttons' : {
                    'Edit Title': function(){
                        $('#txt_artifacttitle').focus().select();
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

    function saveArtifact() {
        if (save_in_progress){
            return false;
        }
        if (!validateArtifactTitle()){
            return false;
        }
        save_in_progress = true;
        var xhtml = $("#artifact_content").tinymce().getContent();
        var objectives = null;
        var vocabulary = null;
        
        if($("#lesson_objectives").size()){
            objectives = $("#lesson_objectives").tinymce().getContent();
        }
        
        if ($("#lesson_vocabulary").size()){
            vocabulary = $("#lesson_vocabulary").tinymce().getContent();
        }
        
        artifact.set({
            'xhtml':xhtml,
            'lesson_objectives': objectives,
            'lesson_vocabulary' : vocabulary 
        });
        
        artifact.set({
            'encodeID' : ''
        });//remove encode ID

        if(!checkForLargeContent(artifact)) {

            saveArtifactContent(artifact);

        } else {

            $.flxweb.showDialog("The text to be saved is very large. Would you like to break it down to multiple concepts ?",{
                'title' : 'Warning',
                'buttons' : {
                    'Continue editing': function(){
                        $(this).dialog('close');
                    },
                    'Save anyway': function(){
                        $(this).dialog('close');
                        saveArtifactContent(artifact);
                    }
                }
            });

        }
        return false;
    }

    function saveArtifactContent(artifact) {

        $.flxweb.showLoading("Saving Concept");
        artifact.save(artifact.toJSON, {
            success : artifactSaveSuccess,
            error : artifactSaveError
        });
        //$(".js_loadingplaceholder").removeClass('hide');
    } 

    function checkForLargeContent(content) {
        content_length = JSON.stringify(content).length;
        warn_size = $("#artifact_content").tinymce().getParam("warn_large_content_min_size") * 1024 ; //In bytes
        if(content_length > warn_size) {
           return true;
        }  
        return false;
    }

    function onContentChange() {
        var xhtml = artifact.get('xhtml');
        var before_content = xhtml.slice(0, xhtml.indexOf('<body>') + 6);
        var after_content = xhtml.slice(xhtml.lastIndexOf('</body>'));
        xhtml = before_content + getContentHtml() + after_content;
        artifact.set({
            'xhtml' : xhtml
        });
    }

    function contentDblClick(evt) {
        $.flxweb.editor.tinymce.init($(this));
    }

    function summaryClick(evt) {
        $.flxweb.editor.tinymce.init($(this));
    }

    function getSummary() {
        return $('#artifact_summary').html();
    }
    
    function onSummaryEdit(evt) {
        artifact.set({
            'summary' : getSummary()
        });
    }
    
    function editArtifact(){
        var contentbox = $("#artifact_content");
        $.flxweb.editor.tinymce.init(contentbox);
        $('.js_arrow','.js_description_toggle').addClass('arrow').removeClass('arrow_right');
        $.flxweb.editor.tinymce.init( $(".js_description").removeClass('hide') );
    }
    
    function isEditorDirty(){
        if ( (window.skipUnsavedWarning)){
            return false;
        }
        return (
            artifact.dirty ||
            $("#artifact_content").tinymce().isDirty() ||
            ( $("#lesson_objectives").size() > 0 && $("#lesson_objectives").tinymce().isDirty() ) ||
            ( $("#lesson_vocabulary").size() > 0 && $("#lesson_vocabulary").tinymce().isDirty() )
        );
    }
    
    function initEditor(editor_elm){
        var elm = $(editor_elm);
        var content = null;
        if ( $(elm).size() ){
            content = $(elm).html();
            $(elm).bind('flxweb.editor.tinmymce.on_init', function(e, data){
                if (data.editor){
                    $(elm).tinymce().setContent(content);
                }
            });
            $(elm).tinymce($.flxweb.editor.tinymce.config);
        }
    }
    
   

    function domready() {
        artifact = $.flxweb.editor.current_artifact;
        $(".js_save_artifact").click(saveArtifact);
        initEditor($("#artifact_content"));
        initEditor($("#lesson_objectives"));
        initEditor($("#lesson_vocabulary"));

        // in-place-edit for book summary
        $('#artifact_summary').live('click', summaryClick);
        
        window.onbeforeunload = function() {
            if( isEditorDirty() ) {
                return "Unsaved changes will be lost. Are you sure you want to leave this page?";
            }
        };
    }

    $(document).ready(domready);
})(jQuery);
