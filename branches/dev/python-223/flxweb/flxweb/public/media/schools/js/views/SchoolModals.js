define([
    'jquery',
    'underscore',
    'backbone',
    'schools/templates/modalTemplates',
    'common/views/modal.view',
    'schools/templates/emailTemplate',
    'schools/services/schoolsADS',
    'schools/services/SchoolCopyEvents'
], function ($, _, Backbone, TMPL, ModalView, emailTemplate, schoolsADS, SchoolCopyEvents) {


    var SchoolModals = ModalView.extend({
        initialize: function(options){
            this.options = $.extend(this.options, {
                showOnOpen: true
            });
            ModalView.prototype.initialize.apply(this);
            this.addClass('modal-external-warn');
            this.isCopySupported =  SchoolCopyEvents.isCopySupported();
        },
        'events': function(){
            return _.extend({}, ModalView.prototype.events(), {
                'click .claim-school-copy-temp-container' : 'onCopyOk',
                'click .claim-school-ok-btn' : 'onClaimPopupOk',
                'click .claim-school-cancel-btn' : 'onClaimPopupCancel',
                'click .learn-claim-school-btn' : 'onCallClaimPopup',
                'click .learn-claim-cancel-btn' : 'onCallClaimPopupCancel',
                'click .embed-copy-btn' : 'onCopyEmbedCode',
                'click .embed-copy-cancel-btn' : 'onCancelCopyEmbedCode'
            });
        },
        //specific for the claim school popup with template
        onCopyOk : function(){
            SchoolCopyEvents.triggerCopyEvent();
        },
        close : function(){
            if( !this.options.blockCloseAds ){
                if( this.options.closeActionName && this.options.schoolName && this.options.schoolID){
                    schoolsADS.logADS(this.options.closeActionName,this.options.schoolName, this.options.schoolID);
                }else{
                    console.error('Incomplete payload for ADS events');
                }
            }

            SchoolCopyEvents.removeCopyEventListener();
            
            ModalView.prototype.close.apply(this);
        },
        onCancelCopyEmbedCode : function(){
            this.close();
        },
        onCopyEmbedCode : function(){
             //ADS event of 'claim_school_embed_copy' and block the close 
            SchoolCopyEvents.triggerCopyEvent()      
            this.close();   
        },
        onClaimPopupOk :  function(){
                if( this.templateCopied){
                    schoolsADS.logADS('claim_school_done',this.options.schoolName, this.options.schoolID);
                    this.close();
                }else{
                    this.claimSchoolCopyFailure();
                }
        },
        onClaimPopupCancel :  function(){
                this.close();
        },
        onCallClaimPopup : function(){
                this.close()
                SchoolModals.claimYourSchool({
                    schoolName:this.options.schoolName, 
                    schoolID: this.options.schoolID
                });
        },
        onCallClaimPopupCancel : function(){
                this.close()
        },
        claimSchoolCopySuccess :  function(){
            var self =  this;
             this.options.blockCloseAds = true; // copy successful, so if the 
            schoolsADS.logADS('claim_school_copy_email',self.options.schoolName, self.options.schoolID);
            this.templateCopied = true;
            this.$template.find('.claim-temp-copy-status').removeClass('failure').addClass('success').text('Email template copied...');
        },
        claimSchoolCopyFailure : function(){
            this.templateCopied = false;
            this.$template.find('.claim-temp-copy-status').removeClass('success').addClass('failure').text('Copy the email template...');
        },
        embedCopySuccess : function(){
             this.options.blockCloseAds =  true;
             schoolsADS.logADS('claim_school_embed_copy',this.options.data.schoolName, this.options.data.schoolID);
        }
    },{
        claimYourSchool : function (data) {
            // should have a title, cpcallback, body should be template ok/cancel should be closing the popup
            var self = this;
            data.isCopySupported = SchoolCopyEvents.isCopySupported();
            var claimYourSchoolModal = new SchoolModals({
                'showOnOpen': true,
                'contentPartial': _.template(TMPL.CLAIMSCHOOLPOPUP,data),
                'headerPartial': "<div class='claim-school-header' >Before you can claim this school page, we need to verify your information</div>",
                'width' : '620px',
                schoolName:  data.schoolName,
                schoolID :  data.schoolID,
                closeActionName : 'claim_school_dismiss'
            });
            claimYourSchoolModal.addClass('modal-uikit-alert modal-uikit-confirm  claim-school-modal');
            SchoolCopyEvents.addCopyEventListener(emailTemplate(data.schoolName),
                function(){
                claimYourSchoolModal.claimSchoolCopySuccess()
            }, function(){
                claimYourSchoolModal.claimSchoolCopyFailure();
            });
            schoolsADS.logADS('claim_school_open',data.schoolName, data.schoolID); //ADS
            return claimYourSchoolModal;

        },
        learnClaimSchool : function(data){
            var leranClaimYourSchoolModal = new SchoolModals({
                'showOnOpen': true,
                'contentPartial': _.template(TMPL.LEARNCLAIMSCHOOLPOPUP,{}),
                'width' : '595px',
                schoolName:  data.schoolName,
                schoolID :  data.schoolID,
                closeActionName : 'claim_school_help_dismiss'
            });
            leranClaimYourSchoolModal.addClass('modal-uikit-alert modal-uikit-confirm  learn-claim-school-modal');
            schoolsADS.logADS('claim_school_help_open',data.schoolName, data.schoolID); //ADS
            return leranClaimYourSchoolModal;     
        },
        showEmbedCodeDialog : function(data){
            var self =  this;
            data.isCopySupported = SchoolCopyEvents.isCopySupported();
            var showEmbedCodeDialogModal = new SchoolModals({
                'showOnOpen': true,
                'headerPartial': "<div class='embed-code-header'>Copy Embed Code</div>",
                'contentPartial': _.template(TMPL.SHOWEMBEDCODEPOPUP,data),
                'width' : '800px',
                schoolName:  data.schoolName,
                schoolID :  data.schoolID,
                closeActionName : 'claim_school_embed_dismiss',
                data:data
            });
            showEmbedCodeDialogModal.addClass('modal-uikit-alert modal-uikit-confirm  embed-code-modal');

            SchoolCopyEvents.addCopyEventListener(showEmbedCodeDialogModal.$template.find('.school-embed-code-area').text().replace(/\&gt/,'>').replace(/\&lt/,'<'),
                function(){
                    showEmbedCodeDialogModal.embedCopySuccess();
                });


            schoolsADS.logADS('claim_school_embed_open',data.schoolName, data.schoolID);
            return showEmbedCodeDialogModal;   
        },
        deleteFlexBook : function (data, callback) { // sugar coating

             var deleteFlexBookModal = new SchoolModals({
                    'showOnOpen': true,
                    'contentPartial': '"Are you sure you want to delete this FlexBook?"',
                    'headerPartial': "Delete FlexBook",
                    'buttons': [
                        {
                            'text': 'OK',
                            'onclick': function () {
                                schoolsADS.logADS('claim_school_remove_book_complete',data.schoolName, data.schoolID);
                                this.options.blockCloseAds =  true;
                                callback();
                                this.close();
                            },
                            'className': 'turquoise modal-uikit-ok'
                        },
                        {
                            'text': 'CANCEL',
                            'onclick': function () {
                                this.close();
                            },
                            'className': 'turquoise modal-uikit-cancel'
                        }
                    ],
                    schoolName:  data.schoolName,
                    schoolID :  data.schoolID,
                    closeActionName : 'claim_school_remove_book_cancel'
                });
                deleteFlexBookModal.addClass('modal-uikit-alert modal-uikit-confirm');
                schoolsADS.logADS('claim_school_remove_book',data.schoolName, data.schoolID);
                return deleteFlexBookModal;
        },
        editSchoolName : function (data,callback) {
            var self = this;
            var editSchoolName = new SchoolModals({
                'showOnOpen': true,
                'contentPartial': _.template(TMPL.EDITSCHNAME,{data:data.schoolName}), //TODO is push it in a template
                'headerPartial': 'School Name',
                'buttons': [
                    {
                        'text': 'SAVE',
                        'onclick': function () {
                            this.options.blockCloseAds = true;
                            callback(document.getElementById('updateSchoolNameField').value);
                            schoolsADS.logADS('claim_school_edit_title_complete',data.schoolName, data.schoolID)
                            this.close();
                        },
                        'className': 'turquoise modal-uikit-ok'
                    },
                    {
                        'text': 'CANCEL',
                        'onclick': function () {
                            this.close();
                        },
                        'className': 'dusty-grey modal-uikit-cancel'
                    }
                ],
                schoolName:  data.schoolName,
                schoolID :  data.schoolID,
                closeActionName : 'claim_school_edit_title_cancel'
            });
            editSchoolName.addClass('modal-uikit-alert modal-uikit-confirm');
            $('#updateSchoolNameField').focus()
            schoolsADS.logADS('claim_school_edit_title',data.schoolName, data.schoolID);
            return editSchoolName;
        },
        updateSchoolBanner : function(){

        }
    });
    return SchoolModals
})
