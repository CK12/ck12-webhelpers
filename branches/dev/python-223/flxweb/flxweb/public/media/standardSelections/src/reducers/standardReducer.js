import {
    STANDARD_DATA_LOADED,
    SELECT_A_STANDARD,
    SHOW_STANDARD_OPTIONS,
    HIDE_STANDARD_OPTIONS,
    SHOW_SUBJECT_OPTIONS,
    SHOW_GRADE_OPTIONS,
    TOGGLE_SHOW_MORE_STANDARDS,
    FETCH_CURRENT_LOCATION,
    USER_FETCH_SUCCESS,
    USER_FETCH_ERROR,
    FETCH_RECENT_STANDARDS,
    HIDE_ALL_OPTIONS
} from '../actions/actionTypes';
const standardOptions = (
    state = {
        // optionsGroup: [],
        standards: [],
        selected: {longname:'State or Standard set'},
        showOptions:false,
        showMore: false,
        disabled: false,
        currentLocation: { state: 'CA'},
        longname: true,
        login: false,
        recentStandards:[]
    },
    action
) =>{
    if(action.type === STANDARD_DATA_LOADED){

        let selectedStandard = {longname:'State or Standard set'};

        if(action.initData&&action.initData.standard){
            selectedStandard = action.standards.filter(standard => standard.name === action.initData.standard)[0] || selectedStandard;
        }
        return {
            ...state,
            standards: [...action.standards],
            selected: selectedStandard
        };
    }else if(action.type === FETCH_RECENT_STANDARDS){
        return {
            ...state,
            recentStandards: [...action.standards]
        };
    }else if(action.type === SELECT_A_STANDARD){
        return {
            ...state,
            selected: action.standard,
            showOptions: false
        };
    }else if(action.type === SHOW_STANDARD_OPTIONS){
        return {
            ...state,
            showMore: false,
            showOptions: true
        };
    }else if(action.type === HIDE_STANDARD_OPTIONS || action.type === SHOW_SUBJECT_OPTIONS || action.type === SHOW_GRADE_OPTIONS){
        return {
            ...state,
            showMore: false,
            showOptions: false
        };
    }else if(action.type === TOGGLE_SHOW_MORE_STANDARDS){
        return {
            ...state,
            showMore: !state.showMore
        };
    }else if(action.type === FETCH_CURRENT_LOCATION){
        return {
            ...state,
            currentLocation: action.location
        };
    }else if(action.type === USER_FETCH_SUCCESS){
        return {
            ...state,
            login: true
        };
    }else if(action.type === USER_FETCH_ERROR){
        return {
            ...state,
            login: false
        };
    }else if(action.type === HIDE_ALL_OPTIONS){
        return {
            ...state,
            showMore: false,
            showOptions: false
        };
    }
    return state;
};
export default standardOptions;
