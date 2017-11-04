define('flxweb.editor.managecollaborators', [
        'jquery',
        'underscore',
        'common/utils/utils',
        'flxweb.models.artifact',
        'common/views/modal.view',
        'text!templates/flxweb.finalize.book.modal.html',
        'text!templates/flxweb.finalize.chapter.row.html',
        'text!templates/flxweb.finalize.section.html',
        'text!templates/flxweb.editor.admin.section.html',
        'text!templates/flxweb.editor.collab.section.html',
        'flxweb.global',
        'jquery-ui'
    ],
    function ($, _, Util, Artifact, ModalView, finalizeModal, chapterRowTemplate, sectionRowTemplate, adminSectionTemplate, collabSectionTemplate) {

        var emailList = [],
            bookEditingAssignments, groupExists = false,
            groupSaveProgress = false,
            artifact = null,
            addCollaboratorResponseArray = [],
            userRole;

        function ManageCollaboratorsDialog() {

            function createEditingGroup(emailList) {
                var _d = $.Deferred();
                Util.ajax({
                    url: Util.getApiUrl('flx/create/editing/group/' + artifactID),
                    data: {
                        'assigneeIDs': emailList
                    },
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function(data) {
                        _d.resolve(data.response);
                    },
                    error: function() {
                        _d.reject('Failed');
                    }
                });
                return _d.promise();
            }

            function addCollaborators(email) {
                var _d = $.Deferred();
                Util.ajax({
                    url: Util.getApiUrl('flx/group/add/member'),
                    data: {
                        'assigneeID': email,
                        'bookID': artifactID
                    },
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function(data) {
                        addCollaboratorResponseArray.push({
                            'email': email,
                            'response': data.response
                        });
                        _d.resolve(data.response);
                    },
                    error: function() {
                        _d.reject('Failed');
                    }
                });
                return _d.promise();
            }

            function deleteCollaborators(email) {
                var _d = $.Deferred();
                Util.ajax({
                    url: Util.getApiUrl('flx/group/delete/member'),
                    data: {
                        'assigneeID': email,
                        'bookID': artifactID
                    },
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function(data) {
                        _d.resolve(data.response);
                    },
                    error: function() {
                        _d.reject('Failed');
                    }
                });
                return _d.promise();
            }

            function addCollaboratorsSuccess(data) {
                var count, successCount = 0,
                    failureList = '',
                    alreadyExists = '',
                    addOwner = '',
                    message = '',
                    str = '',
                    email = $('.js-email-text').val();
                for (count = 0; count < addCollaboratorResponseArray.length; count++) {
                    if (addCollaboratorResponseArray[count].response.message && addCollaboratorResponseArray[count].response.message.indexOf('Already in the group') !== -1) {
                        if (alreadyExists) {
                            alreadyExists = alreadyExists + ', ' + addCollaboratorResponseArray[count].email;
                        } else {
                            alreadyExists = addCollaboratorResponseArray[count].email;
                        }
                    } else if (addCollaboratorResponseArray[count].response.message && addCollaboratorResponseArray[count].response.message.indexOf('No need to assign group owner') !== -1) {
                        addOwner = true;
                    } else if (addCollaboratorResponseArray[count].response.message) {
                        if (failureList) {
                            failureList = failureList + ', ' + addCollaboratorResponseArray[count].email;
                        } else {
                            failureList = addCollaboratorResponseArray[count].email;
                        }
                    } else {
                        successCount++;
                        emailList.push(addCollaboratorResponseArray[count].email);
                        str += '<div class="individual-email-wrapper"><span class="added-email">' + addCollaboratorResponseArray[count].email + '</span><span class="icon-close js-icon-close pointer"></span></div>';
                    }
                }
                $('.js-pre-mail-list').append(str);
                addCollaboratorResponseArray = [];
                $('#collabCount').text('(' + emailList.length + ')');
                $('.js-email-text').val('');
                $('#addEmail').addClass('save-disabled');
                autoComplete();
                if (successCount) {
                    message = successCount + ' Collaborator(s) added successfully.';
                }
                if (failureList) {
                    message = message + ' We cannot find CK-12 account(s) for following email ids: ' + failureList;
                }
                if (alreadyExists) {
                    message = message + '  Already in the group : ' + alreadyExists;
                }
                if (addOwner) {
                    message = message + '  No need to assign group owner as a member.';
                }
                if (message) {
                    ModalView.alert(message);
                }
            }

            function deleteCollaboratorsSuccess($this, data) {
                var index, email = $this.prev('span').text();
                if (data.result) {
                    $this.parent().remove();
                    index = emailList.indexOf(email);
                    emailList.splice(index, 1);
                    $('#collabCount').text('(' + emailList.length + ')');
                    autoComplete();
                    ModalView.alert('Collaborator removed successfully');
                } else if (data.message) {
                    if (data.message.indexOf('still has assignment') !== -1) {
                        ModalView.alert('The collaborator you are attempting to remove still has section(s) assigned for editing.  First unassign the section(s) and then remove the collaborator.');
                    } else {
                        ModalView.alert(data.message);
                    }
                } else {
                    ModalView('Cannot remove collaborator');
                }
            }

            function createEditingGroupSuccess(data) {
                var members, count;
                emailList = [];
                if (data && data.message) {
                    ModalView.alert(data.message);
                } else {
                    members = data.members;
                    groupExists = true;
                    if (members) {
                        for (count = 0; count < members.length; count++) {
                            emailList.push(members[count].email);
                        }
                    }
                    $('#manageCollaborators').text();
                    $('#collabCount').text('(' + emailList.length + ')');
                    $.flxweb.editor.ManageCollaboratorsDialog.close();

                    autoComplete();
                    ModalView.alert('The collaborator(s) were successfully added for editing the FlexBook.');
                }
                groupSaveProgress = false;
                //delete the localStorage keys with pattern *collabBooks*
                Object.keys(localStorage).forEach(function(key){
                    if (/collabBooks/.test(key)) {
                        localStorage.removeItem(key);
                    }
                });
            }

            function bindEvents() {
                $('#cancelCollab').off('click').on('click', function() {
                    $.flxweb.editor.ManageCollaboratorsDialog.close();
                });
                $('#shareUrl').off('click').on('click', function() {
                    $(this).select();
                });
                $('#copyUrl').off('click').on('click', function() {
                    var copyMsg, copyTextarea = $('#shareUrl');
                    copyTextarea.select();
                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        console.log('Copying text command was ' + msg);
                        $('.copy-msg').remove();
                        $('#copyUrl').after('<span class="copy-msg">Link Copied</span>');
                        copyMsg = $('.copy-msg');
                        copyMsg.animate({opacity: 1}, 1000);
                        setTimeout(function() {
                            copyMsg.animate({opacity: 0}, 1000);
                            setTimeout(function() {
                                copyMsg.remove();
                            }, 1000);
                        }, 3000);
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                });
                $('#saveCollab').off('click.saveColl').on('click.saveColl', function saveCollab() {
                    emailList = $.trim($('.js-email-list').val());
                    emailList = _.uniq(emailList.split(",")).toString();
                    if (!groupSaveProgress) {
                        groupSaveProgress = true;
                        $('#saveCollab').unbind('click.saveColl', saveCollab);
                        if (emailList) {
                            createEditingGroup(emailList).done(function(data) {
                                createEditingGroupSuccess(data);
                                $('#saveCollab').bind('click.saveColl', saveCollab);
                            }).fail(function() {
                                ModalView.alert('Unable to create editing group please try again later');
                                $('#saveCollab').bind('click.saveColl', saveCollab);
                            });
                        } else {
                            $('#saveCollab').bind('click.saveColl', saveCollab);
                        }
                    }
                });
                $('#addEmail').off('click').on('click', function() {
                    var emails, count, addCollaboratorCalls = [],
                        email = $.trim($('.js-email-text').val());
                    if (!$(this).hasClass('save-disabled')) {
                        emails = _.uniq(email.split(","));
                        for (count = 0; count < emails.length; count++) {
                            addCollaboratorCalls.push(addCollaborators(emails[count]));
                        }
                        $.when.apply($, addCollaboratorCalls).then(function() {
                            addCollaboratorsSuccess();
                        });
                    }
                });
                $('.js-email-text,.js-email-list').on('paste cut keyup', function() {
                    window.setTimeout(function() {
                        var textContent = $('.js-email-list').hasClass('hide') ? $.trim($('.js-email-text').val()) : $.trim($('.js-email-list').val());
                        textContent !== "" ? $('#saveCollab,#addEmail').removeClass("save-disabled") : $('#saveCollab,#addEmail').addClass('save-disabled');
                    }, 10);
                });
            }

            function onDialogOpen() {
                var count, str = '';
                bindEvents();
                $('#shareUrl').val(window.location.origin + '/editor/' + artifact_json.perma);
                if (groupExists) {
                    $('.js-pre-mail-list-wrapper').removeClass('hide');
                    for (count = 0; count < emailList.length; count++) {
                        str = str + '<div class="individual-email-wrapper"><span class="added-email">' + emailList[count] + '</span><span class="icon-close js-icon-close pointer"></span></div>';
                    }
                    $('.js-pre-mail-list').html(str);
                    $('.group-not-exists').addClass('hide');
                    $('.group-exists').removeClass('hide');
                    $('#saveCollab').addClass('hide');
                    $('#cancelCollab').addClass('hide');
                } else {
                    $('.js-email-list').removeClass('hide');
                    $('#saveCollab').removeClass('hide');
                    $('.group-not-exists').removeClass('hide');
                    $('.group-exists').addClass('hide');
                }
                $('.js-pre-mail-list-wrapper').off('click', '.icon-close').on('click', '.icon-close', function () {
                    var email, $this = $(this);
                    email = $this.prev('span').text();
                    deleteCollaborators(email).done(function(data) {
                        deleteCollaboratorsSuccess($this, data);
                    }).fail(function() {
                        ModalView.alert('Unable to remove collaborator');
                    });
                });
            }

            function init() {
                var collab_dlg = $.flxweb.createDialog($('#js_dialog_managecollaborators'), {
                    'width': '550px'
                });
                collab_dlg.bind('flxweb.dialog.open', onDialogOpen);
                return collab_dlg;
            }

            return init();
        }

        function openDropdown(e) {
            var dropdownBox = $(e.currentTarget).parent().find('.more-options-dropdown-wrapper');
            if (!dropdownBox.hasClass('open')) {
                $('.more-options-dropdown-wrapper').addClass('hide').removeClass('open');
            }
            dropdownBox.toggleClass('open').toggleClass('hide');
            e.stopPropagation();
        }

        function assignCollaborators(assigneeID, sectionID) {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/assign/editing/' + sectionID + '/of/' + artifactID),
                data: {
                    assigneeID: Util.b64EncodeUnicode(assigneeID)
                },
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function(data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function unassignCollaborators(assigneeID, sectionID) {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/unassign/editing/' + sectionID + '/of/' + artifactID),
                data: {
                    assigneeID: Util.b64EncodeUnicode(assigneeID)
                },
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function(data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function handleFirstLevelSections(firstLevelSection) {
            var assignCount, template, count, assigneeID, sectionTemplate, sectionActions, sectionActionsParent, isNew, href,
                assigned = false,
                assigneeID = false,
                assigneeEmail = false,
                isLatest = false;
            for (assignCount = 0; assignCount < bookEditingAssignments.length; assignCount++) {
                if (firstLevelSection.artifactRevisionID === bookEditingAssignments[assignCount].artifactRevisionID) {
                    if (userRole === 'owner' && isContentAdmin()) {
                        if (bookEditingAssignments) {
                            for (count = 0; count < bookEditingAssignments.length; count++) {
                                if (bookEditingAssignments[count].artifactID === firstLevelSection.artifactID) {
                                    assigned = true;
                                    assigneeID = bookEditingAssignments[count].assigneeID;
                                    assigneeEmail = bookEditingAssignments[count].assigneeEmail;
                                }
                            }
                        }
                    } else if (userRole === 'collaborator') {
                        if (bookEditingAssignments) {
                            for (count = 0; count < bookEditingAssignments.length; count++) {
                                if (bookEditingAssignments[count].artifactID === firstLevelSection.artifactID && bookEditingAssignments[count].assigneeID === $('header').data('user')) {
                                    assigned = true;
                                }
                            }
                        }
                    }
                }
            }
            if (userRole === 'owner' && isContentAdmin()) {
                sectionTemplate = _.template(adminSectionTemplate, null, {
                    'variable': 'data'
                });
                isLatest = Artifact.is_latest(firstLevelSection);
                isNew = false;
                sectionActions = $('.artifact_type_lesson[data-artifactid=' + firstLevelSection.artifactID + ']').find('.js_concept_actions');
                if (assigned) {
                    $('.artifact_type_lesson[data-artifactid=' + firstLevelSection.artifactID + ']').find('.js_artifact_row').addClass('assigned-section')
                }
                href = sectionActions.find('.js_row_edit').attr('href');
                template = sectionTemplate({
                    'hasDraft': firstLevelSection.hasDraft,
                    'conceptNode': firstLevelSection,
                    'assigned': assigned,
                    'assigneeID': assigneeID,
                    'assigneeEmail': assigneeEmail,
                    'isLatest': isLatest,
                    'isNew': isNew,
                    'href': href
                });
                sectionActionsParent = sectionActions.parent();
                sectionActions.remove();
                if (sectionActionsParent.find('.clear').length) {
                    sectionActionsParent.find('.clear').before(template);
                } else {
                    sectionActionsParent.append(template);
                }
            } else if (userRole === 'collaborator') {
                sectionTemplate = _.template(collabSectionTemplate, null, {
                    'variable': 'data'
                });
                sectionActions = $('.artifact_type_lesson[data-artifactid=' + firstLevelSection.artifactID + ']').find('.js_concept_actions');
                href = sectionActions.find('.js_row_edit').attr('href');
                template = sectionTemplate({
                    'assigned': assigned,
                    'href': href
                });
                sectionActionsParent = sectionActions.parent();
                sectionActions.remove();
                if (sectionActionsParent.find('.clear').length) {
                    sectionActionsParent.find('.clear').before(template);
                } else {
                    sectionActionsParent.append(template);
                }
            }
        }

        function showAssignmentCounts() {
            var chapterCount, chapters, sectionCount, assignCount, count, chapterArtifact, sections;
            chapters = artifact_json.children;
            if (chapters && chapters.length) {
                for (chapterCount = 0; chapterCount < chapters.length; chapterCount++) {
                    sections = chapters[chapterCount].revisions[0].children;
                    if (chapters[chapterCount].artifactType === 'chapter' && sections) {
                        count = 0;
                        chapterArtifact = $('.artifact_type_chapter[data-artifactid=' + chapters[chapterCount].artifactID + ']');
                        for (sectionCount = 0; sectionCount < sections.length; sectionCount++) {
                            for (assignCount = 0; assignCount < bookEditingAssignments.length; assignCount++) {
                                if (sections[sectionCount] === bookEditingAssignments[assignCount].artifactRevisionID) {
                                    count++;
                                }
                            }
                        }
                        if (count) {
                            chapterArtifact.find('.assignment-count').text('Assignments(' + count + ')').attr('data-count', count);
                            chapterArtifact.find($('.js_chapter_actions').find('.js_row_remove')).addClass('hidden');
                        } else {
                            chapterArtifact.find('.assignment-count').text('').attr('data-count', count);
                            chapterArtifact.find($('.js_chapter_actions').find('.js_row_remove')).removeClass('hidden');
                        }
                    } else {
                        handleFirstLevelSections(chapters[chapterCount]);
                        autoComplete();
                    }
                }
            }
        }

        function getEditingGroup() {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/get/editing/group/' + artifactID),
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function(data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function checkEditingAuthority(sectionID) {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/check/editing/authority/for/' + sectionID),
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function isContentAdmin() {
            return (flxweb_roles.indexOf('content-admin') !== -1);
        }

        function roleBasedView() {
            if (userRole !== 'collaborator') {
                if (userRole === 'owner' && isContentAdmin()) {
                    if ($.trim($('.draft-chapter').text()) || $('.draft-section').length) {
                        $('div#finalizeBook').removeClass('hide');
                    }
                    $('.show-for-content-admin').removeClass('hide');
                    $('.hide-for-content-admin').addClass('hide');
                }
                $('.hide-for-collaborator:not(div#finalizeBook)').removeClass('hide');
                $('.readonly-for-collaborator').attr('readonly', false);
                $('.metadata_level').addClass('js_levelselect');
                $('.metadata_grade').addClass('js_gradeselect');
                $('.js_row_actions.actions').removeClass('hide');
                $('.resource_actions.resource_wrapper').removeClass('hide');
                $('#edit_attachments').addClass('show-edit-attachments');
            }
        }

        function getCollaboratorsDetails() {
            var userID, index, members, collaborator = false;
            var _d = $.Deferred();
            userID = $('header').data('user');
            getEditingGroup().done(function(data) {
                if (data && data.group && data.group.creator) {
                    members = data.group.members;
                    groupExists = true;
                    if (artifact_json.creatorID === userID) {
                        //owner
                        if (members) {
                            for (index = 0; index < members.length; index++) {
                                if (members[index].id !== data.group.creator.id) {
                                    emailList.push(members[index].email);
                                }
                            }
                            $('#collabCount').text('(' + emailList.length + ')');
                        }
                        //owner flow
                        _d.resolve('owner');
                    } else {
                        if (members) {
                            for (index = 0; index < members.length; index++) {
                                if (members[index].id === userID) {
                                    collaborator = true;
                                    break;
                                }
                            }
                        }
                        if (collaborator) {
                            // collaborator flow
                            _d.resolve('collaborator');
                        } else {
                            //others normal flow
                            _d.resolve('other');
                        }
                    }
                } else {
                    //no collaboration normal flow
                    if (artifact_json.creatorID === userID) {
                        _d.resolve('owner');
                    } else {
                        _d.resolve('other');
                    }
                }
            }).fail(function() {

            });
            return _d.promise();
        }

        function chapterExpandToggle() {
            var _this = $(this);
            _this.toggleClass('ui-icon-triangle-1-e').toggleClass('ui-icon-triangle-1-s');
            _this.parent().next().toggleClass('hide');
        }

        function fetchRevisions(revisionString, pageSize) {
            var chapterCount, sectionCount, artifacts, sections, chapterRevisionID, sectionTemplate, template = '';
            sectionTemplate = _.template(sectionRowTemplate, null, {
                'variable': 'data'
            });
            Util.ajax({
                url: Util.getApiUrl('flx/get/info/revisions/' + revisionString),
                data: {
                    'forUpdate': true
                },
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function(result) {
                    if (result && result.response && result.response.artifacts) {
                        artifacts = result.response.artifacts;
                        for (chapterCount = 0; chapterCount < artifacts.length; chapterCount++) {
                            template = '';
                            chapterRevisionID = artifacts[chapterCount].artifactRevisionID;
                            sections = artifacts[chapterCount].revisions[0].children;
                            if (sections) {
                                for (sectionCount = 0; sectionCount < sections.length; sectionCount++) {
                                    sections[sectionCount].tocnumber = (chapterCount + pageSize + 1) + '.' + (sectionCount + 1);
                                    template += sectionTemplate(sections[sectionCount]);
                                }
                                $('#finalizeBookModal').find('[data-artifactrevisionid=' + chapterRevisionID + ']').find('.js_artifact_list').html(template);
                            }
                        }
                    }
                }
            });
        }

        function getSections(artifactChildren) {
            var i, revisionString = '', pageSize = 0,
                count = 0;
            for (i = 0; i < artifactChildren.length; i++) {
                if (artifactChildren[i].artifactType === "chapter") {
                    if (revisionString) {
                        revisionString += ',' + artifactChildren[i].artifactRevisionID;
                    } else {
                        revisionString = artifactChildren[i].artifactRevisionID;
                    }
                    count++;
                }
                if (count === 5) {
                    fetchRevisions(revisionString, pageSize);
                    revisionString = '';
                    count = 0;
                    pageSize += 5;
                }
            }
            if (count && (count != 5)) {
                fetchRevisions(revisionString, pageSize);
            }
        }

        function displayFinalizeCount() {
            var selectedCount, count = $(".js_artifact_list .selected, .js-chapterlist > li.selected") ? $(".js_artifact_list .selected, .js-chapterlist > li.selected").length : 0;
            count > 0 ? $('.js-finalize-button').addClass('active') : $('.js-finalize-button').removeClass('active');
            $('#finalizeDraftCount').text(count);
            selectedCount = $('#finalizeBookModal').find('input[type=checkbox]').parents('.js_artifact_list_item.selected').length + $('#finalizeBookModal').find('input[type=checkbox]').parents('.js_first_level.selected').length;
            if (selectedCount === $('#finalizeBookModal').find('input[type=checkbox]').length) {
                $('.js-select-all').addClass('hide');
                $('.js-clear-all').removeClass('hide');
            }
        }

        function finalizeBook(payload) {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/finalize/' + artifact_json.artifactType),
                type: 'POST',
                data: {
                    'finalize': payload
                },
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function(data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function showFinalizeDialog(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            ModalView.alert('We are creating new revision of the FlexBook. We will email you once it is done.');
        }

        function finalizeBookHandler() {
            var payload, sectionCount = 0,
                chapterRevisionID, children, sectionRevisionID, finalize;
            payload = {
                'artifactID': artifactID,
                'artifactRevisionID': artifactRevisionID,
                'children': []
            };
            $('.artifact_type_chapter', '#finalizeBookModal').each(function() {
                chapterRevisionID = parseInt($(this).attr('data-artifactrevisionid'));
                children = {
                    'artifactRevisionID': chapterRevisionID,
                    'children': []
                };
                $(this).find('.js_artifact_list_item').each(function() {
                    sectionRevisionID = parseInt($(this).attr('data-artifactrevisionid'));
                    if ($(this).find('input[type="checkbox"]').attr('checked') === 'checked') {
                        finalize = true;
                        sectionCount++;
                    } else {
                        finalize = false;
                    }
                    children.children.push({
                        'artifactRevisionID': sectionRevisionID,
                        'finalize': finalize
                    });
                });
                payload.children.push(children);
            });
            $('.js-first-level-section', '#finalizeBookModal').each(function() {
                sectionRevisionID = parseInt($(this).attr('data-artifactrevisionid'));
                if ($(this).find('input[type="checkbox"]').attr('checked') === 'checked') {
                    finalize = true;
                    sectionCount++;
                } else {
                    finalize = false;
                }
                children = {
                    'artifactRevisionID': sectionRevisionID,
                    'finalize': finalize
                };
                payload.children.push(children);
            });
            if (sectionCount) {
                payload = JSON.stringify(payload);
                finalizeBook(payload).done(function(data) {
                    if (data.message) {
                        ModalView.alert(data.message);
                    } else {
                        $('#finalizeBookModal').foundation('reveal', 'close');
                        $('#finalizeBook').text('Finalizing.....');
                        ModalView.alert('We are creating new revision of the FlexBook. We will email you once it is done.');
                        $.flxweb.events.triggerEvent(document, 'flxweb.finalize.book');
                        if (data && data[artifact_json.artifactType] && data[artifact_json.artifactType].taskID) {
                            $('#finalizeBook').attr('task-id', data[artifact_json.artifactType].taskID);
                        }
                        $('#chapter_list').off('click', '.js_save_artifact, .js_row_edit, .js_row_remove ').on('click', '.js_save_artifact, .js_row_edit', function (e) {
                            showFinalizeDialog(e);
                            e.stopImmediatePropagation();
                        });
                        $('.actionLink, .js_save_artifact').off('click').on('click', function (e) {
                            showFinalizeDialog(e);
                            e.stopImmediatePropagation();
                        });
                    }
                }).fail(function() {
                    ModalView.alert('error');
                });
            } else {
                ModalView.alert('Please select sections to finalize');
            }
        }

        function bindFinalizeEvents() {
            $('#finalizeBookModal').off('click.select', '.js-select-all').on('click.select', '.js-select-all', function() {
                $('input[type="checkbox"]', '.js-chapterlist').attr('checked', 'checked');
                $('input[type="checkbox"]', '.js_first_level').parents('.js_first_level').addClass('selected');
                $('input[type="checkbox"]', '.js_artifact_list_item').parents('.js_artifact_list_item').addClass('selected');
                $('.js-select-all').addClass('hide');
                $('.js-clear-all').removeClass('hide');
                displayFinalizeCount();
            });
            $('#finalizeBookModal').off('click.select', '.js-clear-all').on('click.select', '.js-clear-all', function() {
                $('input[type="checkbox"]', '.js-chapterlist').removeAttr('checked');
                $('input[type="checkbox"]', '.js_first_level').parents('.js_first_level').removeClass('selected');
                $('input[type="checkbox"]', '.js_artifact_list_item').parents('.js_artifact_list_item').removeClass('selected');
                $('.js-clear-all').addClass('hide');
                $('.js-select-all').removeClass('hide');
                displayFinalizeCount();
            });
            $('.js_artifact_row').off('click.select', '.checkbox').on('click.select', '.checkbox', function() {
                var artifactRow, artifactRowSiblingsInput;
                artifactRow = $(this).parents('.js_artifact_row');
                artifactRowSiblingsInput = artifactRow.siblings().find('input[type=checkbox]');
                if ($(this).siblings('input').attr('checked') !== 'checked') {
                    if ($(this).parents('.js-first-level-section').length) {
                        $(this).parents('.js-first-level-section').addClass('selected');
                    } else {
                        artifactRowSiblingsInput.attr('checked', 'checked');
                        artifactRow.addClass('selected');
                        artifactRowSiblingsInput.parents('.js_artifact_list_item').addClass('selected');
                    }
                } else {
                    $('.js-select-all').removeClass('hide');
                    $('.js-clear-all').addClass('hide');
                    if ($(this).parents('.js-first-level-section').length) {
                        $(this).parents('.js-first-level-section').removeClass('selected');
                    } else {
                        artifactRowSiblingsInput.removeAttr('checked');
                        artifactRow.removeClass('selected');
                        artifactRowSiblingsInput.parents('.js_artifact_list_item').removeClass('selected');
                    }
                }
                displayFinalizeCount();
            });
            $('.js_artifact_list').off('click.select', '.checkbox').on('click.select', '.checkbox', function() {
                var count = parseInt($('#finalizeDraftCount').text());
                if ($(this).siblings('input').attr('checked') !== 'checked') {
                    $(this).parents('.js_artifact_list_item').addClass('selected');
                    count++;
                    if ($(this).parents('.js_artifact_list_item').siblings('.selected').length === $(this).parents('.js_artifact_list_item').siblings().length) {
                        $(this).parents('.artifact_type_chapter').find(".js_first_level").addClass('selected');
                        $(this).parents('.artifact_type_chapter').find(".js_first_level").find('input[type=checkbox]').attr('checked', 'checked');
                    }
                } else {
                    $('.js-select-all').removeClass('hide');
                    $('.js-clear-all').addClass('hide');
                    $(this).parents('.js_artifact_list_item').removeClass('selected');
                    count--;
                    if ($(this).parents('.js_artifact_list_item').siblings('.selected').length === 0) {
                        $(this).parents('.artifact_type_chapter').find(".js_first_level").removeClass('selected');
                        $(this).parents('.artifact_type_chapter').find(".js_first_level").find('input[type=checkbox]').removeAttr('checked');
                    }
                }
                displayFinalizeCount();
            });
            $('#finalizeBookModal').off('click.finalize', '.js-finalize-button').on('click.finalize', '.js-finalize-button', function() {
                finalizeBookHandler();
            });
        }

        function clickFinalize(artifact) {
            var template, chapterTemplate;
            if (!$('#finalizeBookModal').length) {
                $('body').append(finalizeModal);
            }
            $('#finalizeBookModal').foundation('reveal', 'open');
            $('.js-flexbook-title', '#finalizeBookModal').text(artifact.get('title'));
            chapterTemplate = _.template(chapterRowTemplate, null, {
                'variable': 'data'
            });
            template = chapterTemplate(artifact.get('children'));
            $('.finalize-toc-wrapper').html(template);
            getSections(artifact.get('children'));
            bindFinalizeEvents();
            displayFinalizeCount();
        }

        function autoComplete() {
            $('.js-collab-name').autocomplete({
                source: emailList
            });
        }

        function addContentHandler(e, data) {
            if (data.artifact.artifactType !== 'chapter') {
                if (userRole === 'owner' && isContentAdmin() || (userRole === 'collaborator')) {
                    handleFirstLevelSections(data.artifact);
                }
            }
            autoComplete();
        }

        function domReady() {
            $.extend(true, $.flxweb, {
                'editor': {
                    'ManageCollaboratorsDialog': ManageCollaboratorsDialog()
                }
            });
            artifact = $.flxweb.editor.current_artifact;

            if (artifactID === 'new') {
                roleBasedView('other');
                $('.js-book-editor-top-container,.finalize-book').addClass('hide');
            }

            $('body').off('conceptsLoaded').on('conceptsLoaded', function() {
                autoComplete();
            });
            $('#chapter_list').off('click', '.js_row_assign').on('click', '.js_row_assign', function() {
                var $parent, $collabName, $this = $(this);
                $parent = $this.parents('.more-options-dropdown-wrapper');
                $collabName = $parent.parent().siblings('.js-collab-input-wrapper').find('.js-collab-name');
                $('.more-options-dropdown-wrapper').addClass('hide').removeClass('open');
                $parent.siblings('.js_row_assign_collab').removeClass('hide');
                $parent.siblings('.js-more-options').addClass('hide');
                $parent.parent().siblings('.js-collab-input-wrapper').removeClass('hide-important');
                $collabName.val('');
                $collabName.focus();
            });
            $('#chapter_list').off('click', '.js_row_unassign').on('click', '.js_row_unassign', function() {
                var count, $assignmentCount, assigneeID, sectionID, $this = $(this);
                assigneeID = $this.parents().siblings('.js-collab-input-wrapper').find('.js-collab-name').val();
                sectionID = $this.closest('.js_artifact_list_item').attr('data-artifactid');
                unassignCollaborators(assigneeID, sectionID).done(function(data) {
                    if (data.message) {
                        ModalView.alert(data.message);
                    } else {
                        $this.addClass('hide');
                        $this.siblings('.js_row_assign').removeClass('hide');
                        $this.closest('.js_artifact_row').removeClass('assigned-section');
                        $this.closest('.js_concept_actions').siblings('.assignee-email').text('');
                        $this.siblings().find('.js_row_edit').parent().removeClass('hide');
                        $this.parents('.more-options-dropdown-wrapper').siblings('.js_row_remove').removeClass('hidden');
                        $assignmentCount = $this.parents('.artifact_type_chapter').find('.assignment-count');
                        count = $assignmentCount.attr('data-count');
                        count--;
                        $assignmentCount.attr('data-count', count);
                        if (count) {
                            $assignmentCount.text('Assignments(' + count + ')');
                            $this.parents('.artifact_type_chapter').find($('.js_chapter_actions').find('.js_row_remove')).addClass('hidden')
                        } else {
                            $assignmentCount.text('');
                            $this.parents('.artifact_type_chapter').find($('.js_chapter_actions').find('.js_row_remove')).removeClass('hidden')
                        }
                    }
                }).fail(function() {
                    ModalView.alert("There was an error.");
                });
            });
            $('#chapter_list').off('click', '.js_row_assign_collab').on('click', '.js_row_assign_collab', function(ev) {
                var $sibling, count, $assignmentCount, sectionID, assigneeID, $this = $(this);
                assigneeID = $.trim($this.parents().siblings('.js-collab-input-wrapper').find('.js-collab-name').val());
                if (!assigneeID) {
                    $(this).addClass("hide");
                    $(this).parents('.js_concept_actions').children(".js-more-options").removeClass("hide");
                    $(this).parents('.js_artifact_row').children(".js-collab-input-wrapper").addClass('hide-important')
                    return false;
                }
                sectionID = $this.closest('.js_artifact_list_item').attr('data-artifactid');
                assignCollaborators(assigneeID, sectionID).done(function(data) {
                    $this.addClass('hide');
                    $('.js-more-options').removeClass('hide');
                    $this.parent().siblings('.js-collab-input-wrapper').addClass('hide-important');
                    if (data.message) {
                        if (data.message.indexOf('Unknown assignee') !== -1) {
                            ModalView.alert('The user ' + assigneeID + ' is not part of the collaboration group. Add the user as a collaborator and then assign the section.');
                        } else {
                            ModalView.alert(data.message);
                        }
                    } else {
                        $sibling = $this.siblings('.more-options-dropdown-wrapper');
                        $this.closest('.js_artifact_list_item').attr('data-assigned', 'assigned');
                        $this.closest('.js_artifact_list_item').attr('data-assigneeID', assigneeID);
                        $sibling.find('.js_row_assign').addClass('hide');
                        $sibling.find('.js_row_edit').parent().addClass('hide');
                        $sibling.find('.js_row_unassign').removeClass('hide');
                        $this.closest('.js_artifact_row').addClass('assigned-section');
                        $this.closest('.js_concept_actions').siblings('.assignee-email').text(assigneeID);
                        $this.siblings('.js_row_remove').addClass('hidden');
                        $this.parents('.artifact_type_chapter').find($('.js_chapter_actions').find('.js_row_remove')).addClass('hidden')
                        $assignmentCount = $this.parents('.artifact_type_chapter').find('.assignment-count');
                        count = $assignmentCount.attr('data-count');
                        count++;
                        $assignmentCount.attr('data-count', count);
                        $assignmentCount.text('Assignments(' + count + ')');
                    }
                }).fail(function() {
                    ModalView.alert("There was an error.");
                });
            });
            $('#chapter_list').off('click.open', '.js-more-options').on('click.open', '.js-more-options', openDropdown);
            $('body').off('click.hide').on('click.hide', function() {
                $('.more-options-dropdown-wrapper').addClass('hide').removeClass('open');
            });
            $('body').keyup(function(e) {
                var $this;
                if (e.keyCode == 27 && $(":focus").hasClass("js-collab-name")) {
                    $this = $(":focus").parents('.js-collab-input-wrapper').siblings(".js_concept_actions").children(".js_row_assign_collab");
                    $this.addClass("hide");
                    $this.parents('.js_concept_actions').children(".js-more-options").removeClass("hide");
                    $this.parents('.js_artifact_row').children(".js-collab-input-wrapper").addClass('hide-important')
                    return false;
                }
            });
            $(document).bind('flxweb.editor.flexbook.add_artifact', addContentHandler);
            autoComplete();

            $('.js_expand_toggle', '#finalizeBookModal').live('click', chapterExpandToggle);
        }

        $(document).ready(domReady);

        var manageCollaboration = {
            getAssignments: function() {
                if (bookEditingAssignments) {
                    return bookEditingAssignments;
                } else {
                    return [];
                }
            },
            getAssignmentDetails: function() {
                var _d = $.Deferred();
                Util.ajax({
                    url: Util.getApiUrl('flx/get/editing/group/assignments/of/' + artifactID),
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function(result) {
                        if (result.response.bookEditingAssignments) {
                            bookEditingAssignments = result.response.bookEditingAssignments;
                        }
                        $('body').trigger('assignmentsLoaded');
                        _d.resolve();
                    }
                });
                return _d.promise();
            },
            getUserRole: function() {
                var _d = $.Deferred();
                this.getAssignmentDetails().done(function() {
                    getCollaboratorsDetails().done(function(role) {
                        userRole = role;
                        _d.resolve(role);
                        showAssignmentCounts();
                        roleBasedView();
                    });
                });
                return _d.promise();
            },
            handleFinalizeBook: function(artifact) {
                clickFinalize(artifact);
            },
            checkAuthority: function(sectionID) {
                var _d = $.Deferred();
                checkEditingAuthority(sectionID).done(function(data){
                    _d.resolve(data);
                });
                return _d.promise();
            },
            userIsContentAdmin: isContentAdmin
        };

        return manageCollaboration;

    });
