define([
    'jquery',
    'underscore',
    'backbone',
    'bookmarklet/templates/bookmarklet.templates'
],
function ($, _, Backbone, Templates) {
    'use strict';

    var BookmarkletInvalidView = Backbone.View.extend({
        'template_invalid_view': _.template(Templates.BOOKMARKLET_INVALID, null, {
            'variable': 'data'
        }),
        'events': {
            'click.bookmarklet .js-close-bookmarklet': 'close'
        },
        'initialize': function () {
            this.render();
        },
        'render': function () {
            this.$el.html(this.template_invalid_view());
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
    return BookmarkletInvalidView;
});
