define([
    'jquery',
    'underscore',
    'practiceapp/views/appview',
    'practiceapp/templates/templates',
    'common/utils/url',
    'common/utils/concept_coversheet'
],
function($, _, AppView, Templates, URLHelper, coverSheet){
    var ConceptCoverSheetView = AppView.extend({
        events: {
        },
        tmpl: _.template(Templates.COVERSHEET_CONTAINER, null, {'variable':'data'}),
        render: function(){
            var url = new URLHelper(),
                _c = this,
                data = {};
            if (url.search_params && url.search_params.assignmentEID){
                data.eid = url.search_params.assignmentEID;
                
                coverSheet.initLms({
                    "handle": '',
                    "encodedId": data.eid,
                    "conceptTitle": "",
                    "callback": null,
                    "context": _c.config.app_name,
                    "appID": _c.config.appID
                });
            }
            return $(this.tmpl(data));
        }
    });
    
    return ConceptCoverSheetView;
});
