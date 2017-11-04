define([
    'backbone',
    'underscore',
    'jquery',
    'base64',
    'library/templates/library.templates',
    'library/views/library.resource.editor',
    'common/utils/utils',
    'modality/services/services',
    'ltiBridge'
], function(Backbone, _, $, Base64 ,TMPL, ResourceEditor,utils,ModalityServices, ltiBridge){
    'use strict';
    var LibraryItemView = Backbone.View.extend({
        events: {
        	'click.options     .more-options': "openDropdown",
            'click.archive  .js_archive': "archive",
            'click.edit     .mylibrary_edit': "edit",
            'click.preview     .mylibrary_preview': "previewQuiz",
            'click.copy_menu     .mylibrary_copy': "copyQuizOptionMenu",
            'change.edit .library-row-checkbox': "selectRow",
            'click.view .description-link': 'showDescirption',
            'click.lms_interactive #lms_plix' : 'handleLMSInteractiveAssign',// For LMS context plix
            'click.lms_interactive #lms_simulation' : 'handleLMSInteractiveAssign'// For LMS context simulation
        },
        initialize: function(options){
            _.bindAll(this, "archive", "edit", "render", "update","previewQuiz" , "copyQuiz" ,"copyTest","copyQuizOptionMenu","showCopyTestError");
            this.model.bind('change', this.update);
            $(window).off('resize.draft').on('resize.draft', function(){
                if(window.innerWidth < 768) {
                    $('.library-edit-dropdown:visible').removeClass('open').css('left', '-99999px');
                }
            });
            $('body').off('click.drop').on('click.drop', function(){
                if('.more-options-dropdown-wrapper.open') {
                    $('.more-options-dropdown-wrapper.open').removeClass('open').addClass('hide');
                }
            });
            if($('#copyQuizModal').length === 0){
            	 $('body').append(TMPL.COPY_QUIZ_MODAL);
            }
            $('.js-size-dropdown').off('click.dropdown').on('click.dropdown',function(e){
            	if(!$(this).parent().parent().find('.more-options-dropdown-wrapper').hasClass('open'))
            	e.stopPropagation();
            	$(this).parent().parent().find('.more-options-dropdown-wrapper').removeClass('hide').addClass('open');
            });
            $('#copyTest').off('click.copyQuiz').on('click.copyQuiz',this.copyQuiz);
            $('.close-modal').off('click.close').on('click.close',function(){
            	if($(this).hasClass("disabled")){
            		return false;
            	}else{
            	   	$("#copyQuizModal").foundation("reveal", "close");
                	$("#quizPreviewModal").foundation("reveal", "close");
                	$('#quizPreviewModal').find('iframe').attr('src',"");
                	$('#quizPreviewModal .view-type').removeClass('quiz-desktop quiz-iphone-portrait quiz-iphone-landscape quiz-ipad-landscape quiz-ipad-portrait').addClass('quiz-desktop')
                	$('#quizPreviewModal .js-size-dropdown').html('Desktop');
                	$("#copyQuizModal").find(".message").addClass("hide").removeClass("color-wrong").html("");
                	$("#closeCopyModal").removeClass("disabled");
                	$(".testTitle").val("").removeClass("invalid");
            	}
            
            });
            $('#quizPreviewModal .js-dropdown-element').off('click.changeView').on('click.changeView',function(e){
            	var viewClass = $(this).attr('data-item'),
            		name = $(this).html();
            	$('#quizPreviewModal .view-type').removeClass('quiz-desktop quiz-iphone-portrait quiz-iphone-landscape quiz-ipad-landscape quiz-ipad-portrait').addClass(viewClass)
            	$('#quizPreviewModal .js-size-dropdown').html(name);
            });
            $(document).on('click', '.reveal-modal-bg', function (e) {
	            	$('#quizPreviewModal').find('iframe').attr('src',"");
	            	$('#quizPreviewModal .view-type').removeClass('quiz-desktop quiz-iphone-portrait quiz-iphone-landscape quiz-ipad-landscape quiz-ipad-portrait').addClass('quiz-desktop')
	            	$('#quizPreviewModal .js-size-dropdown').html('Desktop');
	            	$("#copyQuizModal").find(".message").addClass("hide").removeClass("color-wrong").html("");
	            	$("#closeCopyModal").removeClass("disabled");
	            	$(".testTitle").val("").removeClass("invalid");
	        	   	$("#copyQuizModal").foundation("reveal", "close");
	            	$("#quizPreviewModal").foundation("reveal", "close");
            	});
            //console.log(this.model);
            //console.log(this.model.get('modalityGroupInfo'));
            this.itemTemplate = LibraryItemView.template;
            if (options.rowItemTemplate){
                this.itemTemplate = _.template(options.rowItemTemplate, null, {'variable':'data'})
            }
        },
        openDropdown:function(e){
        	var target = $(e.target),
        		dropdownBox = $(e.currentTarget).parent().find('.more-options-dropdown-wrapper');
        	if(!dropdownBox.hasClass('open')){
            	dropdownBox.removeClass('hide');
            	setTimeout(function(){
            		dropdownBox.addClass('open');
            	},10);
        	}
        },
        copyQuizOptionMenu:function(e){
        	$("#copyQuizModal").foundation("reveal", "open");
        	window.editUrlValue = $(e.currentTarget).parent().find('.mylibrary_edit').attr("href") ;
        	window.perma = this.model.attributes.perma ;
        },
        copyQuiz:function(e){
    		var that = this, testTitle = $("#copyQuizModal").find(".testTitle").val(),
    			editUrlValue = window.editUrlValue,
    			perma = window.perma;
    		
    		if($.trim(testTitle) === ""){
    			$("#copyQuizModal").find(".message").removeClass("hide").addClass("color-wrong").html("Please provide a title first");
    			$(".testTitle").addClass("invalid");
    			return false;
    		} else {
                //var validationRegex = $("#copyTestModal").find(".testTitle").attr('data-validate');
                var validationRegex = /^[\/\\]*$/;
                if (typeof validationRegex !== 'undefined' && validationRegex != false) {
                    var regex = new RegExp(validationRegex);
                    if (($.trim(testTitle).toLowerCase().indexOf('/')!= -1)){
                        $("#copyQuizModal").find(".message").removeClass("hide").addClass("color-wrong").html("Invalid characters in the Title");
                        $(".testTitle").addClass("invalid");
                        return false;
                    }
                }
            }
    		
    		
    		$("#copyQuizModal").find(".message").addClass("hide");
    		$("#loadingTemplate").removeClass('hide');
    		$(".testTitle").removeClass("invalid");
    		$("#closeCopyModal").addClass("disabled");
    		if(this.validateCopyTestTitle(testTitle)){
    			this.copyTest({
        			"title" : testTitle,
        			"description" : "",
        			"handle" : "",
        			"url": editUrlValue,
        			"perma":perma,
        			"success" : function(response){
        				$("#closeCopyModal").removeClass("disabled");
        				$("#copyQuizModal").find("#loadingTemplate").addClass('hide');
        				$("#copyQuizModal").find(".message").html("").removeClass("hide color-wrong color-correct").html("Quiz copied successfully with title " + _.escape(response.test.title));
        				$("#copyTest").addClass("hide");
        				$("#closeCopyModal").removeClass("dusty-grey").addClass("tangerine").html("OK");
        				$(".testTitle").removeClass("invalid").val("");
        				$(".title-row").addClass("hide");
        				$("#copyQuizModal").find(".close-modal").val("Close");
        				
        				/**Write code to update view*/
        				var href = "/editor//test/quiz/"+response.test.encodedIDs[0]+"/"+response.test.handle+"/user:"+response.test.owner.login+"?referrer=my_content" ;
        					window.location.href = href;
        				
        			},
        			"error" : function(response){
                        that.showCopyTestError(response);
        			}
        		});
    		}
        },
        validateCopyTestTitle: function(title){
        	/*var regEx = /.*<.*>.;*/
        	var mssg = "The quiz title should not contain special characters like '<' and '>'. Please enter a different title.";
        	if(title.indexOf("<") >=0 || title.indexOf(">") >= 0){
        		this.showCopyTestError({
        			message : mssg
        		});
        		return false;
        	}
        	return true;
        },
        showCopyTestError : function(response) {
            $("#copyQuizModal").find(".message").removeClass("hide").addClass("color-wrong").html(response.message);
            $("#loadingTemplate").addClass("hide");
            $("#closeCopyModal").removeClass("disabled");
            $(".testTitle").addClass("invalid");
        },
		copyTest : function(settings){
			var that = this, impersonateMemberID = utils.gup("impersonateMemberID", settings.url).impersonateMemberID || "",
				data = {
						"title" : Base64.base64encode(settings.title),
						"handle" : settings.handle
					};
			
			if(impersonateMemberID !== ""){
				data["impersonateMemberID"] = impersonateMemberID; 
			}
			var hashParam = settings.perma;
			var testInfo = ModalityServices.getQuizInfo(hashParam);
			$.when(testInfo).done(function(testData){
                if (testData.test == null) {
                    that.showCopyTestError(testData);
                    return;
                }
				ModalityServices.copyTest({
					"testId" : testData.test._id,
					"data" : data,
					"success" : settings.success,
					"error" : settings.error
				});
			});
	
		},
        previewQuiz:function(e){
        	$('#quizPreviewModal').find('iframe').attr('src',"");
        	$("#quizPreviewModal").foundation("reveal", "open");
        	var testInfo = ModalityServices.getQuizInfo(this.model.attributes.perma, true);
        	$.when(testInfo).done(function(testData){
        		$('#quizPreviewModal').find('iframe').attr('src','/assessment/ui/?test/view/quiz/'+testData.test.handle+'/user:' + encodeURIComponent(testData.test.owner.login) + '&preview=true');
			});
        	
        	
        },
        update : function(){
            var updated_content = $( this.itemTemplate( this.model.toJSON()) ).html();
            this.$el.html(updated_content);
        },
        render: function(){
	    var data = this.model.toJSON();
	    if (window.lmsContext === 'lti-app' && (data.artifactType === 'plix' | data.artifactType === 'simulationint')) {
	        data.lmsContext = true;
	    }
            this.setElement($( this.itemTemplate( data ) ));
            return this;
        },
        archive: function(){
            var dataObj, systemLabels = [], labels = [];
            this.$('.js_archive').parents('.js-listitem').find('.labels').each(function() {
                if ($(this).attr('data-systemLabel') === '1') {
                    systemLabels.push($(this).attr('data-label'));
                } else {
                    labels.push($(this).attr('data-label'));
                }
            });
            labels.push('archived');
            dataObj = {
                    'itemtype': this.$('.js_archive').data('itemtype'),
                    'revisionid': this.$('.js_archive').data('revisionid'),
                    'systemLabels': systemLabels,
                    'labels': labels
            };
            this.trigger('archive', dataObj);
            return false;
        },
        edit: function(e){
            if (!this.model.get('artifactID')){
                e.preventDefault();
                new ResourceEditor({
                    model: this.model
                });
                return false;
            }
        },
        selectRow: function() {
            if ($('#library-items-list').find(':checkbox:checked').length) {
                $('#dropdown-label').removeClass('button-disabled').addClass('turquoise');
            } else {
                $('#dropdown-label').addClass('button-disabled').removeClass('turquoise');
            }
        },
        showDescirption: function(e) {
            var $this = $(e.currentTarget);
            $this.siblings('.item_description').toggleClass('hide');
            $this.find('.icon-arrow-up').toggleClass('expand-arrow');
            if (window._ck12) {
                _ck12.logEvent('FBS_USER_ACTION', {
                    'memberID': window.ads_userid,
                    'desc': 'FBS_VIEW_DESCRIPTION'
                });
            }
        },
        handleLMSInteractiveAssign: function(e){
            e.preventDefault();
            var _href = e.target.href;
            var other_window = window.open(_href,'lms-context-ref');
	    var LTIBridge = new ltiBridge();
	    // Let lms bridge listen for postmessage from other window
	    try {
                LTIBridge.postMessageAssign(other_window);
	    } catch(e) {
		console.log("Error on create assignment via postmessage:" + String(e));
	    }
	}
    },{
        template: TMPL.LIBRARY_ITEM
    });
    return LibraryItemView;
});
