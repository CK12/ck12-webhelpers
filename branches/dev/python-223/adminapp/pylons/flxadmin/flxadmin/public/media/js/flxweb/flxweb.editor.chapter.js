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

    //dialog
    var dlg = null;
    var chapter = null;
    var chapter_old = null;
    var save_in_progress = false;

    function saveSuccess(model, response, xhr) {
        if(response) {
            if(!(response.status && response.status=='error')) {
                model.dirty = false; //already saved, shouldn't be dirty.
                var data = {
                    'artifact': model,
                    'old_artifact' : chapter_old
                };
                $.flxweb.events.triggerEvent(document, "flxweb.editor.chapter.save_success", data);
            } else {
                var msg = response.message;
                if (msg.indexOf('already exists') > -1){
                    $.flxweb.showDialog(msg,{
                        'title' : 'Invalid Title',
                        'buttons' : {
                            'Edit Title': function(){
                                $(dlg).find(".chapteredit_content").removeClass('hide');
                                $(dlg).find(".chapteredit_saving").addClass('hide');
                                $("#txt_chapter_title").focus().select();
                                $(this).dialog('close');
                            }
                        }
                    });
                } else {
                    $.flxweb.showDialog('Could not save chapter. <br /> ' + msg);
                }
            }
        }
        save_in_progress = false;
    }

    function saveError(model, xhr) {
        $.flxweb.showDialog("Failed to save chapter.");
        save_in_progress = false;
        dlg.close();
    }
    
    function validateTitle() {
        var artifactTitle = $.trim( $("#txt_chapter_title").val() );
        var msg = null;
        //Rule#1: Check for "Untitled Chapter"
        if( $.trim(artifactTitle) === '') {
            msg = "Chapter title cannot be blank.";
        } else if ($.trim(artifactTitle).toLowerCase() == "untitled chapter"){
            msg = "Chapter title cannot be Untitled Chapter.";
        } else if ($.trim(artifactTitle).toLowerCase().indexOf('/')!= -1) {
            msg = "Slash ( / ) is not a valid character in chapter title.";
        }
        if (msg){
            $.flxweb.showDialog(msg,{
                'title' : 'Invalid Title',
                'buttons' : {
                    'Edit Title': function(){
                        $('#txt_chapter_title').focus().select();
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

    function saveChapter() {
        if (!validateTitle()){
            $("#txt_chapter_title").focus().select();
            return false;
        }
        if (save_in_progress){
            return false;
        }
        save_in_progress = true;
        var title = $.trim( $("#txt_chapter_title").val() );
        var desc = $.trim( $("#txt_chapter_desc").val() );
        var intro = $("#txt_chapter_intro").tinymce().getContent();
        var summary = $("#txt_chapter_summary").tinymce().getContent();
        chapter.set({
            'title': title,
            'summary' : desc,
            'chapter_introduction' : intro,
            'chapter_summary': summary
        });
        $(dlg).find(".chapteredit_content").addClass('hide');
        $(dlg).find(".chapteredit_saving").removeClass('hide');
        chapter.save(null, {
            'success' : saveSuccess,
            'error' : saveError
        });
        return false;
    }

    function fetchSuccess() {
        if (window.tinyMCE){
            $('#txt_chapter_intro').tinymce().setContent(chapter.get('chapterIntroduction'));
            $('#txt_chapter_summary').tinymce().setContent(chapter.get('chapterSummary'));
        }
        $(".chapter_editor_dialog").tabs('option','disabled', false);
        $('#js_savechapter').removeAttr('disabled');
    }
    
    function onIntroTmceInit(e, data){
        if (data.editor){
            if (chapter.get('chapterIntroduction')){
                data.editor.setContent(chapter.get('chapterIntroduction'));
            }
        }
    }
    
    function onSummaryTmceInit(){
        if (data.editor){
            if (chapter.get('chapterSummary')){
                data.editor.setContent(chapter.get('chapterSummary'));
            }
        }
    }

    function onDialogOpen() {
        $('#js_savechapter').click(saveChapter);
        $(".chapter_editor_dialog").tabs({
            'disabled':[1,2]
        });
        $('#txt_chapter_title').val(chapter.get('title'));
        $('#txt_chapter_desc').val(chapter.get('summary'));
        $("#txt_chapter_intro").bind('flxweb.editor.tinymce.on_init', onIntroTmceInit);
        $("#summary").bind('flxweb.editor.tinymce.on_init', onSummaryTmceInit);
        $("#txt_chapter_intro").tinymce($.flxweb.editor.tinymce.config);
        $("#txt_chapter_summary").tinymce($.flxweb.editor.tinymce.config);
        $('#js_savechapter').attr('disabled',"true");
        if (chapter.get('artifactID')){
            chapter.fetch({
                'success' : fetchSuccess
            });
        } else {
            $(".chapter_editor_dialog").tabs('option','disabled', false);
            $('#js_savechapter').removeAttr('disabled');
        }
    }
    
    function onDialogClose(){
        $("#txt_chapter_intro").tinymce().destroy();
        $("#txt_chapter_summary").tinymce().destroy();
    }

    function openChapterEditor(chapter_artifact) {
        /**
         * Opens chapter dialog
         * @param chapter: Artifact object with artifactType =- 'chapter'
         */
        chapter = chapter_artifact;
        chapter_old = chapter_artifact.clone();
        var dialog_options = null;
        if (chapter.get('artifactID') ){
            dialog_options = {'title':'Edit Chapter'};
        } else {
            dialog_options = {'title':'Add Chapter'};
        }
        dlg.open(dialog_options);
    }

    function documentReady() {
        //create dialog
        dlg = $.flxweb.createDialog($("#js_dialog_chapteredit"), {
            width : '700px'
        });
        //attach bindings
        dlg.bind('flxweb.dialog.open', onDialogOpen);
        dlg.bind('flxweb.dialog.close', onDialogClose);
        $.extend(true, $.flxweb, {
            'editor' : {
                'chapterEditor' : {
                    'open' : openChapterEditor,
                    'close' : dlg.close
                }

            }
        });
    }


    $(document).ready(documentReady);

})(jQuery);
