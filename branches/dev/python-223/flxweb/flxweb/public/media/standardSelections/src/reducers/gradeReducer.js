import {
    STANDARD_DATA_LOADED,
    SELECT_A_STANDARD,
    SELECT_A_SUBJECT,
    SHOW_GRADE_OPTIONS,
    HIDE_GRADE_OPTIONS,
    SHOW_STANDARD_OPTIONS,
    SHOW_SUBJECT_OPTIONS,
    SELECT_A_GRADE,
    HIDE_ALL_OPTIONS

} from '../actions/actionTypes';

const gradeOptions = (
    state = {
        options: [],
        selected: {name:'Grade'},
        showOptions:false,
        showMore: false,
        disabled: true
    },
    action
) =>{
    if(action.type === STANDARD_DATA_LOADED){
        let selectedStandard = {};
        let selectedSubject = {};
        let selectedGrade = {name:'Grade'};

        if(action.initData&&action.initData.grade){
            selectedStandard = action.standards.filter(standard => standard.name === action.initData.standard)[0];
            selectedSubject = selectedStandard ? selectedStandard.subjects.filter(subject => subject.name === unescape(action.initData.subject))[0] : null;
            selectedGrade = selectedSubject ? selectedSubject.grades.filter(grade => grade.name === action.initData.grade)[0] : selectedGrade;
            if(selectedStandard && selectedSubject && selectedGrade){
                return {
                    ...state,
                    options: [...selectedSubject.grades],
                    selected: {...selectedGrade},
                    disabled: false
                };
            }
        }
        return {
            ...state
        };
    }else if(action.type === SELECT_A_STANDARD){
        return {
            ...state,
            selected: {name: 'Grade'},
            disabled: true,
            standardBoardId: action.standardBoardId
        };
    }else if(action.type === SELECT_A_SUBJECT){
        return {
            ...state,
            disabled: false,
            selected: {name: 'Grade'},
            options: [...action.grades]
        };
    }else if(action.type === SHOW_GRADE_OPTIONS){
        return {
            ...state,
            showMore: true,
            showOptions: true
        };
    }else if(action.type === HIDE_GRADE_OPTIONS || action.type === SHOW_STANDARD_OPTIONS || action.type === SHOW_SUBJECT_OPTIONS){
        return {
            ...state,
            showMore: true,
            showOptions: false
        };
    }else if(action.type === SELECT_A_GRADE){
        return {
            ...state,
            selected: action.grade,
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

export default gradeOptions;
