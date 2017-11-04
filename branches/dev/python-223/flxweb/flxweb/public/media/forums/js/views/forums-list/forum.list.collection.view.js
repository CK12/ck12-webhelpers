define([
    'marionette',
    'underscore',
    'forums/views/forums-list/forum.item.view'
], function(Mn, _, ForumBlockView){
    var ForumListCollectionView = Mn.CollectionView.extend({
        childView: ForumBlockView,
        initialize: function(options){
            this.user = options.user;
        },
        buildChildView: function(child, ChildViewClass, childViewOptions){
            childViewOptions = {user: this.user};
            var options = _.extend({model: child}, childViewOptions);
            var view = new ChildViewClass(options);
            return view;
        }

    });
    return ForumListCollectionView;
});