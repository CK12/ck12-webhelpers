define([
    'underscore',
    'marionette',
    'schools/templates/templates'
], function(_, Mn, TMPL){
    'use strict';
    var BannerView = Mn.ItemView.extend({
        template: _.template(TMPL.BANNER),
        el: "#schoolBanner"
    });
    return BannerView;
});