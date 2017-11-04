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
define('flxweb.editor.metadata', [
    'jquery', 'jquery-ui', 'flxweb.global', 'flxweb.settings', 'flxweb.editor.common'
], function ($) {
    'use strict';

    var artifact = null;


    function TagsDialog() {
        /***
         * Tag Editor Dialog
         */

        var _dlg = $.flxweb.createDialog('#js_tags_dialog');

        function dialogAddTags() {
            var i, _t, _tags, _tags_text = ($(_dlg).find('#txt_tags').val() || '').trim();
            if (_tags_text) {
                _tags = [];
                _t = _tags_text.split(',');
                for (i = 0; i < _t.length; i++) {
                    _tags.push((_t[i] || '').trim());
                }
                if (_tags) {
                    $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_tags', {
                        'tags': _tags
                    });
                    $(_dlg).find('#txt_tags').val('');
                    _dlg.close();
                }
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }

        function validate() {
            if (($(this).val() || '').trim()) {
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }

        $(_dlg).find('.button.js_add_tags').click(dialogAddTags);
        $(_dlg).find('#txt_tags').keyup(validate);

        return _dlg;
    }

    function TagEditor() {
        var _dlg = TagsDialog(),
            _tmpl = '#ck12_template_new_tag';

        function addTags(e, data) {
            var i, tag, tag_elm, tags = data.tags;
            for (i = 0; i < tags.length; i++) {
                tag = tags[i];
                if (artifact.addTag(tag)) {
                    tag_elm = $.flxweb.template.render(_tmpl, {
                        'tag': window.htmlSafe(tag)
                    });
                    tag_elm.appendTo($('.js_tagslist_container'));
                } else {
                    tag = artifact.getTag(tag).replace('\'', '\\\'');
                    tag_elm = $('.js_tagslist_container ').find('.js_metadata_remove[data-tagname="' + tag + '"]').parent();
                    tag_elm.effect('pulsate', {
                        times: 3
                    }, 1000);
                }
            }
        }

        function removeTag() {
            artifact.removeTag($(this).data('tagname'));
            $(this).parent().remove();
        }

        $('#btn_addtags').click(function () {
            _dlg.open();
            return false;
        });
        $(_dlg).bind('flxweb.editor.metadata.add_tags', addTags);
        $('#tagscontainer .js_metadata_remove').live('click', removeTag);
    }

    function SubjectsDialog() {
        var _dlg = $.flxweb.createDialog('#js_subjects_dialog');

        function onDialogOpen() {
            $('.js_nodelink').removeClass('jstree-clicked');
            $('#browse_tree').jstree({
                'themes': {
                    'theme': 'default',
                    'url': $.flxweb.settings.jstree_stylesheet_directory,
                    'icons': false
                },
                'plugins': ['themes', 'html_data', 'ui']
            });
        }

        function treeNodeChange() {
            $(_dlg).find('.error').addClass('hide');
            return false;
        }

        function dialogAddSubject() {
            var selectedSubjects = [];
            $('.js_nodelink.jstree-clicked').each(function () {
                selectedSubjects.push(($(this).text() || '').trim());
            });
            if (selectedSubjects.length) {
                $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_subject', {
                    'subjects': selectedSubjects
                });
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }

        _dlg.bind('flxweb.dialog.open', onDialogOpen);
        $('#browse_tree .js_clickablenode').live('click', treeNodeChange);
        $('.js_add_subjects').click(dialogAddSubject);
        return _dlg;
    }

    function SubjectEditor() {
        var _dlg = SubjectsDialog(),
            _tmpl = '#ck12_template_new_subject',
            subject_elm = null;

        function addSubjects(e, data) {
            var i, subject, subjects = data.subjects;
            if (subjects) {
                for (i = 0; i < subjects.length; i++) {
                    subject = subjects[i];
                    if (artifact.addSubject(subject)) {
                        subject_elm = $.flxweb.template.render(_tmpl, {
                            'subject': subject
                        });
                        subject_elm.appendTo($('.js_subjectslist_container'));
                    }
                    _dlg.close();
                }
            }
        }

        function removeSubject() {
            artifact.removeSubject($(this).data('subjectname'));
            $(this).parent().remove();
        }

        $('#btn_addsubjects').click(function () {
            _dlg.open();
            return false;
        });
        _dlg.bind('flxweb.editor.metadata.add_subject', addSubjects);
        $('#subjectscontainer .js_metadata_remove').live('click', removeSubject);
    }

    function AttributionsDialog() {
        var _dlg = $.flxweb.createDialog('#js_attributions_dialog');

        function dialogAddAttribution() {
            var role = ($('#attribution_role').val() || '').trim(),
                name = ($('#txt_attribution_name').val() || '').trim();
            if (!name) {
                $(_dlg).find('.error').removeClass('hide');
            }
            if (role && name) {
                $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_attribution', {
                    'attribution': {
                        'role': role,
                        'name': name
                    }
                });
                $('#txt_attribution_name').val('');
            }
        }

        function validateName() {
            if (($(this).val() || '').trim()) {
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        $(_dlg).find('.js_add_attributions').click(dialogAddAttribution);
        $('#txt_attribution_name').keyup(validateName);
        return _dlg;
    }

    function AttributionEditor() {
        var _dlg = AttributionsDialog(),
            _tmpl = '#ck12_template_new_attribution';

        function addAttribution(e, data) {
            var attrelm, name = window.htmlSafe(data.attribution.name),
                role = data.attribution.role;
            if (artifact.addAttribution(name, role)) {
                attrelm = $.flxweb.template.render(_tmpl, {
                    'name': name,
                    'role': role
                });
                $('.js_attributionlist_container').each(function () {
                    if ($(this).data('attribrole') === role) {
                        $(this).append(attrelm).parent().removeClass('hide');
                        _dlg.close();
                    }
                });
            } else {
                $.flxweb.showDialog($.flxweb.gettext('Attribution already exists for <%=attrrole %> <%=attrname %>', {
                    'attrname': name,
                    'attrrole': role
                }));
            }
        }

        function removeAttribution() {
            var name = $(this).data('attribname'),
                role = $(this).data('attribrole');
            artifact.removeAttribution(name, role);
            $(this).parent().remove();
            $('.js_attributionlist_container').each(function () {
                if ($(this).data('attribrole') === role) {
                    if ($(this).find('.js_attribution').size() === 0) {
                        $(this).parent().addClass('hide');
                    }
                }
            });
            return false;
        }

        $('#btn_addattributions').click(function () {
            _dlg.open();
            return false;
        });
        _dlg.bind('flxweb.editor.metadata.add_attribution', addAttribution);
        $('#attributionscontainer .js_attribution_remove').live('click', removeAttribution);
    }

    function LevelEditor() {
        function changeLevel() {
            var level_elm = $(this);
            if (level_elm.hasClass('selected')) {
                artifact.setLevel(null);
                level_elm.removeClass('selected');
            } else {
                artifact.setLevel(level_elm.data('levelname'));
                $('#levelcontainer .js_levelselect').removeClass('selected');
                level_elm.addClass('selected');
            }
        }

        $('#levelcontainer').off('click.select').on('click.select', '.js_levelselect', changeLevel);
    }

    function GradeEditor() {
        function changeGrade() {
            var grade_elm = $(this);
            if (grade_elm.hasClass('selected')) {
                artifact.removeGrade(grade_elm.data('gradename'));
                grade_elm.removeClass('selected');
            } else {
                artifact.addGrade(grade_elm.data('gradename'));
                grade_elm.addClass('selected');
            }

        }
        $('#gradescontainer').off('click.select').on('click.select', '.js_gradeselect', changeGrade);
    }

    function StatesDialog() {
        var _dlg = $.flxweb.createDialog('#js_states_dialog');

        function dialogAddStates() {
            var i, _st, _states, selection = $('.js_stateselect').val();
            if (selection) {
                _states = [];
                _st = null;
                for (i = 0; i < selection.length; i++) {
                    _st = selection[i].split(':');
                    _states.push({
                        'statecode': _st[0],
                        'state': _st[1]
                    });
                }
                $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_states', {
                    'states': _states
                });
                $('.js_stateselect').val('');
                _dlg.close();
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }

        function validate() {
            if ($(this).val()) {
                $(_dlg).find('.error').addClass('hide');
            } else {
                $(_dlg).find('.error').removeClass('hide');
            }
        }
        $(_dlg).find('.js_add_states').click(dialogAddStates);
        $('.js_stateselect').change(validate);
        return _dlg;
    }

    function StateEditor() {
        var statedialog = StatesDialog(),
            _tmpl = '#ck12_template_new_state';

        function addStates(e, data) {
            var i, state_elm, states = data.states;
            for (i = 0; i < states.length; i++) {
                if (artifact.addState(states[i].statecode)) {
                    state_elm = $.flxweb.template.render(_tmpl, states[i]);
                    state_elm.appendTo($('.js_stateslist_container'));
                }
            }
        }

        function removeState() {
            artifact.removeState($(this).data('statename'));
            $(this).parent().remove();
        }
        $('#btn_addstates').click(function () {
            statedialog.open();
            return false;
        });
        statedialog.bind('flxweb.editor.metadata.add_states', addStates);
        $('#statescontainer .js_metadata_remove').live('click', removeState);
    }

    function SearchKeywordsDialog() {
        /***
         * Search Keywords Editor Dialog
         */

        var _dlg = $.flxweb.createDialog('#js_search_keywords_dialog', {
            'width': 500
        });

        function validateKeywordLength(_keywords) {
            var i;
            for (i = 0; i < _keywords.length; i++) {
                if (_keywords[i].length > 80) {
                    $(_dlg).find('.error.length').removeClass('hide');
                    return false;
                }
            }
            return _keywords;
        }

        function dialogAddSearchKeywords() {
            var i, _k, _keywords, _keyword_text = ($(_dlg).find('#txt_search_keywords').val() || '').trim();
            if (_keyword_text) {
                _keywords = [];
                _k = _keyword_text.split(';');
                for (i = 0; i < _k.length; i++) {
                    _keywords.push((_k[i] || '').trim());
                }
                if (validateKeywordLength(_keywords)) {
                    $.flxweb.events.triggerEvent(_dlg, 'flxweb.editor.metadata.add_search_keywords', {
                        'keywords': _keywords
                    });
                    $(_dlg).find('#txt_search_keywords').val('');
                    _dlg.close();
                }
            } else {
                $(_dlg).find('.error.empty').removeClass('hide');
            }
        }

        function validate() {
            if (($(this).val() || '').trim()) {
                $(_dlg).find('.error.empty').addClass('hide');
                $(_dlg).find('.error.length').addClass('hide');
            } else {
                $(_dlg).find('.error.empty').removeClass('hide');
            }
        }

        $(_dlg).find('.button.js_add_search_keywords').click(dialogAddSearchKeywords);
        $(_dlg).find('#txt_search_keywords').keyup(validate);

        return _dlg;
    }

    function SearchKeywordsEditor() {
        var _dlg = SearchKeywordsDialog(),
            _tmpl = '#ck12_template_new_search_keywords';

        function addSearchKeyword(e, data) {
            var i, keyword, keyword_elm, keywords = data.keywords;
            for (i = 0; i < keywords.length; i++) {
                keyword = keywords[i];
                if (artifact.addSearchKeyword(keyword)) {
                    keyword_elm = $.flxweb.template.render(_tmpl, {
                        'keyword': window.htmlSafe(keyword)
                    });
                    keyword_elm.appendTo($('.js_search_keyword_list_container'));
                } else {
                    keyword = artifact.getSearchKeyword(keyword).replace('\'', '\\\'');
                    keyword_elm = $('.js_search_keyword_list_container ').find('.js_metadata_remove[data-keywordname="' + keyword + '"]').parent();
                    keyword_elm.effect('pulsate', {
                        times: 3
                    }, 1000);
                }
            }
        }

        function removeKeyword() {
            artifact.removeSearchKeyword($(this).data('keywordname'));
            $(this).parent().remove();
        }

        $('#btn_addsearch_keywords').click(function () {
            _dlg.open();
            $(_dlg).find('.error').addClass('hide');
            return false;
        });
        $(_dlg).bind('flxweb.editor.metadata.add_search_keywords', addSearchKeyword);
        $('#search_keywords_container .js_metadata_remove').live('click', removeKeyword);
    }

    function domReady() {
        artifact = $.flxweb.editor.current_artifact;
        TagEditor();
        LevelEditor();
        GradeEditor();
        StateEditor();
        SubjectEditor();
        AttributionEditor();
        SearchKeywordsEditor();
    }

    $(document).ready(domReady);
});