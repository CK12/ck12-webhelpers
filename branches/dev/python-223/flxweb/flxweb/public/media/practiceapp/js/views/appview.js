define(['jquery', 'backbone'],
function($,Backbone){
    
    var AppView = Backbone.View.extend({
        bindEvents: function(){
            //function to bind additional events
        },
        unbindEvents: function(){
            //to unbind events added by bindEvents
        },
        initialize: function(options){
            var _c = this;
            
            //quick access properties
            _c.controller = options.controller;
            _c.context = _c.controller.appContext;
            _c.config = _c.context.config;
            
            this.$el.html(this.render());
            this.bindEvents();
            
            if(this.postInitialize){
            	this.postInitialize();
            }
        },
        destroy: function(){
            this.off();
            this.unbindEvents();
            this.$el.html("");
        }
    });
    return AppView;
});
