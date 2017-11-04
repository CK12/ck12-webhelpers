define([
    'backbone',
    'jquery',
    'common/views/modal.view',
    'library/models/library.worddoc',
    'library/views/library.paginator',
    'library/templates/library.templates',
    'common/utils/utils'
], function(Backbone, $, ModalView, WordDocModel, LibraryPaginator, TMPL, Util) {
    'use strict';
    var GoogleDocsView = Backbone.View.extend({
        googleDocsPaginatorContainerID: "#google-docs-paginator",
        googleDocsItemTemplate: TMPL.GOOGLEDOCITEM,
        imported_artifact_type: 'lesson',
        paginator: null,
        state: {
            pageNum: 1,
            pageSize: 10,
            docsList: true
        },
        events: {
            'click #btn_gdtimport': 'importGoogleDocs',
            'click .js_gdoc_auth_link': 'handleGAuth',
            'click .js_list_type': 'listTypeClick',
            'click .js_gdoc': 'selectDocument',
            'click #modality-types-dropdown .js-dropdown-element': 'selectModality',
            'click #js_addfromgdocs_confirm': 'startGDTImport',
            'click #googleDocsModal': 'dropdownClose',
            'click #dropdown-modality': 'disableModalitySelection'
        },
        initialize: function(){
            _.bindAll(this, "render", "importGoogleDocs", "onAuthFail", "authSuccess", "authURLSuccess", "checkWindowStatus", "handleGAuth",
                    "listTypeClick", "selectDocument", "onLoadDocListSuccess", "startGDTImport", "disableModalitySelection", "selectModality", "importStartSuccess",
                    "pageChange", "updatePagination", "importSuccess", "htmlEscapArtifactTitle");
            this.render();
            this.model.off("authFail").on("authFail", this.onAuthFail);
            this.model.off("authSuccess").on("authSuccess", this.authSuccess);
            this.model.off("authURLSuccess").on("authURLSuccess", this.authURLSuccess);
            //this.model.off("loadDocListSuccess").on("loadDocListSuccess", this.onLoadDocListSuccess);
            this.model.on("reset", this.onLoadDocListSuccess);
        },
        render: function() {
            this.$el.html(GoogleDocsView.template);
            $('.content-type-dropdown').removeClass('open').css('left', '-99999px');
            $('.js_gdoc_list_container').addClass('hide');
            $('.js_gdoc_login_container').addClass('hide');
            $('#googleDocsModal').foundation('reveal', 'open');
            this.model.gdtAuthStatus();
            this.model.getGoogleAuthURL();
            this.paginator = new LibraryPaginator({
                el: $(this.googleDocsPaginatorContainerID)
            });
            this.paginator.render();
            this.model.off('pageChange').on('pageChange', this.updatePagination);
            this.paginator.on('pageChange', this.pageChange);
        },
        updatePagination: function(data){
            this.paginator.update({
                current: data.currentPage,
                total: data.totalPages
            });
        },
        pageChange: function(data) {
            this.state.pageNum = data.pageNum;
            this.loadDocList();
        },
        getState: function(){
            var state = {
                pageNum : this.state.pageNum,
                pageSize : this.state.pageSize
            };
            return state;
        },
        importGoogleDocs: function() {
            
        },
        onAuthFail: function() {
            $('.js_gdoc_list_container').addClass('hide');
            $('.js_gdoc_login_container').removeClass('hide');
        },
        loadDocList: function() {
            var params = {};
            params = {
                    'pageNum': this.state.pageNum,
                    'pageSize': this.state.pageSize
            };
            this.model.loadDocList(params, this.state.docsList);
        },
        selectModality: function(e) {
            var currentTarget, dropdownModality, modalityName, modalityType;
            dropdownModality = $('#dropdown-modality');
            currentTarget = $(e.currentTarget);
            modalityName = currentTarget.find('a').text();
            modalityType = currentTarget.attr('data-val');
            dropdownModality.text(modalityName);
            dropdownModality.attr('data-val', modalityType);
            $('#modality-types-dropdown').removeClass('open').css('left', '-99999px');
        },
        htmlEscapArtifactTitle : function(artifactTitle){
            artifactTitle = artifactTitle.replace(/(\r\n|\n|\r)/gm," ");
               var display_title=artifactTitle.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
               return {'artifact_title' : artifactTitle,
                        'display_title' : display_title}
        },
        importSuccess: function(json_status) {
            var userdata, params, titles, self, disp_msg, artifactType;
            self = this;
            userdata = JSON.parse(json_status.userdata);
            if(userdata) {
                params = {
                    'artifactID': userdata.id
                };
                this.model.fetchArtifact(params).done(function(artifact) {
                    titles = self.htmlEscapArtifactTitle(artifact.title);
                    artifactType = artifact.artifactType;
                    $('#googleDocsModal').foundation('reveal', 'close');
                    disp_msg = "<strong>"+self.gdoc_name+"</strong> was imported successfully and saved with the title <strong>"+titles.display_title+"</strong> in your library.";
                    ModalView.alert(disp_msg, function() {
                        window.location = webroot_url + 'my/library';
                    });
                });
            }
        },
        importError: function(error_info) {
            var result, duplicate_re, is_duplicate, re_info, artifact_type, artifact_title;
            result = error_info.result;
            duplicate_re =  /(.*?)\[(.*?)\]\s+from\[(.*?)\]\s+exists already/g;
            is_duplicate = false;
            if (result){
                re_info = duplicate_re.exec(result);
                if (re_info){
                    is_duplicate = true;
                    artifact_type = re_info[1];
                    if (artifact_type.toLowerCase() == "book" || artifact_type.toLowerCase() == 'flexbook'){
                        artifact_type = 'FlexBook';
                    } else {
                        artifact_type = 'concept';
                    }
                    artifact_title = re_info[2];
                    $('#googleDocsModal .js_dialog_content').removeClass('hide');
                    $('#googleDocsModal .js_dialog_loading').addClass('hide');
                    ModalView.alert('The ' + artifact_type + ' with title <strong>' + artifact_title + ' already exists</strong> in your library. Please use a different title');
                }
            }
            if (!is_duplicate){
                $('#googleDocsModal').foundation('reveal', 'close');
                ModalView.alert('There was a problem while importing selected Google Document.');
            }
        },
        importStartSuccess: function(data) {
            var task_id = data.response.taskID;
            if (this.options.importSuccess) {
                new WordDocModel().taskProcessor({
                    'task_id' : task_id,
                    'gdtImport': true
                }).then(this.options.importSuccess, this.importError);
            } else {
                new WordDocModel().taskProcessor({
                    'task_id' : task_id,
                    'gdtImport': true
                }).then(this.importSuccess, this.importError);
            }
        },
        startGDTImport: function() {
            var self, params, title, id = this.gdoc_id;
            self = this;
            title = $.trim($('#txt_gdoc_title').val());
            if($('.js_list_type_docs').hasClass('selected')){
                this.imported_artifact_type = $.trim($('#dropdown-modality').attr('data-val'));
            } else {
                this.imported_artifact_type = 'book';
            }
            if (!id){
                if ( $('.js_list_type_cols').hasClass('selected')  ){
                    ModalView.alert("Please select a collection to import.");
                } else {
                    ModalView.alert("Please select a document to import.");
                }
                return false;
            }
            if (!title) {
                ModalView.alert("Please add a document to title.");
                return false;
            }
            if ((!Util.validateResourceTitle(title, 'concept', $('#txt_gdoc_title'))) || (this.imported_artifact_type == 'book' && !Util.validateResourceTitle(title, 'artifact', $('#txt_gdoc_title'))) ) {
                return false;
            }
            
            params = {
                'docID': id,
                'title': title,
                'artifactType': this.imported_artifact_type,
                'command':'gdocImport'
            };
            
            this.model.importGoogleDocs(params).done(function(data) {
                self.importStartSuccess(data);
            });
            $('#googleDocsModal .msg').text('Importing Google Document: ' + title);
            $('#googleDocsModal .js_dialog_content').addClass('hide');
            $('#googleDocsModal .js_dialog_loading').removeClass('hide');
        },
        disableModalitySelection: function(e) {
            if ($(e.target).hasClass('disabled')) {
                return false;
            }
        },
        listTypeClick: function(e) {
            if(!$(e.currentTarget).hasClass('selected')) {
                $('.js_help_text').addClass('hide');
                $('.js_list_type').removeClass('selected');
                $(e.currentTarget).addClass('selected');
                if ($(e.currentTarget).hasClass('js_list_type_docs')) {
                    $('.js_help_text_docs').removeClass('hide');
                    $('#modality_type_select').removeClass('hide-important');
                    this.state.docsList = true;
                    this.state.pageNum = 1;
                    this.loadDocList();
                } else {
                    $('.js_help_text_cols').removeClass('hide');
                    $('#modality_type_select').addClass('hide-important');
                    this.state.docsList = false;
                    this.state.pageNum = 1;
                    this.loadDocList();
                }
            }
        },
        selectDocument: function(e) {
            var _gdoc = $(e.currentTarget);
            var title = _gdoc.data('doctitle');
            this.gdoc_id = _gdoc.data('docid');
            this.gdoc_name = title;
            $('.gdoc_item_list a').removeClass('selected');
            _gdoc.addClass('selected');
            $('#txt_gdoc_title').val(title);
        },
        dropdownClose: function(e) {
            if (!$(e.target).hasClass('dropdown')) {
                $('.f-dropdown.open').removeClass('open').css('left', '-99999px');
            } else if (!$(e.target).next().hasClass('open')) {
                $('.f-dropdown.open').removeClass('open').css('left', '-99999px');
            }
        },
        authSuccess: function() {
            this.state.pageNum = 1;
            this.state.docsList = true;
            this.loadDocList();
        },
        authURLSuccess: function(data) {
            if (data.response.googleAuthURL) {
                $('.js_gdoc_auth_link').attr('href', data.response.googleAuthURL);
            }
        },
        checkWindowStatus: function(gauth_win) {
            if (gauth_win.closed) {
                return true;
            }
            return false;
        },
        handleGAuth: function(e) {
            var timer, self, gauth_win, gauth_link = $(e.currentTarget).attr('href');
            self = this;
            gauth_win = window.open(gauth_link, 'gauth_win', 'status=no,titlebar=no,scrollbars=no, menubar=no, location=no, width=500, height=450, resizable=no');
            timer = setInterval(function() {
                if(self.checkWindowStatus(gauth_win)) {
                    clearInterval(timer);
                    self.authSuccess();
                }
            }, 1000);
            return false;
        },
        onLoadDocListSuccess: function() {
            var i, str = '', documents,
            container = $('.gdoc_item_list');
            documents = this.model.toJSON();
            $('.js_gdoc_list_container').removeClass('hide');
            $('.js_gdoc_login_container').addClass('hide');
            if (documents.length) {
                $('#google-docs-paginator').removeClass('hide');
                for (i = 0; i < documents.length; i++) {
                    str += this.googleDocsItemTemplate(documents[i]);
                }
            } else {
                $('#google-docs-paginator').addClass('hide');
                if (this.state.docsList) {
                    str = 'There are no documents to display.';
                } else {
                    str = 'There are no collections to display.';
                }
            }
            container.html(str);
        }
    }, {
        template: TMPL.GOOGLE_DOCS
    });
    return GoogleDocsView;
});
