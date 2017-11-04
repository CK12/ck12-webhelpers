define(['jquery',
        'common/utils/utils'],
    function ($, util) {
        'use strict';

        function SearchService() {

            function initAutoComplete(query, loadingElement, artifactType) {
                var isShowLoading,
                    _d = $.Deferred();
                artifactType = artifactType || 'book,domain,labkit,tebook,workbook';
                if (loadingElement.length) {
                    loadingElement = loadingElement[0];
                    isShowLoading = true;
                } else {
                    loadingElement = '';
                    isShowLoading = false;
                }
                util.ajax({
                    url: util.getApiUrl('flx/search/hints/' + artifactType + '/title/' + query),
                    datatype: 'json',
                    useCDN: true,
                    cdnExpirationAge: 'daily',
                    loadingElement: loadingElement,
                    isShowLoading: isShowLoading,
                    success: _d.resolve,
                    error: _d.reject
                });
                return _d.promise();
            }

            this.initAutoComplete = initAutoComplete;
        }

        return new SearchService();

    });
