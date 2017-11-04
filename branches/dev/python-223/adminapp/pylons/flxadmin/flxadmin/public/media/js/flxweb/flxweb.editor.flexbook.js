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
    var artifact = null;
    //the Flexbook artifact.
    var artifact_original = null;
    //maintain an unmodified copy of artifact.
    var artifact_cache = new Hash();
    //List of ALL artifacts
    var modified_children_count = 0;
    var dialog_addcontent = null;
    var reload_after_save = true;
    var edit_concept_after_save = null;
    var save_in_progress = false;

    function ArtifactUpdater(artifact) {
        var _artifact = artifact;
        var __artifact = _artifact.clone();

        function saveSuccess(model, response, xhr) {
            if(response) {
                if(!(response.status && response.status=='error') ) {
                    _artifact.set(response);
                    //fetchArtifact();
                    var evt_success = $.Event('flxweb.editor.flexbook.artifact_update_success');
                    evt_success.artifact = _artifact;
                    evt_success.artifact_old = __artifact;
                    $(document).trigger(evt_success);
                } else {
                    var evt_err = $.Event('flxweb.editor.flexbook.artifact_update_error');
                    evt_err.artifact = _artifact;
                    evt_err.message = response.message;
                    $(document).trigger(evt_err);
                }
            }
        }

        function saveError(model, xhr) {
            var evt_err = $.Event('flxweb.editor.flexbook.artifact_update_error');
            evt_err.artifact = _artifact;
            evt_err.message = "Status: " + xhr.status + " Message:" + xhr.statusText;
            $(document).trigger(evt_err);
        }

        function saveArtifact() {
            _artifact.save(null, {
                success : saveSuccess,
                error : saveError
            });
        }

        saveArtifact();
    }

    function getChildSequence(ui_list) {
        var rows = $(ui_list).find("> li");
        var sequence = [];
        rows.each(function() {
            sequence.push($(this).data('artifactid'));
        });
        return sequence;
    }

    function artifactSaveSuccess(event) {
        //Handle successful save of an artifact (book or chapter)
        var _artifact = event.artifact;
        var _artifact_old = event.artifact_old;
        if( Artifact.isBookType( _artifact.get('artifactType') ) ) {
            save_in_progress = false;
            $.flxweb.hideLoading();
            $(".modified").removeClass('modified');
            var perma = artifact.get('perma');
            var latest = artifact.get('latestRevision');
            var location = $.flxweb.settings.webroot_url;
            //book saved,
            if ( reload_after_save ){
                location += perma + 'r' + latest + '/';
                window.skipUnsavedWarning = true;
                window.location = location;
            } else {
                if (edit_concept_after_save){
                    var _concept = edit_concept_after_save;
                    
                    var position = getArtifactPosition(_concept);
                    if (position){
                        location += 'editor/'
                        location += perma + 'r' + latest + '/';
                        location += 'section/';
                        location += position + '/' + _concept.get('handle') + '/';
                        window.skipUnsavedWarning = true;
                        window.location = location;
                    } else {
                        location += 'new/concept/?context=' + perma + 'r' + latest + '/';
                        window.skipUnsavedWarning = true;
                        window.location = location;                        
                    }
                }
            }
            
        } else {
            //child artifact saved, update the book
            artifact.replaceChild(_artifact_old.get('id'), _artifact);
            modified_children_count--;
            if(modified_children_count === 0) {
                ArtifactUpdater(artifact);
            }
        }
    }

    function artifactSaveError(event) {
        save_in_progress = false;
        $.flxweb.hideLoading();
        $.flxweb.showDialog("Could not save book: <br />" + event.message);
    }

    function saveFlexBookChildren() {
        //Save any children that are modified before proceeding with the book save.
        var children = artifact.getChildren();
        var child = null;
        for(var i = 0; i < children.length; i++) {
            child = children[i];
            if(child.dirty) {
                if(child.get('artifactType') == 'chapter') {
                    ArtifactUpdater(child);
                }
            }
        }
    }

    /**
     *
     * Validates the Artifact Title
     * Rules:
     * 1) Should not be "Untitled FlexBook"
     * 2) TODO: Duplicate title check
     */
    function validateArtifactTitle() {
        var artifactTitle = $('#txt_artifacttitle').val();
        var msg = null;
        //Rule#1: Check for "Untitled FlexBook"
        if( $.trim(artifactTitle) === '') {
            msg = "Book title cannot be blank.";
        } else if ($.trim(artifactTitle).toLowerCase() == "untitled flexbook"){
            msg = "Book title cannot be Untitled Flexbook.";
        } else if ($.trim(artifactTitle).toLowerCase().indexOf('/')!= -1) {
            msg = "Slash ( / ) is not a valid character in book title.";
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

    function saveFlexBook() {
        // Validate the artifact title
        if(!validateArtifactTitle()) {
            save_in_progress = false;
            return false;
        }
        //iterate through rows and reorganize artifact
        var rows = $('#chapter_list >.js_artifact_list >li');
        var sorted_artifacts = [];
        rows.each(function() {
            var _artifact_id = $(this).data('artifactid');
            var _artifact = artifact_cache.get(_artifact_id);
            if(_artifact.get('artifactType') == 'chapter') {
                _artifact.set({
                    'bookTitle' : artifact.get('title')
                }, {
                    'silent' : true
                });
            }
            if($(this).find('ul.modified').size()) {
                var _seq = getChildSequence($(this).find('ul'));
                var _children = [];
                for(var i = 0; i < _seq.length; i++) {
                    var _id = _seq[i];
                    _children.push(artifact_cache.get(_id));
                }
                _artifact.setChildren(_children);
            }
            sorted_artifacts.push(_artifact);
        });
        artifact.setChildren(sorted_artifacts);
        //return false;
        $.flxweb.showLoading("Saving FlexBook");
        //Begin book saving process
        var children_modified = false;
        $(artifact.getChildren()).each(function() {
            if(this.get('artifactType') == 'chapter') {
                if(this.dirty) {
                    children_modified = true;
                    modified_children_count++;
                }
            }
        });
        if(children_modified) {
            saveFlexBookChildren();
        } else {
            ArtifactUpdater(artifact);
        }
        return false;
    }

    function updateRowIndices() {
        //update row numbers
        var index_labels = $(".js_index_label");
        var idx_parent = 0;
        var idx_child = 0;
        var level = 0;
        $(index_labels).each(function() {
            level = $(this).parents().filter('.js_artifact_list').size();
            if(level == 1) {
                idx_parent++;
                idx_child = 0;
                $(this).text(idx_parent);
            } else {
                idx_child++;
                $(this).text(idx_parent + '.' + idx_child);
            }
        });
        //update edit links with proper position
        var edit_links = $(".js_row_edit");
        var href = '';
        idx_parent = 0;
        idx_child = 0;
        level = 0;
        $(edit_links).each(function(){
            level = $(this).parents().filter('.js_artifact_list').size();
            if (level == 1){
                idx_parent ++;
                idx_child = 0;
                href = $(this).attr('href');
                if ( href != '#'){
                    href = href.replace( /\/section\/\d+\.\d+\//, '/section/' + idx_parent + '.' + idx_child + '/' );
                    $(this).attr('href', href);
                }
            } else {
                idx_child ++;
                 href = $(this).attr('href');
                if ( href != '#'){
                    href = href.replace( /\/section\/\d+\.\d+\//, '/section/' + idx_parent + '.' + idx_child + '/' );
                    $(this).attr('href', href);
                }
            }
        });
    }

    function artifactRowUpdate(event, ui) {
        //call the artifacRowUpdate once only
        // see http://stackoverflow.com/questions/3101129/jquery-sortable-update-event-can-called-only-one-time
        if(ui.sender === null) {
            updateRowIndices();
            $(this).addClass('modified');
            var row = $(ui.item);
            $(row).parent().addClass('modified');
            $(row).parent().removeClass('js_empty');
            $.flxweb.events.triggerEvent($(document), 'flxweb.editor.flexbook.row_moved', {
                'artifactRevisionID' : $(row).data('artifactrevisionid'),
                'artifactType' : $(row).data('artifacttype'),
                'artifactID' : $(row).data('artifactid'),
                'newIndex' : $(row).find('.js_index_label').html()
            });
        }
    }

    function artifactRowReceive(ui) {
        $(this).addClass('modified');
        if(ui.sender) {
            ui.sender.addClass('modified');
        }
    }

    function summaryClick(evt) {
        //Initialize tinyMCE editor for summary.
        $.flxweb.editor.tinymce.init($(this));
    }

    function getSummary() {
        //Returns the contents of #artifact_summary block.
        return $('#artifact_summary').html();
    }

    function onSummaryEdit(evt) {
        //Sets artifact summary to current contents of #artifact_summary block.
        artifact.set({
            'summary' : getSummary()
        });
    }

    function chapterExpandToggle() {
        //Expand/collapse chapter rows
        $(this).toggleClass('ui-icon-triangle-1-e').toggleClass('ui-icon-triangle-1-s');
        var child_container = $(this).parent().next().toggleClass('hide');
    }

    function cacheChildren(artifact) {
        var children = artifact.getChildren();
        for(var i = 0; i < children.length; i++) {
            var child = children[i];
            artifact_cache.set(child.get('id'), child);
            if(child.hasChildren()) {
                cacheChildren(child);
            }
        }
    }

    function removeRow(row) {
        var title = $(row).find(".js_artifact_title:first").text();
        $(row).parent().addClass('modified');
        $(row).fadeOut(400, function() {
            $(this).remove();
            updateRowIndices();
            $.flxweb.events.triggerEvent($(document), 'flxweb.editor.flexbook.row_removed', {
                'artifactRevisionID' : $(row).data('artifactrevisionid'),
                'artifactID' : $(row).data('artifactid'),
                'artifactType' : $(row).data('artifacttype')
            });
            $.flxweb.notify( "Removed : " + title );
        });
        return false;
    }
    
    function artifactInTOC(artifact){
        var a = artifact_cache.get( artifact.get('artifactID') );
        if (a === null){
            return false;
        } else {
            return true;
        }
    }
    
    function initSortableRows(){
        //Create a nested sortable list.
        $('#chapter_list ul').sortable({
            'update' : artifactRowUpdate,
            'receive' : artifactRowReceive,
            'helper' : 'clone',
            'handle' : '.js_row_handle',
            'connectWith' : '#chapter_list ul',
            'placeholder' : 'ui-state-highlight',
            'start' : function(e, ui) {//fix placeholder height
                ui.placeholder.height(ui.item.height());
            }
        });
    }
    
    function destroySortableRows(){
        $('#chapter_list ul').sortable('destroy');
    }

    function refreshSortableRows(){
        $('#chapter_list ul').sortable('refresh');
    }
    
    function addArtifact(artifact) {
        var idx = $(".chapterlist>li").size() + 1;
        var position = null;
        var jsondata = null;
        
        if ( Artifact.isBookType( artifact.get('artifactType') ) ){
            if (artifact.get('artifactID') == $.flxweb.editor.current_artifact.get('artifactID')){
                $.flxweb.showDialog("Cannot add a book into itself.");
            } else {
                var children = artifact.getChildren();
                var grandchildren = null;
                var child = null;
                var grandchild = null;
                var chapter_row = null;
                var concept_row = null;
                for (var i = 0; i < children.length; i++){
                    child = children[i];
                    if ( !artifactInTOC(child) ){
                        artifact_cache.set(child.get('artifactID'), child);
                        jsondata = child.toJSON();
                        position = '' + idx + '.0';
                        jsondata.position = position;
                        jsondata.index = idx;
                        if (child.get('artifactType') == 'chapter'){
                            chapter_row =  $.flxweb.template.render("#ck12_template_chapter_row", jsondata);
                            grandchildren = child.getChildren();
                            for (var j = 0; j < grandchildren.length; j++){
                                grandchild = grandchildren[j];
                                if ( !artifactInTOC(grandchild) ){
                                    artifact_cache.set(grandchild.get('artifactID'), grandchild);
                                    jsondata = grandchild.toJSON();
                                    position = '' + idx + '.' + (j+1);
                                    jsondata.position = position;
                                    jsondata.index = position;
                                    concept_row = $.flxweb.template.render("#ck12_template_concept_row", jsondata);
                                    chapter_row.find('.conceptlist').removeClass('js_empty').append(concept_row);
                                }
                            }
                            $(".chapterlist").append(chapter_row).addClass('modified');
                            chapter_row.effect('pulsate');
                        } else {
                            concept_row = $.flxweb.template.render("#ck12_template_concept_row", jsondata);
                            $(".chapterlist").append(concept_row).addClass('modified');
                            concept_row.effect('pulsate');
                        }
                        idx ++;
                    } else {
                        $(".chapterlist li").each(function(){
                            if ( $(this).data('artifactid') == child.get('artifactID') ){
                                $(this).effect('pulsate');
                            }
                        });
                    }
                }
            }
        } else {
            if (!artifactInTOC(artifact)){
                artifact_cache.set(artifact.get('id'), artifact);
                jsondata = artifact.toJSON();
                position = '' + idx + '.0';
                var rowType = (artifact.get('artifactType') == 'chapter') ? 'chapter' : 'concept';
                jsondata.position = position;
                jsondata.index = idx;
                var template = "#ck12_template_" + rowType + "_row";
                var new_row = $.flxweb.template.render(template, jsondata);
                $(".chapterlist").append(new_row).addClass('modified');
                new_row.effect('pulsate');
            } else {
                $(".chapterlist li").each(function(){
                    if ( $(this).data('artifactid') == artifact.get('artifactID') ){
                        $(this).effect('pulsate');
                    }
                });
            }
        }
        //destroySortableRows();
        refreshSortableRows();
        initSortableRows();
    }

    function rowEditClick() {
        var editor = $.flxweb.editor.chapterEditor;
        //@source: flxweb.editor.chapter.js
        var row = $(this).parents('.js_artifact_list_item').get(0);
        var chapter_id = $(row).data('artifactid');
        var _artifact = artifact_cache.get(chapter_id);
        if (_artifact.get('artifactType') == 'chapter'){
            editor.open(_artifact.clone());
            return false;
        } else {
            if ( isEditorDirty() ){
                reload_after_save = false;
                edit_concept_after_save = _artifact;
                saveFlexBook();
                return false;
            }
        }
        
    }
    
    function addConceptClick(){
        if (isEditorDirty() || $.flxweb.editor.current_artifact.get('id') == 'new'){
            reload_after_save = false;
        edit_concept_after_save = new Artifact({'artifactType':'concept'});
        saveFlexBook();
        return false;
        }
    }

    function chapterSaveSuccess(evt, data) {
        $.flxweb.editor.chapterEditor.close();
        var chapter = data.artifact;
        var old_chapter = data.old_artifact;
        var chapter_id = chapter.get('artifactID');
        var old_chapter_id = old_chapter.get('artifactID');
        var row_id = old_chapter_id;
        if (!old_chapter_id){
            row_id = chapter_id;
        }
        if(artifact_cache.get(row_id)) {
            //existing chapter
            var chapter_rows = $(".chapterlist>li");
            chapter_rows.each(function() {
                if($(this).data('artifactid') == row_id) {
                    $(this).attr('data-artifactrevisionid', chapter.get('artifactRevisionID'));
                    $(this).data('artifactrevisionid', chapter.get('artifactRevisionID'));
                    $(this).attr('data-artifactid', chapter.get('artifactID'));
                    $(this).data('artifactid', chapter.get('artifactID'));
                    $(this).find('.js_artifact_title').text( chapter.get('title') );
                    $(this).effect('pulsate');
                }
            });
        } else {
            //new chapter
            addArtifact(chapter);
        }
        artifact_cache.set(chapter_id, chapter);
    }

    function addNewChapter() {
        
        if(!validateArtifactTitle()) {
            $.flxweb.showDialog("You must enter a title for your book before adding new chapters to the book.",{
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
        
        var chapter = new Artifact({
            'title' : "New Chapter",
            'artifactType' : 'chapter',
            'bookTitle' : artifact.get('title')
        });
        var editor = $.flxweb.editor.chapterEditor;
        editor.open(chapter);
        return false;
    }

    function openGDTimporter() {
        $.flxweb.gdtimport.open();
        return false;
    }

    function openXDTimporter() {
        $.flxweb.xdtimport.open();
        return false;
    }

    function gdtImportSuccess(evt, data) {
        var artifact = data.artifact;
        $.flxweb.gdtimport.close();
        addArtifact(artifact);
    }

    function xdtImportSuccess(evt, data) {
        var artifact = data.artifact;
        $.flxweb.xdtimport.close();
        addArtifact(artifact);
    }
    
    function coverImageChange(e, data){
        $(".js_coverimage").attr('src', data.thumb_url + '?_=' + Number(new Date()) );
        artifact.set({
            'coverImage': data.cover_url,
            'coverRevision' : data.cover_revision
        });
        $.flxweb.editor.CustomCoverDialog.close();
    }

    function addContent(e, data){
        var artifact = data.artifact;
        addArtifact(artifact);
        $.flxweb.editor.AddContentDialog.close();
    }
    
    function isEditorDirty(){
        if ( (window.skipUnsavedWarning)){
            return false;
        }
        return (
            artifact.dirty ||
            $(".modified").size() > 0
        );
    }
    
    function clickSaveFlexbook(){
        if (save_in_progress){
            return false;
        }
        save_in_progress = true
        reload_after_save = true;
        edit_concept_after_save = null;
        saveFlexBook();
        return false;
    }
    
    function getArtifactPosition(lookup_artifact){
        var listitems = $("li.js_artifact_list_item");
        var pos = null;
        $(listitems).each(function(){
            if ( $(this).data('artifactid') == lookup_artifact.get('artifactID') && 
                 $(this).data('artifactrevisionid') == lookup_artifact.get('artifactRevisionID') ){
                pos = $(this).find('.js_artifact_row .js_index_label').text();
                if (pos){
                    pos = $.trim(pos);
                    if (pos.indexOf('.') == -1){
                        pos = ''+pos+'.0';
                    }
                }
            }
        });
        return pos;
    }
    
    function confirmRemoveRow(){
        var row = $(this).parents('li')[0];
        var title = $(row).find('.js_artifact_title:first').text();
        $.flxweb.showDialog("Are you sure you want to remove "+title+"?",
        {
            'buttons': [
                {
                    'text': 'Remove',
                    'click': function(){
                        removeRow(row); 
                        $(this).dialog('close');
                    }
                },
                {
                    'text' : 'Cancel',
                    'click': function(){
                        $(this).dialog('close');
                    }
                }
            ]
        });
        return false;
    }
    
    function domReady() {

        //Initialize artifact objects
        artifact = $.flxweb.editor.current_artifact;
        // artifact_original = artifact.clone();

        //fill up the artifact_cache so it has all the artifacts it needs
        artifact_cache.set(artifact.get('id'), artifact);
        cacheChildren(artifact);

        //Summary change handler
        $(document).bind($.flxweb.editor.tinymce.events.CONTENT_CHANGED, onSummaryEdit);
        //TODO: need a different event, CONTENT_CHANGED is primarily for the content.

        //Chanpter expand/collapse
        $('.js_artifact_list_item .js_expand_toggle').live('click', chapterExpandToggle);
        //Make summary editable
        $('#artifact_summary').live('click', summaryClick);

        //generic handler for all artifact saves.
        $(document).bind('flxweb.editor.flexbook.artifact_update_success', artifactSaveSuccess);
        $(document).bind('flxweb.editor.flexbook.artifact_update_error', artifactSaveError);

        initSortableRows();
        //Save button handler
        $('.js_save_artifact').click(clickSaveFlexbook);
        $('.js_row_remove').live('click', confirmRemoveRow);
        $('.js_row_edit').live('click', rowEditClick);
        $('.js_addconcept').click(addConceptClick);
        $("#btn_gdtimport").click(openGDTimporter);
        $("#btn_xdtimport").click(openXDTimporter);
        $("#btn_addchapter").click(addNewChapter);
        $(document).bind('flxweb.gdtimport.success', gdtImportSuccess);
        $(document).bind('flxweb.xdtimport.success', xdtImportSuccess);
        $(document).bind('flxweb.editor.chapter.save_success', chapterSaveSuccess);
        $(document).bind('flxweb.editor.addcontent.add_artifact', addContent);
        $("#btn_addcontent").click(function() {
            $.flxweb.editor.AddContentDialog.open();
            return false;
        });
        $(".js_coverimage_edit").click(function(){
            $.flxweb.editor.CustomCoverDialog.open();
            return false;
        });
        $(document).bind('flxweb.editor.covereditor.coverchange', coverImageChange);

        window.onbeforeunload = function() {
            if( isEditorDirty() ) {
                return "Unsaved changes will be lost. Are you sure you want to leave this page?";
            }
        };
    }


    $(document).ready(domReady);
})(jQuery);
