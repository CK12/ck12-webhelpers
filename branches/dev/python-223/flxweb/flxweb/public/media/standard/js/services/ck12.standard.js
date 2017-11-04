define(['common/utils/utils'], function (util) {
    'use strict';

    function standardService() {

        var _df = util.deferredFunction;

        function getStandards(data, collection) {
            var _d = $.Deferred();
            util.ajaxStart();
            collection.fetch({
                data: data,
                success: function () {
                    util.ajaxStop();
                    _d.resolve();
                },
                error: function () {
                    $(document).trigger('ajaxStop.ck12');
                    _d.reject('Sorry, we could not load the Standards right now. Please try again or contact or customer support.');
                }
            });
            return _d.promise();
        }

        function getStandardsForConcept(_d, params) {
            util.ajax({
                url: util.getApiUrl('flx/get/standards?set=' + params.set + '&eid=' + params.eid),
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        }

        this.getStandards = getStandards;
        this.getStandardsForConcept = _df(getStandardsForConcept);
    }

    return standardService;

});