define( [
		'jquery',
        'underscore',
        'backbone',
        'softRegistration/views/PopupView',
        'text!softRegistration/templates/UnderAgeRegConfirm.html'
	] , function($, _, Backbone, PopupView, UnderAgeRegConfirm ){  

	var UnderAgeRegConfirmView =  PopupView.extend({
			defaults : _.extend({}, PopupView.prototype.defaults, {

			}),
            events : _.extend({}, PopupView.prototype.events, {
                "click .popup-close" : "close",
                'click .back-homepage-btn' : 'close'
            }),
            bodyTemplate:  UnderAgeRegConfirm,
			initialize : function(){
                PopupView.prototype.initialize.apply(this);
			},
            close : function(){
                // RegEvents.trigger('SotRegPopupClosed');
                PopupView.prototype.close.apply(this, arguments);
            },
	});

	return UnderAgeRegConfirmView;
})