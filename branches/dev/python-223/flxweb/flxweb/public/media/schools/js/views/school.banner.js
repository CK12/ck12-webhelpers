define([
    'underscore',
    'marionette',
    'schools/templates/templates',
    'common/utils/utils',
    'schools/views/SchoolModals'
], function(_, Mn, TMPL, utils, SchoolModals){
    'use strict';
    var SchoolBannerView = Mn.ItemView.extend({
        modelEvents: {
            'change': 'render'
        },
        events:{
            'click .edit-school-name':'editSchoolName',
            'click .edit-you-school'  : 'editSchoolPage',
            'click .claim-you-school' : 'claimYourSchool',
            'click .claim-school-help-icon' : 'learnClaimSchool',
            'click .school-embed-icon' : 'showEmbedCodeDialog'
        },
        template: _.template(TMPL.SCHOOLBANNER),
        appendSchoolDetails : function(obj){
            obj  = obj || {};
            obj['schoolName'] =  this.model.get('schoolName');
            obj['schoolID']   =  this.model.get('schoolID');
            return obj; // return it as this fn is invoked in arguments of another fn
        },
        el: "#schoolBanner",
        templateHelpers: function(){
            var _this = this;
            return {
                schoolName: utils.toTitleCase(_this.model.get('schoolName'))
            };
        },
        editSchoolName:function (e) {
            SchoolModals.editSchoolName(this.appendSchoolDetails(),function(val,cb){
                console.log(val)
                // call the model to update the school name
                this.model.updateSchoolName(val,cb)
            }.bind(this))
        },
        editSchoolPage: function (e) {
            this.model.toggleEditMode()
        },
        claimYourSchool : function () {
            SchoolModals.claimYourSchool(this.appendSchoolDetails())
        },
        learnClaimSchool : function(){
            SchoolModals.learnClaimSchool(this.appendSchoolDetails());
        },
        showEmbedCodeDialog : function(){
            SchoolModals.showEmbedCodeDialog(this.appendSchoolDetails({
		        url:location.href
            }));
        }
    });
    return SchoolBannerView;
});
