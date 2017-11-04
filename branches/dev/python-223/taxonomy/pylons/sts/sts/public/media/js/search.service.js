function SearchService() {
    function initAutoComplete(query, loadingElement) {
        var isShowLoading,
            _d = $.Deferred();
        $.ajax({
		url: "http://www.ck12.org/flx/search/hints/domain/title/"+query+"",
            datatype: 'json',
            success: _d.resolve,
            error: _d.reject
        });
        return _d.promise();
    }
    this.initAutoComplete = initAutoComplete;
}
