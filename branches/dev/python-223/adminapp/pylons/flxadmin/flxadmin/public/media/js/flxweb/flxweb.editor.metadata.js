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
    
    
    function TagsDialog(){
        /***
         * Tag Editor Dialog
         */
        
        var _dlg = $.flxweb.createDialog("#js_tags_dialog");
        
        function dialogAddTags(){
            var _tags_text = $.trim( $("#txt_tags", _dlg).val() );
            var _tags = null;
            if (_tags_text){
                _tags = [];
                var _t = _tags_text.split(",");
                for (var i = 0; i < _t.length; i++){
                    _tags.push( $.trim( _t[i]) );
                }
                if (_tags){
                    $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_tags',{
                        'tags': _tags
                    });
                    $("#txt_tags", _dlg).val('');
                    _dlg.close();
                }
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        
        function validate(){
            if ($.trim($(this).val())){
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        
        $(_dlg).find(".btn.js_add_tags").click(dialogAddTags);
        $(_dlg).find("#txt_tags").keyup(validate);
        
        return _dlg;
    }
    
    function TagEditor(){
        var _dlg = TagsDialog();
        var _tmpl = "#ck12_template_new_tag";
        
        function addTags(e, data){
            var tags = data.tags;
            for (var i= 0; i < tags.length ; i++){
                var tag = tags[i];
                if (artifact.addTag(tag)){
                    var tag_elm = $.flxweb.template.render(_tmpl, {'tag': tag});
                    tag_elm.appendTo( $(".js_tagslist_container") );
                }
            }
        }
        
        function removeTag(){
            var tag_elm = $(this).parent();
            var tag_name = $(this).data('tagname');
            artifact.removeTag(tag_name);
            $(tag_elm).remove();
        }
        
        $("#btn_addtags").click(function(){
            _dlg.open();
            return false;
        });
        $(_dlg).bind("flxweb.editor.metadata.add_tags", addTags);
        $("#tagscontainer .js_metadata_remove").live('click', removeTag);
    }
    
    
    
    
    function SubjectsDialog(){
        var _dlg = $.flxweb.createDialog("#js_subjects_dialog");
        
        function onDialogOpen(){
            $(".js_nodelink").removeClass('jstree-clicked');
            var tree = $('#browse_tree').jstree({
                "themes" : {
                    "theme" : "default",
                    "icons" : false
                },
                "plugins" : ["themes", "html_data", "ui"]
            });
        }
        
        function treeNodeChange(){
            $(_dlg).find('.error').addClass('hide');
            return false;
        }
        
        function dialogAddSubject(){
            var selectedSubjects = [];
            var sel = $(".js_nodelink.jstree-clicked");
            $(sel).each(function(){
                selectedSubjects.push( $.trim($(this).text()) );
            });
            if (selectedSubjects.length){
                $.flxweb.events.triggerEvent(_dlg,'flxweb.editor.metadata.add_subject',{
                    'subjects': selectedSubjects
                });
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }

        _dlg.bind('flxweb.dialog.open', onDialogOpen);
        $("#browse_tree .js_clickablenode").live('click', treeNodeChange);
        $(".js_add_subjects").click(dialogAddSubject);
        return _dlg;
    }
    
    function SubjectEditor(){
        var _dlg = SubjectsDialog();
        var _tmpl = "#ck12_template_new_subject";
        var subject_elm = null;
        
        function addSubjects(e, data){
            var subjects = data.subjects;
            var subject = null;
            if (subjects){
                for (var i = 0; i < subjects.length; i++){
                    subject = subjects[i];
                    if (artifact.addSubject(subject)){
                        subject_elm = $.flxweb.template.render(_tmpl,{
                            'subject': subject
                        });
                        subject_elm.appendTo($(".js_subjectslist_container"));
                    }
                    _dlg.close();
                }
            }
        }
        
        function removeSubject(){
            var subject = $(this).data('subjectname');
            artifact.removeSubject(subject);
            $(this).parent().remove();
        }
        
        $("#btn_addsubjects").click(function(){
           _dlg.open();
           return false; 
        });
        _dlg.bind('flxweb.editor.metadata.add_subject', addSubjects);
        $("#subjectscontainer .js_metadata_remove").live('click', removeSubject);
    }
    
    function AttributionsDialog(){
        var _dlg = $.flxweb.createDialog("#js_attributions_dialog");
        function dialogAddAttribution(){
            var role = $.trim( $("#attribution_role").val() );
            var name = $.trim( $("#txt_attribution_name").val() );
            if (!name){
                $(_dlg).find('.error').removeClass('hide');
            }
            if (role && name){
                $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_attribution',{
                    'attribution': {
                        'role' : role,
                        'name' : name
                    }
                });
                $("#txt_attribution_name").val('');
            }
        }
        function validateName(){
            if ( $.trim( $(this).val() )  ){
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        $(_dlg).find(".js_add_attributions").click(dialogAddAttribution);
        $("#txt_attribution_name").keyup(validateName);
        return _dlg;
    }
    
    function AttributionEditor(){
        var _dlg = AttributionsDialog();
        var _tmpl = "#ck12_template_new_attribution";
        var _containers = $(".js_attributionlist_container");
        
        function addAttribution(e, data){
            var attrdata = data.attribution;
            var name = attrdata.name;
            var role = attrdata.role;
            if (artifact.addAttribution(name, role)){
                var attrelm = $.flxweb.template.render(_tmpl, attrdata);
                _containers.each(function(){
                   if ($(this).data('attribrole') == role){
                       $(this).append(attrelm);
                       $(this).parent().removeClass('hide');
                       _dlg.close();
                   } 
                });
            }
        }
        
        function removeAttribution(){
            var name=$(this).data('attribname');
            var role=$(this).data('attribrole');
            artifact.removeAttribution(name, role);
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
        
        $("#btn_addattributions").click(function(){
            _dlg.open();
            return false;
        });
        _dlg.bind('flxweb.editor.metadata.add_attribution', addAttribution);
        $("#attributionscontainer .js_attribution_remove").live('click', removeAttribution);
    }
    
    function LevelEditor(){
        var selectors = $("#levelcontainer .js_levelselect");
        
        function changeLevel(){
            var level_elm = $(this);
            if (level_elm.hasClass('selected')){
                artifact.setLevel(null);
                level_elm.removeClass('selected');
            } else {
                var levelname = level_elm.data('levelname');
                artifact.setLevel(levelname);
                selectors.removeClass('selected');
                level_elm.addClass('selected');
            }
        }
        
        selectors.click(changeLevel);
    }
    
    function GradeEditor(){
        var selectors = $("#gradescontainer .js_gradeselect");
        
        function changeGrade(){
            var grade_elm = $(this);
            var grade = grade_elm.data('gradename');
            if (grade_elm.hasClass('selected')){
                artifact.removeGrade(grade);
                grade_elm.removeClass('selected');
            } else {
                artifact.addGrade(grade);
                grade_elm.addClass('selected');   
            }
            
        }
        
        selectors.click(changeGrade);
    }
    
    function StatesDialog(){
        var _dlg = $.flxweb.createDialog("#js_states_dialog");
        function dialogAddStates(){
            var selection = $(".js_stateselect").val();
            if (selection){
                var _states = [];
                var _st = null;
                for (var i = 0; i<selection.length; i++){
                    _st = selection[i].split(':');
                    _states.push({
                       'statecode': _st[0],
                       'state': _st[1] 
                    });
                }
                $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_states',{
                    'states': _states
                });
                $(".js_stateselect").val('');
                _dlg.close();
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        function validate(){
            if ($(this).val()){
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        $(_dlg).find(".js_add_states").click(dialogAddStates);
        $(".js_stateselect").change(validate);
        return _dlg;
    }
    
    function StateEditor(){
        var statedialog = StatesDialog();
        var _tmpl = "#ck12_template_new_state";
        function addStates(e, data){
            var states = data.states;
            var state_elm = null;
            for (var i=0; i<states.length; i++){
                if (artifact.addState(states[i].statecode)){
                    state_elm = $.flxweb.template.render(_tmpl, states[i]);
                    state_elm.appendTo($(".js_stateslist_container"));
                }
            }
        }
        function removeState(){
            var state_elm = $(this).parent();
            var state_name = $(this).data('statename');
            artifact.removeState(state_name);
            $(state_elm).remove();
        }
        $("#btn_addstates").click( function(){
           statedialog.open();
           return false; 
        });
        statedialog.bind('flxweb.editor.metadata.add_states', addStates);
        $("#statescontainer .js_metadata_remove").live('click', removeState);
    }
    
    function domReady(){
        artifact = $.flxweb.editor.current_artifact;
        TagEditor();
        LevelEditor();
        GradeEditor();
        StateEditor();
        SubjectEditor();
        AttributionEditor();
    }
    
    $(document).ready(domReady);
})(jQuery);
