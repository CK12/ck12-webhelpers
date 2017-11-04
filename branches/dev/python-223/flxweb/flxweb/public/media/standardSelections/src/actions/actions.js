import {
    loadData,
    fetchCurrentLocation,
    fetchCurrentLocation2,
    fetchRecentStandards,
    getLoggedInUser
} from '../services';

import {
    STANDARD_DATA_LOADED,
    SELECT_A_STANDARD,
    SHOW_STANDARD_OPTIONS,
    HIDE_STANDARD_OPTIONS,
    TOGGLE_SHOW_MORE_STANDARDS,
    FETCH_RECENT_STANDARDS,
    SHOW_SUBJECT_OPTIONS,
    HIDE_SUBJECT_OPTIONS,
    SELECT_A_SUBJECT,
    SHOW_GRADE_OPTIONS,
    HIDE_GRADE_OPTIONS,
    SELECT_A_GRADE,
    HIDE_ALL_OPTIONS,
    FETCH_CURRENT_LOCATION,
    USER_FETCH_SUCCESS,
    USER_FETCH_ERROR
} from './actionTypes';
export const loadStandardsData = (initData)=>{
    return (dispatch) =>{
        dispatch({
            type: STANDARD_DATA_LOADED,
            standards: loadData().response.standards,
            initData
        });
    };
};
export const getCurrentLocation = (dispatch) => {
    fetchCurrentLocation().then((userInfo)=>{
        if(userInfo.location && userInfo.location.country){
            var state = userInfo.location.state || 'notExisting';
            if(userInfo.location.country.slice(0,2).toUpperCase() === 'US' && userInfo.location.state.length === 0){
                state = 'CA';
            }
            dispatch({
                type: FETCH_CURRENT_LOCATION,
                location: {
                    ...userInfo.location,
                    state
                    // country: 'International'
                }
            });
        }else{
            return fetchCurrentLocation2().then((data) =>{
                userInfo = data['ip_info'];
                dispatch({
                    type: FETCH_CURRENT_LOCATION,
                    location: {
                        city: userInfo.city,
                        country: userInfo['country_short'] + ': '+userInfo['country_long'],
                        postalCode: userInfo['area_code'],
                        state: userInfo.region || 'CA'
                    }
                });
            });
        }
    }).catch((err)=>{console.log('Authentication required');}).done();
};
export const getCurrentLocationForAnonymousUser = (dispatch) =>{
    return fetchCurrentLocation2().then((data) =>{
        var userInfo = data['ip_info'];
        dispatch({
            type: FETCH_CURRENT_LOCATION,
            location: {
                city: userInfo.city,
                country: userInfo['country_short'] + ': '+userInfo['country_long'],
                postalCode: userInfo['area_code'],
                state: userInfo.region || 'CA'
            }
        });
    });
};
export const fetchUser = () => {
    return (dispatch) => {
        getLoggedInUser().then(
        (userInfo)=> {
            dispatch(fetchUserSuccess(userInfo));
        }).catch((err) => {
            dispatch(fetchUserError(err));
        }).done();
    };
};
export const fetchUserSuccess = (userInfo) =>{
    return{
        type: USER_FETCH_SUCCESS,
        payload: {userInfo}
    };
};
export const fetchUserError = (error) => {
    return {
        type: USER_FETCH_ERROR,
        payload: {error},
        error: true
    };
};
export const getRecentStandards = (dispatch) => {
    fetchRecentStandards().then(data =>{
        dispatch({
            type: FETCH_RECENT_STANDARDS,
            standards: data.lastReadStandards
        });
    }).catch((err) =>{
        if(err.status === 401){
            console.log('Authentication required');
        }
    }).done();
};

export const hideAllOptions = () =>{
    return (dispatch) => {
        dispatch({
            type: HIDE_ALL_OPTIONS
        });
    };
};
export const selectAStandard = (standard)=>{
    return {
        type: SELECT_A_STANDARD,
        standard: standard,
        subjects: [...standard.subjects],
        standardBoardId: standard.id
    };
};

export const showStandardOptions = ()=>{
    return {
        type: SHOW_STANDARD_OPTIONS
    };
};

export const hideStandardOptions = ()=>{
    return {
        type: HIDE_STANDARD_OPTIONS
    };
};

export const toggleShowMoreStandards = () =>{
    return {
        type: TOGGLE_SHOW_MORE_STANDARDS
    };
};

export const showSubjectOptions = () =>{
    return {
        type: SHOW_SUBJECT_OPTIONS
    };
};
export const hideSubjectOptions = () =>{
    return {
        type: HIDE_SUBJECT_OPTIONS
    };
};
export const selectASubject = (subject) => {
    return {
        type: SELECT_A_SUBJECT,
        subject: subject,
        grades: [...subject.grades]
    };
};

export const showGradeOptions = () =>{
    return {
        type: SHOW_GRADE_OPTIONS
    };
};
export const hideGradeOptions = () =>{
    return {
        type: HIDE_GRADE_OPTIONS
    };
};

export const selectAGrade = (grade) =>{
    return {
        type: SELECT_A_GRADE,
        grade: grade
    };
};
