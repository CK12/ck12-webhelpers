define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates'
], function($, _, Backbone, Mn, TMPL){
    var GuidelinesView = Mn.ItemView.extend({
        template: _.template(TMPL.ModalGuidelines),
        showGuideline: function(){
            this.$el.find('#showGuidelines').foundation('reveal', 'open');
        }
    });
    return GuidelinesView;
});
