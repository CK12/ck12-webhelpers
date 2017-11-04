// This is the base class for popups on soft registration
define([ 
	'backbone',
	'underscore',
	'text!softRegistration/templates/base.popup.html'
	], function( Backbone, _ ,  BasePopupTemplate ){

	var	_generateRandomID = function(){
			var str  =  '1234567890';
			var size =  5,
			    len  = str.length,
			    id='';

			for ( var i  = 0; i < size ; i++){
				id += str [ Math.floor(Math.random()*len)]
			}
			return id;   

	};
	var CustomPopupStyle  = function(){
		return 'top:'+getNextTopPositionPopup()+'px';
	}

	function _renderTemplate(config) {
            return _.template(BasePopupTemplate, config);
    };

    function getNextTopPositionPopup(){
    	var offset =  0;
    	var windowHeight = $(window).height();
    	switch(true){
    		case windowHeight < 823 :
    			 offset = Math.max((windowHeight - 668-10), 0);
    		     break;
    		case windowHeight >= 823:
	    		offset = 100;
	    		break; 
    	}
    	return $(window).scrollTop() + offset;

    };

    var scrollTimout;

    function registerCallbackOnScrollEvent(){
    	$(window).on('scroll', function(){
    		if($(window).scrollTop() <= $('body').height() ){
    			clearTimeout(scrollTimout)
    			scrollTimout = setTimeout( function(){
		    		var top  =  parseInt($('.popup-body').css('top'));
		    		var nextTop =  getNextTopPositionPopup();
		    		$('.popup-body').stop();
		    		$('.popup-body').animate({
		    			top: '+='+(nextTop-top)+'px'
		    		},400)
    			}, 100)
    			
    		}	
		})
    }

	var PopupView = Backbone.View.extend({
  		events : {
			"click .popup-close" : "close"
  		},
  		updates:{

  		},
  		defaultValues:{
  			width:0,
  			hideCloseBtn : false
  		},
		initialize : function(){

			_.bindAll(this,'close');
			$(document).bind('keyup', this.handleEnterKeyPress.bind(this)); // TODO investigate why it is not working in events hash

			this.model = this.model || new Backbone.Model();

			if( typeof this.options.width == 'undefined'){
				this.options.width = this.defaultValues.width;
			}

			if( typeof this.options.hideCloseBtn == 'undefined'){
				this.options.hideCloseBtn = this.defaultValues.hideCloseBtn;
			}

			this.segrregateSubTemplates();

            var el =  document.createElement('div');
            
            this.elId =  _generateRandomID();
            el.setAttribute('id', this.elId);
            this.$el = $(el);
            this.render();
            this.appendTemplate();
            

		},
		render : function(options){
			this.options =  _.extend(this.options, this.model.toJSON(), {popupStyle : CustomPopupStyle()});
			// console.log(this.options);
			var bodyTemplate =  _.template(this.bodyTemplate, this.options);
			this.$template =  $( _renderTemplate(_.extend(this.options,{ bodyTemplate:bodyTemplate })));
			this.$el.empty();
			this.$el.append( this.$template );
			registerCallbackOnScrollEvent();
		},
		appendTemplate : function(){
			// $('body').addClass('noscroll');
			$('body').append( this.$el );
		},
		close : function(){
			 this.remove();
			 // $('body').removeClass('noscroll');
		},
		handleEnterKeyPress : function(e){
			// override it
        },
		getOptions : function(){
			return _.extend( this.options, this.model.toJSON());
		},
		// partial update area;
        segrregateSubTemplates :  function(){
            var $template =  $( this.bodyTemplate);
            var $updateCache = this.updates;
            var self = this;
            Object.keys( $updateCache ).forEach( function(event){
                var selectors =  $updateCache[event];
				if( !Array.isArray(selectors) ){
					selectors = [selectors];
				}
				for( var i =0 ; i < selectors.length; i++){
					var selector =  selectors[i];
					var subTemplate = $template.find( selector )[0];

	                if( subTemplate ){
					var outerHTML = $(subTemplate)[0].outerHTML;
					var subTemplateStr =  outerHTML.replace(/\&gt;/g,'>').replace(/\&lt;/g,'<').replace(/\&amp;/g,'&') ;
					
						(function(templateString, selector){
							self.model.on(event, function(data){
		                        var compiled = _.template( templateString )( self.getOptions() );
		//                         console.log(compiled);
		                        $(selector).replaceWith(compiled);
	                        })
						})(subTemplateStr, selector)
	                    
	                }
				}
               
            })
        },
		addClass : function(className){
			this.$template.find('.popup-body').addClass(className)
		}

	});

	return PopupView;

})