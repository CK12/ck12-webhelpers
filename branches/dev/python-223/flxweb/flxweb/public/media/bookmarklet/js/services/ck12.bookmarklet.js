define(['common/utils/utils'], function (util) {
    'use strict';

    function bookmarkletService() {

        var bookmarkletURL = {
            'search_url': util.getApiUrl('taxonomy/search/concept/'),
            'validateURL': util.getApiUrl('flx/get/url/status'),
            'get_labels_url': util.getApiUrl('flx/get/mylib/info/labels'),
            'save_resource_url': util.getApiUrl('flx/create'),
            'create_embed_url': util.getApiUrl('flx/create/embeddedobject')
        };

        function searchConcepts(searchTerm) {
            var _d = $.Deferred();
            util.ajax({
                url: bookmarkletURL.search_url + searchTerm,
                loadingElement: $('#search-concept-input').siblings('.js-loading-icon')[0],
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject();
                }
            });
            return _d.promise();
        }

        function validateURL(data) {
            var _d = $.Deferred();
            util.ajax({
                url: bookmarkletURL.validateURL,
                data: data,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject();
                }
            });
            return _d.promise();
        }

        function searchTags(term) {
            var _d = $.Deferred();
            util.ajax({
                url: bookmarkletURL.get_labels_url + '?searchLabel=' + term,
                loadingElement: $('#search-tag-input').siblings('.js-loading-icon')[0],
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject();
                }
            });
            return _d.promise();
        }

        function saveResource(options, type) {
            var _d = $.Deferred();
            options.xhtml = util.b64EncodeUnicode(options.xhtml);
            util.ajax({
                url: bookmarkletURL.save_resource_url + '/' + type,
                data: options,
                type: 'POST',
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject();
                }
            });
            return _d.promise();
        }

        function createEmbedObject(options) {
            options.code = util.b64EncodeUnicode(options.code);
            var _d = $.Deferred();
            util.ajax({
                url: bookmarkletURL.create_embed_url,
                data: options,
                type: 'POST',
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject();
                }
            });
            return _d.promise();
        }

        this.searchConcepts = searchConcepts;
        this.validateURL = validateURL;
        this.searchTags = searchTags;
        this.saveResource = saveResource;
        this.createEmbedObject = createEmbedObject;
    }

    return new bookmarkletService();

});
