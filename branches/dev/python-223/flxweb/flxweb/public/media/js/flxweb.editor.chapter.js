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

define('flxweb.editor.chapter',[
    'jquery',
    'common/utils/utils',
    'jquery-ui',
    'flxweb.global',
    'flxweb.settings'
],
function($, Util) {

    //dialog
    var dlg = null;
    var chapter = null;
    var chapter_children = null;
    var chapter_old = null;
    var chapterRevisionCommnetsInputHtml = '';
    var showChapterRevisionPopup = true;

    function validateTitle() {
        var artifactTitle = $.trim( $("#txt_chapter_title").val() );
        var msg = null;
        //Rule#1: Check for "Untitled Chapter"
        if( $.trim(artifactTitle) === '') {
            msg = $.flxweb.gettext("Chapter title cannot be blank.");
        } else if ($.trim(artifactTitle).toLowerCase() == "new chapter"){
            msg = $.flxweb.gettext("Chapter title cannot be New Chapter.");
        } else if ($.trim(artifactTitle).indexOf('/') != -1){
            msg = $.flxweb.gettext("Slash (/) character is not allowed in chapter title.");
        }
        var _chapter_siblings = $.flxweb.editor.current_artifact.getChildren();
        if (_chapter_siblings && _chapter_siblings.length){
            var _c = null;
            for (var i = 0; i < _chapter_siblings.length; i++){
                _c = _chapter_siblings[i];
                if (_c.get('artifactType') == 'chapter' && _c.get('title').toLowerCase() == artifactTitle.toLowerCase() && _c.get('artifactID') != chapter.get('artifactID') ){
                    msg = $.flxweb.gettext('A chapter with same name already exists in this FlexBook, please use a different title.')
                }
            }
        }


        if (msg){
            $.flxweb.showDialog(msg,{
                'title' : $.flxweb.gettext("Invalid Title"),
                'buttons' : {
                    'Edit Title': function(){
                        $('.chapter_editor_dialog ul li:first-of-type a').click();
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

    function getArtifactRevisionComments() {
        if ($.inArray(flxweb_role , ($.flxweb.settings.edit_allowed_roles).split(',')) != -1){
            var msg = 'Brief description of changes (including author initials for shared works):<br/>' + chapterRevisionCommnetsInputHtml;
            $.flxweb.showDialog(msg, {
            'title': 'Revision Comments (Optional)',
                'buttons': {
                'Save': function () {
                    var chapterRevisionComments = $.trim($('.dialog_msg input#txt_chapter_revision_comment.forminput').val());
                    showChapterRevisionPopup = false;
                    $(this).dialog('close');
                    chapter.set({
                        'revisionComment':chapterRevisionComments
                    });
                    if (chapter.get('revisions')){
                        chapter.get('revisions')[0].comment = chapterRevisionComments
                    }
                    saveChapter();
                },
                    'Cancel': function () {
                    $(this).dialog('close');
                    return false;
                }
            }
        });
       }else{
            return true;
       }
       return false;
    }

    function saveChapter() {
        if ($('#js_savechapter').hasClass('disabled')) {
            return false;
        }
        if (!validateTitle()){
            if($("#mce_fullscreen").size() > 0){
                $("#mce_fullscreen").tinymce().execCommand('mceFullScreen');
            }
            return false;
        }
        if (showChapterRevisionPopup) {
            if (! getArtifactRevisionComments()){
                return false;
            }
        }

        var title = $.trim( $("#txt_chapter_title").val() );
        var desc = $.trim( $("#txt_chapter_desc").val() );
        var intro = $("#txt_chapter_intro").tinymce().getContent();
        var summary = $("#txt_chapter_summary").tinymce().getContent();
        intro = cleanEditorContent(intro);
        summary = cleanEditorContent(summary);

        chapter.set({
            'title': title,
            'summary' : desc,
            'chapterIntroduction' : intro,
            'chapterSummary': summary,
            'content_modified': true/*,
            'children': chapter_children*/
        });
        
        if (chapter_children.length) {
            chapter.set({
                'children': chapter_children
            });
        }

        if (! chapter.get('artifactID')){
            chapter.set('artifactID', chapter.get('id'));
        }

        if (! chapter.get('artifactRevisionID')){
            chapter.set('artifactRevisionID', chapter.get('id'));
        }

        var data = {
            'artifact': chapter,
            'old_artifact' : chapter_old
        };
        $.flxweb.events.triggerEvent(document, "flxweb.editor.chapter.save_success", data);

        return false;
    }

    function ChapterAttributionsDialog(){
        var _dlg = $.flxweb.createDialog("#js_chapter_attributions_dialog");
        function dialogAddChapterAttribution(){
            var role = $.trim( $("#chapter_attribution_role").val() );
            var name = $.trim( $("#txt_chapter_attribution_name").val() );
            if (!name){
                $(_dlg).find('.error').removeClass('hide');
            }
            if (role && name){
                $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_chapter_attribution',{
                    'attribution': {
                        'role' : role,
                        'name' : name
                    }
                });
                $("#txt_chapter_attribution_name").val('');
            }
        }
        function validateName(){
            if ( $.trim( $(this).val() )  ){
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        $(_dlg).find(".js_add_attributions").off('click').on('click', function () {
            dialogAddChapterAttribution();
        });
        $("#txt_chapter_attribution_name").keyup(validateName);
        return _dlg;
    }

    function displayAttributes() {
       var name, role, authors, _tmpl, _containers, count, attrelm;
        authors = chapter.get('authors');
        _tmpl = "#ck12_template_new_attribution";
        _containers = $(".js_chapter_attributionlist_container");
        for (count=0; count < authors.length; count++) {
            name = authors[count].name;
            role = authors[count].role;
            attrelm = $.flxweb.template.render(_tmpl, {'name':name,'role':role});
            _containers.each(function(){
                if ($(this).data('attribrole') == role){
                    $(this).append(attrelm);
                    $(this).parent().removeClass('hide');
                }
             });
        }
    }

    function ChapterEditor(){

        var _dlg = ChapterAttributionsDialog();
        var _tmpl = "#ck12_template_new_attribution";
        var _containers = $(".js_chapter_attributionlist_container");
        function addChapterAttribution(e, data){
            var artifactID = chapter.get('artifactID');
            var roleID = '3';
            var attrdata = data.attribution;
            var name = window.htmlSafe(attrdata.name);
            var role = attrdata.role;
            if (chapter.addAttribution(name, role)){
                var attrelm = $.flxweb.template.render(_tmpl, {'name':name,'role':role});
                _containers.each(function(){
                   if ($(this).data('attribrole') == role){
                       $(this).append(attrelm);
                       $(this).parent().removeClass('hide');
                       _dlg.close();
                   }
                });
            } else {
                $.flxweb.showDialog( $.flxweb.gettext("Attribution already exists for <%=attrrole %> <%=attrname %>",{
                    'attrname': name,
                    'attrrole': role
                }) );
            }
        }

        function removeAttribution(){
            var name=$(this).data('attribname');
            var role=$(this).data('attribrole');
            chapter.removeAttribution(name, role);
            $(this).parent().remove();
            $(_containers).each(function(){
                if ($(this).data('attribrole') == role){
                    if ($(this).find('.js_attribution').size() === 0){
                        $(this).parent().addClass('hide');
                    }
                }
            });
            return false;
        }

        $("#chapter_btn_addattributions").off('click').on('click', function() {
            _dlg.open();
            return false;
        });
        _dlg.off('flxweb.editor.metadata.add_chapter_attribution').on('flxweb.editor.metadata.add_chapter_attribution', addChapterAttribution);
        $("#chapterattributionscontainer .js_attribution_remove").live('click', removeAttribution);
        $(".chapter_editor_dialog").tabs('option','disabled', false);
        $('#js_savechapter').removeClass('disabled');
    }

    function fetchSuccess() {
        $("#txt_chapter_intro").tinymce($.flxweb.editor.tinymce.config);
        $("#txt_chapter_summary").tinymce($.flxweb.editor.tinymce.config);
        ChapterEditor();
    }

    function onIntroTmceInit(e, data){
        if (data.editor){
            if (chapter.get('chapterIntroduction')){
                data.editor.setContent(updateMath(chapter.get('chapterIntroduction')));
            }
        }
    }

    function onSummaryTmceInit(e, data){
        if (data.editor){
            if (chapter.get('chapterSummary')){
                data.editor.setContent(updateMath(chapter.get('chapterSummary')));
            }
        }
    }

    function clearEditors(){
        // Bug 41913 - In tinymce 4, the editors are not reinitialized
        // again unless they are first removed
        if(window.tinymce && tinymce.majorVersion > 3 && tinymce.editors.length){
            $("#txt_chapter_intro").tinymce().remove();
            $("#txt_chapter_summary").tinymce().remove();
        }
    }


    function onDialogOpen() {
        clearEditors();
        window.chapter = chapter;
        $.flxweb.events.triggerEvent(document, 'flxweb.chapter.editor.open');
        $('#js_savechapter').click(saveChapter);
        $('#txt_chapter_title').val(chapter.get('title'));
        $('#txt_chapter_desc').val(chapter.get('summary'));
        $("#txt_chapter_intro").bind('flxweb.editor.tinymce.on_init', onIntroTmceInit);
        $("#txt_chapter_summary").bind('flxweb.editor.tinymce.on_init', onSummaryTmceInit);
        if(artifactID=="new" || (typeof chapter.get('artifactID')=="undefined") || chapter.get('content_modified')){
            $("#txt_chapter_intro").tinymce($.flxweb.editor.tinymce.config);
            $("#txt_chapter_summary").tinymce($.flxweb.editor.tinymce.config);
        }
        showChapterRevisionPopup = true;
        var rev_comment = chapter.get('revisionComment') ? chapter.get('revisionComment') : chapter.get('revisions') ? chapter.get('revisions')[0].comment||'' : '';
        var _tmpl = "#ck12_template_chapter_revision_comment";
        chapterRevisionCommnetsInputHtml = $.flxweb.template.render(_tmpl, {'comment': rev_comment});
        chapterRevisionCommnetsInputHtml = $('<div></div>').html(chapterRevisionCommnetsInputHtml).html();
        if (chapter.get('authors')) {
            displayAttributes();
        }
        if (chapter.get('artifactID') && !chapter.get('content_modified')){
            $('#js_savechapter').addClass('disabled');
            $(".chapter_editor_dialog").tabs({
                'disabled':[1,2,3]
            });
            chapter.fetch({
                'success' : fetchSuccess
            });
        } else if (!chapter.get('artifactID')) {
            $(".chapter_editor_dialog").tabs({});
            /*$(".chapter_editor_dialog").tabs('option','disabled', false);
            $('#js_savechapter').removeClass('disabled');*/
            ChapterEditor();
        } else {
            $(".chapter_editor_dialog").tabs({});
            /*$(".chapter_editor_dialog").tabs('option','disabled', false);
            $('#js_savechapter').removeClass('disabled');*/
            ChapterEditor();
        }
        $('[href="#chapteredit_attachments"]').off('click.resource').on('click.resource', function() {
            if (!$(this).parent().hasClass('ui-state-disabled')) {
                var chapterArtifactID, $el = $('.chapter_resources_container', '#chapteredit_attachments');
                chapterArtifactID = chapter.get('id');
                if (chapterArtifactID in window.chapterResourceCache) {
                    $el.html(window.chapterResourceCache[chapterArtifactID]);
                } else if (chapterArtifactID && !isNaN(chapterArtifactID)) {
                    $el.html('Loading...');
                    Util.ajax({
                        url: Util.getApiUrl('ajax/resource_list/' + chapter.get('perma') + '/r' + chapter.get('latestRevision') + '/'),
                        data: {
                            'artifact_id': chapterArtifactID,
                            'artifact_revision_id': chapter.get('artifactRevisionID'),
                            'owned': true,
                            'editable': true
                        },
                        cache: false,
                        dataType: 'html',
                        success: function (result) {
                            window.chapterResourceCache[chapterArtifactID] = result;
                            $el.html(result);
                        }
                    });
                } else {
                    $el.html('<div class="artifact_attachment_container js_resource_container"><div class="js_msg_no_resources">Currently there are no resources to be displayed.</div></div>');
                }
            }
        });
    }

    function onDialogClose(){
        clearEditors();
        $(".chapter_editor_dialog").tabs('destroy');
        //Bug 9004 redirect the user to "Edit" tab on add Chapter.
        $('.js_editortabs').tabs( "select" , '#edit_content' );
    }

    function openChapterEditor(chapter_artifact) {
        /**
         * Opens chapter dialog
         * @param chapter: Artifact object with artifactType =- 'chapter'
         */
        chapter = chapter_artifact;
        chapter_children = chapter.getChildren();
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
        window.chapterResourceCache = {};
        dlg = $.flxweb.createDialog($("#js_dialog_chapteredit"), {
            width : '765px'
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

        // The close button needs to be bound to clear the editors
        $('.chapter-editor-wrapper a.ui-dialog-titlebar-close').on('click', onDialogClose);
    }

    function cleanEditorContent(xhtml) {
        var $mathJaxHidden;
        xhtml = $("<div>"+xhtml+"</div>");
        $("span[class^='MathJax']",xhtml).remove();
        $mathJaxHidden = xhtml.find('#MathJax_Hidden');
        if($mathJaxHidden.length>0 && $mathJaxHidden.parent().children().length == 1){
            $mathJaxHidden.parent().remove();
        }
        $("div[id^='MathJax']",xhtml).remove();
        $(".MathJax_Display", xhtml).remove();
        xhtml.find('div').each(function(){
            $(this).html($.trim($(this).html()));
        });
        xhtml.find('*').removeClass('x-ck12-validated x-ck12-dirty').removeAttr('data-error');
        $("div:empty", xhtml).remove();
        $.each((xhtml.find('.x-ck12-mathEditor, p:empty, span[style]')), function () {
            var $this = $(this);
            if($this.hasClass('x-ck12-mathEditor')){
                $this.html('').attr('data-contenteditable', false).removeAttr('contenteditable').removeClass('selectedElement showContextMenu forSingleClick doubleClick');
                if($this.data('edithtml').indexOf('paste-option') !== -1){
                    $this.attr('data-edithtml','');
                }
            } else if(this.tagName === 'P' && $this.is(':empty')) {
                $this.html('&#160;');
            } else if($this.css('display') === 'none' || ($this.attr('style')).indexOf('display: none') !== -1) {
                $this.html('');
            }
        });
        xhtml = $(xhtml).html();
        return xhtml;
    }

    function updateMath(tinymceContent){
        var updateContent = $('<div>'+tinymceContent+'</div>');
        $.each((updateContent.find('.x-ck12-mathEditor')), function(i,v){
            var mathLatex,
                $this = $(this),
                mathId = tinymce.DOM.uniqueId(),
                decodedTex;
            if($this.data('tex')){
                decodedTex = decodeURIComponent($this.attr('data-tex'));
                if (decodedTex.indexOf('\\begin{align') === -1) {
                    mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
                } else {
                    mathLatex = decodedTex;
                }
                mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
                while (tinymce.activeEditor.dom.get(mathId) != null) {
                    mathId = tinymce.DOM.uniqueId();
                }
                $this.attr('id',mathId).html(mathLatex).removeAttr('data-tex-mathjax').prop('contenteditable', false);
                //MathJax.Hub.Queue(['Typeset',MathJax.Hub,$(this)[0]]);
                if (!$this.prevAll().length) {
                    $this.before('<span></span>');
                }
            }
            else {
                $this.remove();
            }
        });
        updateContent = updateContent.html();
        return updateContent;
    }

    $(document).ready(documentReady);

});
