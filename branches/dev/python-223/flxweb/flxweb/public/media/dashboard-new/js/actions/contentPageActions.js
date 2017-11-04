import {
    contentService
} from 'services';
import {
    showMessageBox
} from 'actions/messageBoxActions';
import {
    SET_CONTENT_ACTIVE_TAB,
    GET_CONTENT_ACTIVE_TAB,
    FETCH_STANDARDS_SUCCESS,
    FETCH_STANDARDS_ERROR,
    SET_SELECTED_STANDARD_INDEX,
    SET_SELECTED_SUBJECT_INDEX,
    SET_SELECTED_GRADE_INDEX,
    FETCH_STANDARDS_CORRELATIONS_SUCCESS,
    FETCH_STANDARDS_CORRELATIONS_ERROR,
    FETCH_BOOKS_SUCCESS,
    FETCH_BOOKS_ERROR,
    FETCH_RECENTLY_VIEWED_SUCCESS,
    FETCH_RECENTLY_VIEWED_ERROR,
    FETCH_READ_SUCCESS,
    FETCH_READ_ERROR,
    FETCH_VIDEO_SUCCESS,
    FETCH_VIDEO_ERROR,
    FETCH_PRACTICE_SUCCESS,
    FETCH_PRACTICE_ERROR,
    FETCH_PLIX_SUCCESS,
    FETCH_PLIX_ERROR,
    FETCH_RWA_SUCCESS,
    FETCH_RWA_ERROR,
    FETCH_SIMULATION_SUCCESS,
    FETCH_SIMULATION_ERROR,
    PLACE_IN_LIBRARY_SUCCESS,
    PLACE_IN_LIBRARY_ERROR,
    CHECK_ALL_IN_LIBRARY_SUCCESS,
    CHECK_ALL_IN_LIBRARY_ERROR

} from 'actions/actionTypes';


export function getContentActiveTab(content) {
    return {
        type: GET_CONTENT_ACTIVE_TAB,
        content
    };
}
export function setContentActiveTab(content) {
    return {
        type: SET_CONTENT_ACTIVE_TAB,
        content
    };
}
export function setSelectedStandardIndex(standards) {
    return {
        type: SET_SELECTED_STANDARD_INDEX,
        standards
    };
}
export function setSelectedSubjectIndex(standards) {
    return {
        type: SET_SELECTED_SUBJECT_INDEX,
        standards
    };
}
export function setSelectedGradeIndex(standards) {
    return {
        type: SET_SELECTED_GRADE_INDEX,
        standards
    };
}
export function getBooksData(dispatch, info, callback) {
    return contentService.getBooksData(info)
        .then(res => {
            dispatch({
                type: FETCH_BOOKS_SUCCESS,
                standards: {
                    booksData: res.text || ''
                }
            });
            callback();
        })
        .catch(() => {
            dispatch({
                type: FETCH_BOOKS_ERROR
            });
            callback();
        });
}
export function fetchStandards(dispatch) {
    return contentService.fetchStandards()
        .then(res =>
            dispatch({
                type: FETCH_STANDARDS_SUCCESS,
                standards: res.body.response
            })
        )
        .catch(() =>
            dispatch({
                type: FETCH_STANDARDS_ERROR
            })
        );
}
export function getStandardsCorrelationsData(dispatch, info, callback) {
    return contentService.getStandardsCorrelationsData(info)
        .then(response => {
            dispatch({
                type: FETCH_STANDARDS_CORRELATIONS_SUCCESS,
                standards: {
                    standardsCorrelationsLink: info.url,
                    standardsCorrelationsData: response.text || ''
                }
            });
            callback();
        })
        .catch(() =>
            dispatch({
                type: FETCH_STANDARDS_CORRELATIONS_ERROR
            })
        );
}
export function fetchRecentlyViewedModalities(dispatch,collectionHandles) {
	let modalityTypes = 'lesson,enrichment,lecture,asmtpractice,plix' ;
		modalityTypes = (collectionHandles && (collectionHandles.split(',').indexOf('physics') !== -1 || collectionHandles.split(',').indexOf('chemistry') !== -1)) ? modalityTypes + ',simulationint' : modalityTypes;
	let	defaultInfo = {
	        modalityTypes,
	        collectionHandles
	    };
    return contentService.fetchRecentlyViewedModalities(defaultInfo)
        .then(({
        	lastReadModalities
        }) => {
            dispatch({
                type: FETCH_RECENTLY_VIEWED_SUCCESS,
                content: {
                    recentlyViewed: lastReadModalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_RECENTLY_VIEWED_ERROR
            })
        );
}
export function fetchReadModalities(dispatch, branch) {
    let defaultInfo = {
        modalityTypes: 'lesson',
        branches: branch || ''
    };
    return contentService.fetchModalities(defaultInfo)
        .then(({
            trending_modalities
        }) => {
            dispatch({
                type: FETCH_READ_SUCCESS,
                content: {
                    lessons: trending_modalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_READ_ERROR
            })
        );
}
export function fetchVideoModalities(dispatch, branch) {
    let defaultInfo = {
        modalityTypes: 'enrichment,lecture',
        branches: branch || ''
    };
    return contentService.fetchModalities(defaultInfo)
        .then(({
            trending_modalities
        }) => {
            dispatch({
                type: FETCH_VIDEO_SUCCESS,
                content: {
                    videos: trending_modalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_VIDEO_ERROR
            })
        );
}
export function fetchPracticeModalities(dispatch, branch) {
    let defaultInfo = {
        modalityTypes: 'asmtpractice',
        branches: branch || ''
    };
    return contentService.fetchModalities(defaultInfo)
        .then(({
            trending_modalities
        }) => {
            dispatch({
                type: FETCH_PRACTICE_SUCCESS,
                content: {
                    asmtpractice: trending_modalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_PRACTICE_ERROR
            })
        );
}
export function fetchPlixModalities(dispatch, branch) {
    let defaultInfo = {
        modalityTypes: 'plix',
        branches: branch || ''
    };
    return contentService.fetchModalities(defaultInfo)
        .then(({
            trending_modalities
        }) => {
            dispatch({
                type: FETCH_PLIX_SUCCESS,
                content: {
                    plix: trending_modalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_PLIX_ERROR
            })
        );
}
export function fetchRWAModalities(dispatch, branch) {
    let defaultInfo = {
        modalityTypes: 'rwa',
        branches: branch || ''
    };
    return contentService.fetchModalities(defaultInfo)
        .then(({
            trending_modalities
        }) => {
            dispatch({
                type: FETCH_RWA_SUCCESS,
                content: {
                    rwa: trending_modalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_RWA_ERROR
            })
        );
}
export function fetchSimulationModalities(dispatch, branch) {
	let branches = [];
		branch && (branch.split(',').indexOf('physics') !== -1 ) ? branches.push('physics') : branches;
		branch && (branch.split(',').indexOf('chemistry') !== -1 ) ? branches.push('chemistry') : branches;
	
	let	defaultInfo = {
        modalityTypes: 'simulationint',
        branches: branches.join(',')
    };
    return contentService.fetchModalities(defaultInfo)
        .then(({
            trending_modalities
        }) => {
            dispatch({
                type: FETCH_SIMULATION_SUCCESS,
                content: {
                    simulationint: trending_modalities
                }
            });
        })
        .catch(() =>
            dispatch({
                type: FETCH_SIMULATION_ERROR
            })
        );
}
export function placeInLibrary(dispatch, info) {
    return contentService.placeInLibrary(info)
        .then(({}) => {
            dispatch(showMessageBox({
                messageType: 'success',
                message: 'This resource has been added to your Library.'
            }));
            dispatch({
                type: PLACE_IN_LIBRARY_SUCCESS,
                item:`${info.artifactID}`
            });
        })
        .catch(() =>
            dispatch({
                type: PLACE_IN_LIBRARY_ERROR
            })
        );
}
export function checkInLibrary(dispatch, info, callback) {
    return contentService.checkInLibrary(Object.assign({},info,{artifactRevision:"artifactRevision"}))
        .then((objects) => {
            if (objects.objects[`${info.artifactID}`]) {
                dispatch(showMessageBox({
                    messageType: 'success',
                    message: 'This resource has already been added to your Library.'
                }));
                dispatch({
                    type: PLACE_IN_LIBRARY_SUCCESS,
                    item:`${info.artifactID}`
                });
            } else {
                callback(dispatch, info);
                dispatch();
            }
        })
        .catch(() =>
            dispatch({
                type: PLACE_IN_LIBRARY_ERROR
            })
        );
}
export function checkAllInLibrary(dispatch, info){
	return contentService.checkInLibrary(info)
		.then(
			({objects}) => {
				let artifacts = [];
				for(var i in objects){
					artifacts.push(`${i}`);
				}
                dispatch({
                    type: CHECK_ALL_IN_LIBRARY_SUCCESS,
                    content: {
                    	placedInLibrary: artifacts
                    }
                });
			}
		)
		.catch(() =>
	        dispatch({
	            type: CHECK_ALL_IN_LIBRARY_ERROR
	        })
		);
}