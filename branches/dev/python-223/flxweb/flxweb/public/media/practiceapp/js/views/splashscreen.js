define([
    'jquery',
    'underscore',
    'practiceapp/views/appview',
    'practiceapp/templates/templates'
],
function($, _, AppView, Templates){
    var SplashScreenView = AppView.extend({
        events: {
        },
        tmpl: _.template(Templates.SPLASH_SCREEN, null, {'variable':'data'}),
        render: function(){
            var app_name = null;
            if ( (this.config.lms_provider || this.config.provider == 'athena') && this.config.app_display_name){
                app_name = this.config.app_display_name.replace("CK-12 ","");
            } else if ( this.config.provider == 'google' ) {
                app_name = 'google';
            }
            return $(this.tmpl({
                'splash_img': this.config.splash_img,
                'app_name': app_name
            }));
	    var splash = $(this.tmpl({'splash_img': "../../images/logock12footerhov.png"}));
		
	    window.setTimeout(function(){
	      console.log("Doing setTimeout");
	      splash.find(".splashscreen-message-container p").removeClass("hide");
	    },3000);
            return splash;

        }
    });
    
    return SplashScreenView;
});
