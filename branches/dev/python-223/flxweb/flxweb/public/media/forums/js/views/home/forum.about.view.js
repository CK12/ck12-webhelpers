define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates'
], function($, _, Backbone, Mn, TMPL){
    var ForumAboutView = Mn.ItemView.extend({
        template: _.template(TMPL.ForumAbout),
        modelEvents: {
            'change': 'fieldsChanged'
        },
        fieldsChanged: function(){
            this.render();
        }
    });
    return ForumAboutView;
});
