import {
    STANDARD_DATA_LOADED,
    SELECT_A_STANDARD,
    SELECT_A_SUBJECT,
    SHOW_SUBJECT_OPTIONS,
    HIDE_SUBJECT_OPTIONS,
    SHOW_STANDARD_OPTIONS,
    SHOW_GRADE_OPTIONS,
    HIDE_ALL_OPTIONS

} from '../actions/actionTypes';

const subjectOptions = (
    state = {
        label: 'subject',
        options:[],
        selected: {name:'Subject'},
        showOptions:false,
        disabled: true,
        standardBoardId: 0
    },
    action
) =>{
    if(action.type === STANDARD_DATA_LOADED){
        let selectedStandard = {};
        let selectedSubject = {name:'Subject'};

        if(action.initData&&action.initData.subject){
            selectedStandard = action.standards.filter(standard => standard.name === action.initData.standard)[0];
            selectedSubject = selectedStandard ? selectedStandard.subjects.filter(subject => subject.name === unescape(action.initData.subject))[0]: selectedSubject;
            if(selectedStandard && selectedSubject){
                return {
                    ...state,
                    options: [...selectedStandard.subjects],
                    selected: selectedSubject,
                    disabled: false
                };
            }
        }
        return {
            ...state
        };
    }else if(action.type === SELECT_A_STANDARD){
        return {
            options: [...action.subjects],
            selected: {name: 'Subject'},
            showOptions: false,
            disabled: false,
            standardBoardId: action.standardBoardId
        };
    }else if(action.type === SELECT_A_SUBJECT){
        return {
            ...state,
            selected: action.subject,
            showOptions: false
        };
    }else if(action.type === SHOW_SUBJECT_OPTIONS){
        return {
            ...state,
            showMore: true,
            showOptions: true
        };
    }else if(action.type === HIDE_SUBJECT_OPTIONS || action.type === SHOW_STANDARD_OPTIONS || action.type === SHOW_GRADE_OPTIONS){
        return {
            ...state,
            showMore: true,
            showOptions: false
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

export default subjectOptions;
