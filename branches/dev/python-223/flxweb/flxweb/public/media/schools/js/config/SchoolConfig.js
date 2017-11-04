define([], function(){

	var stateCountRequestParams =  {
			published:true,
            status : 'approved',
            isDeleted: false,
            hasSchoolArtifacts : true
	};
	var stateDetailsRequestParams =  {
			published:true,
            status : 'approved',
            isDeleted: false,
            hasSchoolArtifacts : true
	};
	var DEFAULT_COVER_IMAGE  = 'http://www.ck12.org/media/images/thumb_dflt_flexbook_lg.png';
	var flexbook_artifact_type  = [ 'book', 'tebook', 'workbook', 'labkit', 'quizbook'];


	return {
		stateCountRequestParams : stateCountRequestParams,
		stateDetailsRequestParams : stateDetailsRequestParams,
		DEFAULT_COVER_IMAGE : DEFAULT_COVER_IMAGE,
		flexbook_artifact_type : flexbook_artifact_type
	}
})