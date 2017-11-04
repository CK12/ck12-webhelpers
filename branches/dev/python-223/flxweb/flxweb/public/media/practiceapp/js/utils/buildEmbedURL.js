/**
 * Module for constructing urls.
 *
*/
define(['common/utils/url'], function(URLHelper){

    var URLBuilder = (function() {

        /**
         * Create embed url using Url Helper with hash params
         * 
         * @param prefix (string): prefix for the url
         * @param paramsObj (object): object of query params
         */
        var getEmbedURL = function(prefix, paramsObj){
            var embedUrl = new URLHelper(prefix);
            embedUrl.updateHashParams(paramsObj);

            return embedUrl.url();
        };

	/**
	*  Build an embed url using assignment info
	*
	*  @param assignmentInfo (object): 
	*      handle = modality_handle
	*      mtype = modality_type
	*      context = concept_handle
	*      realm = modality_realm
	*      branch = branch_handle
	*      filters = branch_handle
	*      nochrome = branch_handle
	*      
	*  @param prefix (string): prefix for the url.
	*/
	var buildEmbedUrlByAssignment = function(assignmentInfo, prefix){
		var type = assignmentInfo.type,
			url_params = {mtype: type, hideConceptLink: true},
			url_prefix = prefix || null,
                        isUGC = assignmentInfo.hasOwnProperty('login');

                        if (isUGC){
                            url_params.realm = "user:"+ assignmentInfo.login;
                        }
			if (type === 'lesson'){
				url_params.handle = assignmentInfo.handle;
				url_params.branch = assignmentInfo.branchHandle || 
					(assignmentInfo.domains ? assignmentInfo.domains[0].branchInfo.handle : '');

			} else { // 'lecture','enrichment','rwa','plix','simulationint'
				url_params.handle = assignmentInfo.handle;
                                if (isUGC === false){ 
				    url_params.context = assignmentInfo.domains[0].handle;
				    url_params.branch = assignmentInfo.domains[0].branchInfo.handle;
                                }
			}

			if (assignmentInfo.conceptCollectionHandle) {
				url_params.conceptCollectionHandle = assignmentInfo.conceptCollectionHandle;
				url_params.collectionHandle = assignmentInfo.collectionHandle;
				url_params.collectionCreatorID = assignmentInfo.collectionCreatorID;
			}

			return getEmbedURL( url_prefix, url_params);
	    };

        return {
            buildEmbedUrlByAssignment : buildEmbedUrlByAssignment
        };

    })();
    return URLBuilder;
    
});
