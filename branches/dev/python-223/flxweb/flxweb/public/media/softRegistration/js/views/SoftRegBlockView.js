/**
* The view class for the soft registration view block on the modalities page.
* The only event registered is click for sign-up.
*/

define( [
	'backbone',
	'underscore',
	'softRegistration/RegEvents',
	'text!softRegistration/templates/SoftRegBlock.html'
	], function(Backbone, _, RegEvents,  SoftRegBlockTemplate){

	var ANIMATION_TIMER_IN_MS = 600;
	var scrollTimout;
	var SoftRegBlockView  = Backbone.View.extend({

		// this blocks height is 100px
		template: _.template(SoftRegBlockTemplate),
		el : '#softRegWrapper',
		isSchoolPage: false,
		isForumPage : false,
		schoolBannerSelector : '#schoolBanner',
		forumBannerSelector : '#forumBanner',
		contentPadding : 95,
		contentFinalMargin: 100,
		marginBottomForBanner: 20,
		marginTopForBanner : 1,
		otherBannerMarginTop: 103,
		events: {
            'click .soft-reg-join-btn' : 'navigateForReg',
            'click .soft-reg-sign-in-btn' : 'navigateForSignIn',
            'click .soft-reg-banner-close' : 'handleCloseEvent'
        },
		initialize : function(){
			var path = window.location.pathname;
			this['isSchoolPage'] = /schools/.test(path) ;
			this['isForumPage'] = /forums/.test(path) ;
			this['isCBSEPage']  =  /cbse/.test( path );
			this.render();
		},
		render :  function(){
			var self  = this;
			if( this.$el.children().length > 0 ) { // if it already exists
				return ;
			}

			this.shouldAdjustBannerMargin();
			this.$el.empty();
			this.template = _.template( SoftRegBlockTemplate)(this.options);// TODO : Make sure the template variables are not undefined
			this.$el.append(this.template).show();

			//TODO
			var element  ;
			if( $('#content-container').length>0 ){
				element = $('#content-container');
			}
			if( this.shouldRenderBanner()){
				if( element && this.$el.length >0 ){
					element.animate({'padding-top':'+='+(self.contentPadding + self.marginBottomForBanner)+'px'},ANIMATION_TIMER_IN_MS);
				    this.$el.animate({'margin-top':'+='+self.contentFinalMargin+'px'}, { duration : ANIMATION_TIMER_IN_MS, complete: function(){
				    	self.$el.css({'z-index': 100});
				    }});
						//fallback. Not sure why Jquery does not call the callback in case the element is outside viewport  # BUG -51769
						setTimeout( function(){
								self.$el.css({'z-index': 100});
						}, ANIMATION_TIMER_IN_MS);

				}else{
					console.warn(' no element found in body area ')
				}
			}else{
				this.$el.hide();
			}
		},
		shouldRenderBanner : function(){
			return true;// condition for future
		},
		navigateForReg : function(){
			RegEvents.trigger('raiseEventForReg', 'BANNER');
			this.closeBanner();
		},
		navigateForSignIn : function(){
			RegEvents.trigger('raiseEventForSignIn', 'BANNER');
			this.closeBanner();
		},
		handleCloseEvent : function(){
			RegEvents.trigger('raiseEventForClose', 'BANNER');
			this.closeBanner();
		},
		isMaintainenceBannerPresent : function(){
			return  $('#maintenanceWrapper').children().length > 0 ;
		},
		isCBSEBannerPresent  : function(){
			return $('#cbseBanner').children().length > 0 && this['isCBSEPage'];
		},
		isSchoolBannerPresent :  function(){
			return this[ 'isSchoolPage' ];
		},
		isForumBannerPresent :  function(){
			return this[ 'isForumPage' ];
		},
		adjustBannerMargin : function( val , height){
			var self = this;
			if( typeof val ==  'undefined ') return;

			// change initial margin-top
			// so that the animation starting point is adjusted accordingly
			this.$el.css('margin-top', parseInt( this.$el.css('margin-top') ) - val);

			// contentFinalMargin is the value with which the ER banner needs to be animated
			// there are two conditions
			// 1. if the present banner is visible in the viewport, then add the height present for the banner in the  viewport
			// 2. if the present banner is not visible , then  do not add any height

			this.contentFinalMargin -= (($(window).scrollTop() >= height) ? 0 :  ($(window).scrollTop() - val ));

		},
		shouldAdjustBannerMargin : function(){
			var maintainenceBannerHeight  =  67; // 67
			var forumBannerHeight   = 100; // 100
			var schoolBannerHeight  =  185; // 180 + 30 margin-bottom
			var cbseBannerHeight    =  90;
			var height  = 0 ;
			var self = this;

			if( this.isMaintainenceBannerPresent() ){
				height +=  maintainenceBannerHeight;
				this.adjustBannerMargin(maintainenceBannerHeight, height);
				$('#maintenanceWrapper').on('content:removed', function(){
						console.log('maintenanceWrapper removed');
						height -= maintainenceBannerHeight;
				});// ADDED FOR ER banner placement adjustment
			}
			if( this.isSchoolBannerPresent()){
				height += schoolBannerHeight;
				this.adjustBannerMargin(schoolBannerHeight, height);
				// very specific to school page banner
				$('#schoolBanner').css('margin-bottom', 5);
			}
			if( this.isForumBannerPresent()){
				height += forumBannerHeight;
				this.adjustBannerMargin(forumBannerHeight, height);
			}
			if( this.isCBSEBannerPresent()){
				height += cbseBannerHeight;
				this.adjustBannerMargin( cbseBannerHeight, height);
			}
			console.log(height);
			if( height > 0 ){
				$(window).on('scroll', function(){
		    			var marginTop =  - Math.min( $(window).scrollTop(), height ) ;
			    		self.$el.stop();
			    		self.$el.animate({
			    			'margin-top': marginTop+'px'
			    		}, 0)
				})
			}
		},
		animateUpBanners : function(){
			if( this['isSchoolPage'] ){
				$(this['schoolBannerSelector']).animate({
					'margin-top':'-='+this.otherBannerMarginTop+'px'
				}, ANIMATION_TIMER_IN_MS)
			}else if( this['isForumPage']){
				$(this['forumBannerSelector']).animate({
					'margin-top':'-='+this.otherBannerMarginTop+'px'
				}, ANIMATION_TIMER_IN_MS)
			}
		},
		closeBanner : function(immediate){
			var self = this;
			var element  ;
			if( $('#content-container').length>0 ){
				element = $('#content-container');
			}
			if( element && this.$el.length >0 ){
				// this.animateUpBanners();
				element.animate({'padding-top':'-='+(self.contentPadding + self.marginBottomForBanner)+'px'},ANIMATION_TIMER_IN_MS);
			}else{
				console.warn(' no element found in body area ');
			}

			this.$el.css({'z-index':-1});
			var self = this;
			this.$el.animate({'margin-top':'-='+self.contentFinalMargin+'px'}, ANIMATION_TIMER_IN_MS, function(){
				this.remove();
			});
		},
		remove: function(){
			this.$el.empty();
			this.stopListening();
		}
	});

	return SoftRegBlockView;

})
