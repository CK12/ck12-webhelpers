define([
    'jquery',
    'underscore',
    'backbone',
    'bookmarklet/templates/bookmarklet.templates'
],
function ($, _, Backbone, Templates) {
    'use strict';

    var BookmarkletCK12View = Backbone.View.extend({
        'template_ck12_view': _.template(Templates.BOOKMARKLET_CK12, null, {
            'variable': 'data'
        }),
        'events': {
            'click.bookmarklet .js-close-bookmarklet': 'close'
        },
        'initialize': function () {
            this.render();
        },
        'render': function () {
            this.$el.html(this.template_ck12_view());
        },
        'close': function () {
            if (window.parent && window.parent.postMessage) {
                try {
                    window.parent.postMessage(JSON.stringify({
                        'close': true
                    }), '*');
                } catch (e) {
                    console.log(e);
                }
            }
        }
    });
    return BookmarkletCK12View;
});
