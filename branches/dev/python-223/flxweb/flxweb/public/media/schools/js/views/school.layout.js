define([
    'backbone',
    'underscore',
    'marionette',
    'schools/templates/templates'
], function(Backbone, _, Marionette, TMPL){
    var SchoolLayoutView = Marionette.LayoutView.extend({
        template : _.template(TMPL.MAIN),
        el : "#schoolMain",
        regions: {
            'list': "#schoolList",
            'stateSelector' : "#stateSelector"
        }
    });
    return SchoolLayoutView;
});