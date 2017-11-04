define([
    'jquery',
    'underscore',
    'practiceapp/views/appview',
    'practiceapp/templates/templates',
    'common/services/support',
],
function($, _, AppView, Templates, Support){
    var ErrorPageView = AppView.extend({
        initialize: function(options){

            this.errorID = new Date().getTime();
            var errorLog = {'errorID':this.errorID,'error': this.options.errorMsg, 'url':window.location.href,'ref':document.referrer};
            console.log(JSON.stringify(errorLog));
            // Logging for trackJS
            if (window.trackJs){
                window.trackJs.track('error:' + JSON.stringify(this.options.errorMsg));
            }
            ErrorPageView.__super__.initialize.apply(this, arguments); // run parent class init first
        },
        events:  function(){

            return _.extend({},AppView.prototype.events, {
                'click #contact-support': 'contactSupport',
                'click #show-debug': 'showDebugInfo'
                
            });
        },
        tmpl: _.template(Templates.ERROR_PAGE,null, {'variable':'data'}),
        render: function(){
            var tmpl_data = {'errorMsg': this.options.errorMsg};

            if (this.options.ltiAuthFailure){
                tmpl_data.ltiAuthFailure = this.options.ltiAuthFailure;
            }
            if (this.options.isAdmin){
                tmpl_data._isAdmin = this.options.isAdmin;
            }
            if (this.options.hideSupportButton){
                tmpl_data.hideSupportButton = this.options.hideSupportButton;
            }
	    if (this.options.bannerText){
		tmpl_data.banner_text = this.options.bannerText;
            }
            if (this.options.noCookies){
                tmpl_data.banner_text = this.options.errorMsg;
                tmpl_data.noCookies = this.options.noCookies;
                tmpl_data.hideSupportButton = true;
            }
            var errorPage = $(this.tmpl(tmpl_data));
            return errorPage;
        },
        showDebugInfo: function(){
            console.log("Toggle error message");
            $('.error_msg_text').toggleClass("hide");
        },
        contactSupport: function(){
            var timestamp = new Date().getTime();
            var errorData = {
                'body': {msg: this.options.errorMsg,
                         'error_type': 'LMS Launch Error',
	                 'errorID': this.errorID},
                'subject': 'LTI Launch Error: ' + this.errorID,
                'senderName': this.options.senderName,
                'senderEmail': this.options.senderEmail,
                'httpstatus': '500'
            };
            Support.contactSupport(errorData); 
        }
    });
    
    return ErrorPageView;
});
