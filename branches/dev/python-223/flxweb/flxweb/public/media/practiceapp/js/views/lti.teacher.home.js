define([
    "jquery",
    "underscore",
    "athenaapp/views/edit",
    "common/utils/url",
    "practiceapp/views/lti.library.view",
    "embed/utils/embed.helper",
    'common/utils/walkthrough'
], function($, _, EditView, URLUtil, LTILibraryView, EmbedHelper, Walkthrough){
    var embedParams = "&utm_source=viewer&utm_medium=embed&utm_campaign=LTIApp"; // FOR GA CAMPAIGN
    var LTITeacherHomeView = EditView.extend({
        modalityTypes : "lesson,lecture,enrichment,asmtpractice,asmtquiz,exerciseint,quizans,quizdemo,quiz,rwa",
        modalityFilters: "text,multimedia,assessment,real_world",
        conceptDataWrapperWidth: "54%",
        libraryView: null,
        libraryContainer: null,
        excludeBooks: true,
        events: function(){ 
            var parentEvents = EditView.prototype.events;
            if(_.isFunction(parentEvents)){
                parentEvents = parentEvents();
            }
            return $.extend({},parentEvents,{
                'click #library-show': 'onLibraryClick',
                'click #library-back': 'hideLibrary',
                'click.walktrough .walkthrough-link': 'adaptiveWalkthrough',
                'click .new-flow-link': 'triggerNewFlow'
            });
        },
        initialize: function(options){
            console.log("Initializing LTI Teacher home view");
            var appContext, that = this;
            EditView.prototype.initialize.apply(this, arguments);
            that.showLibraryLink();
	    that.showNewFlowLink();
            that.libraryContainer = that.$("#library-container");
            _.bindAll(this, 'onAssign', 'showModalityEmbed');
            that.controller.setTitle("");
        },
        setEmbedURI: function (embedURI, artifactID, contextEID, title, collection_info) {
            var controller = this.controller;
            var provider = controller.appContext.config.provider;
            var url = new URLUtil(embedURI);
            var extraParams = url.hash_params;
            extraParams.artifactID = artifactID;
            if (collection_info) {
              extraParams.collectionHandle = collection_info.collectionHandle;
              extraParams.conceptCollectionHandle = collection_info.conceptCollectionHandle;
              extraParams.conceptCollectionAbsoluteHandle = collection_info.conceptCollectionAbsoluteHandle;
              extraParams.collectionCreatorID = collection_info.collectionCreatorID;
            }
            console.log(url);
            if (url.hash_params.mtype =="asmtquiz"){
                this.trigger('assignConcept', {
                    current_concept: {
                        eid: String(artifactID),
                        title: title,
                        handle: url.hash_params.handle,
                        extraParams: extraParams
                    }
                });
	    } else if (url.hash_params.mtype == "asmtpractice"){
                this.trigger('assignConcept', {
                    current_concept: {
                        eid: contextEID,
                        title:  title ? title : url.hash_params.handle,
                        handle: url.hash_params.context,
                        extraParams: extraParams
                    }
                });
            } else {
                // check if embedURI is http or https
                if (embedURI.substr(0,5)[4] === ":") {
                    embedURI = "https" + embedURI.substr(4);
                }
                // add additional params
                //embedURI += "&nochrome=true";
                embedURI += "&app_context="+provider;
                embedURI += embedParams;
                this.trigger("setURI", {
                    uri: embedURI,
                    title: title,
                    artifactID: artifactID,
                    extraParams: extraParams
                }); // 
                controller.dexterjs.logEvent("LTI_MODALITY_INSERT", {
                    artifactID: artifactID,
                    context_eid: contextEID
                });
            }
        },
        walkthroughRender : function(){
	    if($("body").find("#walkthrough").length === 0){
	        $('body').prepend('<div id="walkthrough"></div>');
                        Walkthrough.init({
                                container: '#walkthrough',
                                context : this.context.appName
                        });
                }
        },
        adaptiveWalkthrough: function() {
                 this.walkthroughRender();
                 $("#walkthrough").removeClass("hide");
        },
	triggerNewFlow: function(){
	    this.trigger('tryNewFlow');
	},
        initializeLibrary: function(){
            console.log("!! here");
            this.libraryView = new LTILibraryView({
                'el': this.libraryContainer
            });
            console.log(this.libraryView);
            this.libraryView.render();
            this.libraryView.bind('assign', this.onAssign);
            this.libraryView.bind('showEmbedView', this.showModalityEmbed);
        },
        hideLibrary: function(){
            $("#library_btn").removeClass("hide");
            $("#library_back_container").addClass("hide");
            $(".assignment-subject-list").removeClass("hide");
            $("#library-container").addClass("hide");
            $('#'+$('.js-group-assignment-nav.selected').data('target')).removeClass('hide')
            $("#groups-assignment-container").removeClass("library_mode");
        },
        onLibraryClick: function(){
            console.log("Library clicked...");
            if (!this.libraryView){
                this.initializeLibrary();
            }
            if ($("#assignment-search-input") && $("#assignment-search-input").is(":visible")){
                $(".js-search-close").trigger('click');
            } 
            $("#library_btn").addClass("hide");
            $("#library_back_container").removeClass("hide");
            $(".assignment-subject-list").addClass("hide");
            $("#library-container").removeClass("hide").siblings().addClass("hide");
            $("#groups-assignment-container").addClass("library_mode");
            $("#library_files_container").addClass("hide");

            this.controller.dexterjs.logEvent("FBS_MY_LIBRARY");

            return false;
        },
        showLibraryLink: function(){
            if (this.controller.appContext.libraryID){
                this.$("#library-link-container").removeClass('hide');
            }
        },
        showNewFlowLink: function(){
	    var lms_name = this.controller.getLMSName();
            if (this.controller.appContext.config.enabled_new_flow.indexOf(lms_name) !=-1){
                this.$("#new-app-flow").removeClass('hide');
                this.$("#new-app-flow").addClass('walkthrough-link-cont');
            }
        },
        
        onAssign: function(assignData){
            console.log(assignData);
            
            var collection_info = null;
            var encodedID = assignData.domaineid? assignData.domaineid : null; 
            var embedURI = EmbedHelper.getModalityEmbedUrl({
                modality_type: assignData.mtype,
                modality_handle: assignData.handle,
                modality_realm: assignData.realm,
                nochrome: true,
                hideConceptLink: true
            });
            if (assignData.mtype === 'asmtquiz' && assignData.collectionHandle) {
                collection_info = {};
                collection_info.collectionHandle = assignData.collectionHandle;
                collection_info.conceptCollectionHandle = assignData.conceptCollectionHandle;
                collection_info.conceptCollectionAbsoluteHandle = assignData.conceptCollectionAbsoluteHandle;
                collection_info.collectionCreatorID = assignData.collectionCreatorID;
            }
            this.setEmbedURI(embedURI, assignData.artifactid, encodedID, assignData.title, collection_info);
        },
        showModalityEmbed : function(assignData){
            var that = this, 
                embedURI = EmbedHelper.getModalityEmbedUrl({
                    modality_type: assignData.mtype,
                    modality_handle: assignData.handle,
                    modality_realm: assignData.realm,
                    nochrome: true
                });
            EditView.renderEmbedView(embedURI, {
                css: {
                    "margin-top": "30px"
                },
                onopen: function() {
                    window.addEventListener("message", that.messageListener);
                    window.addEventListener("resize", EditView.resizeIframe);
                    window.scrollTo(0,0);
                },
                onclose: function() {
                    window.removeEventListener("message", that.messageListener);
                    window.removeEventListener("resize", EditView.resizeIframe);
                    that.trigger("editIframeClosed"); // finished or iframe closed
                }
            });
        },
        renderEmptyLibrary: function(){
            
        }
    });
    return LTITeacherHomeView;
});
