define([
	'backbone',
    'jquery',
    'underscore',
    'common/views/modal.view',
    'library/templates/library.templates',
    'common/utils/utils',
    'jquery.fileupload'
], function(Backbone, $, _, ModalView, TMPL, Util) {
    'use strict';
    var WordDocsView = Backbone.View.extend({
        events: {
        	'change #txt_xdt_title': 'titleCheck',
        	'click #js_addfromword_confirm': 'startXDTImport',
        	'submit #js_xdtupload_form': 'startXDTImport',
        	'click #modality-types-dropdown-docs .js-dropdown-element': 'selectModality',
        },
        initialize: function(){
        	_.bindAll(this, "fileAdd", "titleCheck", "validate", "startXDTImport", "importStartSuccess", "importStartError",
        			"importSuccess", "importError", "selectModality");
        	this.render();
        },
        selectModality: function(e) {
        	var currentTarget, dropdownModality, modalityName, modalityType;
        	dropdownModality = $('#dropdown-modality');
        	currentTarget = $(e.currentTarget);
        	modalityName = currentTarget.find('a').text();
        	modalityType = currentTarget.attr('data-val');
        	$('#artifactType').val(modalityType);
        	dropdownModality.text(modalityName);
        	dropdownModality.attr('data-val', modalityType);
        	$('#modality-types-dropdown-docs').removeClass('open').css('left', '-99999px');
        },
        render: function() {
            var fileupload;
            this.$el.html(WordDocsView.template);
            $('.content-type-dropdown').removeClass('open').css('left', '-99999px');
            $('#wordDocsModal').foundation('reveal', 'open');
            fileupload = $(".xdtimport_container").fileupload({
                'dataType' : 'json',
                'acceptFileTypes' : /(\.|\/)(docx?)$/i,
                'replaceFileInput': false,
                'add': this.fileAdd,
                'done': this.importStartSuccess,
                'fail': this.importStartError
            });
            return this;
        },
        fileAdd: function(e, data) {
        	var filename, current_txt_title, txt_title = $('#txt_xdt_title');
            filename = data.files[0].name;
            if ( filename.toLowerCase().substr(filename.length -5) == '.docx' ){
                $('.js_xdt_filecontainer').find('.error').addClass('hide');
                $('.js_xdt_titlecontainer').find('.error').addClass('hide');
                if ( ! $.trim( txt_title.val() ) ){
                    txt_title.val(filename);
                }
                current_txt_title = $.trim(txt_title.val());
                if((this.model.old_txt_title == current_txt_title) && (this.model.old_filename == this.model.old_txt_title)) {
                    txt_title.val(filename);
                }
                current_txt_title = $.trim(txt_title.val());
                this.model.old_txt_title = current_txt_title;
                this.model.old_filename = filename;
                this.model.xdt_data = data;
            } else {
                $('.js_xdt_filecontainer').find('.error').removeClass('hide');
            }
        },
        titleCheck: function() {
            if (! $.trim($("#txt_xdt_title").val()) ){
                $('.js_xdt_titlecontainer').find('.error').removeClass('hide');
            } else {
                $('.js_xdt_titlecontainer').find('.error').addClass('hide');
            }
        },
        validate: function() {
        	var valid = true;
            if (! $.trim($("#txt_xdt_title").val()) ){
                $('.js_xdt_titlecontainer').find('.error').removeClass('hide');
                valid = false;
            }
            
            if (! $("#file_xdt_upload").val() ){
                $('.js_xdt_filecontainer').find('.error').removeClass('hide');
                valid = false;
            }
            if (valid){
            	valid = Util.validateResourceTitle($("#txt_xdt_title").val(), 'concept', $("#txt_xdt_title"));
            }
            return valid;
        },
        startXDTImport: function() {
            if (!this.validate()){
                return false;
            }
            if (this.model.xdt_data){
                $('.xdtimport_container').find('.js_dialog_loading .msg').html("Importing "+ this.model.xdt_data.files[0].name);
                this.model.xdt_data.submit();
                $('#wordDocsModal .js_dlg_content').addClass('hide');
                $('#wordDocsModal .js_dialog_loading').removeClass('hide');
            }
            return false;
        },
        importStartSuccess: function(e, data) {
            var task_id = data.result.taskID;
            this.model.taskProcessor({
                'task_id' : task_id
            }).then(this.importSuccess, this.importError);
        },
        importStartError: function(e, data) {
        	$('#wordDocsModal .js_dlg_content').removeClass('hide');
            $('#wordDocsModal .js_dialog_loading').addClass('hide');
        	ModalView.alert("Could not import word document. Error:" + data.errorThrown);
        },
        importSuccess: function(json_status) {
            var disp_msg, userdata = json_status.userdata;
            if(userdata) {
            	$('#wordDocsModal').foundation('reveal','close');
            	disp_msg = this.model.xdt_data.files[0].name + " was imported successfully and saved with the title " + $("#txt_xdt_title").val() + " in your library.";
            	ModalView.alert(disp_msg, function() {
            	    window.location = webroot_url + 'my/library';
            	});
            }
        },
        importError: function(error_info) {
            var result = error_info.result;
            var duplicate_re =  /(.*?)\[(.*?)\]\s+from\[(.*?)\]\s+exists already/g;
            var is_duplicate = false;
            if (result){
                var re_info = duplicate_re.exec(result);
                if (re_info){
                    is_duplicate = true;
                    var artifact_type = re_info[1];
                    if (artifact_type.toLowerCase() == "book" || artifact_type.toLowerCase() == 'flexbook'){
                        artifact_type = 'FlexBook';
                    } else {
                        artifact_type = 'concept';
                    }
                    var artifact_title = re_info[2];
                    $('.js_dlg_content').removeClass('hide');
                    $('#wordDocsModal .js_dlg_content').removeClass('hide');
                    $('#wordDocsModal .js_dialog_loading').addClass('hide');
                    ModalView.alert("The" + artifact_type + "with title <strong>" + artifact_title + " already exists</strong> in your library. Please use a different title.");
                }
            }
            if (!is_duplicate){
            	$('#wordDocsModal .js_dlg_content').removeClass('hide');
                $('#wordDocsModal .js_dialog_loading').addClass('hide');
            	ModalView.alert("Word document import failed with errors.");
            }
        }
    }, {
        template: TMPL.WORD_DOCS
    });
    return WordDocsView;
});
