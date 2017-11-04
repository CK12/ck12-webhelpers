define(['common/utils/utils'], function (util) {
    'use strict';

    function searchService() {

        var searchURL = {
            'search': util.getApiUrl('flx/search/direct/modality/minimal/'),
            'searchMy': util.getApiUrl('flx/search/modality/mylib/minimal/')
        };

        function search(value, params, searchTypes, searchSource) {
            var _d = $.Deferred();
            if (!searchSource){
                searchSource = 'search';
            }
            if (!searchTypes){
                throw new TypeError("searchTypes not specified");
            }
            searchTypes = searchTypes.replace(/,,/g, ',');
            params.includeEIDs = 1;
            value = escape(value);
            var cacheExpires = (params.ck12only) ? 'daily' : 'hourly';
            var cacheUserInfo = searchSource == 'searchMy';
            console.log('cacheExpires: ' + cacheExpires + ', cacheUserInfo: ' + cacheUserInfo);
            util.ajax({
                url: searchURL[searchSource] + searchTypes + '/' + value,
                data: params,
                dataType : 'json',
                useCDN: true,
                cdnExpirationAge: cacheExpires,
                cdnCacheUserInfo: cacheUserInfo,
                isPageDisable: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject();
                }
            });
            return _d.promise();
        }

        this.search = search;
    }

    return new searchService();

});
