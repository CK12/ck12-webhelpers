function SearchService() {
    function initAutoComplete(query, loadingElement) {
        var isShowLoading,
            _d = $.Deferred();
        $.ajax({
            url: "/flx/search/hints/domain/title/"+query+"",
            datatype: 'json',
            success: _d.resolve,
            error: _d.reject
        });
        return _d.promise();
    }
    this.initAutoComplete = initAutoComplete;
}
