define([
    'underscore',
    'marionette',
    'forums/templates/templates'

], function(_, Mn, TMPL){
    var ForumMemberItemView = Mn.ItemView.extend({
        template: _.template(TMPL.ForumMemberSnippet)    
    });
    return ForumMemberItemView;
});